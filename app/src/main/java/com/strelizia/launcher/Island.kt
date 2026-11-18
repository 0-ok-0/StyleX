package com.strelizia.launcher

import android.accessibilityservice.AccessibilityService
import android.app.Notification
import android.content.BroadcastReceiver
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Path
import android.graphics.PixelFormat
import android.graphics.Rect
import android.graphics.RectF
import android.graphics.Typeface
import android.media.MediaMetadata
import android.media.session.MediaSessionManager
import android.media.session.PlaybackState
import android.os.Build
import android.os.PowerManager
import android.os.SystemClock
import android.service.notification.StatusBarNotification
import android.view.Gravity
import android.view.View
import android.view.WindowManager
import androidx.core.content.ContextCompat
import org.json.JSONObject
import kotlin.math.abs
import kotlin.math.max
import kotlin.math.roundToInt
import kotlin.math.sin

/** Настройки островка (их пишут лаунчер и приложение настроек) и форма выреза камеры. */
object Island {
    class Conf(val on: Boolean, val shape: String, val style: String, val mus: Boolean, val chg: Boolean, val ntf: Boolean)

    private fun prefs(ctx: Context) = ctx.getSharedPreferences("island", Context.MODE_PRIVATE)

    fun save(ctx: Context, json: String) {
        try {
            JSONObject(json)
        } catch (e: Exception) {
            return
        }
        prefs(ctx).edit().putString("conf", json).apply()
        Hub.main.post { Hub.lockService?.island?.reload() }
    }

    fun conf(ctx: Context): Conf {
        val o = try {
            JSONObject(prefs(ctx).getString("conf", "{}") ?: "{}")
        } catch (e: Exception) {
            JSONObject()
        }
        return Conf(
            o.optBoolean("on", false),
            o.optString("shape", "auto"),
            o.optString("style", "neon"),
            o.optBoolean("mus", true),
            o.optBoolean("chg", true),
            o.optBoolean("ntf", true)
        )
    }

    /** Верхний вырез камеры в пикселях экрана или null, если его нет или Android не сообщает. */
    fun cutRect(ctx: Context): Rect? {
        if (Build.VERSION.SDK_INT < 29) return null
        return try {
            val wm = ctx.getSystemService(WindowManager::class.java)
            val dc = if (Build.VERSION.SDK_INT >= 30) {
                wm?.currentWindowMetrics?.windowInsets?.displayCutout
            } else {
                @Suppress("DEPRECATION")
                val disp = wm?.defaultDisplay
                disp?.cutout
            }
            val rs = dc?.boundingRects ?: return null
            rs.minByOrNull { it.top }
        } catch (e: Exception) {
            null
        }
    }

    fun kind(ctx: Context, r: Rect?): String {
        if (r == null || r.isEmpty()) return "none"
        val w = r.width().toFloat()
        val h = max(1, r.height()).toFloat()
        val sw = ctx.resources.displayMetrics.widthPixels.toFloat()
        return when {
            w > sw * 0.28f || w / h > 3.2f -> "notch"
            w / h > 1.5f -> "drop"
            else -> "hole"
        }
    }

    fun cutoutJson(ctx: Context): String {
        val r = cutRect(ctx)
        val o = JSONObject().put("kind", kind(ctx, r))
        if (r != null) {
            val d = ctx.resources.displayMetrics.density
            o.put("x", (r.exactCenterX() / d).toDouble()).put("w", (r.width() / d).toDouble()).put("h", (r.height() / d).toDouble())
        }
        return o.toString()
    }
}

/**
 * Островок у камеры: окно службы спецвозможностей поверх всех приложений.
 * Касания не перехватывает. Появляется, только когда есть что показать: музыка, зарядка, новое уведомление.
 */
class IslandHost(private val svc: AccessibilityService) {
    private val wm: WindowManager? = svc.getSystemService(WindowManager::class.java)
    private var view: IslandView? = null
    private var conf = Island.conf(svc)
    private var running = false
    private var lastPost = System.currentTimeMillis()
    private var showUntil = 0L
    private var receiver: BroadcastReceiver? = null

