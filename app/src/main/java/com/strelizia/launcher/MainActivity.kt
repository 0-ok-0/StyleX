package com.strelizia.launcher

import android.Manifest
import android.app.Activity
import android.app.ActivityOptions
import android.app.NotificationManager
import android.app.WallpaperManager
import android.app.role.RoleManager
import android.content.BroadcastReceiver
import android.content.ComponentName
import android.content.ContentUris
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.LauncherApps
import android.content.pm.PackageManager
import android.graphics.Color
import android.graphics.Rect
import android.location.Location
import android.location.LocationManager
import android.media.session.MediaSessionManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.PowerManager
import android.os.Process
import android.os.VibrationEffect
import android.os.Vibrator
import android.provider.CalendarContract
import android.provider.Settings
import android.view.WindowManager
import android.webkit.WebView
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import org.json.JSONArray
import org.json.JSONObject
import kotlin.math.max

class MainActivity : Activity() {

    lateinit var web: WebView
    @Volatile var isResumedNow = false
    @Volatile var lastLoc: Location? = null

    private var ready = false
    private val pending = ArrayList<String>()
    private val receivers = ArrayList<BroadcastReceiver>()
    private var mediaListener: MediaSessionManager.OnActiveSessionsChangedListener? = null
    private var lastBat = -1
    private var lastChg = false

    companion object {
        private const val RC_CAL = 11
        private const val RC_LOC = 12
        private const val RC_ROLE = 13
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val w = window
        w.statusBarColor = Color.TRANSPARENT
        w.navigationBarColor = Color.TRANSPARENT
        if (Build.VERSION.SDK_INT >= 29) {
            w.isNavigationBarContrastEnforced = false
            w.isStatusBarContrastEnforced = false
        }
        if (Build.VERSION.SDK_INT >= 28) {
            val lp = w.attributes
            lp.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES
            w.attributes = lp
        }
        WindowCompat.setDecorFitsSystemWindows(w, false)

        web = WebView(this)
        Web.setup(web, this)
        web.addJavascriptInterface(Bridge(this), "Android")
        web.isHapticFeedbackEnabled = false
        web.isLongClickable = false
        web.setOnLongClickListener { true }
        setContentView(web)

        val ctl = WindowInsetsControllerCompat(w, web)
        ctl.isAppearanceLightStatusBars = false
        ctl.isAppearanceLightNavigationBars = false

        ViewCompat.setOnApplyWindowInsetsListener(web) { _, insets ->
            val d = resources.displayMetrics.density
            val bars = insets.getInsets(WindowInsetsCompat.Type.systemBars() or WindowInsetsCompat.Type.displayCutout())
            val ime = insets.getInsets(WindowInsetsCompat.Type.ime())
            val o = JSONObject()
                .put("t", (bars.top / d).toDouble())
                .put("b", (bars.bottom / d).toDouble())
                .put("kb", (ime.bottom / d).toDouble())
            emit("insets", o.toString())
            insets
        }

        Hub.listener = { name, payload -> emit(name, payload) }
        Torch.init(applicationContext)
        registerSystem()
        web.loadUrl(Web.URL_MAIN)
    }

    /** Событие в интерфейс: LXN(name, payload). Копим, пока страница не готова. */
    fun emit(name: String, payload: String = "null") {
        runOnUiThread {
            val js = "window.LXN&&LXN(" + JSONObject.quote(name) + "," + payload + ")"
            if (!ready) {
                if (pending.size < 200) pending.add(js)
            } else {
                web.evaluateJavascript(js, null)
            }
        }
    }

    fun onPageReady() {
        runOnUiThread {
            ready = true
            for (js in pending) web.evaluateJavascript(js, null)
            pending.clear()
            ViewCompat.requestApplyInsets(web)
            lastBat = -1
            pushBattery(null)
            if (isResumedNow) emit("resume")
        }
    }

    override fun onResume() {
        super.onResume()
        isResumedNow = true
        web.onResume()
        emit("resume")
        registerMedia()
    }

