package com.strelizia.launcher

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.pm.ApplicationInfo
import android.content.pm.LauncherActivityInfo
import android.content.pm.LauncherApps
import android.content.pm.PackageManager
import android.os.Build
import android.os.Process
import android.provider.AlarmClock
import android.provider.MediaStore
import android.provider.Settings
import org.json.JSONArray
import org.json.JSONObject

/** Список установленных приложений, их категории и «роли» (камера, браузер и т.д.). */
object Apps {
    class App(val id: String, val label: String, val cat: String, val ic: String, val pkg: String, val ver: Long)

    @Volatile private var cache: List<App>? = null
    private val labels = HashMap<String, String>()

    /** Пакет -> наша рисованная иконка, если роль не нашлась через систему. Каждая иконка достаётся одному приложению. */
    private val KNOWN = mapOf(
        "com.android.camera" to "camera", "com.miui.gallery" to "gallery", "com.google.android.apps.photos" to "gallery",
        "com.miui.player" to "music", "com.google.android.apps.youtube.music" to "music", "ru.yandex.music" to "music", "com.spotify.music" to "music",
        "com.android.chrome" to "browser", "com.mi.globalbrowser" to "browser", "com.yandex.browser" to "browser", "org.mozilla.firefox" to "browser",
        "com.google.android.apps.maps" to "maps", "ru.yandex.yandexmaps" to "maps", "ru.dublgis.dgismobile" to "maps",
        "com.google.android.gm" to "mail", "ru.mail.mailapp" to "mail", "ru.yandex.mail" to "mail",
        "com.google.android.apps.messaging" to "chats", "com.android.mms" to "chats", "org.telegram.messenger" to "chats", "com.whatsapp" to "chats",
        "com.google.android.dialer" to "phone", "com.google.android.contacts" to "contacts",
        "com.android.vending" to "store", "com.xiaomi.mipicks" to "store", "com.xiaomi.market" to "store",
        "com.miui.calculator" to "calc", "com.google.android.calculator" to "calc",
        "com.android.settings" to "settings", "com.google.android.calendar" to "calendar", "com.xiaomi.calendar" to "calendar",
        "com.android.deskclock" to "clock", "com.google.android.deskclock" to "clock",
        "com.miui.notes" to "notes", "com.google.android.keep" to "notes",
        "com.miui.videoplayer" to "video", "com.google.android.youtube" to "video", "ru.kinopoisk" to "video", "ru.ivi.client" to "video",
        "com.crunchyroll.crunchyroid" to "anime",
        "com.google.android.apps.translate" to "translate", "ru.yandex.translate" to "translate",
        "com.miui.compass" to "compass",
        "com.google.android.apps.tasks" to "tasks", "com.todoist" to "tasks", "com.microsoft.todos" to "tasks",
        "ru.sberbankmobile" to "bank", "com.idamob.tinkoff.android" to "bank", "ru.vtb24.mobilebanking.android" to "bank", "ru.alfabank.mobile.android" to "bank",
        "ru.ozon.app.android" to "shop", "com.wildberries.ru" to "shop", "ru.beru.android" to "shop",
        "com.google.android.apps.books" to "books", "ru.litres.android" to "books", "com.amazon.kindle" to "books",
        "com.miui.fm" to "radio",
        "com.mi.health" to "health", "com.xiaomi.wearable" to "health", "com.google.android.apps.fitness" to "health",
        "com.miui.weather2" to "weather",
        "com.mi.android.globalFileexplorer" to "files", "com.android.fileexplorer" to "files", "com.google.android.apps.nbu.files" to "files",
        "com.android.soundrecorder" to "recorder", "com.miui.soundrecorder" to "recorder"
    )

    fun invalidate() {
        cache = null
        synchronized(labels) { labels.clear() }
    }

