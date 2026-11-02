package dev.foldframe.atelier

import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.*
import androidx.compose.foundation.gestures.detectDragGesturesAfterLongPress
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.itemsIndexed
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.DeleteOutline
import androidx.compose.material.icons.filled.GridView
import androidx.compose.material.icons.filled.IosShare
import androidx.compose.material.icons.filled.MenuBook
import androidx.compose.material.icons.filled.MoreHoriz
import androidx.compose.material.icons.filled.PhotoLibrary
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.TransformOrigin
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import coil.compose.AsyncImage
import dev.chrisbanes.haze.hazeEffect
import dev.chrisbanes.haze.materials.ExperimentalHazeMaterialsApi
import dev.chrisbanes.haze.materials.HazeMaterials
import dev.chrisbanes.haze.hazeSource
import dev.chrisbanes.haze.rememberHazeState
import kotlinx.coroutines.launch
import kotlin.math.abs
import kotlin.math.ceil

private val Paper = Color(0xFFF4F0E9)
private val Ink = Color(0xFF262622)
private val Muted = Color(0xFF827D75)
private val Accent = Color(0xFFAD5A3C)
private val Linen = Color(0xFFE8E0D4)
private val Olive = Color(0xFF9E9A84)

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.statusBarColor = android.graphics.Color.rgb(244, 240, 233)
        window.navigationBarColor = android.graphics.Color.rgb(244, 240, 233)
        window.decorView.systemUiVisibility = android.view.View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR or android.view.View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR
        setContent { MaterialTheme { FoldFrame() } }
    }
}

@Composable
private fun FoldFrame() {
    val context = LocalContext.current
    val store = remember { AlbumStore(context) }
    var openId by remember { mutableStateOf<String?>(null) }
    var createDialog by remember { mutableStateOf(false) }
    var editId by remember { mutableStateOf<String?>(null) }
    var pendingPhotoId by remember { mutableStateOf<String?>(null) }
    val launcher = rememberLauncherForActivityResult(ActivityResultContracts.PickMultipleVisualMedia(maxItems = 40)) { uris ->
        pendingPhotoId?.let { if (uris.isNotEmpty()) store.addPhotos(it, uris) }
        pendingPhotoId = null
    }
    fun pickPhotos(id: String) {
        pendingPhotoId = id
        launcher.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly))
    }
    val current = store.albums.firstOrNull { it.id == openId }
    var fullImageIndex by remember { mutableIntStateOf(-1) }
    val scope = rememberCoroutineScope()
    var exporting by remember { mutableStateOf(false) }

    Box(Modifier.fillMaxSize().background(Paper)) {
        AnimatedContent(
            targetState = current?.id,
            transitionSpec = { fadeIn() togetherWith fadeOut() },
            label = "album-navigation"
        ) { target ->
            val album = store.albums.firstOrNull { it.id == target }
            if (album == null) {
                LibraryScreen(
                    albums = store.albums,
                    onCreate = { createDialog = true },
                    onOpen = { openId = it },
                    onEdit = { editId = it }
                )
            } else {
                AlbumScreen(
                    album = album,
                    onBack = { openId = null },
                    onImport = { pickPhotos(album.id) },
                    onPhotoClick = { fullImageIndex = it },
                    onMove = { from, to -> store.movePhoto(album.id, from, to) },
                    exporting = exporting,
                    onExport = {
                        if (album.photos.isEmpty()) Toast.makeText(context, "先添加几张照片", Toast.LENGTH_SHORT).show()
                        else scope.launch {
                            exporting = true
                            try {
                                exportCollage(context, album)
                                Toast.makeText(context, "已保存到 图片 / FoldFrame", Toast.LENGTH_LONG).show()
                            } catch (e: Exception) {
                                Toast.makeText(context, "导出失败：${e.localizedMessage}", Toast.LENGTH_LONG).show()
                            } finally { exporting = false }
                        }
                    }
                )
            }
        }
    }
    if (createDialog) {
        var name by remember { mutableStateOf("") }
        AlertDialog(
            onDismissRequest = { createDialog = false },
            title = { Text("新建一本摄影集", color = Ink, fontFamily = FontFamily.Serif, fontSize = 24.sp) },
            text = { OutlinedTextField(value = name, onValueChange = { name = it }, label = { Text("相册名称") }, singleLine = true) },
            confirmButton = { TextButton(onClick = { val id = store.create(name); createDialog = false; openId = id }) { Text("创建", color = Accent) } },
            dismissButton = { TextButton(onClick = { createDialog = false }) { Text("取消", color = Muted) } },
            containerColor = Paper
        )
    }
    val editing = store.albums.firstOrNull { it.id == editId }
    if (editing != null) {
        var newName by remember(editing.id) { mutableStateOf(editing.title) }
        var confirmDelete by remember { mutableStateOf(false) }
        AlertDialog(
            onDismissRequest = { editId = null },
            title = { Text(if (confirmDelete) "确认删除整本相册？" else "编辑摄影集", fontFamily = FontFamily.Serif) },
            text = {
                Column { if (confirmDelete) Text("原始照片不会被删除；仅移除 FoldFrame 中的整理记录。")
                    else OutlinedTextField(value = newName, onValueChange = { newName = it }, label = { Text("相册名称") }) }
            },
            confirmButton = { TextButton(onClick = { if (confirmDelete) store.delete(editing.id) else store.rename(editing.id, newName); editId = null }) { Text(if (confirmDelete) "确认删除" else "保存", color = Accent) } },
            dismissButton = { TextButton(onClick = { if (confirmDelete) confirmDelete = false else editId = null }) { Text("取消") } },
            icon = { if (!confirmDelete) IconButton(onClick = { confirmDelete = true }) { Icon(Icons.Default.DeleteOutline, "删除相册", tint = Accent) } },
            containerColor = Paper
        )
    }
    if (fullImageIndex >= 0 && current != null && current.photos.isNotEmpty()) {
        FullscreenPhotos(current, fullImageIndex.coerceAtMost(current.photos.lastIndex), onClose = { fullImageIndex = -1 }, onDelete = { id ->
            store.removePhoto(current.id, id)
            fullImageIndex = -1
        })
    }
}

