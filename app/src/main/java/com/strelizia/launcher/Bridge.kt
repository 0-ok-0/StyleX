package com.strelizia.launcher

import android.util.Log
import android.webkit.JavascriptInterface

/** Всё, что интерфейс (JS) может спросить или попросить у Android. Имя в JS: window.Android. */
class Bridge(private val act: MainActivity) {

    @JavascriptInterface fun ready() = act.onPageReady()

    @JavascriptInterface fun apps(): String = Apps.json(act)
    @JavascriptInterface fun defaults(): String = Apps.defaults(act)
    @JavascriptInterface fun status(): String = act.statusJson()
    @JavascriptInterface fun qs(): String = Sys.qsJson(act)
    @JavascriptInterface fun sys(): String = Sys.sysJson(act)
    @JavascriptInterface fun media(): String = Media.json(act)
    @JavascriptInterface fun events(): String = Cal.json(act)
    @JavascriptInterface fun location(): String = act.lastLocation()
    @JavascriptInterface fun ringer(): String = Sys.ringer(act)
    @JavascriptInterface fun shortcuts(id: String?): String = Apps.shortcutsJson(act, id ?: "")

    @JavascriptInterface
    fun notifs(): String {
        Hub.notifService?.refresh()
        val arr = org.json.JSONArray()
        for (n in Hub.notifs) {
            arr.put(
                org.json.JSONObject()
                    .put("k", n.key).put("p", n.pkg).put("t", n.title).put("s", n.text)
                    .put("tm", n.time).put("c", n.clearable).put("app", Apps.label(act, n.pkg))
            )
        }
        val perm = androidx.core.app.NotificationManagerCompat.getEnabledListenerPackages(act).contains(act.packageName)
        return org.json.JSONObject().put("perm", perm).put("list", arr).toString()
    }

    @JavascriptInterface fun launch(id: String?, x: Double, y: Double, w: Double, h: Double): Boolean = act.launchApp(id ?: "", x, y, w, h)
    @JavascriptInterface fun shortcut(id: String?, sc: String?): Boolean = act.shortcut(id ?: "", sc ?: "")
    @JavascriptInterface fun info(id: String?) = act.appInfo(id ?: "")
    @JavascriptInterface fun uninstall(id: String?) = act.uninstall(id ?: "")

    @JavascriptInterface fun openNotif(k: String?) = act.openNotif(k ?: "")
    @JavascriptInterface fun dismissNotif(k: String?) = act.dismissNotif(k ?: "")
    @JavascriptInterface fun clearNotifs() = act.clearNotifs()

    @JavascriptInterface fun mediaCmd(c: String?) = Media.cmd(act, c ?: "")
    @JavascriptInterface fun torch(on: Boolean): Boolean = Torch.set(act, on)
    @JavascriptInterface fun dnd(on: Boolean): Boolean = Sys.dnd(act, on)
    @JavascriptInterface fun panel(k: String?) = Sys.panel(act, k ?: "")
    @JavascriptInterface fun setBrightness(v: Double): Boolean = Sys.setBrightness(act, v.toFloat())
    @JavascriptInterface fun askWrite() = act.askWrite()

    @JavascriptInterface
    fun volume(): String = try {
        val am = act.getSystemService(android.media.AudioManager::class.java)
        if (am == null) "{}" else {
            val mx = am.getStreamMaxVolume(android.media.AudioManager.STREAM_MUSIC).coerceAtLeast(1)
            val cur = am.getStreamVolume(android.media.AudioManager.STREAM_MUSIC)
            org.json.JSONObject().put("v", cur.toDouble() / mx).put("max", mx).toString()
        }
    } catch (e: Exception) {
        "{}"
    }

    @JavascriptInterface
    fun setVolume(v: Double): Boolean = try {
        val am = act.getSystemService(android.media.AudioManager::class.java)
        if (am == null) false else {
            val mx = am.getStreamMaxVolume(android.media.AudioManager.STREAM_MUSIC)
            am.setStreamVolume(android.media.AudioManager.STREAM_MUSIC, Math.round(v.coerceIn(0.0, 1.0) * mx).toInt(), 0)
            true
        }
    } catch (e: Exception) {
        false
    }

    @JavascriptInterface
    fun rotation(): Boolean = try {
        android.provider.Settings.System.getInt(act.contentResolver, android.provider.Settings.System.ACCELEROMETER_ROTATION, 0) == 1
    } catch (e: Exception) {
        false
    }

    @JavascriptInterface
    fun setRotation(on: Boolean): Boolean = try {
        if (!android.provider.Settings.System.canWrite(act)) false
        else android.provider.Settings.System.putInt(act.contentResolver, android.provider.Settings.System.ACCELEROMETER_ROTATION, if (on) 1 else 0)
    } catch (e: Exception) {
        false
    }

    @JavascriptInterface fun screenshot(): Boolean = Hub.lockService?.screenshot() ?: false
    @JavascriptInterface fun lock(): Boolean = act.lockScreen()
    @JavascriptInterface fun sysShade(): Boolean = act.systemShade()

    @JavascriptInterface fun makeDefault() = act.makeDefault()
    @JavascriptInterface fun openNotifAccess() = act.openNotifAccess()
    @JavascriptInterface fun openAccessibility() = act.openAccessibility()
    @JavascriptInterface fun askCalendar() = act.askCalendar()
    @JavascriptInterface fun askLocation() = act.askLocation()
    @JavascriptInterface fun openBattery() = act.openBattery()
    @JavascriptInterface fun openAutostart() = act.openAutostart()
    @JavascriptInterface fun openDream() = act.openDream()
    @JavascriptInterface fun openAppSettings() = act.openAppSettings()
    @JavascriptInterface fun openEvent(id: Double, begin: Double) = act.openEvent(id.toLong(), begin.toLong())
    @JavascriptInterface fun setWallpaper(which: String?) = act.setWallpaper(which ?: "both")

    @JavascriptInterface fun vibe(ms: Int) = act.vibe(ms)
    @JavascriptInterface fun vibePattern(json: String?) = act.vibePattern(json ?: "[]")
    @JavascriptInterface fun exclude(json: String?) = act.exclude(json ?: "[]")
    @JavascriptInterface fun openSettings(page: String?) = act.openSettingsApp(page ?: "")
    @JavascriptInterface fun tiles(): String = Tiles.json(act)
    @JavascriptInterface fun tile(k: String?): Boolean = Tiles.tap(act, k ?: "")
    @JavascriptInterface fun island(json: String?) = Island.save(act, json ?: "{}")
    @JavascriptInterface fun cutout(): String = Island.cutoutJson(act)

    @JavascriptInterface fun log(m: String?) {
        Log.w("Strelizia", m ?: "")
    }
}
