package com.strelizia.launcher

import android.accessibilityservice.AccessibilityService
import android.os.Build
import android.view.accessibility.AccessibilityEvent

/**
 * Служба спецвозможностей. Делает ровно две вещи: блокирует экран по двойному тапу
 * и открывает системную шторку. Экран не читает.
 */
class LockService : AccessibilityService() {

    var island: IslandHost? = null

    override fun onServiceConnected() {
        super.onServiceConnected()
        Hub.lockService = this
        island = IslandHost(this).also { it.start() }
        Hub.emit("perm", "\"acc\"")
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent) {}

    override fun onInterrupt() {}

    override fun onDestroy() {
        island?.stop()
        island = null
        if (Hub.lockService === this) Hub.lockService = null
        super.onDestroy()
    }

    fun lock(): Boolean =
        Build.VERSION.SDK_INT >= 28 && performGlobalAction(GLOBAL_ACTION_LOCK_SCREEN)

    fun shade(): Boolean = performGlobalAction(GLOBAL_ACTION_NOTIFICATIONS)

    fun screenshot(): Boolean =
        Build.VERSION.SDK_INT >= 28 && performGlobalAction(GLOBAL_ACTION_TAKE_SCREENSHOT)
}