@Composable
private fun LibraryScreen(albums: List<AlbumEntry>, onCreate: () -> Unit, onOpen: (String) -> Unit, onEdit: (String) -> Unit) {
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        Row(Modifier.fillMaxWidth().padding(horizontal = 28.dp, vertical = 17.dp), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
            Text("F / F", color = Ink, fontFamily = FontFamily.Serif, fontSize = 24.sp, fontWeight = FontWeight.Bold)
            Text("PRIVATE PHOTO ATELIER", color = Muted, fontSize = 9.sp, letterSpacing = 2.5.sp)
            Box(Modifier.size(9.dp).background(Accent, CircleShape))
        }
        LazyVerticalGrid(
            columns = GridCells.Fixed(2),
            modifier = Modifier.fillMaxSize(),
            horizontalArrangement = Arrangement.spacedBy(14.dp),
            verticalArrangement = Arrangement.spacedBy(23.dp),
            contentPadding = PaddingValues(start = 24.dp, end = 24.dp, bottom = 100.dp)
        ) {
            item(span = { androidx.compose.foundation.lazy.grid.GridItemSpan(2) }) {
                Column(Modifier.padding(top = 28.dp, bottom = 17.dp)) {
                    Text("THE ART OF KEEPING", color = Accent, fontSize = 10.sp, fontWeight = FontWeight.SemiBold, letterSpacing = 2.6.sp)
                    Spacer(Modifier.height(17.dp))
                    Text("让瞬间，\n有了形状。", fontFamily = FontFamily.Serif, fontSize = 44.sp, lineHeight = 53.sp, color = Ink)
                    Spacer(Modifier.height(12.dp))
                    Text("不是浏览照片，而是收藏时间。", color = Muted, fontSize = 13.sp)
                    Spacer(Modifier.height(28.dp))
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        Box(Modifier.height(1.dp).width(38.dp).background(Accent))
                        Text("YOUR COLLECTION  /  ${albums.size.toString().padStart(2,'0')}", color = Muted, fontSize = 10.sp, letterSpacing = 1.7.sp)
                    }
                }
            }
            item {
                Column {
                    Box(Modifier.fillMaxWidth().aspectRatio(.72f).clip(RoundedCornerShape(3.dp)).background(Ink).clickable { onCreate() }, contentAlignment = Alignment.Center) {
                        Box(Modifier.fillMaxSize().padding(13.dp).border(1.dp, Color.White.copy(alpha = .24f)))
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Icon(Icons.Default.Add, null, tint = Color(0xFFF8F5EE), modifier = Modifier.size(35.dp))
                            Spacer(Modifier.height(14.dp))
                            Text("CREATE\nAN EDITION", color = Color.White, fontFamily = FontFamily.Serif, fontSize = 18.sp, textAlign = TextAlign.Center, lineHeight = 23.sp)
                        }
                        Text("EST. 2026", modifier = Modifier.align(Alignment.BottomCenter).padding(29.dp), color = Color.White.copy(alpha=.44f), fontSize = 8.sp, letterSpacing = 1.4.sp)
                    }
                    Spacer(Modifier.height(10.dp))
                    Text("新建摄影集", color = Ink, fontSize = 14.sp, fontWeight = FontWeight.Medium)
                    Text("把故事装订成册", color = Muted, fontSize = 11.sp)
                }
            }
            itemsIndexed(albums, key = { _, item -> item.id }) { index, album ->
                EditionCover(album, index, onOpen = { onOpen(album.id) }, onEdit = { onEdit(album.id) })
            }
            if (albums.isEmpty()) item(span = { androidx.compose.foundation.lazy.grid.GridItemSpan(2) }) {
                Text("从一张照片开始。打开新摄影集，再从手机相册中挑选你的故事。", modifier = Modifier.padding(top = 14.dp), color = Muted, fontSize = 12.sp, lineHeight = 20.sp)
            }
        }
    }
}

