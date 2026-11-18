package com.strelizia.launcher

import android.Manifest
import android.content.ContentUris
import android.content.Context
import android.content.pm.PackageManager
import android.provider.CalendarContract
import org.json.JSONArray
import org.json.JSONObject
import java.util.Calendar

/** События на сегодня для App Vault. */
object Cal {
    fun json(ctx: Context): String {
        val o = JSONObject()
        val ok = ctx.checkSelfPermission(Manifest.permission.READ_CALENDAR) == PackageManager.PERMISSION_GRANTED
        o.put("perm", ok)
        val arr = JSONArray()
        if (ok) {
            val c = Calendar.getInstance()
            c.set(Calendar.HOUR_OF_DAY, 0)
            c.set(Calendar.MINUTE, 0)
            c.set(Calendar.SECOND, 0)
            c.set(Calendar.MILLISECOND, 0)
            val begin = c.timeInMillis
            val end = begin + 24L * 3600L * 1000L
            val b = CalendarContract.Instances.CONTENT_URI.buildUpon()
            ContentUris.appendId(b, begin)
            ContentUris.appendId(b, end)
            val proj = arrayOf(
                CalendarContract.Instances.EVENT_ID,
                CalendarContract.Instances.TITLE,
                CalendarContract.Instances.BEGIN,
                CalendarContract.Instances.END,
                CalendarContract.Instances.ALL_DAY
            )
            try {
                ctx.contentResolver.query(b.build(), proj, null, null, CalendarContract.Instances.BEGIN + " ASC")?.use { cur ->
                    while (cur.moveToNext() && arr.length() < 8) {
                        val e = JSONObject()
                        e.put("id", cur.getLong(0))
                        e.put("t", cur.getString(1) ?: "")
                        e.put("b", cur.getLong(2))
                        e.put("e", cur.getLong(3))
                        e.put("ad", cur.getInt(4) == 1)
                        arr.put(e)
                    }
                }
            } catch (e: Exception) {
            }
        }
        o.put("ev", arr)
        return o.toString()
    }
}
