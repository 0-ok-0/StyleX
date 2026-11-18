package com.strelizia.launcher

import android.app.Notification
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import org.json.JSONObject

/** Читает уведомления для счётчиков, шторки и плашек. Нужен доступ к уведомлениям. */
class NotifService : NotificationListenerService() {

    private var seen: Map<String, String> = emptyMap()

    override fun onListenerConnected() {
        super.onListenerConnected()
        Hub.notifService = this
        refresh()
        Hub.emit("notifs")
        Hub.emit("media")
    }

    override fun onListenerDisconnected() {
        if (Hub.notifService === this) Hub.notifService = null
        super.onListenerDisconnected()
        Hub.emit("notifs")
    }

    override fun onNotificationPosted(sbn: StatusBarNotification) {
        val before = seen
        refresh()
        val item = toItem(sbn)
        if (item != null) {
            val sig = item.title + "" + item.text
            if (before[item.key] != sig) {
                val o = JSONObject()
                    .put("k", item.key)
                    .put("p", item.pkg)
                    .put("t", item.title)
                    .put("s", item.text)
                    .put("app", Apps.label(this, item.pkg))
                Hub.emit("posted", o.toString())
            }
        }
        Hub.emit("notifs")
        Hub.emit("media")
    }

    override fun onNotificationRemoved(sbn: StatusBarNotification) {
        refresh()
        Hub.emit("notifs")
    }

    override fun onDestroy() {
        if (Hub.notifService === this) Hub.notifService = null
        super.onDestroy()
    }

    fun refresh() {
        val arr: Array<StatusBarNotification> = try {
            activeNotifications ?: return
        } catch (e: Exception) {
            return
        }
        val list = arr.mapNotNull { toItem(it) }.sortedByDescending { it.time }
        Hub.notifs = list
        seen = list.associate { it.key to (it.title + "" + it.text) }
    }

    private fun toItem(s: StatusBarNotification): NotifItem? {
        if (s.packageName == packageName) return null
        val n: Notification = s.notification ?: return null
        if ((n.flags and Notification.FLAG_GROUP_SUMMARY) != 0) return null
        if (s.isOngoing) return null
        val ex = n.extras ?: return null
        val title = ex.getCharSequence(Notification.EXTRA_TITLE)?.toString() ?: ""
        val text = (ex.getCharSequence(Notification.EXTRA_BIG_TEXT)
            ?: ex.getCharSequence(Notification.EXTRA_TEXT))?.toString() ?: ""
        if (title.isBlank() && text.isBlank()) return null
        return NotifItem(s.key, s.packageName, title, text, s.postTime, s.isClearable)
    }
}