@Composable
private fun EditionCover(album: AlbumEntry, index: Int, onOpen: () -> Unit, onEdit: () -> Unit) {
    var pressed by remember { mutableStateOf(false) }
    val tilt by animateFloatAsState(if (pressed) -11f else 0f, spring(stiffness = Spring.StiffnessMediumLow), label = "cover-tilt")
    Column {
        Box(
            Modifier.fillMaxWidth().aspectRatio(.72f)
                .graphicsLayer { rotationY = tilt; cameraDistance = 24f * density }
                .shadow(11.dp, RoundedCornerShape(3.dp), clip = false)
                .clip(RoundedCornerShape(3.dp))
                .background(if (index % 2 == 0) Color(0xFF77705E) else Color(0xFFB0A393))
                .clickable { pressed = true; onOpen() }
        ) {
            if (album.photos.isNotEmpty()) AsyncImage(model = album.photos.first().uri, contentDescription = album.title, contentScale = ContentScale.Crop, modifier = Modifier.fillMaxSize())
            Box(Modifier.fillMaxSize().background(Brush.verticalGradient(listOf(Color.Black.copy(alpha = .18f), Color.Transparent, Color.Black.copy(alpha = .66f)))))
            Box(Modifier.fillMaxHeight().width(9.dp).background(Color.Black.copy(alpha = .24f)))
            Text("FOLDFRAME  /  ${index + 1}", Modifier.align(Alignment.TopStart).padding(18.dp), color = Color.White.copy(alpha=.88f), fontSize = 9.sp, letterSpacing = 1.5.sp)
            Text(album.title, modifier = Modifier.align(Alignment.BottomStart).padding(17.dp), maxLines = 3, overflow = TextOverflow.Ellipsis, color = Color.White, fontFamily = FontFamily.Serif, fontSize = 22.sp, lineHeight = 25.sp)
            Box(Modifier.align(Alignment.TopEnd).clickable { onEdit() }.padding(9.dp).size(35.dp).background(Color.Black.copy(alpha = .18f), CircleShape), contentAlignment=Alignment.Center) { Icon(Icons.Default.MoreHoriz, "编辑相册", tint=Color.White) }
        }
        Spacer(Modifier.height(12.dp))
        Text(album.title, color = Ink, fontSize = 13.sp, maxLines = 1, fontWeight = FontWeight.Medium)
        Spacer(Modifier.height(3.dp))
        Text("${album.photos.size} FRAMES  /  VOL.${(index+1).toString().padStart(2,'0')}", color = Muted, fontSize = 9.sp, letterSpacing = .8.sp)
    }
}