    private val tick = object : Runnable {
        override fun run() {
            if (!running) return
            poll()
            Hub.main.postDelayed(this, 1500)
        }
    }

    fun start() {
        running = true
        val r = object : BroadcastReceiver() {
            override fun onReceive(c: Context, i: Intent) {
                if (i.action == Intent.ACTION_POWER_CONNECTED && conf.chg) {
                    val (p, _) = Sys.battery(svc)
                    flash(IslandView.CHG, "$p%", 4000)
                }
            }
        }
        try {
            ContextCompat.registerReceiver(svc, r, IntentFilter(Intent.ACTION_POWER_CONNECTED), ContextCompat.RECEIVER_EXPORTED)
            receiver = r
        } catch (e: Exception) {
        }
        reload()
        Hub.main.post(tick)
    }

    fun stop() {
        running = false
        Hub.main.removeCallbacks(tick)
        val r = receiver
        if (r != null) {
            try {
                svc.unregisterReceiver(r)
            } catch (e: Exception) {
            }
        }
        receiver = null
        remove()
    }

    fun reload() {
        conf = Island.conf(svc)
        if (!conf.on) {
            remove()
            return
        }
        val v = view ?: add() ?: return
        v.look = conf.style
        v.shape = shapeFor()
        place(v)
        v.invalidate()
    }

    private fun shapeFor(): String {
        if (conf.shape == "pill" || conf.shape == "drop" || conf.shape == "notch") return conf.shape
        return when (Island.kind(svc, Island.cutRect(svc))) {
            "drop" -> "drop"
            "notch" -> "notch"
            else -> "pill"
        }
    }