    override fun onPause() {
        isResumedNow = false
        emit("pause")
        web.onPause()
        super.onPause()
    }

    override fun onDestroy() {
        Hub.listener = null
        for (r in receivers) {
            try {
                unregisterReceiver(r)
            } catch (e: Exception) {
            }
        }
        receivers.clear()
        unregisterMedia()
        web.destroy()
        super.onDestroy()
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        emit(if (isResumedNow) "home" else "homeFrom")
    }

    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        // Рабочий стол не закрывается: «назад» закрывает панели внутри лаунчера.
        emit("back")
    }

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>, grantResults: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        val granted = grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED
        val what = if (requestCode == RC_CAL) "cal" else "loc"
        emit("perm", JSONObject.quote(what))
        if (!granted) emit("toast", JSONObject.quote("Доступ не дан. Можно включить в настройках приложения"))
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == RC_ROLE) emit("perm", JSONObject.quote("def"))
    }

    // ───────── системные события ─────────

    private fun reg(f: IntentFilter, onRecv: (Intent) -> Unit) {
        val r = object : BroadcastReceiver() {
            override fun onReceive(context: Context, intent: Intent) {
                onRecv(intent)
            }
        }
        try {
            ContextCompat.registerReceiver(this, r, f, ContextCompat.RECEIVER_EXPORTED)
            receivers.add(r)
        } catch (e: Exception) {
        }
    }

    private fun registerSystem() {
        reg(IntentFilter(Intent.ACTION_BATTERY_CHANGED)) { pushBattery(it) }
        val pf = IntentFilter()
        pf.addAction(Intent.ACTION_PACKAGE_ADDED)
        pf.addAction(Intent.ACTION_PACKAGE_REMOVED)
        pf.addAction(Intent.ACTION_PACKAGE_CHANGED)
        pf.addAction(Intent.ACTION_PACKAGE_REPLACED)
        pf.addDataScheme("package")
        reg(pf) {
            Apps.invalidate()
            emit("apps")
        }
        reg(IntentFilter(Intent.ACTION_USER_PRESENT)) { emit("unlock") }
        // экран погас: интерфейс заранее ставит обложку загрузки, и после разблокировки рабочий стол не мигает
        reg(IntentFilter(Intent.ACTION_SCREEN_OFF)) { emit("screenOff") }
        val qf = IntentFilter()
        qf.addAction(NotificationManager.ACTION_INTERRUPTION_FILTER_CHANGED)
        qf.addAction("android.intent.action.AIRPLANE_MODE")
        qf.addAction("android.net.wifi.WIFI_STATE_CHANGED")
        qf.addAction("android.bluetooth.adapter.action.STATE_CHANGED")
        reg(qf) { emit("qs") }
    }

    fun pushBattery(i: Intent?) {
        val (p, c) = if (i != null && i.action == Intent.ACTION_BATTERY_CHANGED) Sys.batteryFrom(i) else Sys.battery(this)
        if (p == lastBat && c == lastChg) return
        lastBat = p
        lastChg = c
        emit("bat", JSONObject().put("bat", p).put("chg", c).toString())
    }

    private fun registerMedia() {
        if (mediaListener != null) return
        if (!NotificationManagerCompat.getEnabledListenerPackages(this).contains(packageName)) return
        val msm = getSystemService(MediaSessionManager::class.java) ?: return
        val l = MediaSessionManager.OnActiveSessionsChangedListener { emit("media") }
        try {
            msm.addOnActiveSessionsChangedListener(l, ComponentName(this, NotifService::class.java))
            mediaListener = l
        } catch (e: Exception) {
        }
    }

    private fun unregisterMedia() {
        val l = mediaListener ?: return
        try {
            getSystemService(MediaSessionManager::class.java)?.removeOnActiveSessionsChangedListener(l)
        } catch (e: Exception) {
        }
        mediaListener = null
    }

    // ───────── то, что вызывает интерфейс ─────────

    private fun ui(f: () -> Unit) = runOnUiThread { f() }

    fun go(i: Intent): Boolean = try {
        startActivity(i)
        true
    } catch (e: Exception) {
        false
    }

    fun launchApp(id: String, x: Double, y: Double, w: Double, h: Double): Boolean {
        val cn = ComponentName.unflattenFromString(id) ?: return false
        ui {
            try {
                val d = resources.displayMetrics.density
                val l = (x * d).toInt()
                val t = (y * d).toInt()
                val ww = max(1, (w * d).toInt())
                val hh = max(1, (h * d).toInt())
                val opts = ActivityOptions.makeScaleUpAnimation(web, l, t, ww, hh).toBundle()
                val la = getSystemService(LauncherApps::class.java) ?: throw IllegalStateException("no LauncherApps")
                la.startMainActivity(cn, Process.myUserHandle(), Rect(l, t, l + ww, t + hh), opts)
            } catch (e: Exception) {
                emit("fail", JSONObject.quote(id))
            }
        }
        return true
    }

    fun shortcut(id: String, sc: String): Boolean {
        ui {
            if (!Apps.startShortcut(this, id, sc)) emit("fail", JSONObject.quote(id))
        }
        return true
    }

    fun appInfo(id: String) {
        val cn = ComponentName.unflattenFromString(id) ?: return
        ui {
            try {
                val la = getSystemService(LauncherApps::class.java) ?: throw IllegalStateException("no LauncherApps")
                la.startAppDetailsActivity(cn, Process.myUserHandle(), null, null)
            } catch (e: Exception) {
                go(Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:" + cn.packageName)))
            }
        }
    }

    fun uninstall(id: String) {
        val cn = ComponentName.unflattenFromString(id) ?: return
        ui { go(Intent(Intent.ACTION_DELETE, Uri.parse("package:" + cn.packageName))) }
    }

    fun openNotif(key: String) {
        val s = Hub.notifService ?: return
        ui {
            try {
                val sbn = s.getActiveNotifications(arrayOf(key))?.firstOrNull()
                if (sbn != null) {
                    val n = sbn.notification
                    val pi = n.contentIntent
                    var ok = false
                    if (pi != null) {
                        try {
                            pi.send()
                            ok = true
                        } catch (e: Exception) {
                        }
                    }
                    if (!ok) packageManager.getLaunchIntentForPackage(sbn.packageName)?.let { go(it) }
                    if ((n.flags and android.app.Notification.FLAG_AUTO_CANCEL) != 0) s.cancelNotification(key)
                }
            } catch (e: Exception) {
            }
        }
    }

    fun dismissNotif(key: String) {
        try {
            Hub.notifService?.cancelNotification(key)
        } catch (e: Exception) {
        }
    }

    fun clearNotifs() {
        try {
            Hub.notifService?.cancelAllNotifications()
        } catch (e: Exception) {
        }
    }

    fun lockScreen(): Boolean = Hub.lockService?.lock() ?: false

    fun systemShade(): Boolean {
        val acc = Hub.lockService
        if (acc != null && acc.shade()) return true
        return try {
            val sbs = getSystemService("statusbar")
            Class.forName("android.app.StatusBarManager").getMethod("expandNotificationsPanel").invoke(sbs)
            true
        } catch (e: Exception) {
            false
        }
    }

    fun isDefaultHome(): Boolean = try {
        val ri = packageManager.resolveActivity(Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_HOME), PackageManager.MATCH_DEFAULT_ONLY)
        ri?.activityInfo?.packageName == packageName
    } catch (e: Exception) {
        false
    }

    private fun accEnabled(): Boolean = try {
        val s = Settings.Secure.getString(contentResolver, Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES) ?: ""
        s.contains("$packageName/")
    } catch (e: Exception) {
        false
    }

    fun statusJson(): String {
        val o = JSONObject()
        o.put("def", isDefaultHome())
        o.put("notif", NotificationManagerCompat.getEnabledListenerPackages(this).contains(packageName))
        o.put("acc", Hub.lockService != null || accEnabled())
        o.put("cal", checkSelfPermission(Manifest.permission.READ_CALENDAR) == PackageManager.PERMISSION_GRANTED)
        o.put("loc", checkSelfPermission(Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED)
        o.put("write", Settings.System.canWrite(this))
        o.put("batt", try {
            getSystemService(PowerManager::class.java)?.isIgnoringBatteryOptimizations(packageName) == true
        } catch (e: Exception) {
            false
        })
        val dev = try {
            Settings.Global.getString(contentResolver, Settings.Global.DEVICE_NAME)
        } catch (e: Exception) {
            null
        }
        o.put("model", if (!dev.isNullOrBlank()) dev else Build.MANUFACTURER.replaceFirstChar { it.uppercase() } + " " + Build.MODEL)
        o.put("android", Build.VERSION.RELEASE)
        o.put("sdk", Build.VERSION.SDK_INT)
        o.put("xiaomi", Build.MANUFACTURER.equals("Xiaomi", ignoreCase = true) || Build.BRAND.equals("POCO", ignoreCase = true) || Build.BRAND.equals("Redmi", ignoreCase = true))
        return o.toString()
    }

    fun makeDefault() {
        ui {
            var done = false
            if (Build.VERSION.SDK_INT >= 29) {
                try {
                    val rm = getSystemService(RoleManager::class.java)
                    if (rm != null && rm.isRoleAvailable(RoleManager.ROLE_HOME) && !rm.isRoleHeld(RoleManager.ROLE_HOME)) {
                        startActivityForResult(rm.createRequestRoleIntent(RoleManager.ROLE_HOME), RC_ROLE)
                        done = true
                    }
                } catch (e: Exception) {
                }
            }
            if (!done) go(Intent(Settings.ACTION_HOME_SETTINGS))
        }
    }

    fun openNotifAccess() {
        ui {
            var ok = false
            if (Build.VERSION.SDK_INT >= 30) {
                val i = Intent(Settings.ACTION_NOTIFICATION_LISTENER_DETAIL_SETTINGS)
                i.putExtra(Settings.EXTRA_NOTIFICATION_LISTENER_COMPONENT_NAME, ComponentName(this, NotifService::class.java).flattenToString())
                ok = go(i)
            }
            if (!ok) go(Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS))
        }
    }

    fun openAccessibility() {
        ui { go(Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)) }
    }

    fun askCalendar() {
        ui {
            if (checkSelfPermission(Manifest.permission.READ_CALENDAR) == PackageManager.PERMISSION_GRANTED) emit("perm", JSONObject.quote("cal"))
            else requestPermissions(arrayOf(Manifest.permission.READ_CALENDAR), RC_CAL)
        }
    }

    fun askLocation() {
        ui {
            if (checkSelfPermission(Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED) emit("perm", JSONObject.quote("loc"))
            else requestPermissions(arrayOf(Manifest.permission.ACCESS_COARSE_LOCATION), RC_LOC)
        }
    }

    fun askWrite() {
        ui {
            if (!go(Intent(Settings.ACTION_MANAGE_WRITE_SETTINGS, Uri.parse("package:$packageName")))) go(Intent(Settings.ACTION_MANAGE_WRITE_SETTINGS))
        }
    }

    fun openBattery() {
        ui {
            val ok = go(Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS, Uri.parse("package:$packageName")))
            if (!ok) go(Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS))
        }
    }

    fun openAutostart() {
        ui {
            val i = Intent().setComponent(ComponentName("com.miui.securitycenter", "com.miui.permcenter.autostart.AutoStartManagementActivity"))
            if (!go(i)) go(Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:$packageName")))
        }
    }

    fun openDream() {
        ui {
            if (!go(Intent(Settings.ACTION_DREAM_SETTINGS))) go(Intent(Settings.ACTION_DISPLAY_SETTINGS))
        }
    }

    fun openAppSettings() {
        ui { go(Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:$packageName"))) }
    }

    fun openEvent(id: Long, begin: Long) {
        ui {
            val i = if (id > 0) Intent(Intent.ACTION_VIEW, ContentUris.withAppendedId(CalendarContract.Events.CONTENT_URI, id))
            else Intent(Intent.ACTION_VIEW, CalendarContract.CONTENT_URI.buildUpon().appendPath("time").appendPath(begin.toString()).build())
            if (!go(i)) go(Intent(Intent.ACTION_VIEW, CalendarContract.CONTENT_URI.buildUpon().appendPath("time").appendPath(System.currentTimeMillis().toString()).build()))
        }
    }

    fun setWallpaper(which: String) {
        Thread {
            val ok = try {
                val wm = WallpaperManager.getInstance(this)
                val flags = if (which == "lock") WallpaperManager.FLAG_LOCK else (WallpaperManager.FLAG_LOCK or WallpaperManager.FLAG_SYSTEM)
                assets.open("web/wp/wp09.jpg").use { wm.setStream(it, null, true, flags) }
                true
            } catch (e: Exception) {
                false
            }
            emit("toast", JSONObject.quote(if (ok) "Обои 09 поставлены" else "Не получилось поставить обои"))
        }.start()
    }

    @Suppress("MissingPermission")
    fun lastLocation(): String {
        if (checkSelfPermission(Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) return ""
        val lm = getSystemService(LocationManager::class.java) ?: return ""
        var best: Location? = null
        for (p in listOf(LocationManager.NETWORK_PROVIDER, LocationManager.PASSIVE_PROVIDER, LocationManager.GPS_PROVIDER)) {
            val l = try {
                lm.getLastKnownLocation(p)
            } catch (e: Exception) {
                null
            }
            if (l != null) {
                val b = best
                if (b == null || l.time > b.time) best = l
            }
        }
        if (best == null && Build.VERSION.SDK_INT >= 30) {
            ui {
                try {
                    lm.getCurrentLocation(LocationManager.NETWORK_PROVIDER, null, mainExecutor) { loc ->
                        if (loc != null) {
                            lastLoc = loc
                            emit("loc")
                        }
                    }
                } catch (e: Exception) {
                }
            }
        }
        val r = best ?: lastLoc ?: return ""
        return r.latitude.toString() + "," + r.longitude.toString()
    }

    /** Приложение настроек «Стрелиция» (SettingsActivity), открывается своей задачей. */
    fun openSettingsApp(page: String) {
        ui {
            val i = Intent(this, SettingsActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            if (page.isNotEmpty()) i.putExtra("page", page)
            go(i)
        }
    }

    fun vibe(ms: Int) {
        try {
            @Suppress("DEPRECATION")
            val v = getSystemService(Vibrator::class.java) ?: return
            if (!v.hasVibrator()) return
            v.vibrate(VibrationEffect.createOneShot(ms.coerceIn(5, 400).toLong(), VibrationEffect.DEFAULT_AMPLITUDE))
        } catch (e: Exception) {
        }
    }

    fun vibePattern(json: String) {
        try {
            val a = JSONArray(json)
            val t = LongArray(a.length() + 1)
            t[0] = 0
            for (i in 0 until a.length()) t[i + 1] = a.optLong(i).coerceIn(0, 600)
            @Suppress("DEPRECATION")
            val v = getSystemService(Vibrator::class.java) ?: return
            if (!v.hasVibrator()) return
            v.vibrate(VibrationEffect.createWaveform(t, -1))
        } catch (e: Exception) {
        }
    }

    fun exclude(json: String) {
        ui {
            if (Build.VERSION.SDK_INT >= 29) {
                try {
                    val d = resources.displayMetrics.density
                    val arr = JSONArray(json)
                    val rects = ArrayList<Rect>()
                    for (i in 0 until arr.length()) {
                        val a = arr.optJSONArray(i) ?: continue
                        rects.add(Rect((a.optDouble(0) * d).toInt(), (a.optDouble(1) * d).toInt(), (a.optDouble(2) * d).toInt(), (a.optDouble(3) * d).toInt()))
                    }
                    web.systemGestureExclusionRects = rects
                } catch (e: Exception) {
                }
            }
        }
    }
}
