package com.strelizia.launcher

import android.content.ComponentName
import android.content.Context
import android.content.pm.LauncherApps
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.Rect
import android.graphics.RectF
import android.graphics.drawable.AdaptiveIconDrawable
import android.graphics.drawable.Drawable
import android.net.Uri
import android.os.Build
import android.os.Process
import android.webkit.WebResourceResponse
import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream
import java.io.File
import kotlin.math.sqrt

/**
 * Перекрашивает иконки любых приложений в неон Стрелиции.
 * Android 13+: монохромный слой иконки. Иначе: силуэт переднего слоя или выделение знака по контрасту.
 */
object Icons {
    private const val S = 144
    private const val NEON = 0xFF5A64
    private val lock = Any()

    fun response(ctx: Context, path: String): WebResourceResponse? {
        val comp = Uri.decode(path).removeSuffix(".png")
        val bytes = get(ctx, comp) ?: return null
        val r = WebResourceResponse("image/png", null, ByteArrayInputStream(bytes))
        r.responseHeaders = mapOf("Cache-Control" to "max-age=604800")
        return r
    }

    fun prewarm(ctx: Context, ids: List<String>) {
        val t = Thread {
            for (id in ids) {
                try {
                    get(ctx, id)
                } catch (e: Exception) {
                }
            }
        }
        t.priority = Thread.MIN_PRIORITY
        t.start()
    }

    fun get(ctx: Context, comp: String): ByteArray? {
        val cn = ComponentName.unflattenFromString(comp) ?: return null
        val ver = try {
            ctx.packageManager.getPackageInfo(cn.packageName, 0).lastUpdateTime
        } catch (e: Exception) {
            0L
        }
        val dir = File(ctx.cacheDir, "icons")
        dir.mkdirs()
        val f = File(dir, Integer.toHexString(comp.hashCode()) + "-" + ver + ".png")
        if (f.exists()) {
            try {
                return f.readBytes()
            } catch (e: Exception) {
            }
        }
        synchronized(lock) {
            if (f.exists()) {
                try {
                    return f.readBytes()
                } catch (e: Exception) {
                }
            }
            val la = ctx.getSystemService(LauncherApps::class.java) ?: return null
            val info = try {
                la.getActivityList(cn.packageName, Process.myUserHandle()).firstOrNull { it.componentName == cn }
            } catch (e: Exception) {
                null
            } ?: return null
            val d: Drawable = try {
                info.getIcon(ctx.resources.displayMetrics.densityDpi)
            } catch (e: Exception) {
                null
            } ?: return null
            val bmp = try {
                render(d)
            } catch (e: Exception) {
                return null
            }
            val bos = ByteArrayOutputStream()
            bmp.compress(Bitmap.CompressFormat.PNG, 100, bos)
            bmp.recycle()
            val out = bos.toByteArray()
            try {
                f.writeBytes(out)
            } catch (e: Exception) {
            }
            return out
        }
    }

    private fun render(d: Drawable): Bitmap {
        if (Build.VERSION.SDK_INT >= 33 && d is AdaptiveIconDrawable) {
            val mono = d.monochrome
            if (mono != null) {
                val b = layer(mono)
                val a = alpha(b)
                b.recycle()
                if (coverage(a) > 0.01f) return tint(a)
            }
        }
        if (d is AdaptiveIconDrawable) {
            val fg = d.foreground
            if (fg != null) {
                val fb = layer(fg)
                val a = alpha(fb)
                val cov = coverage(a)
                if (cov in 0.02f..0.6f) {
                    fb.recycle()
                    return tint(a)
                }
                val comp = Bitmap.createBitmap(S, S, Bitmap.Config.ARGB_8888)
                val c = Canvas(comp)
                val bg = d.background
                if (bg != null) {
                    val bb = layer(bg)
                    c.drawBitmap(bb, 0f, 0f, null)
                    bb.recycle()
                }
                c.drawBitmap(fb, 0f, 0f, null)
                fb.recycle()
                val m = contrast(comp)
                comp.recycle()
                return tint(m)
            }
        }
        val b = Bitmap.createBitmap(S, S, Bitmap.Config.ARGB_8888)
        val c = Canvas(b)
        val dm = d.mutate()
        dm.setBounds(0, 0, S, S)
        dm.draw(c)
        val m = contrast(b)
        b.recycle()
        return tint(m)
    }

