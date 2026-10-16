package io.github.c666249.rewarder;

import android.content.Context;
import android.graphics.Color;
import android.graphics.drawable.GradientDrawable;
import android.view.Gravity;
import android.view.View;
import android.widget.FrameLayout;
import eightbitlab.com.blurview.BlurTarget;

/** Native foreground shell; all optical pixels come from ReactBitsGlass WebGL.
 * This is intentionally NOT another translucent Android shape or BlurView.
 * The scene uses the original GlassSurface displacement/RGB sampling algorithm.
 */
final class GlassMaterial {
    private GlassMaterial(){}
    private static int dp(Context c,float v){return Math.round(MotionViews.dp(c,v));}
    static final class GlassShell extends FrameLayout {
        GlassShell(Context c,float radius,String finish){
            super(c);
            setBackgroundColor(Color.TRANSPARENT);
            setClipChildren(false);
            setClipToPadding(false);
            setImportantForAccessibility(View.IMPORTANT_FOR_ACCESSIBILITY_NO);
            ReactBitsGlass.register(this,finish,radius);
        }
    }
    private static GlassShell wrap(Context c,View content,float radius,String finish,int width,int height){
        GlassShell shell=new GlassShell(c,radius,finish);
        shell.addView(content,new FrameLayout.LayoutParams(width,height,Gravity.CENTER));
        return shell;
    }
    // BlurTarget is kept as a signature-only compatibility parameter:
    // background sampling is performed inside the SAME WebGL canvas as glass.
    static GlassShell panel(Context c,BlurTarget ignored,View child,float radius){
        return wrap(c,child,radius,"clear",-1,-2);
    }
    static GlassShell floatingCard(Context c,BlurTarget ignored,View child,float radius){
        return wrap(c,child,radius,"clear",-1,-2);
    }
    static GlassShell pill(Context c,BlurTarget ignored,View child,float radius){
        return wrap(c,child,radius,"clear",-2,-2);
    }
    static GlassShell balancePill(Context c,BlurTarget ignored,View child,float radius){
        return wrap(c,child,radius,"hero",-2,-2);
    }
    static GlassShell navigation(Context c,BlurTarget ignored,MotionViews.RubberTabs tabs,float radius){
        GlassShell outer=new GlassShell(c,radius,"nav");
        FrameLayout stage=new FrameLayout(c);
        stage.setClipChildren(false);
        stage.setClipToPadding(false);
        GlassShell selected=new GlassShell(c,radius-6f,"clear");
        stage.addView(selected,new FrameLayout.LayoutParams(1,1,Gravity.TOP|Gravity.LEFT));
        stage.addView(tabs,new FrameLayout.LayoutParams(-1,-1,Gravity.FILL));
        stage.addOnLayoutChangeListener((v,left,top,right,bottom,ol,ot,or_,ob)->{
            int w=right-left,h=bottom-top;
            if(w<10||h<10)return;
            int targetWidth=Math.max(1,Math.round((w-dp(c,14f))/2f-dp(c,4f)));
            int targetHeight=Math.max(1,h-dp(c,12f));
            FrameLayout.LayoutParams lp=(FrameLayout.LayoutParams)selected.getLayoutParams();
            if(lp.width!=targetWidth||lp.height!=targetHeight){
                lp.width=targetWidth;lp.height=targetHeight;
                selected.setLayoutParams(lp);
                selected.setPivotX(targetWidth*.5f);selected.setPivotY(targetHeight*.5f);
            }
            tabs.reportThumb();
        });
        tabs.setThumbListener((center,width,scale)->{
            int base=selected.getLayoutParams().width;
            if(base<2)return;
            selected.setX(center-base*.5f);
            selected.setY(dp(c,6));
            selected.setScaleX(width/base);
            selected.setScaleY(scale);
        });
        outer.addView(stage,new FrameLayout.LayoutParams(-1,-1,Gravity.FILL));
        return outer;
    }
}
