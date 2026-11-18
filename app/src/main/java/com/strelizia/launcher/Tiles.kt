package com.strelizia.launcher

import android.content.Context
import android.content.Intent
import android.content.res.Configuration
import android.location.LocationManager
import android.media.AudioManager
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.net.Uri
import android.os.Build
import android.os.PowerManager
import android.provider.AlarmClock
import android.provider.MediaStore
import android.provider.Settings
import org.json.JSONObject

/**
 * Плитки пункта управления сверх базовых: состояние и нажатие.
 * Что Android не даёт переключать сторонним приложениям, открывается своим системным экраном.
 */
object Tiles {
    private fun safe(f: () -> Boolean): Boolean = try {
        f()
    } catch (e: Exception) {
        false
    }

    fun json(ctx: Context): String {
        val o = JSONObject()
        o.put("loc", safe {
            val lm = ctx.getSystemService(LocationManager::class.java)
            if (lm == null) false
            else if (Build.VERSION.SDK_INT >= 28) lm.isLocationEnabled
            else lm.isProviderEnabled(LocationManager.NETWORK_PROVIDER) || lm.isProviderEnabled(LocationManager.GPS_PROVIDER)
        })
        o.put("nfc", safe { android.nfc.NfcAdapter.getDefaultAdapter(ctx)?.isEnabled == true })
        o.put("dark", (ctx.resources.configuration.uiMode and Configuration.UI_MODE_NIGHT_MASK) == Configuration.UI_MODE_NIGHT_YES)
        o.put("saver", safe { ctx.getSystemService(PowerManager::class.java)?.isPowerSaveMode == true })
        o.put("datasaver", safe {
            val cm = ctx.getSystemService(ConnectivityManager::class.java)
            cm != null && cm.restrictBackgroundStatus == ConnectivityManager.RESTRICT_BACKGROUND_STATUS_ENABLED
        })
        o.put("vpn", safe {
            val cm = ctx.getSystemService(ConnectivityManager::class.java)
            val caps = if (cm == null) null else cm.getNetworkCapabilities(cm.activeNetwork)
            caps?.hasTransport(NetworkCapabilities.TRANSPORT_VPN) == true
        })
        o.put("abright", safe {
            Settings.System.getInt(ctx.contentResolver, Settings.System.SCREEN_BRIGHTNESS_MODE, 0) == Settings.System.SCREEN_BRIGHTNESS_MODE_AUTOMATIC
        })
        o.put("ring", Sys.ringer(ctx))
        return o.toString()
    }

    fun tap(ctx: Context, k: String): Boolean {
        if (k == "abright") return autoBright(ctx)
        if (k == "ring") return ring(ctx)
        val pm = ctx.packageManager
        val tries: List<Intent?> = when (k) {
            "loc" -> listOf(Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS))
            "hot" -> listOf(Intent().setClassName("com.android.settings", "com.android.settings.TetherSettings"), Intent(Settings.ACTION_WIRELESS_SETTINGS))
            "nfc" -> listOf(Intent(Settings.ACTION_NFC_SETTINGS), Intent(Settings.ACTION_WIRELESS_SETTINGS))
            "cast" -> listOf(Intent(Settings.ACTION_CAST_SETTINGS), Intent("android.settings.WIFI_DISPLAY_SETTINGS"))
            "dark" -> listOf(Intent("android.settings.DARK_THEME_SETTINGS"), Intent(Settings.ACTION_DISPLAY_SETTINGS))
            "night" -> listOf(Intent("android.settings.NIGHT_DISPLAY_SETTINGS"), Intent(Settings.ACTION_DISPLAY_SETTINGS))
            "saver" -> listOf(Intent(Settings.ACTION_BATTERY_SAVER_SETTINGS), Intent(Intent.ACTION_POWER_USAGE_SUMMARY))
            "datasaver" -> listOf(Intent("android.settings.DATA_SAVER_SETTINGS"), Intent("android.settings.DATA_USAGE_SETTINGS"), Intent(Settings.ACTION_WIRELESS_SETTINGS))
            "vpn" -> listOf(Intent(Settings.ACTION_VPN_SETTINGS))
            "alarm" -> listOf(Intent(AlarmClock.ACTION_SHOW_ALARMS))
            "timer" -> listOf(Intent(AlarmClock.ACTION_SHOW_TIMERS), Intent(AlarmClock.ACTION_SHOW_ALARMS))
            "calc" -> listOf(Intent.makeMainSelectorActivity(Intent.ACTION_MAIN, Intent.CATEGORY_APP_CALCULATOR), pm.getLaunchIntentForPackage("com.miui.calculator"))
            "cam" -> listOf(Intent(MediaStore.INTENT_ACTION_STILL_IMAGE_CAMERA))
            "qr" -> listOf(pm.getLaunchIntentForPackage("com.xiaomi.scanner"), Intent(MediaStore.INTENT_ACTION_STILL_IMAGE_CAMERA))
            "rec" -> listOf(pm.getLaunchIntentForPackage("com.miui.screenrecorder"), Intent(Settings.ACTION_SETTINGS))
            "wallet" -> listOf(pm.getLaunchIntentForPackage("com.google.android.apps.walletnfcrel"), Intent(Settings.ACTION_NFC_PAYMENT_SETTINGS))
            "invert" -> listOf(Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS))
            else -> listOf(Intent(Settings.ACTION_SETTINGS))
        }
        for (i in tries) if (i != null && Sys.open(ctx, i)) return true
        return Sys.open(ctx, Intent(Settings.ACTION_SETTINGS))
    }

    private fun autoBright(ctx: Context): Boolean {
        if (!Settings.System.canWrite(ctx)) {
            Sys.open(ctx, Intent(Settings.ACTION_MANAGE_WRITE_SETTINGS, Uri.parse("package:" + ctx.packageName)))
            return false
        }
        return safe {
            val cr = ctx.contentResolver
            val auto = Settings.System.getInt(cr, Settings.System.SCREEN_BRIGHTNESS_MODE, 0) == Settings.System.SCREEN_BRIGHTNESS_MODE_AUTOMATIC
            Settings.System.putInt(cr, Settings.System.SCREEN_BRIGHTNESS_MODE, if (auto) Settings.System.SCREEN_BRIGHTNESS_MODE_MANUAL else Settings.System.SCREEN_BRIGHTNESS_MODE_AUTOMATIC)
            Hub.emit("qs")
            true
        }
    }

    private fun ring(ctx: Context): Boolean {
        val am = ctx.getSystemService(AudioManager::class.java) ?: return false
        return try {
            am.ringerMode = when (am.ringerMode) {
                AudioManager.RINGER_MODE_NORMAL -> AudioManager.RINGER_MODE_VIBRATE
                AudioManager.RINGER_MODE_VIBRATE -> AudioManager.RINGER_MODE_SILENT
                else -> AudioManager.RINGER_MODE_NORMAL
            }
            Hub.emit("qs")
            true
        } catch (e: Exception) {
            // «Без звука» Android разрешает только с доступом к режиму «Не беспокоить»
            Sys.open(ctx, Intent(Settings.ACTION_NOTIFICATION_POLICY_ACCESS_SETTINGS))
            false
        }
    }
}
