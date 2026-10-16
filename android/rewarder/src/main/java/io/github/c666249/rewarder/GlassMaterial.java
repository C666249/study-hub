package io.github.c666249.rewarder;

import android.content.Context;
import android.graphics.Color;
import android.graphics.drawable.GradientDrawable;
import android.view.Gravity;
import android.view.View;
import android.view.ViewOutlineProvider;
import android.widget.FrameLayout;

import eightbitlab.com.blurview.BlurTarget;
import com.example.liquidglass.LiquidGlassView;

/**
 * Clear, refracting glass for the existing Android View hierarchy.
 *
 * Uses QWEA0/Liquid-Glass-Android (MIT) for a real SDF glass lens on API33+,
 * with graceful classic blur on older devices. Samples ONLY the separately
 * rendered moving color target, not children or sibling panes.
 *
 * The previous painted double rim, fan-shaped arc glints, rough speckles and
 * opaque glass fill are intentionally gone. A tiny edge caustic is supplied
 * by the library's physical material itself.
 */
final class GlassMaterial {
    private GlassMaterial(){}
    private static int d(Context c,float v){return Math.round(MotionViews.dp(c,v));}

    static final class GlassShell extends LiquidGlassView {
        GlassShell(Context context,BlurTarget source,float radiusDp,boolean isPill,int tint) {
            super(context);
            float r=d(context,radiusDp);
            setCornerRadius(r);
            setBackdropSource(source);
            setEnableDynamicBackground(true);
            setMaterial(com.example.liquidglass.GlassMaterial.CLEAR);
            // Clear means optically visible moving background, not stained glass.
            setGlassTint(tint);
            setBlurAmount(isPill?.025f:.040f);
            setSaturation(118f);
            setRefractionHeight(d(context,isPill?7f:9f));
            setBevelWidth(d(context,isPill?12f:18f));
            setRefractionFalloff(2.65f);
            setDispersionStrength(.055f);
            setEnableSensorHighlight(false);
            setEnableAdaptiveTint(false);
            setEnableShadow(false);
            setEnablePressEffect(false);
            setEnableEdgeHighlight(true);
            setEdgeHighlightOpacity(32f);
            setEdgeHighlightBorderWidth(d(context,.75f));
            setEnableChromaticAberration(false);
            // Rounded foreground clipping: text and children remain crisp.
            GradientDrawable outline=new GradientDrawable();
            outline.setColor(Color.TRANSPARENT);
            outline.setCornerRadius(r);
            setBackground(outline);
            setOutlineProvider(ViewOutlineProvider.BACKGROUND);
            setClipToOutline(true);
            setClipChildren(false);
        }
    }

    private static GlassShell create(Context c,BlurTarget target,View content,
            float radius,int tint,int contentWidth,int contentHeight,boolean pill){
        GlassShell shell=new GlassShell(c,target,radius,pill,tint);
        FrameLayout.LayoutParams p=new FrameLayout.LayoutParams(
            contentWidth,contentHeight,Gravity.CENTER);
        shell.addView(content,p);
        return shell;
    }

    static GlassShell panel(Context c,BlurTarget target,View content,float radius){
        return create(c,target,content,radius,0x18DCEAE7,-1,-2,false);
    }
    static GlassShell floatingCard(Context c,BlurTarget target,View content,float radius){
        return create(c,target,content,radius,0x14E0E8E4,-1,-2,false);
    }
    static GlassShell pill(Context c,BlurTarget target,View content,float radius){
        return create(c,target,content,radius,0x10EAF1EE,-2,-2,true);
    }
    static GlassShell navigation(Context c,BlurTarget target,View content,float radius){
        return create(c,target,content,radius,0x1BD9E6E9,-1,-1,true);
    }
}
