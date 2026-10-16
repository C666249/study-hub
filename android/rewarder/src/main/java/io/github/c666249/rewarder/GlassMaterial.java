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
 * Real SDF glass with deliberately different optical personalities.
 *
 * Clear: short-range blur, focused refraction, light rim, unpainted centre.
 * Frosted: subtle scattering and low-contrast rim for readable large cards.
 *
 * Based on the open-source QWEA0/Liquid-Glass-Android implementation (MIT).
 * Never draw synthetic arcs, double-stroke frames or repeated noise over glass.
 */
final class GlassMaterial {
    private GlassMaterial(){}
    private static int dp(Context c,float v){return Math.round(MotionViews.dp(c,v));}
    private enum Finish { HERO, CLEAR, FROSTED, NAV }

    static final class GlassShell extends LiquidGlassView {
        GlassShell(Context context,BlurTarget source,float radiusDp,Finish finish){
            super(context);
            int r=dp(context,radiusDp);
            setCornerRadius(r);
            setBackdropSource(source);
            setEnableDynamicBackground(true);
            // The v1.6 implementation disabled BOTH dispersion gates, so
            // setDispersionStrength had no effect in its AGSL lens. Intentionally
            // enable only on clear lenses; the renderer does RGB channel sampling
            // in one shader pass, without separate CPU texture uploads.
            setEnableChromaticAberration(false);
            setEnableChromaticDispersion(finish==Finish.HERO || finish==Finish.CLEAR);
            setEnableSensorHighlight(false);
            setEnableAdaptiveTint(false);
            setEnableShadow(false);
            setEnablePressEffect(false);
            setEnableEdgeHighlight(true);
            // The default small-control cap reduces refraction by minDim/110dp.
            // Use explicit calibrated optical distances for 40dp glass pills,
            // and retain adaptive clipping on larger cards.
            setAdaptiveLensScale(finish==Finish.FROSTED || finish==Finish.NAV);
            setGlobalDownsampleFactor(1f);
            setEdgeSoftness(dp(context,1.8f));

            if(finish==Finish.HERO){
                // React Bits GlassSurface lesson: make actual edge displacement
                // visible instead of painting a fake white stroke. Use a short,
                // clearly refractive shoulder with an almost unblurred centre.
                setMaterial(com.example.liquidglass.GlassMaterial.CLEAR);
                setBlurAmount(.008f);
                setSaturation(112f);
                setGlassTint(0x06EFF5F1);
                setBevelWidth(dp(context,18f));
                setRefractionHeight(dp(context,24f));
                setRefractionFalloff(1.35f);
                setEdgeSoftness(dp(context,2.8f));
                setDispersionStrength(.11f);
                setEdgeHighlightOpacity(55f);
                setEdgeHighlightBorderWidth(dp(context,.78f));
                setRefractionOutward(false);
            } else if(finish==Finish.CLEAR){
                setMaterial(com.example.liquidglass.GlassMaterial.CLEAR);
                setBlurAmount(.012f);
                setSaturation(109f);
                setGlassTint(0x06EDF4F0);
                setBevelWidth(dp(context,14f));
                setRefractionHeight(dp(context,17f));
                setRefractionFalloff(1.75f);
                setEdgeSoftness(dp(context,2.2f));
                setDispersionStrength(.068f);
                setEdgeHighlightOpacity(37f);
                setEdgeHighlightBorderWidth(dp(context,.66f));
            } else if(finish==Finish.FROSTED) {
                // Material diffusion is restrained: color still flows underneath.
                setMaterial(com.example.liquidglass.GlassMaterial.REGULAR);
                setBlurAmount(.047f);
                setSaturation(109f);
                setGlassTint(0x07EAF1EF);
                setBevelWidth(dp(context,12f));
                setRefractionHeight(dp(context,6.8f));
                setRefractionFalloff(2.45f);
                setDispersionStrength(.025f);
                setEdgeHighlightOpacity(13f);
                setEdgeHighlightBorderWidth(dp(context,.55f));
            } else {
                setMaterial(com.example.liquidglass.GlassMaterial.REGULAR);
                setBlurAmount(.024f);
                setSaturation(110f);
                setGlassTint(0x07CBDCE0);
                setBevelWidth(dp(context,11f));
                setRefractionHeight(dp(context,4.5f));
                setRefractionFalloff(2.5f);
                setDispersionStrength(.02f);
                setEdgeHighlightOpacity(17f);
                setEdgeHighlightBorderWidth(dp(context,.5f));
            }
            GradientDrawable clip=new GradientDrawable();
            clip.setColor(Color.TRANSPARENT);
            clip.setCornerRadius(r);
            setBackground(clip);
            setOutlineProvider(ViewOutlineProvider.BACKGROUND);
            setClipToOutline(true);
            setClipChildren(true);
        }
    }