    private fun params(): WindowManager.LayoutParams {
        val lp = WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.TYPE_ACCESSIBILITY_OVERLAY,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE or
                WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN or WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
            PixelFormat.TRANSLUCENT
        )
        lp.gravity = Gravity.TOP or Gravity.START
        if (Build.VERSION.SDK_INT >= 30) {
            lp.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_ALWAYS
        } else if (Build.VERSION.SDK_INT >= 28) {
            lp.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES
        }
        return lp
    }

    private fun add(): IslandView? {
        val m = wm ?: return null
        val v = IslandView(svc)
        v.visibility = View.GONE
        return try {
            m.addView(v, params())
            view = v
            v
        } catch (e: Exception) {
            null
        }
    }

    private fun remove() {
        val v = view ?: return
        view = null
        try {
            wm?.removeView(v)
        } catch (e: Exception) {
        }
    }

    private fun statusBar(): Int {
        val id = svc.resources.getIdentifier("status_bar_height", "dimen", "android")
        return if (id > 0) svc.resources.getDimensionPixelSize(id) else (24 * svc.resources.displayMetrics.density).roundToInt()
    }

    private fun place(v: IslandView) {
        val dm = svc.resources.displayMetrics
        val d = dm.density
        val r = Island.cutRect(svc)
        val cx = r?.exactCenterX() ?: (dm.widthPixels / 2f)
        val sb = statusBar()
        val m = (6 * d).roundToInt()
        var w = 0
        var h = 0
        var y = 0
        if (v.shape == "pill") {
            h = max((sb * 0.72f).roundToInt(), (22 * d).roundToInt())
            w = (h * 5.4f).roundToInt()
            val cy = if (r != null && Island.kind(svc, r) == "hole") r.bottom - r.width() / 2f else sb / 2f
            y = (cy - h / 2f).roundToInt() - m
        } else {
            h = max(sb, (24 * d).roundToInt())
            w = (h * (if (v.shape == "drop") 5.2f else 6.2f)).roundToInt()
            y = 0
        }
        val lp = (v.layoutParams as? WindowManager.LayoutParams) ?: params()
        lp.width = w + 2 * m
        lp.height = h + (if (v.shape == "pill") 2 * m else m)
        lp.x = (cx - w / 2f).roundToInt() - m
        lp.y = y
        v.m = m.toFloat()
        v.camX = cx - lp.x
        try {
            wm?.updateViewLayout(v, lp)
        } catch (e: Exception) {
        }
    }

    private fun poll() {
        val v = view ?: return
        val pm = svc.getSystemService(PowerManager::class.java)
        if (pm != null && !pm.isInteractive) {
            v.visibility = View.GONE
            v.anim = false
            return
        }
        val now = System.currentTimeMillis()
        if (conf.ntf) checkNotif(now)
        if (now < showUntil) return
        if (conf.mus) {
            val t = playing()
            if (t != null) {
                v.kind = IslandView.MUS
                v.text = t
                show(v)
                return
            }
        }
        v.visibility = View.GONE
        v.anim = false
    }

    private fun show(v: IslandView) {
        val wasAnim = v.anim
        v.anim = v.kind == IslandView.MUS
        if (v.visibility != View.VISIBLE) v.visibility = View.VISIBLE
        if (!wasAnim || !v.anim) v.invalidate()
    }

    fun flash(kind: Int, text: String, ms: Long) {
        val v = view ?: return
        v.kind = kind
        v.text = text
        showUntil = System.currentTimeMillis() + ms
        show(v)
    }

    private fun playing(): String? = try {
        val msm = svc.getSystemService(MediaSessionManager::class.java)
        val list = msm?.getActiveSessions(ComponentName(svc, NotifService::class.java)) ?: emptyList()
        val c = list.firstOrNull { it.playbackState?.state == PlaybackState.STATE_PLAYING }
        if (c == null) null else (c.metadata?.getString(MediaMetadata.METADATA_KEY_TITLE) ?: "")
    } catch (e: Exception) {
        null
    }

    @Suppress("DEPRECATION")
    private fun checkNotif(now: Long) {
        val ns = Hub.notifService ?: return
        val arr = (try {
            ns.activeNotifications
        } catch (e: Exception) {
            null
        }) ?: return
        var best: StatusBarNotification? = null
        for (s in arr) {
            if (s.packageName == svc.packageName || s.isOngoing) continue
            val b = best
            if (s.postTime > lastPost && (b == null || s.postTime > b.postTime)) best = s
        }
        val b = best ?: return
        lastPost = b.postTime
        if (now - b.postTime > 10000) return
        var t = b.notification.extras?.getCharSequence(Notification.EXTRA_TITLE)?.toString() ?: ""
        if (t.isEmpty()) {
            t = try {
                svc.packageManager.getApplicationLabel(svc.packageManager.getApplicationInfo(b.packageName, 0)).toString()
            } catch (e: Exception) {
                ""
            }
        }
        flash(IslandView.NTF, t, 3500)
    }
}

/** Рисует сам островок: форма, неоновая обводка, значок слева, эквалайзер или текст справа от камеры. */
class IslandView(ctx: Context) : View(ctx) {
    companion object {
        const val MUS = 1
        const val CHG = 2
        const val NTF = 3
    }

    var shape = "pill"
    var look = "neon"
    var kind = MUS
    var text = ""
    var camX = 0f
    var m = 0f
    var anim = false

    private val dp = ctx.resources.displayMetrics.density
    private val red = Color.rgb(255, 42, 68)
    private val bg = Paint(Paint.ANTI_ALIAS_FLAG)
    private val line = Paint(Paint.ANTI_ALIAS_FLAG)
    private val glow = Paint(Paint.ANTI_ALIAS_FLAG)
    private val fg = Paint(Paint.ANTI_ALIAS_FLAG)
    private val path = Path()
    private val bolt = Path()
    private val rf = RectF()

    init {
        bg.color = Color.BLACK
        line.style = Paint.Style.STROKE
        line.strokeWidth = 1.5f * dp
        line.strokeCap = Paint.Cap.ROUND
        line.color = red
        glow.style = Paint.Style.STROKE
        glow.strokeWidth = 5f * dp
        glow.color = Color.argb(70, 255, 42, 68)
        fg.textSize = 12f * dp
        fg.typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
        fg.textAlign = Paint.Align.RIGHT
    }

