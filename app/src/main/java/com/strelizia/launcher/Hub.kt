package com.strelizia.launcher

import android.os.Handler
import android.os.Looper

/** Одно уведомление в том виде, в каком его показывает шторка лаунчера. */
data class NotifItem(
    val key: String,
    val pkg: String,
    val title: String,
    val text: String,
    val time: Long,
    val clearable: Boolean
)

/** Общая точка связи между службами и экраном лаунчера. */
object Hub {
    val main = Handler(Looper.getMainLooper())

    @Volatile var notifService: NotifService? = null
    @Volatile var lockService: LockService? = null
    @Volatile var notifs: List<NotifItem> = emptyList()
    @Volatile var listener: ((String, String) -> Unit)? = null

    /** payload: готовое JS-выражение (JSON или "null"). */
    fun emit(name: String, payload: String = "null") {
        main.post { listener?.invoke(name, payload) }
    }
}
