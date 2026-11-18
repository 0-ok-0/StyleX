package com.strelizia.launcher

import android.content.Context
import android.graphics.Color
import android.service.dreams.DreamService
import android.webkit.JavascriptInterface
import android.webkit.WebView
import org.json.JSONArray
import org.json.JSONObject

/** Заставка «Стрелиция AOD»: неоновые часы, дата, заряд и значки уведомлений. */
class AodDream : DreamService() {
    private var web: WebView? = null

    override fun onAttachedToWindow() {
        super.onAttachedToWindow()
        isInteractive = false
        isFullscreen = true
        isScreenBright = false
        val w = WebView(this)
        Web.setup(w, this)
        w.addJavascriptInterface(AodBridge(applicationContext), "Android")
        w.setBackgroundColor(Color.BLACK)
        setContentView(w)
        w.loadUrl(Web.URL_AOD)
        web = w
    }

    override fun onDreamingStarted() {
        super.onDreamingStarted()
        web?.onResume()
        web?.resumeTimers()
    }

    override fun onDetachedFromWindow() {
        web?.destroy()
        web = null
        super.onDetachedFromWindow()
    }
}

class AodBridge(private val ctx: Context) {
    @JavascriptInterface
    fun bat(): String {
        val (p, c) = Sys.battery(ctx)
        return JSONObject().put("bat", p).put("chg", c).toString()
    }

    @JavascriptInterface
    fun notifs(): String {
        val arr = JSONArray()
        val seen = HashSet<String>()
        for (n in Hub.notifs) {
            if (!seen.add(n.pkg)) continue
            val id = Apps.firstId(ctx, n.pkg) ?: continue
            arr.put(id)
            if (arr.length() >= 6) break
        }
        return arr.toString()
    }
}