    override fun onDraw(c: Canvas) {
        super.onDraw(c)
        val w = width.toFloat()
        val h = height.toFloat()
        val top = if (shape == "pill") m else 0f
        val bot = h - m
        val hh = bot - top
        path.reset()
        rf.set(m, top, w - m, bot)
        if (shape == "pill") {
            path.addRoundRect(rf, hh / 2f, hh / 2f, Path.Direction.CW)
        } else {
            val r = hh * (if (shape == "drop") 0.5f else 0.38f)
            path.addRoundRect(rf, floatArrayOf(0f, 0f, 0f, 0f, r, r, r, r), Path.Direction.CW)
        }
        val neon = look == "neon"
        if (neon) c.drawPath(path, glow)
        c.drawPath(path, bg)
        if (neon) c.drawPath(path, line)

        val accent = if (neon) red else Color.WHITE
        val cy = (top + bot) / 2f
        val lx = m + hh * 0.55f
        val rx = w - m - hh * 0.45f
        when (kind) {
            MUS -> note(c, lx, cy, accent)
            CHG -> boltAt(c, lx, cy, accent)
            else -> {
                fg.color = accent
                c.drawCircle(lx, cy, 3.5f * dp, fg)
            }
        }
        if (kind == MUS) {
            eq(c, rx, cy, hh, accent)
            if (anim) postInvalidateDelayed(110)
        } else {
            fg.color = Color.WHITE
            val avail = rx - (camX + 10f * dp)
            var s = text
            if (avail > 8f * dp && s.isNotEmpty()) {
                if (fg.measureText(s) > avail) {
                    while (s.length > 1 && fg.measureText(s + "…") > avail) s = s.dropLast(1)
                    s = s + "…"
                }
                c.drawText(s, rx + 4f * dp, cy - (fg.descent() + fg.ascent()) / 2f, fg)
            }
        }
    }

    private fun note(c: Canvas, x: Float, cy: Float, col: Int) {
        fg.color = col
        line.color = col
        c.drawCircle(x - 2f * dp, cy + 3.5f * dp, 2.6f * dp, fg)
        c.drawLine(x + 0.4f * dp, cy + 3.5f * dp, x + 0.4f * dp, cy - 5.5f * dp, line)
        c.drawLine(x + 0.4f * dp, cy - 5.5f * dp, x + 4f * dp, cy - 3.5f * dp, line)
        line.color = red
    }

    private fun boltAt(c: Canvas, x: Float, cy: Float, col: Int) {
        bolt.reset()
        bolt.moveTo(x + 1f * dp, cy - 6.5f * dp)
        bolt.lineTo(x - 4f * dp, cy + 1f * dp)
        bolt.lineTo(x - 0.5f * dp, cy + 1f * dp)
        bolt.lineTo(x - 1.5f * dp, cy + 6.5f * dp)
        bolt.lineTo(x + 4f * dp, cy - 1f * dp)
        bolt.lineTo(x + 0.5f * dp, cy - 1f * dp)
        bolt.close()
        fg.color = col
        c.drawPath(bolt, fg)
    }

    private fun eq(c: Canvas, right: Float, cy: Float, hh: Float, col: Int) {
        fg.color = col
        val t = SystemClock.uptimeMillis() / 150.0
        val bw = 2.4f * dp
        val gap = 2.2f * dp
        val mh = hh * 0.46f
        for (i in 0 until 4) {
            val k = 0.3f + 0.7f * abs(sin(t + i * 1.7)).toFloat()
            val x = right - (4 - i) * (bw + gap) + gap
            val bh = mh * k
            rf.set(x, cy + mh / 2f - bh, x + bw, cy + mh / 2f)
            c.drawRoundRect(rf, bw / 2f, bw / 2f, fg)
        }
    }
}
