package com.strelizia.launcher

import android.content.ComponentName
import android.content.Context
import android.media.MediaMetadata
import android.media.session.MediaController
import android.media.session.MediaSessionManager
import android.media.session.PlaybackState
import android.os.SystemClock
import androidx.core.app.NotificationManagerCompat
import org.json.JSONObject

/** Мини-плеер: что играет сейчас в любом приложении и кнопки управления. */
object Media {
    private fun controller(ctx: Context): MediaController? {
        val msm = ctx.getSystemService(MediaSessionManager::class.java) ?: return null
        val list: List<MediaController> = try {
            msm.getActiveSessions(ComponentName(ctx, NotifService::class.java))
        } catch (e: Exception) {
            return null
        }
        return list.firstOrNull { it.playbackState?.state == PlaybackState.STATE_PLAYING } ?: list.firstOrNull()
    }

    fun json(ctx: Context): String {
        val o = JSONObject()
        val perm = NotificationManagerCompat.getEnabledListenerPackages(ctx).contains(ctx.packageName)
        o.put("perm", perm)
        val c = if (perm) controller(ctx) else null
        if (c == null) {
            o.put("on", false)
            return o.toString()
        }
        val md = c.metadata
        val ps = c.playbackState
        val title = md?.getString(MediaMetadata.METADATA_KEY_TITLE)
            ?: md?.getString(MediaMetadata.METADATA_KEY_DISPLAY_TITLE) ?: ""
        if (title.isEmpty()) {
            o.put("on", false)
            return o.toString()
        }
        val artist = md?.getString(MediaMetadata.METADATA_KEY_ARTIST)
            ?: md?.getString(MediaMetadata.METADATA_KEY_ALBUM_ARTIST) ?: ""
        val dur = md?.getLong(MediaMetadata.METADATA_KEY_DURATION) ?: 0L
        val playing = ps?.state == PlaybackState.STATE_PLAYING
        var pos = ps?.position ?: 0L
        if (playing && ps != null && ps.lastPositionUpdateTime > 0) {
            pos += ((SystemClock.elapsedRealtime() - ps.lastPositionUpdateTime) * ps.playbackSpeed).toLong()
        }
        o.put("on", true)
        o.put("play", playing)
        o.put("t", title)
        o.put("a", artist)
        o.put("d", dur)
        o.put("pos", pos)
        o.put("p", c.packageName)
        o.put("app", Apps.label(ctx, c.packageName))
        return o.toString()
    }

    fun cmd(ctx: Context, k: String) {
        val c = controller(ctx) ?: return
        val t = c.transportControls
        when (k) {
            "play" -> t.play()
            "pause" -> t.pause()
            "toggle" -> if (c.playbackState?.state == PlaybackState.STATE_PLAYING) t.pause() else t.play()
            "next" -> t.skipToNext()
            "prev" -> t.skipToPrevious()
            "open" -> {
                val pi = c.sessionActivity
                var ok = false
                if (pi != null) {
                    try {
                        pi.send()
                        ok = true
                    } catch (e: Exception) {
                    }
                }
                if (!ok) {
                    ctx.packageManager.getLaunchIntentForPackage(c.packageName)?.let { Sys.open(ctx, it) }
                }
            }
        }
    }
}