@OptIn(ExperimentalHazeMaterialsApi::class)
@Composable
private fun AlbumScreen(album: AlbumEntry, onBack: () -> Unit, onImport: () -> Unit, onPhotoClick: (Int) -> Unit, onMove: (Int, Int) -> Unit, onExport: () -> Unit, exporting: Boolean) {
    var bookMode by remember { mutableStateOf(false) }
    val haze = rememberHazeState()
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        Row(Modifier.fillMaxWidth().padding(start=20.dp,end=20.dp,top=11.dp,bottom=18.dp), verticalAlignment=Alignment.CenterVertically) {
            IconButton(onClick=onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack,"返回",tint=Ink) }
            Spacer(Modifier.width(11.dp))
            Text("FOLDFRAME", color=Ink, fontSize=11.sp, letterSpacing=2.2.sp, fontWeight=FontWeight.SemiBold)
            Spacer(Modifier.weight(1f))
            Row(Modifier.background(Linen, RoundedCornerShape(50)).padding(4.dp), verticalAlignment=Alignment.CenterVertically) {
                ModePill(Icons.Default.GridView, "网格", !bookMode) { bookMode=false }
                ModePill(Icons.Default.MenuBook, "翻页", bookMode) { bookMode=true }
            }
        }
        Box(Modifier.fillMaxSize()) {
            Column(Modifier.fillMaxSize().hazeSource(haze)) {
                Column(Modifier.padding(horizontal=28.dp).padding(top=24.dp,bottom=15.dp)) {
                    Text("PERSONAL EDITION  /  ${album.photos.size} FRAMES", color=Accent, fontSize=10.sp, letterSpacing=2.0.sp)
                    Spacer(Modifier.height(13.dp))
                    Text(album.title, fontFamily=FontFamily.Serif, fontSize=37.sp, color=Ink, lineHeight=43.sp)
                    Spacer(Modifier.height(9.dp))
                    Text(if (bookMode) "左右滑动，像翻开一本私人影集。" else "长按照片拖动，重新编排你的故事。", color=Muted,fontSize=12.sp)
                    Spacer(Modifier.height(14.dp))
                    HorizontalDivider(thickness=1.dp, color=Color(0xFFD9D0C5))
                }
                if (album.photos.isEmpty()) {
                    Box(Modifier.weight(1f).fillMaxWidth().padding(32.dp).border(1.dp, Color(0xFFCFC6B9), RoundedCornerShape(4.dp)),contentAlignment=Alignment.Center) {
                        Column(horizontalAlignment=Alignment.CenterHorizontally) {
                            Icon(Icons.Default.PhotoLibrary,null, tint=Olive,modifier=Modifier.size(37.dp))
                            Spacer(Modifier.height(19.dp))
                            Text("一本尚未开始的故事",fontFamily=FontFamily.Serif,color=Ink,fontSize=22.sp)
                            Spacer(Modifier.height(8.dp))
                            Text("从手机导入照片，开始排版。",color=Muted,fontSize=12.sp)
                            Spacer(Modifier.height(20.dp))
                            DarkButton("选择照片",Icons.Default.Add,onImport)
                        }
                    }
                } else if (bookMode) BookPages(album,onPhotoClick,Modifier.weight(1f))
                else PhotoGrid(album,onPhotoClick,onMove,Modifier.weight(1f))
            }
            Row(
                Modifier.align(Alignment.BottomCenter).fillMaxWidth()
                    .hazeEffect(state=haze, style=HazeMaterials.thin())
                    .background(Paper.copy(alpha=.77f))
                    .navigationBarsPadding().padding(horizontal=23.dp, vertical=16.dp),
                horizontalArrangement=Arrangement.spacedBy(12.dp), verticalAlignment=Alignment.CenterVertically
            ) {
                Box(Modifier.weight(1f)) { DarkButton("添加照片",Icons.Default.Add,onImport,fill=true) }
                Box(Modifier.weight(1f)) { OutlinedAction(if (exporting) "导出中…" else "导出拼贴", Icons.Default.IosShare, enabled=!exporting, onClick=onExport) }
            }
        }
    }
}

@Composable
private fun ModePill(icon: androidx.compose.ui.graphics.vector.ImageVector, label: String, selected: Boolean, onClick: () -> Unit) {
    val scale by animateFloatAsState(if(selected) 1f else .91f, spring(dampingRatio=Spring.DampingRatioMediumBouncy), label="mode-spring")
    Box(
        Modifier.graphicsLayer{scaleX=scale;scaleY=scale}
            .background(if(selected) Color.White else Color.Transparent, RoundedCornerShape(40.dp))
            .clickable(onClick=onClick).padding(horizontal=12.dp,vertical=9.dp),
        contentAlignment=Alignment.Center
    ) { Icon(icon,label,tint=if(selected) Ink else Muted,modifier=Modifier.size(19.dp)) }
}

