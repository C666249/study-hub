package io.github.c666249.rewarder;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.LinearGradient;
import android.graphics.Paint;
import android.graphics.RectF;
import android.graphics.Shader;
import android.graphics.drawable.GradientDrawable;
import android.view.Gravity;
import android.view.View;
import android.view.ViewOutlineProvider;
import android.widget.FrameLayout;
import eightbitlab.com.blurview.BlurTarget;
import eightbitlab.com.blurview.BlurView;

/**
 * Shared live-glass material: true hardware-backed blur of the continuously
 * animated background BlurTarget + a subtle frosted tint, refractive rim, and
 * tapered top glint. Child contents remain sharp.
 *
 * GlassShell has no data or network dependencies and doesn't intercept taps.
 */
final class GlassMaterial {
    private GlassMaterial(){}
    private static int d(Context c,float v){return Math.round(MotionViews.dp(c,v));}

    static final class GlassShell extends FrameLayout {
        private final Paint rim=new Paint(Paint.ANTI_ALIAS_FLAG);
        private final Paint glint=new Paint(Paint.ANTI_ALIAS_FLAG);
        private final RectF bounds=new RectF();
        private final float radius;
        private final boolean pill;

        GlassShell(Context context,float radiusDp,boolean pill){
            super(context);
            this.radius=d(context,radiusDp);
            this.pill=pill;
            setWillNotDraw(false);
            setClipChildren(true);
            setClipToPadding(false);
            GradientDrawable outline=new GradientDrawable();
            outline.setColor(Color.TRANSPARENT);
            outline.setCornerRadius(radius);
            setBackground(outline);
            setOutlineProvider(ViewOutlineProvider.BACKGROUND);
            setClipToOutline(true);
            setImportantForAccessibility(IMPORTANT_FOR_ACCESSIBILITY_NO);
        }

        @Override protected void dispatchDraw(Canvas canvas){
            super.dispatchDraw(canvas);
            float w=getWidth(),h=getHeight();
            if(w<=1||h<=1)return;
            float r=Math.min(radius,Math.min(w,h)*.50f);
            float inset=d(getContext(),.65f);
            bounds.set(inset,inset,w-inset,h-inset);

            // Barely-there vertical reflection through clear, imperfect glass.
            glint.setStyle(Paint.Style.FILL);
            glint.setShader(new LinearGradient(0,0,0,h,
                new int[]{0x25FFFFFF,0x08D4E8FA,0x00FFFFFF,0x08E6CCF2},
                new float[]{0f,.19f,.64f,1f},Shader.TileMode.CLAMP));
            canvas.drawRoundRect(bounds,r,r,glint);
            glint.setShader(null);

            // Spectrally shifting rim: brighter upper left, cooler lower edge.
            rim.setStyle(Paint.Style.STROKE);
            rim.setStrokeWidth(d(getContext(),1.0f));
            rim.setShader(new LinearGradient(0,0,w,h,
                new int[]{0xB0F7F9FF,0x64DFEAFF,0x38D8C6E6,0x83E2F2FA},
                new float[]{0f,.36f,.68f,1f},Shader.TileMode.CLAMP));
            canvas.drawRoundRect(bounds,r,r,rim);
            rim.setShader(null);

            if(pill){
                // A fine curved highlight catches top of smaller glass controls.
                rim.setColor(0x36FFFFFF);
                rim.setStrokeWidth(d(getContext(),.8f));
                bounds.inset(d(getContext(),1.1f),d(getContext(),1.1f));
                canvas.drawArc(bounds,201,141,false,rim);
            }
            rim.setStyle(Paint.Style.FILL);
        }
    }

    /**
     * Foreground contents take 'match' dimensions when specified, otherwise
     * provide the natural wrap-content height for cards or wrap-content width
     * for pills. Blur is always full shell size and samples only BlurTarget.
     */
    private static GlassShell create(Context c,BlurTarget target,View content,
          float radius,int tint,float blurRadius,
          int contentWidth,int contentHeight,boolean pill){
        GlassShell shell=new GlassShell(c,radius,pill);
        BlurView glass=new BlurView(c);
        GradientDrawable mask=new GradientDrawable();
        mask.setColor(Color.TRANSPARENT);
        mask.setCornerRadius(d(c,radius));
        glass.setBackground(mask);
        glass.setClipToOutline(true);
        glass.setOutlineProvider(ViewOutlineProvider.BACKGROUND);
        shell.addView(glass,new FrameLayout.LayoutParams(-1,-1));
        glass.setupWith(target)
            .setBlurRadius(blurRadius)
            .setOverlayColor(tint);
        FrameLayout.LayoutParams p=new FrameLayout.LayoutParams(contentWidth,contentHeight,Gravity.CENTER);
        shell.addView(content,p);
        return shell;
    }

    static GlassShell panel(Context c,BlurTarget target,View content,float radius){
        return create(c,target,content,radius,0x30323B52,19f,-1,-2,false);
    }
    static GlassShell floatingCard(Context c,BlurTarget target,View content,float radius){
        return create(c,target,content,radius,0x28323D52,17f,-1,-2,false);
    }
    static GlassShell pill(Context c,BlurTarget target,View content,float radius){
        return create(c,target,content,radius,0x283D475C,16f,-2,-2,true);
    }
    static GlassShell navigation(Context c,BlurTarget target,View content,float radius){
        return create(c,target,content,radius,0x44232C3F,22f,-1,-1,true);
    }
}