    @Synchronized
    fun list(ctx: Context): List<App> {
        cache?.let { return it }
        val la = ctx.getSystemService(LauncherApps::class.java) ?: return emptyList()
        val acts: List<LauncherActivityInfo> = try {
            la.getActivityList(null, Process.myUserHandle())
        } catch (e: Exception) {
            emptyList()
        }
        val roles = roles(ctx, acts)
        val used = HashSet<String>(roles.values)
        val out = ArrayList<App>()
        for (a in acts) {
            val cn = a.componentName
            if (cn.packageName == ctx.packageName) continue
            val id = cn.flattenToString()
            var ic = roles[id] ?: ""
            if (ic.isEmpty()) {
                val k = KNOWN[cn.packageName]
                if (k != null && !used.contains(k)) {
                    ic = k
                    used.add(k)
                }
            }
            val ver = try {
                ctx.packageManager.getPackageInfo(cn.packageName, 0).lastUpdateTime
            } catch (e: Exception) {
                0L
            }
            val label = a.label?.toString()?.trim()?.ifEmpty { null } ?: cn.packageName
            out.add(App(id, label, category(a.applicationInfo, ic, cn.packageName), ic, cn.packageName, ver))
        }
        cache = out
        return out
    }

    fun json(ctx: Context): String {
        val arr = JSONArray()
        val l = list(ctx)
        for (a in l) arr.put(JSONArray().put(a.id).put(a.label).put(a.cat).put(a.ic).put(a.pkg).put(a.ver))
        Icons.prewarm(ctx.applicationContext, l.filter { it.ic.isEmpty() }.map { it.id })
        return arr.toString()
    }

    fun defaults(ctx: Context): String {
        val l = list(ctx)
        val ids = ArrayList<String>()
        for (k in listOf("chats", "camera", "music", "gallery", "browser")) {
            l.firstOrNull { it.ic == k }?.let { ids.add(it.id) }
        }
        if (ids.size < 5) l.firstOrNull { it.ic == "phone" }?.let { ids.add(it.id) }
        if (ids.size < 3) {
            for (a in l.sortedBy { it.label.lowercase() }) {
                if (ids.size >= 5) break
                if (!ids.contains(a.id)) ids.add(a.id)
            }
        }
        val arr = JSONArray()
        for (i in ids) arr.put(i)
        return arr.toString()
    }

    fun firstId(ctx: Context, pkg: String): String? = list(ctx).firstOrNull { it.pkg == pkg }?.id

    fun label(ctx: Context, pkg: String): String {
        synchronized(labels) { labels[pkg]?.let { return it } }
        val pm = ctx.packageManager
        val l = try {
            pm.getApplicationLabel(pm.getApplicationInfo(pkg, 0)).toString()
        } catch (e: Exception) {
            pkg
        }
        synchronized(labels) { labels[pkg] = l }
        return l
    }

    private fun roles(ctx: Context, acts: List<LauncherActivityInfo>): Map<String, String> {
        val pm = ctx.packageManager
        val byPkg = acts.groupBy { it.componentName.packageName }
        val res = HashMap<String, String>()
        fun put(key: String, intent: Intent) {
            if (res.containsValue(key)) return
            val ri = try {
                pm.resolveActivity(intent, PackageManager.MATCH_DEFAULT_ONLY)
            } catch (e: Exception) {
                null
            } ?: return
            val ai = ri.activityInfo ?: return
            val list = byPkg[ai.packageName] ?: return
            val hit = list.firstOrNull { it.componentName.className == ai.name }
                ?: (if (list.size == 1) list[0] else null)
                ?: return
            val id = hit.componentName.flattenToString()
            if (!res.containsKey(id)) res[id] = key
        }
        fun sel(c: String): Intent = Intent.makeMainSelectorActivity(Intent.ACTION_MAIN, c)

        put("phone", Intent(Intent.ACTION_DIAL))
        put("chats", sel(Intent.CATEGORY_APP_MESSAGING))
        put("mail", sel(Intent.CATEGORY_APP_EMAIL))
        put("contacts", sel(Intent.CATEGORY_APP_CONTACTS))
        put("camera", Intent(MediaStore.INTENT_ACTION_STILL_IMAGE_CAMERA))
        put("gallery", sel(Intent.CATEGORY_APP_GALLERY))
        put("music", sel(Intent.CATEGORY_APP_MUSIC))
        put("browser", sel(Intent.CATEGORY_APP_BROWSER))
        put("maps", sel(Intent.CATEGORY_APP_MAPS))
        put("calendar", sel(Intent.CATEGORY_APP_CALENDAR))
        put("calc", sel(Intent.CATEGORY_APP_CALCULATOR))
        put("store", sel(Intent.CATEGORY_APP_MARKET))
        put("settings", Intent(Settings.ACTION_SETTINGS))
        put("clock", Intent(AlarmClock.ACTION_SHOW_ALARMS))
        put("recorder", Intent(MediaStore.Audio.Media.RECORD_SOUND_ACTION))
        if (Build.VERSION.SDK_INT >= 29) {
            put("files", sel(Intent.CATEGORY_APP_FILES))
            put("weather", sel(Intent.CATEGORY_APP_WEATHER))
            put("health", sel(Intent.CATEGORY_APP_FITNESS))
        }
        return res
    }