    private static GlassShell wrap(Context c,BlurTarget source,View child,float radius,
                                    Finish finish,int w,int h){
        GlassShell shell=new GlassShell(c,source,radius,finish);
        shell.addView(child,new FrameLayout.LayoutParams(w,h,Gravity.CENTER));
        return shell;
    }

    static GlassShell panel(Context c,BlurTarget source,View child,float radius){
        return wrap(c,source,child,radius,Finish.FROSTED,-1,-2);
    }
    static GlassShell floatingCard(Context c,BlurTarget source,View child,float radius){
        return wrap(c,source,child,radius,Finish.FROSTED,-1,-2);
    }
    static GlassShell pill(Context c,BlurTarget source,View child,float radius){
        return wrap(c,source,child,radius,Finish.CLEAR,-2,-2);
    }
    static GlassShell balancePill(Context c,BlurTarget source,View child,float radius){
        return wrap(c,source,child,radius,Finish.HERO,-2,-2);
    }

    /**
     * The selected segment is ANOTHER real clear-glass lens, not a tinted
     * painted rectangle. RubberTabs still owns finger input and the exact
     * FMV width/position physics; this view only mirrors its geometry.
     */
    static GlassShell navigation(Context c,BlurTarget source,MotionViews.RubberTabs tabs,float radius){
        GlassShell outer=new GlassShell(c,source,radius,Finish.NAV);
        FrameLayout stage=new FrameLayout(c);
        stage.setClipChildren(false);
        stage.setClipToPadding(false);
        GlassShell selected=new GlassShell(c,source,radius-6f,Finish.CLEAR);
        stage.addView(selected,new FrameLayout.LayoutParams(1,1,Gravity.TOP|Gravity.LEFT));
        stage.addView(tabs,new FrameLayout.LayoutParams(-1,-1,Gravity.FILL));

        stage.addOnLayoutChangeListener((v,left,top,right,bottom,ol,ot,or_,ob)->{
            int width=right-left,height=bottom-top;
            if(width<10||height<10)return;
            int slotWidth=Math.max(1,Math.round((width-dp(c,14f))/2f-dp(c,4f)));
            int slotHeight=Math.max(1,height-dp(c,12f));
            FrameLayout.LayoutParams lp=(FrameLayout.LayoutParams)selected.getLayoutParams();
            if(lp.width!=slotWidth||lp.height!=slotHeight){
                lp.width=slotWidth;lp.height=slotHeight;
                selected.setLayoutParams(lp);
                selected.setPivotX(slotWidth*.5f);
                selected.setPivotY(slotHeight*.5f);
            }
            tabs.reportThumb();
        });

        tabs.setThumbListener((center,width,scale)->{
            int slot=selected.getLayoutParams().width;
            if(slot<2)return;
            selected.setX(center-slot*.5f);
            selected.setY(dp(c,6f));
            selected.setScaleX(width/slot);
            selected.setScaleY(scale);
        });
        outer.addView(stage,new FrameLayout.LayoutParams(-1,-1,Gravity.FILL));
        return outer;
    }
}
