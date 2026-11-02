package dev.foldframe.atelier

import android.content.ContentValues
import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Canvas
import android.graphics.Color as AColor
import android.graphics.Paint
import android.graphics.Rect
import android.graphics.RectF
import android.net.Uri
import android.os.Environment
import android.provider.MediaStore
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlin.math.max

/** Writes an actual local JPEG via MediaStore; photo access stays on-device. */
suspend fun exportCollage(context: Context, album: AlbumEntry): Uri = withContext(Dispatchers.IO) {
    require(album.photos.isNotEmpty()) { "请先添加照片" }
    val width = 1800
    val height = 2500
    val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
    val canvas = Canvas(bitmap)
    canvas.drawColor(AColor.rgb(244, 240, 233))
    val p = Paint(Paint.ANTI_ALIAS_FLAG).apply { color = AColor.rgb(37, 38, 35) }
    p.typeface = android.graphics.Typeface.create("serif", android.graphics.Typeface.NORMAL)
    p.textSize = 110f
    canvas.drawText(album.title.take(25), 110f, 250f, p)
    p.typeface = android.graphics.Typeface.create("sans-serif", android.graphics.Typeface.BOLD)
    p.textSize = 29f
    canvas.drawText("FOLDFRAME  /  PRIVATE EDITION", 112f, 130f, p)
    canvas.drawRect(110f, 290f, 1690f, 294f, p)
    val gap = 24
    val left = 110
    val top = 340
    val tileW = (1580 - gap) / 2
    val tileH = 570
    album.photos.take(6).forEachIndexed { index, photo ->
        val x = left + (index % 2) * (tileW + gap)
        val y = top + (index / 2) * (tileH + gap)
        val rect = RectF(x.toFloat(), y.toFloat(), (x + tileW).toFloat(), (y + tileH).toFloat())
        p.color = AColor.rgb(222, 213, 199)
        canvas.drawRoundRect(rect, 15f, 15f, p)
        try {
            context.contentResolver.openInputStream(Uri.parse(photo.uri))?.use { input ->
                val options = BitmapFactory.Options().apply { inJustDecodeBounds = true }
                // Reopen stream after measuring dimensions to avoid a huge decoded bitmap.
                BitmapFactory.decodeStream(input, null, options)
                val opts = BitmapFactory.Options().apply { inSampleSize = max(1, max(options.outWidth / 900, options.outHeight / 900)) }
                context.contentResolver.openInputStream(Uri.parse(photo.uri))?.use { second ->
                    BitmapFactory.decodeStream(second, null, opts)?.let { source ->
                        val ratio = max(tileW.toFloat() / source.width, tileH.toFloat() / source.height)
                        val cropW = (tileW / ratio).toInt().coerceAtMost(source.width)
                        val cropH = (tileH / ratio).toInt().coerceAtMost(source.height)
                        val sx = (source.width - cropW) / 2
                        val sy = (source.height - cropH) / 2
                        canvas.drawBitmap(source, Rect(sx, sy, sx + cropW, sy + cropH), rect, Paint(Paint.ANTI_ALIAS_FLAG or Paint.FILTER_BITMAP_FLAG))
                        source.recycle()
                    }
                }
            }
        } catch (_: Exception) { /* Render a paper placeholder if source URI is no longer available. */ }
    }
    p.color = AColor.rgb(37, 38, 35)
    p.typeface = android.graphics.Typeface.create("sans-serif", android.graphics.Typeface.NORMAL)
    p.textSize = 28f
    canvas.drawText("CURATED WITH FOLDFRAME  •  ${album.photos.size} FRAMES", 110f, 2370f, p)
    val values = ContentValues().apply {
        put(MediaStore.Images.Media.DISPLAY_NAME, "FoldFrame_${System.currentTimeMillis()}.jpg")
        put(MediaStore.Images.Media.MIME_TYPE, "image/jpeg")
        put(MediaStore.Images.Media.RELATIVE_PATH, Environment.DIRECTORY_PICTURES + "/FoldFrame")
        put(MediaStore.Images.Media.IS_PENDING, 1)
    }
    val resolver = context.contentResolver
    val uri = resolver.insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, values) ?: error("无法创建导出文件")
    try {
        resolver.openOutputStream(uri)?.use { bitmap.compress(Bitmap.CompressFormat.JPEG, 92, it) } ?: error("无法写入相册")
        values.clear()
        values.put(MediaStore.Images.Media.IS_PENDING, 0)
        resolver.update(uri, values, null, null)
    } catch (e: Exception) { resolver.delete(uri, null, null); throw e }
    finally { bitmap.recycle() }
    uri
}
