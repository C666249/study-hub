package dev.foldframe.atelier

import android.content.Context
import android.net.Uri
import androidx.compose.runtime.mutableStateListOf
import org.json.JSONArray
import org.json.JSONObject
import java.util.UUID

data class PhotoEntry(val id: String, val uri: String)
data class AlbumEntry(val id: String, val title: String, val note: String, val photos: List<PhotoEntry>)

class AlbumStore(private val context: Context) {
    val albums = mutableStateListOf<AlbumEntry>()
    private val prefs = context.getSharedPreferences("foldframe_albums_v1", Context.MODE_PRIVATE)
    init { load() }

    fun create(title: String, note: String = "A PERSONAL EDITION"): String {
        val id = UUID.randomUUID().toString()
        albums.add(0, AlbumEntry(id, title.trim().ifBlank { "Untitled edition" }, note, emptyList()))
        save()
        return id
    }
    fun delete(id: String) { albums.removeAll { it.id == id }; save() }
    fun rename(id: String, title: String) = update(id) { it.copy(title = title.trim().ifBlank { it.title }) }
    fun addPhotos(id: String, uris: List<Uri>) {
        val unique = uris.distinctBy { it.toString() }
        unique.forEach {
            try { context.contentResolver.takePersistableUriPermission(it, android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION) }
            catch (_: Exception) { /* Picker URIs may already be persisted by the system. */ }
        }
        update(id) { old ->
            val before = old.photos.map { it.uri }.toSet()
            old.copy(photos = old.photos + unique.filter { u -> u.toString() !in before }.map { PhotoEntry(UUID.randomUUID().toString(), it.toString()) })
        }
    }
    fun removePhoto(id: String, photoId: String) = update(id) { it.copy(photos = it.photos.filterNot { p -> p.id == photoId }) }
    fun movePhoto(id: String, from: Int, to: Int) = update(id) { old ->
        if (from !in old.photos.indices || to !in old.photos.indices || from == to) old
        else old.copy(photos = old.photos.toMutableList().apply { add(to, removeAt(from)) })
    }
    private fun update(id: String, change: (AlbumEntry) -> AlbumEntry) {
        val index = albums.indexOfFirst { it.id == id }
        if (index >= 0) { albums[index] = change(albums[index]); save() }
    }
    private fun save() {
        val array = JSONArray()
        albums.forEach { album ->
            val p = JSONArray()
            album.photos.forEach { p.put(JSONObject().put("id", it.id).put("uri", it.uri)) }
            array.put(JSONObject().put("id", album.id).put("title", album.title).put("note", album.note).put("photos", p))
        }
        prefs.edit().putString("albums", array.toString()).apply()
    }
    private fun load() {
        try {
            val array = JSONArray(prefs.getString("albums", "[]"))
            for (i in 0 until array.length()) {
                val obj = array.getJSONObject(i)
                val list = obj.optJSONArray("photos") ?: JSONArray()
                val photos = (0 until list.length()).map { j ->
                    val p = list.getJSONObject(j)
                    PhotoEntry(p.getString("id"), p.getString("uri"))
                }
                albums.add(AlbumEntry(obj.getString("id"), obj.getString("title"), obj.optString("note", "A PERSONAL EDITION"), photos))
            }
        } catch (_: Exception) { /* Malformed preferences should not prevent launch. */ }
    }
}
