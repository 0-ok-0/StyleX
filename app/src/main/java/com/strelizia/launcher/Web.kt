package com.strelizia.launcher

import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.view.View
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.webkit.WebViewAssetLoader

/** Общая настройка WebView: интерфейс грузится из assets по https, иконки рисуются на лету. */
object Web {
    const val HOST = "appassets.androidplatform.net"
    const val URL_MAIN = "https://$HOST/assets/web/index.html"
    const val URL_AOD = "https://$HOST/assets/web/aod.html"
    const val URL_SET = "https://$HOST/assets/web/settings.html"

    @SuppressLint("SetJavaScriptEnabled")
    fun setup(w: WebView, ctx: Context) {
        val appCtx = ctx.applicationContext
        val loader = WebViewAssetLoader.Builder()
            .setDomain(HOST)
            .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(appCtx))
            .addPathHandler("/icons/", WebViewAssetLoader.PathHandler { path -> Icons.response(appCtx, path) })
            .build()

        val s = w.settings
        s.javaScriptEnabled = true
        s.domStorageEnabled = true
        s.allowFileAccess = false
        s.allowContentAccess = false
        s.mediaPlaybackRequiresUserGesture = false
        s.setSupportZoom(false)
        s.builtInZoomControls = false
        s.displayZoomControls = false
        s.textZoom = 100
        s.useWideViewPort = true
        s.loadWithOverviewMode = false

        w.isVerticalScrollBarEnabled = false
        w.isHorizontalScrollBarEnabled = false
        w.overScrollMode = View.OVER_SCROLL_NEVER
        w.setBackgroundColor(Color.BLACK)

        w.webViewClient = object : WebViewClient() {
            override fun shouldInterceptRequest(view: WebView, request: WebResourceRequest): WebResourceResponse? {
                return loader.shouldInterceptRequest(request.url)
            }

            override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                val u = request.url
                if (u.host == HOST) return false
                try {
                    appCtx.startActivity(Intent(Intent.ACTION_VIEW, u).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
                } catch (e: Exception) {
                }
                return true
            }
        }
    }
}