@Composable
private fun DarkButton(text:String, icon:androidx.compose.ui.graphics.vector.ImageVector, onClick:()->Unit, fill:Boolean=false) {
    Row(Modifier.then(if(fill)Modifier.fillMaxWidth() else Modifier).clip(RoundedCornerShape(50.dp)).background(Ink).clickable(onClick=onClick).padding(horizontal=18.dp, vertical=14.dp), horizontalArrangement=Arrangement.Center,verticalAlignment=Alignment.CenterVertically) {
        Icon(icon,null,tint=Color.White,modifier=Modifier.size(18.dp))
        Spacer(Modifier.width(8.dp))
        Text(text,color=Color.White,fontSize=12.sp,fontWeight=FontWeight.Medium)
    }
}

@Composable
private fun OutlinedAction(text:String,icon:androidx.compose.ui.graphics.vector.ImageVector,enabled:Boolean,onClick:()->Unit) {
    Row(Modifier.fillMaxWidth().clip(RoundedCornerShape(50.dp)).border(1.dp, Ink.copy(alpha=.24f),RoundedCornerShape(50.dp)).clickable(enabled=enabled,onClick=onClick).padding(horizontal=12.dp,vertical=13.dp), horizontalArrangement=Arrangement.Center,verticalAlignment=Alignment.CenterVertically) {
        Icon(icon,null,tint=Ink,modifier=Modifier.size(17.dp))
        Spacer(Modifier.width(7.dp))
        Text(text,color=Ink,fontSize=12.sp)
    }
}

@Composable
private fun PhotoGrid(album:AlbumEntry,onClick:(Int)->Unit,onMove:(Int,Int)->Unit,modifier:Modifier=Modifier) {
    val haptic = LocalHapticFeedback.current
    val density = LocalDensity.current
    val cellStep = with(density){ 185.dp.toPx() }
    LazyVerticalGrid(
        columns=GridCells.Fixed(2), modifier=modifier, horizontalArrangement=Arrangement.spacedBy(11.dp),
        verticalArrangement=Arrangement.spacedBy(19.dp), contentPadding=PaddingValues(start=23.dp,end=23.dp,top=8.dp,bottom=107.dp)
    ) {
        itemsIndexed(album.photos,key={_,p->p.id}) { index, photo ->
            var dragY by remember(photo.id) { mutableFloatStateOf(0f) }
            var dragX by remember(photo.id) { mutableFloatStateOf(0f) }
            var origin by remember(photo.id){ mutableIntStateOf(index) }
            Column(Modifier.animateItem()) {
                Box(Modifier.fillMaxWidth()
                    .aspectRatio(if(index%5==0) .79f else if(index%4==0) .97f else .84f)
                    .graphicsLayer { translationX=dragX; translationY=dragY; scaleX=if(abs(dragY)+abs(dragX)>3)1.045f else 1f;scaleY=scaleX; shadowElevation=if(abs(dragY)+abs(dragX)>3) 19f else 0f }
                    .clip(RoundedCornerShape(3.dp))
                    .background(Linen)
                    .pointerInput(photo.id,index,album.photos.size) {
                        detectDragGesturesAfterLongPress(
                            onDragStart={ origin=index; haptic.performHapticFeedback(HapticFeedbackType.LongPress) },
                            onDragCancel={dragY=0f;dragX=0f},
                            onDragEnd={
                                val dcol=if(dragX>cellStep*.52)1 else if(dragX < -cellStep*.52)-1 else 0
                                val drow=(dragY/cellStep).toInt().coerceIn(-3,3)
                                val target=(origin + drow*2 + dcol).coerceIn(0,album.photos.lastIndex)
                                if(target!=origin){onMove(origin,target);haptic.performHapticFeedback(HapticFeedbackType.TextHandleMove)}
                                dragY=0f; dragX=0f
                            },
                            onDrag={change,amount->change.consume();dragX+=amount.x;dragY+=amount.y}
                        )
                    }
                    .clickable { onClick(index) }
                ) {
                    AsyncImage(model=photo.uri, contentDescription="照片 ${index+1}", modifier=Modifier.fillMaxSize(), contentScale=ContentScale.Crop)
                    Text("${(index+1).toString().padStart(2,'0')}",modifier=Modifier.align(Alignment.BottomEnd).background(Color.Black.copy(alpha=.32f)).padding(7.dp),color=Color.White,fontSize=9.sp)
                }
                Spacer(Modifier.height(8.dp))
                Text("FRAME ${(index+1).toString().padStart(2,'0')}",color=Muted,fontSize=9.sp,letterSpacing=1.2.sp)
            }
        }
    }
}

