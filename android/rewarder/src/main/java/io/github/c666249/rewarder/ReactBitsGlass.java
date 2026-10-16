package io.github.c666249.rewarder;

import android.app.Activity;
import android.content.Context;
import android.graphics.Color;
import android.graphics.Rect;
import android.os.Handler;
import android.os.Looper;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import org.json.JSONArray;
import org.json.JSONObject;
import java.lang.ref.WeakReference;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;

/**
 * Native foreground and store remain Android Views. The actual React Bits
 * GlassSurface optical algorithm runs as one shared WebGL2 scene underneath
 * native touch targets, labels and FMV animations.
 *
 * The WebView draws BOTH backdrop and glass with one backdrop sampler; a
 * transparent WebView placed on top of the native background would be unable
 * to refract the native View pixels. This structure avoids that mistake.
 */
final class ReactBitsGlass {
    private static final class Lens {
        final WeakReference<View> view;
        final int id;
        final String finish;
        final float radius;
        Lens(View v,int id,String finish,float radius) {
            this.view=new WeakReference<>(v);
            this.id=id;
            this.finish=finish;
            this.radius=radius;
        }
    }
    private static final ArrayList<Lens> lenses=new ArrayList<>();
    private static final Handler handler=new Handler(Looper.getMainLooper());
    private static WebView web;
    private static boolean ready;
    private static boolean running;
    private static int nextId=1;
    private static final int[] nativeOrigin=new int[2];
    private static final int[] glassOrigin=new int[2];
    private static final Rect nativeClip=new Rect();
    private static final Rect frameClip=new Rect();

    private ReactBitsGlass() {}

    static View install(Activity activity) {
        release();
        lenses.clear();nextId=1;
        WebView w=new WebView(activity);
        w.setBackgroundColor(Color.TRANSPARENT);
        w.setLayerType(View.LAYER_TYPE_HARDWARE,null);
        w.setVerticalScrollBarEnabled(false);
        w.setHorizontalScrollBarEnabled(false);
        w.setOverScrollMode(View.OVER_SCROLL_NEVER);
        w.setImportantForAccessibility(View.IMPORTANT_FOR_ACCESSIBILITY_NO);
        WebSettings settings=w.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(false);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(false);
        settings.setBlockNetworkLoads(true);
        settings.setDefaultTextEncodingName("UTF-8");
        w.setWebViewClient(new WebViewClient(){
            @Override public void onPageFinished(WebView view,String url) {
                if(view==web) {
                    ready=true;running=true;handler.post(tick);
                }
            }
        });
        web=w;
        w.loadUrl("file:///android_asset/rewarder-glass.html");
        return w;
    }

    static void register(View view,String finish,float radiusDp) {
        lenses.add(new Lens(view,nextId++,finish,radiusDp));
    }

    private static final Runnable tick=new Runnable(){
        @Override public void run(){
            if(!running||web==null)return;
            if(!ready||!web.isShown()||web.getWidth()<1){
                handler.postDelayed(this,110);
                return;
            }
            final WebView w=web;
            w.getLocationOnScreen(nativeOrigin);
            final float density=w.getResources().getDisplayMetrics().density;
            final int screenLeft=nativeOrigin[0],screenTop=nativeOrigin[1];
            final int width=w.getWidth(),height=w.getHeight();
            JSONArray arr=new JSONArray();
            ArrayList<Lens> visible=new ArrayList<>();
            for(int i=lenses.size()-1;i>=0;i--){
                View v=lenses.get(i).view.get();
                if(v==null||!v.isAttachedToWindow())lenses.remove(i);
                else if(v.isShown() && v.getWidth()>2 && v.getHeight()>2 && v.getGlobalVisibleRect(nativeClip))
                    visible.add(lenses.get(i));
            }
            // Outer lens before nested claim/selected lens, so the latter wins.
            Collections.sort(visible,(a,b)->{
                View av=a.view.get(),bv=b.view.get();
                if(av==null||bv==null)return 0;
                return Float.compare(bv.getWidth()*(float)bv.getHeight(),av.getWidth()*(float)av.getHeight());
            });
            for(Lens lens:visible){
                View v=lens.view.get();
                if(v==null)continue;
                v.getLocationOnScreen(glassOrigin);
                if(!v.getGlobalVisibleRect(nativeClip))continue;
                frameClip.set(nativeClip);
                if(!frameClip.intersect(screenLeft,screenTop,screenLeft+width,screenTop+height))continue;
                try {
                    JSONObject item=new JSONObject();
                    item.put("id",lens.id);
                    item.put("x",(glassOrigin[0]-screenLeft)/density);
                    item.put("y",(glassOrigin[1]-screenTop)/density);
                    item.put("w",v.getWidth()*v.getScaleX()/density);
                    item.put("h",v.getHeight()*v.getScaleY()/density);
                    item.put("r",lens.radius);
                    item.put("finish",lens.finish);
                    item.put("cx",(frameClip.left-screenLeft)/density);
                    item.put("cy",(frameClip.top-screenTop)/density);
                    item.put("cw",frameClip.width()/density);
                    item.put("ch",frameClip.height()/density);
                    arr.put(item);
                }catch(Exception ignored){}
            }
            // JSON is generated from owned numeric geometry only. No user text,
            // filenames, secrets or reward data ever enters the WebView.
            final String json=arr.toString();
            w.evaluateJavascript("window.GlassScene&&GlassScene.setLenses("+json+")",null);
            handler.postDelayed(this,75);
        }
    };

    static void pause(){
        running=false;
        handler.removeCallbacks(tick);
        if(web!=null)web.evaluateJavascript("window.GlassScene&&GlassScene.pause()",null);
        if(web!=null)web.onPause();
    }
    static void resume(){
        if(web==null)return;
        web.onResume();
        if(ready){
            web.evaluateJavascript("window.GlassScene&&GlassScene.resume()",null);
            running=true;handler.removeCallbacks(tick);handler.post(tick);
        }
    }
    static void release(){
        running=false;ready=false;
        handler.removeCallbacks(tick);
        if(web!=null){
            final WebView old=web;web=null;
            old.stopLoading();
            if(old.getParent() instanceof ViewGroup)((ViewGroup)old.getParent()).removeView(old);
            old.destroy();
        }
        lenses.clear();
    }
}