    @Suppress("DEPRECATION")
    private fun category(ai: ApplicationInfo, ic: String, pkg: String): String {
        when (ic) {
            "phone", "chats", "mail", "contacts" -> return "com"
            "music", "video", "anime", "radio", "gallery", "camera", "books" -> return "med"
            "calendar", "notes", "tasks", "files", "translate", "calc", "recorder" -> return "wrk"
            "games", "puzzle", "dice" -> return "fun"
            "browser", "maps", "weather", "bank", "shop", "store", "health", "clock", "compass", "settings" -> return "srv"
        }
        if ((ai.flags and ApplicationInfo.FLAG_IS_GAME) != 0) return "fun"
        when (ai.category) {
            ApplicationInfo.CATEGORY_GAME -> return "fun"
            ApplicationInfo.CATEGORY_AUDIO, ApplicationInfo.CATEGORY_VIDEO, ApplicationInfo.CATEGORY_IMAGE, ApplicationInfo.CATEGORY_NEWS -> return "med"
            ApplicationInfo.CATEGORY_SOCIAL -> return "com"
            ApplicationInfo.CATEGORY_PRODUCTIVITY -> return "wrk"
            ApplicationInfo.CATEGORY_MAPS -> return "srv"
        }
        val p = pkg.lowercase()
        val com = listOf("messenger", "telegram", "whatsapp", "viber", "vkontakte", "discord", "signal", "skype", "zoom", "chat", "mail", "sms", "mms", "contacts", "dialer", "max.")
        val med = listOf("music", "video", "youtube", "tv", "player", "photo", "camera", "gallery", "book", "reader", "anime", "tiktok", "twitch", "cinema", "kino", "radio", "podcast")
        val wrk = listOf("office", "docs", "notes", "drive", "calendar", "task", "translate", "pdf", "files", "scanner", "notion", "excel", "word", "sheets", "slides")
        val fun_ = listOf("game", "games", "play.games", "supercell", "mihoyo", "hoyoverse", "tencent", "netease", "riot", "epic")
        if (com.any { p.contains(it) }) return "com"
        if (med.any { p.contains(it) }) return "med"
        if (wrk.any { p.contains(it) }) return "wrk"
        if (fun_.any { p.contains(it) }) return "fun"
        return "srv"
    }

    fun shortcutsJson(ctx: Context, id: String): String {
        val arr = JSONArray()
        val cn = ComponentName.unflattenFromString(id) ?: return "[]"
        val la = ctx.getSystemService(LauncherApps::class.java) ?: return "[]"
        try {
            if (!la.hasShortcutHostPermission()) return "[]"
            val q = LauncherApps.ShortcutQuery()
                .setPackage(cn.packageName)
                .setQueryFlags(
                    LauncherApps.ShortcutQuery.FLAG_MATCH_DYNAMIC or
                        LauncherApps.ShortcutQuery.FLAG_MATCH_MANIFEST or
                        LauncherApps.ShortcutQuery.FLAG_MATCH_PINNED
                )
            val list = la.getShortcuts(q, Process.myUserHandle()) ?: return "[]"
            list.filter { it.isEnabled && (it.activity == null || it.activity == cn) }
                .sortedWith(compareBy({ if (it.isDeclaredInManifest) 0 else 1 }, { it.rank }))
                .take(4)
                .forEach { s ->
                    val label = (s.shortLabel ?: s.longLabel ?: "").toString()
                    if (label.isNotBlank()) arr.put(JSONObject().put("i", s.id).put("n", label))
                }
        } catch (e: Exception) {
        }
        return arr.toString()
    }

    fun startShortcut(ctx: Context, id: String, sc: String): Boolean {
        val cn = ComponentName.unflattenFromString(id) ?: return false
        val la = ctx.getSystemService(LauncherApps::class.java) ?: return false
        return try {
            la.startShortcut(cn.packageName, sc, null, null, Process.myUserHandle())
            true
        } catch (e: Exception) {
            false
        }
    }
}