    /** Слой адаптивной иконки: 108dp, видимая часть 72dp в центре. */
    private fun layer(dr: Drawable): Bitmap {
        val b = Bitmap.createBitmap(S, S, Bitmap.Config.ARGB_8888)
        val c = Canvas(b)
        val o = S / 4
        val m = dr.mutate()
        m.setBounds(-o, -o, S + o, S + o)
        m.draw(c)
        return b
    }

    private fun alpha(b: Bitmap): IntArray {
        val px = IntArray(S * S)
        b.getPixels(px, 0, S, 0, 0, S, S)
        for (i in px.indices) px[i] = (px[i] ushr 24) and 0xFF
        return px
    }

    private fun coverage(a: IntArray): Float {
        var n = 0
        for (v in a) if (v > 128) n++
        return n.toFloat() / a.size
    }

    /** Знак на однотонном фоне: всё, что заметно отличается от самого частого цвета. */
    private fun contrast(b: Bitmap): IntArray {
        val px = IntArray(S * S)
        b.getPixels(px, 0, S, 0, 0, S, S)
        val hist = HashMap<Int, Int>()
        for (p in px) {
            if (((p ushr 24) and 0xFF) < 200) continue
            val k = (((p shr 20) and 0xF) shl 8) or (((p shr 12) and 0xF) shl 4) or ((p shr 4) and 0xF)
            hist[k] = (hist[k] ?: 0) + 1
        }
        val silhouette = IntArray(S * S) { (px[it] ushr 24) and 0xFF }
        val dom = hist.maxByOrNull { it.value }?.key ?: return silhouette
        val dr = ((dom shr 8) and 0xF) * 17
        val dg = ((dom shr 4) and 0xF) * 17
        val db = (dom and 0xF) * 17
        val out = IntArray(S * S)
        var n = 0
        for (i in px.indices) {
            val p = px[i]
            val a = (p ushr 24) and 0xFF
            if (a == 0) continue
            val r = (p shr 16) and 0xFF
            val g = (p shr 8) and 0xFF
            val bl = p and 0xFF
            val dist = sqrt(((r - dr) * (r - dr) + (g - dg) * (g - dg) + (bl - db) * (bl - db)).toFloat()) / 441.7f
            val k = ((dist - 0.12f) / 0.22f).coerceIn(0f, 1f)
            val v = (a * k).toInt()
            out[i] = v
            if (v > 128) n++
        }
        if (n.toFloat() / out.size < 0.015f) return silhouette
        return out
    }

    /** Красит маску в неон и выравнивает размер знака, чтобы иконки смотрелись ровно. */
    private fun tint(a: IntArray): Bitmap {
        var minX = S
        var minY = S
        var maxX = -1
        var maxY = -1
        for (y in 0 until S) {
            for (x in 0 until S) {
                if (a[y * S + x] > 40) {
                    if (x < minX) minX = x
                    if (x > maxX) maxX = x
                    if (y < minY) minY = y
                    if (y > maxY) maxY = y
                }
            }
        }
        val px = IntArray(S * S)
        for (i in a.indices) {
            val v = a[i].coerceIn(0, 255)
            px[i] = if (v == 0) 0 else ((v shl 24) or NEON)
        }
        val raw = Bitmap.createBitmap(S, S, Bitmap.Config.ARGB_8888)
        raw.setPixels(px, 0, S, 0, 0, S, S)
        if (maxX < 0) return raw
        val w = maxX - minX + 1
        val h = maxY - minY + 1
        val k = (S * 0.74f) / maxOf(w, h)
        val dw = w * k
        val dh = h * k
        val out = Bitmap.createBitmap(S, S, Bitmap.Config.ARGB_8888)
        val dst = RectF((S - dw) / 2f, (S - dh) / 2f, (S + dw) / 2f, (S + dh) / 2f)
        Canvas(out).drawBitmap(raw, Rect(minX, minY, maxX + 1, maxY + 1), dst, Paint(Paint.FILTER_BITMAP_FLAG or Paint.ANTI_ALIAS_FLAG))
        raw.recycle()
        return out
    }
}