@Composable
private fun BookPages(album:AlbumEntry,onClick:(Int)->Unit,modifier:Modifier=Modifier) {
    val pages = (album.photos.size+1)/2
    val pager = rememberPagerState(pageCount = { pages.coerceAtLeast(1) })
    Column(modifier,verticalArrangement=Arrangement.Center) {
        HorizontalPager(state=pager,contentPadding=PaddingValues(horizontal=24.dp),pageSpacing=17.dp,modifier=Modifier.weight(1f)) { page ->
            val rotate by animateFloatAsState(if(pager.currentPage==page)0f else 8f, spring(stiffness=Spring.StiffnessLow),label="page-turn")
            Column(Modifier.fillMaxWidth().padding(vertical=24.dp)
                .graphicsLayer { rotationY=rotate;cameraDistance=32f*density;transformOrigin=TransformOrigin(.0f,.5f) }
                .shadow(11.dp,RoundedCornerShape(3.dp))
                .background(Color(0xFFFFFDF9),RoundedCornerShape(3.dp))
                .padding(19.dp)) {
                Row(verticalAlignment=Alignment.CenterVertically) {
                    Text("FOLDFRAME",color=Ink,fontSize=9.sp,letterSpacing=2.sp)
                    Spacer(Modifier.weight(1f))
                    Text("${(page+1).toString().padStart(2,'0')} / ${pages.toString().padStart(2,'0')}",color=Muted,fontSize=9.sp)
                }
                Spacer(Modifier.height(16.dp))
                for(j in 0..1) {
                    val i=page*2+j
                    if(i<album.photos.size) {
                        Box(Modifier.weight(1f).fillMaxWidth().clip(RoundedCornerShape(2.dp)).background(Linen).clickable{onClick(i)}) {
                            AsyncImage(model=album.photos[i].uri,contentDescription="照片 ${i+1}",modifier=Modifier.fillMaxSize(),contentScale=ContentScale.Crop)
                        }
                        Spacer(Modifier.height(if(j==0)11.dp else 0.dp))
                    } else Spacer(Modifier.weight(1f))
                }
                Spacer(Modifier.height(13.dp))
                Text("A MOMENT, PRESERVED.",color=Muted,fontSize=8.sp,letterSpacing=1.3.sp)
            }
        }
        Row(Modifier.fillMaxWidth().padding(bottom=105.dp),horizontalArrangement=Arrangement.Center,verticalAlignment=Alignment.CenterVertically) {
            Text("←",color=Muted,fontSize=17.sp)
            Spacer(Modifier.width(15.dp))
            Text("SWIPE TO TURN THE PAGE",color=Muted,fontSize=9.sp,letterSpacing=1.2.sp)
            Spacer(Modifier.width(15.dp))
            Text("→",color=Muted,fontSize=17.sp)
        }
    }
}

@Composable
private fun FullscreenPhotos(album:AlbumEntry,startIndex:Int,onClose:()->Unit,onDelete:(String)->Unit) {
    val state=rememberPagerState(initialPage=startIndex, pageCount={album.photos.size})
    Dialog(onDismissRequest=onClose) {
        Box(Modifier.fillMaxWidth().fillMaxHeight(.89f).clip(RoundedCornerShape(12.dp)).background(Ink)) {
            HorizontalPager(state=state,modifier=Modifier.fillMaxSize()) { i ->
                AsyncImage(model=album.photos[i].uri,contentDescription="放大照片 ${i+1}",modifier=Modifier.fillMaxSize().padding(vertical=75.dp),contentScale=ContentScale.Fit)
            }
            Row(Modifier.fillMaxWidth().align(Alignment.TopCenter).padding(16.dp),verticalAlignment=Alignment.CenterVertically) {
                Text("${state.currentPage+1} / ${album.photos.size}",color=Color.White,fontFamily=FontFamily.Serif,fontSize=18.sp)
                Spacer(Modifier.weight(1f))
                IconButton(onClick=onClose){Icon(Icons.Default.Close,"关闭",tint=Color.White)}
            }
            Row(Modifier.align(Alignment.BottomCenter).fillMaxWidth().padding(17.dp),horizontalArrangement=Arrangement.SpaceBetween, verticalAlignment=Alignment.CenterVertically) {
                Text("FOLDFRAME  •  ORIGINAL",color=Color.White.copy(alpha=.58f),fontSize=9.sp,letterSpacing=1.5.sp)
                IconButton(onClick={onDelete(album.photos[state.currentPage].id)}){Icon(Icons.Default.DeleteOutline,"从影集移除",tint=Color.White)}
            }
        }
    }
}
