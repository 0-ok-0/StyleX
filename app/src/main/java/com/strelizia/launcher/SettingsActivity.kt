package com.strelizia.launcher

import android.Manifest
import android.app.Activity
import android.app.WallpaperManager
import android.app.role.RoleManager
import android.content.ComponentName
import android.content.Intent
import android.content.pm.PackageManager
import android.content.res.Configuration
import android.graphics.Color
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.PowerManager
import android.os.VibrationEffect
import android.os.Vibrator
import android.provider.Settings
import android.util.Log
import android.webkit.JavascriptInterface
import android.webkit.WebView
import androidx.core.app.NotificationManagerCompat
import androidx.core.view.WindowInsetsControllerCompat
import org.json.JSONObject

/**
 * Приложение «Стрелиция» из списка приложений: настройки в стиле системных (assets/web/settings.html).
 * Рабочий стол живёт отдельно, в MainActivity (кнопка «Домой»).
 */
class SettingsActivity : Activity() {

    lateinit var web: WebView
    private var ready = false
    private val pending = ArrayList<String>()

    companion object {
        private const val RC_CAL = 21
        private const val RC_LOC = 22
        private const val RC_ROLE = 23
    }

    fun isNight(): Boolean =
        (resources.configuration.uiMode and Configuration.UI_MODE_NIGHT_MASK) == Configuration.UI_MODE_NIGHT_YES

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val dark = isNight()
        val bg = if (dark) Color.BLACK else Color.rgb(247, 247, 247)
        window.statusBarColor = bg
        window.navigationBarColor = bg

        web = WebView(this)
        Web.setup(web, this)
        web.setBackgroundColor(bg)
        web.addJavascriptInterface(SetBridge(this), "Android")
        setContentView(web)

        val ctl = WindowInsetsControllerCompat(window, web)
        ctl.isAppearanceLightStatusBars = !dark
        ctl.isAppearanceLightNavigationBars = !dark

