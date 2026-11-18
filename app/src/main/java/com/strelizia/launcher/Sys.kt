package com.strelizia.launcher

import android.app.Activity
import android.app.ActivityManager
import android.app.NotificationManager
import android.bluetooth.BluetoothManager
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.res.Resources
import android.hardware.camera2.CameraCharacteristics
import android.hardware.camera2.CameraManager
import android.media.AudioManager
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.net.wifi.WifiManager
import android.os.BatteryManager
import android.os.Build
import android.os.Environment
import android.os.Handler
import android.os.Looper
import android.os.StatFs
import android.provider.Settings
import org.json.JSONObject
import kotlin.math.roundToInt

/** Заряд, память, сеть и быстрые настройки для шторки. */
object Sys {
    fun open(ctx: Context, i: Intent): Boolean = try {
        ctx.startActivity(i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
        true
    } catch (e: Exception) {
        false
    }

    fun batteryFrom(i: Intent): Pair<Int, Boolean> {
        val level = i.getIntExtra(BatteryManager.EXTRA_LEVEL, -1)
        val scale = i.getIntExtra(BatteryManager.EXTRA_SCALE, 100)
        val st = i.getIntExtra(BatteryManager.EXTRA_STATUS, -1)
        val chg = st == BatteryManager.BATTERY_STATUS_CHARGING || st == BatteryManager.BATTERY_STATUS_FULL
        return Pair(if (level >= 0 && scale > 0) level * 100 / scale else 0, chg)
    }

    fun battery(ctx: Context): Pair<Int, Boolean> {
        val i = try {
            ctx.registerReceiver(null, IntentFilter(Intent.ACTION_BATTERY_CHANGED))
        } catch (e: Exception) {
            null
        }
        return if (i != null) batteryFrom(i) else Pair(0, false)
    }

    fun sysJson(ctx: Context): String {
        val o = JSONObject()
        val (b, c) = battery(ctx)
        o.put("bat", b)
        o.put("chg", c)
        try {
            val am = ctx.getSystemService(ActivityManager::class.java)
            val mi = ActivityManager.MemoryInfo()
            am?.getMemoryInfo(mi)
            o.put("ramFree", mi.availMem)
            o.put("ramTotal", mi.totalMem)
        } catch (e: Exception) {
        }
        try {
            val sf = StatFs(Environment.getDataDirectory().path)
            o.put("stFree", sf.availableBytes)
            o.put("stTotal", sf.totalBytes)
        } catch (e: Exception) {
        }
        o.put("net", net(ctx))
        o.put("cores", Runtime.getRuntime().availableProcessors())
        return o.toString()
    }

    private fun net(ctx: Context): String = try {
        val cm = ctx.getSystemService(ConnectivityManager::class.java)
        val caps = if (cm == null) null else cm.getNetworkCapabilities(cm.activeNetwork)
        when {
            caps == null -> "нет сети"
            caps.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) -> "Wi-Fi"
            caps.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR) -> "моб. сеть"
            caps.hasTransport(NetworkCapabilities.TRANSPORT_VPN) -> "VPN"
            else -> "сеть"
        }
    } catch (e: Exception) {
        "сеть"
    }

    fun qsJson(ctx: Context): String {
        val o = JSONObject()
        o.put("wifi", try {
            (ctx.applicationContext.getSystemService(Context.WIFI_SERVICE) as WifiManager).isWifiEnabled
        } catch (e: Exception) {
            false
        })
        o.put("bt", try {
            ctx.getSystemService(BluetoothManager::class.java)?.adapter?.isEnabled == true
        } catch (e: Exception) {
            false
        })
        o.put("torch", Torch.on)
        val nm = ctx.getSystemService(NotificationManager::class.java)
        o.put("dnd", try {
            (nm?.currentInterruptionFilter ?: 0) > NotificationManager.INTERRUPTION_FILTER_ALL
        } catch (e: Exception) {
            false
        })
        o.put("dndAccess", try {
            nm?.isNotificationPolicyAccessGranted == true
        } catch (e: Exception) {
            false
        })
        o.put("air", try {
            Settings.Global.getInt(ctx.contentResolver, Settings.Global.AIRPLANE_MODE_ON, 0) == 1
        } catch (e: Exception) {
            false
        })
        o.put("brt", brightness(ctx).toDouble())
        o.put("write", Settings.System.canWrite(ctx))
        return o.toString()
    }

    private fun brMax(ctx: Context): Int {
        var mx = 255
        try {
            val id = Resources.getSystem().getIdentifier("config_screenBrightnessSettingMaximum", "integer", "android")
            if (id != 0) mx = Resources.getSystem().getInteger(id)
        } catch (e: Exception) {
        }
        val cur = try {
            Settings.System.getInt(ctx.contentResolver, Settings.System.SCREEN_BRIGHTNESS)
        } catch (e: Exception) {
            0
        }
        if (cur > mx) mx = if (cur <= 2047) 2047 else if (cur <= 4095) 4095 else 16383
        if (mx <= 0) mx = 255
        return mx
    }

    fun brightness(ctx: Context): Float {
        val cur = try {
            Settings.System.getInt(ctx.contentResolver, Settings.System.SCREEN_BRIGHTNESS)
        } catch (e: Exception) {
            128
        }
        return (cur.toFloat() / brMax(ctx)).coerceIn(0f, 1f)
    }

    fun setBrightness(act: Activity, v: Float): Boolean {
        val c = v.coerceIn(0.01f, 1f)
        if (Settings.System.canWrite(act)) {
            try {
                val mx = brMax(act)
                Settings.System.putInt(act.contentResolver, Settings.System.SCREEN_BRIGHTNESS_MODE, Settings.System.SCREEN_BRIGHTNESS_MODE_MANUAL)
                Settings.System.putInt(act.contentResolver, Settings.System.SCREEN_BRIGHTNESS, (c * mx).roundToInt().coerceIn(1, mx))
                return true
            } catch (e: Exception) {
            }
        }
        act.runOnUiThread {
            val lp = act.window.attributes
            lp.screenBrightness = c
            act.window.attributes = lp
        }
        return false
    }

    fun dnd(ctx: Context, on: Boolean): Boolean {
        val nm = ctx.getSystemService(NotificationManager::class.java) ?: return false
        if (!nm.isNotificationPolicyAccessGranted) {
            open(ctx, Intent(Settings.ACTION_NOTIFICATION_POLICY_ACCESS_SETTINGS))
            return false
        }
        return try {
            nm.setInterruptionFilter(if (on) NotificationManager.INTERRUPTION_FILTER_PRIORITY else NotificationManager.INTERRUPTION_FILTER_ALL)
            true
        } catch (e: Exception) {
            false
        }
    }

    fun panel(ctx: Context, k: String) {
        if (k == "notif") {
            // общие настройки уведомлений телефона, не лаунчера. В HyperOS это «Уведомления и строка состояния»
            val tries = listOf(
                Intent("android.settings.NOTIFICATION_SETTINGS"),
                Intent("android.settings.ALL_APPS_NOTIFICATION_SETTINGS"),
                Intent().setClassName("com.miui.notification", "miui.notification.management.activity.NotificationAppListActivity"),
                Intent(Settings.ACTION_SETTINGS)
            )
            for (t in tries) if (open(ctx, t)) return
            return
        }
        val i = when (k) {
            "wifi" -> if (Build.VERSION.SDK_INT >= 29) Intent(Settings.Panel.ACTION_WIFI) else Intent(Settings.ACTION_WIFI_SETTINGS)
            "bt" -> Intent(Settings.ACTION_BLUETOOTH_SETTINGS)
            "air" -> Intent(Settings.ACTION_AIRPLANE_MODE_SETTINGS)
            "net" -> if (Build.VERSION.SDK_INT >= 29) Intent(Settings.Panel.ACTION_INTERNET_CONNECTIVITY) else Intent(Settings.ACTION_WIRELESS_SETTINGS)
            "volume" -> if (Build.VERSION.SDK_INT >= 29) Intent(Settings.Panel.ACTION_VOLUME) else Intent(Settings.ACTION_SOUND_SETTINGS)
            "settings" -> Intent(Settings.ACTION_SETTINGS)
            else -> Intent(Settings.ACTION_SETTINGS)
        }
        if (!open(ctx, i)) open(ctx, Intent(Settings.ACTION_SETTINGS))
    }

    fun ringer(ctx: Context): String = try {
        when (ctx.getSystemService(AudioManager::class.java)?.ringerMode) {
            AudioManager.RINGER_MODE_SILENT -> "silent"
            AudioManager.RINGER_MODE_VIBRATE -> "vibrate"
            else -> "normal"
        }
    } catch (e: Exception) {
        "normal"
    }
}

/** Настоящий фонарик через камеру, без разрешения на камеру. */
object Torch {
    @Volatile var on = false
    private var id: String? = null
    private var inited = false

    fun init(ctx: Context) {
        if (inited) return
        inited = true
        val cm = ctx.getSystemService(CameraManager::class.java) ?: return
        id = try {
            cm.cameraIdList.firstOrNull { cm.getCameraCharacteristics(it).get(CameraCharacteristics.FLASH_INFO_AVAILABLE) == true }
        } catch (e: Exception) {
            null
        }
        try {
            cm.registerTorchCallback(object : CameraManager.TorchCallback() {
                override fun onTorchModeChanged(cameraId: String, enabled: Boolean) {
                    if (cameraId == id) {
                        on = enabled
                        Hub.emit("qs")
                    }
                }
            }, Handler(Looper.getMainLooper()))
        } catch (e: Exception) {
        }
    }

    fun set(ctx: Context, v: Boolean): Boolean {
        val cm = ctx.getSystemService(CameraManager::class.java) ?: return false
        val i = id ?: return false
        return try {
            cm.setTorchMode(i, v)
            true
        } catch (e: Exception) {
            false
        }
    }
}