        web.loadUrl(Web.URL_SET + pageHash(intent))
    }

    private fun pageHash(i: Intent?): String {
        val p = i?.getStringExtra("page") ?: ""
        return if (p.isEmpty()) "" else "#page=" + Uri.encode(p)
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        val p = intent.getStringExtra("page") ?: ""
        if (p.isNotEmpty() && ready) web.evaluateJavascript("window.SX&&SX.go(" + JSONObject.quote(p) + ")", null)
    }

    /** Событие в интерфейс настроек: SXN(name, payload). */
    fun emit(name: String, payload: String = "null") {
        runOnUiThread {
            val js = "window.SXN&&SXN(" + JSONObject.quote(name) + "," + payload + ")"
            if (!ready) {
                if (pending.size < 50) pending.add(js)
            } else {
                web.evaluateJavascript(js, null)
            }
        }
    }

    fun onReady() {
        runOnUiThread {
            ready = true
            for (js in pending) web.evaluateJavascript(js, null)
            pending.clear()
        }
    }

    override fun onResume() {
        super.onResume()
        web.onResume()
        emit("resume")
    }

    override fun onPause() {
        web.onPause()
        super.onPause()
    }

    override fun onDestroy() {
        web.destroy()
        super.onDestroy()
    }

    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        if (!ready) {
            finish()
            return
        }
        // «назад» сначала закрывает диалог или подраздел, на главном экране настроек закрывает приложение
        web.evaluateJavascript("(window.SX&&SX.back())?1:0") { r -> if (r != "1") finish() }
    }

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>, grantResults: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        emit("perm", JSONObject.quote(if (requestCode == RC_CAL) "cal" else "loc"))
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == RC_ROLE) emit("perm", JSONObject.quote("def"))
    }

    fun go(i: Intent): Boolean = try {
        startActivity(i)
        true
    } catch (e: Exception) {
        false
    }

    private fun isDefaultHome(): Boolean = try {
        val ri = packageManager.resolveActivity(Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_HOME), PackageManager.MATCH_DEFAULT_ONLY)
        ri?.activityInfo?.packageName == packageName
    } catch (e: Exception) {
        false
    }

    fun statusJson(): String {
        val o = JSONObject()
        o.put("def", isDefaultHome())
        o.put("notif", NotificationManagerCompat.getEnabledListenerPackages(this).contains(packageName))
        val accOn = try {
            (Settings.Secure.getString(contentResolver, Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES) ?: "").contains("$packageName/")
        } catch (e: Exception) {
            false
        }
        o.put("acc", Hub.lockService != null || accOn)
        o.put("cal", checkSelfPermission(Manifest.permission.READ_CALENDAR) == PackageManager.PERMISSION_GRANTED)
        o.put("loc", checkSelfPermission(Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED)
        o.put("write", Settings.System.canWrite(this))
        val dndOn = try {
            getSystemService(android.app.NotificationManager::class.java)?.isNotificationPolicyAccessGranted == true
        } catch (e: Exception) {
            false
        }
        o.put("dnd", dndOn)
        val battOn = try {
            getSystemService(PowerManager::class.java)?.isIgnoringBatteryOptimizations(packageName) == true
        } catch (e: Exception) {
            false
        }
        o.put("batt", battOn)
        val ver = try {
            @Suppress("DEPRECATION")
            val pi = packageManager.getPackageInfo(packageName, 0)
            pi.versionName ?: ""
        } catch (e: Exception) {
            ""
        }
        o.put("ver", ver)
        o.put("model", Build.MANUFACTURER.replaceFirstChar { it.uppercase() } + " " + Build.MODEL)
        o.put("android", Build.VERSION.RELEASE)
        o.put("sdk", Build.VERSION.SDK_INT)
        return o.toString()
    }

    fun makeDefault() {
        runOnUiThread {
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

    fun askCalendar() {
        runOnUiThread {
            if (checkSelfPermission(Manifest.permission.READ_CALENDAR) == PackageManager.PERMISSION_GRANTED) emit("perm", JSONObject.quote("cal"))
            else requestPermissions(arrayOf(Manifest.permission.READ_CALENDAR), RC_CAL)
        }
    }

    fun askLocation() {
        runOnUiThread {
            if (checkSelfPermission(Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED) emit("perm", JSONObject.quote("loc"))
            else requestPermissions(arrayOf(Manifest.permission.ACCESS_COARSE_LOCATION), RC_LOC)
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

    fun vibe(ms: Int) {
        try {
            @Suppress("DEPRECATION")
            val v = getSystemService(Vibrator::class.java) ?: return
            if (!v.hasVibrator()) return
            v.vibrate(VibrationEffect.createOneShot(ms.coerceIn(5, 400).toLong(), VibrationEffect.DEFAULT_AMPLITUDE))
        } catch (e: Exception) {
        }
    }
}

/** Мост приложения настроек. Имя в JS: window.Android (settings.js). */
class SetBridge(private val a: SettingsActivity) {

    private fun ui(f: () -> Unit) = a.runOnUiThread { f() }

    private fun open(vararg list: Intent) {
        ui {
            for (i in list) if (a.go(i)) break
        }
    }

    @JavascriptInterface fun ready() = a.onReady()
    @JavascriptInterface fun status(): String = a.statusJson()
    @JavascriptInterface fun night(): Boolean = a.isNight()
    @JavascriptInterface fun cutout(): String = Island.cutoutJson(a)

    @JavascriptInterface fun makeDefault() = a.makeDefault()
    @JavascriptInterface fun homeSettings() = open(Intent(Settings.ACTION_HOME_SETTINGS), Intent(Settings.ACTION_SETTINGS))

    @JavascriptInterface
    fun openNotifAccess() {
        val list = ArrayList<Intent>()
        if (Build.VERSION.SDK_INT >= 30) {
            list.add(
                Intent(Settings.ACTION_NOTIFICATION_LISTENER_DETAIL_SETTINGS)
                    .putExtra(Settings.EXTRA_NOTIFICATION_LISTENER_COMPONENT_NAME, ComponentName(a, NotifService::class.java).flattenToString())
            )
        }
        list.add(Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS))
        open(*list.toTypedArray())
    }

    @JavascriptInterface fun openAccessibility() = open(Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS))
    @JavascriptInterface fun askCalendar() = a.askCalendar()
    @JavascriptInterface fun askLocation() = a.askLocation()
    @JavascriptInterface fun askWrite() = open(Intent(Settings.ACTION_MANAGE_WRITE_SETTINGS, Uri.parse("package:" + a.packageName)), Intent(Settings.ACTION_MANAGE_WRITE_SETTINGS))
    @JavascriptInterface fun openDndAccess() = open(Intent(Settings.ACTION_NOTIFICATION_POLICY_ACCESS_SETTINGS))
    @JavascriptInterface fun openBattery() = open(Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS, Uri.parse("package:" + a.packageName)), Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS))
    @JavascriptInterface fun openAutostart() = open(Intent().setComponent(ComponentName("com.miui.securitycenter", "com.miui.permcenter.autostart.AutoStartManagementActivity")), Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:" + a.packageName)))
    @JavascriptInterface fun openDream() = open(Intent(Settings.ACTION_DREAM_SETTINGS), Intent(Settings.ACTION_DISPLAY_SETTINGS))
    @JavascriptInterface fun openAppSettings() = open(Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:" + a.packageName)))
    @JavascriptInterface fun openSecurity() = open(Intent(Settings.ACTION_SECURITY_SETTINGS), Intent(Settings.ACTION_SETTINGS))

    @JavascriptInterface fun goHome() = open(Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_HOME).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
    @JavascriptInterface fun openLauncher() = ui {
        a.go(Intent(a, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
    }
    @JavascriptInterface fun close() = ui { a.finish() }
    @JavascriptInterface fun setWallpaper(which: String?) = a.setWallpaper(which ?: "both")

    @JavascriptInterface
    fun settingsChanged(json: String?) {
        val s = json ?: return
        val ok = try {
            JSONObject(s)
            true
        } catch (e: Exception) {
            false
        }
        if (ok) Hub.emit("settings", s)
    }

    @JavascriptInterface fun island(json: String?) = Island.save(a, json ?: "{}")
    @JavascriptInterface fun vibe(ms: Int) = a.vibe(ms)

    @JavascriptInterface
    fun log(m: String?) {
        Log.w("StreliziaSet", m ?: "")
    }
}
