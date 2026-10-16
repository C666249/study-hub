package io.github.c666249.rewarder;

import android.animation.ValueAnimator;
import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapShader;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.LinearGradient;
import android.graphics.Paint;
import android.graphics.RadialGradient;
import android.graphics.Shader;
import android.os.SystemClock;
import android.view.View;
import android.view.animation.LinearInterpolator;

/**
 * GPU-friendly animated light behind frosted glass.
 *
 * FMV Background Visual: continuous, slow, interruptible, no touch interception.
 * Blue/violet/rose/cyan volumes orbit on DIFFERENT periods, softly stretch and
 * overlap like water refracting light. No visible wave strokes.
 *
 * Unlike the former software pixel-field, no per-frame setPixels, pixel-wise
 * sin/exp loops or large bitmap upload. Eight reusable radial shaders are
 * transformed by Canvas at ~30 FPS. Animation is paused while not visible.
 */
final class GlassBackdrop extends View {
    private static final long FRAME_MS=33L;
    private final Paint paint=new Paint(Paint.ANTI_ALIAS_FLAG | Paint.FILTER_BITMAP_FLAG | Paint.DITHER_FLAG);
    private final Paint veil=new Paint(Paint.ANTI_ALIAS_FLAG | Paint.DITHER_FLAG);
    private final Paint grainPaint=new Paint(Paint.ANTI_ALIAS_FLAG | Paint.FILTER_BITMAP_FLAG);
    private final Shader[] lights=new Shader[8];
    private final Shader[] calmLights=new Shader[8];
    private Bitmap grain;
    private Shader background;
    private Shader dreamBackground;
    private Shader frost;
    private ValueAnimator ticker;
    private long epoch;
    private long lastDraw=0L;
    private float seconds=0f;

    GlassBackdrop(Context c) {
        super(c);
        setClickable(false);
        setFocusable(false);
        setImportantForAccessibility(IMPORTANT_FOR_ACCESSIBILITY_NO);
        createShaders();
        createGrain();
    }

    private void createShaders() {
        // Center, inner haze, outer haze, transparent edge. Everything remains soft.
        lights[0]=light(0xA14D87F3,0x685365C8,0x22405998);
        lights[1]=light(0xBE9856EC,0x7D6A52B8,0x26404A8A);
        lights[2]=light(0xB8D7528A,0x8B943C80,0x252C365F);
        lights[3]=light(0x993BC9CC,0x6440A5B4,0x183F6A73);
        lights[4]=light(0x987C6AEC,0x624A55A0,0x172F3F6E);
        lights[5]=light(0xA35585D9,0x6A405997,0x152B395D);
        // Glints are broad luminous volumes, not sparkles or visible lines.
        lights[6]=light(0x428BC0FC,0x2B718DC8,0x0B4C6F9A);
        lights[7]=light(0x4FDFA2B5,0x2AAB7A98,0x0A5A5C71);

        // Start in the warm jade/bronze atmosphere of the earlier glass build.
        // The blue/violet/rose colors are NOT shown directly at launch.
        calmLights[0]=light(0x956FACA3,0x4F558A81,0x15366360);
        calmLights[1]=light(0x898DAF87,0x515F8873,0x183C564D);
        calmLights[2]=light(0x9AAB8664,0x5B8A7055,0x183E4034);
        calmLights[3]=light(0x897DC7AF,0x51429B87,0x164A7568);
        calmLights[4]=light(0x6763A799,0x374E867D,0x13325359);
        calmLights[5]=light(0x7187B39D,0x3E628778,0x0B394B4D);
        calmLights[6]=light(0x428FD4BA,0x2B6D9A84,0x08446D62);
        calmLights[7]=light(0x50D3AE83,0x2A968567,0x0B5A594C);
    }

    private static Shader light(int center,int inner,int outer) {
        return new RadialGradient(0f,0f,1f,
            new int[]{center,inner,outer,Color.TRANSPARENT},
            new float[]{0f,.30f,.63f,1f},Shader.TileMode.CLAMP);
    }

    private void createGrain(){
        int side=96;
        grain=Bitmap.createBitmap(side,side,Bitmap.Config.ARGB_8888);
        int[] pixels=new int[side*side];
        int seed=0x2877A5;
        for(int i=0;i<pixels.length;i++){
            seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;
            // Subpixel optical diffusion only. Old 2..9 alpha grain looked rough.
            int alpha=(seed>>>24)&1;
            pixels[i]=Color.argb(alpha,248,248,249);
        }
        grain.setPixels(pixels,0,side,0,0,side,side);
        grainPaint.setShader(new BitmapShader(grain,Shader.TileMode.REPEAT,Shader.TileMode.REPEAT));
    }

    @Override protected void onSizeChanged(int w,int h,int ow,int oh){
        super.onSizeChanged(w,h,ow,oh);
        if(w<=0||h<=0)return;
        background=new LinearGradient(0,0,w,h,
            new int[]{0xff152322,0xff182c29,0xff172523,0xff242821},
            new float[]{0f,.29f,.68f,1f},Shader.TileMode.CLAMP);
        dreamBackground=new LinearGradient(0,0,w,h,
            new int[]{0xff11162a,0xff191b33,0xff141c31,0xff231b2c},
            new float[]{0f,.29f,.68f,1f},Shader.TileMode.CLAMP);
        frost=new LinearGradient(0,0,w,h,
            new int[]{0x10EDF4E8,0x08DAE7DB,0x09DCE5EC,0x16E6E3D6},
            new float[]{0f,.30f,.67f,1f},Shader.TileMode.CLAMP);
    }

    /**
     * Draw a deforming, feather-soft elliptical light volume using only
     * Canvas transforms. Different oscillation periods avoid a synchronized
     * screensaver look and yield visible drift over a few seconds.
     */
    private float colorBlend;
    // 72 seconds for calm -> violet-blue -> calm, with a smooth derivative at
    // both ends. Both palettes share the same spatial movement / refraction.
    private void pool(Canvas canvas,int id,float cx,float cy,
                      float rx,float ry,float rotation) {
        canvas.save();
        canvas.translate(cx,cy);
        canvas.rotate(rotation);
        canvas.scale(rx,ry);
        paint.setAlpha(Math.max(0,Math.round(255*(1f-colorBlend))));
        paint.setShader(calmLights[id]);
        canvas.drawCircle(0f,0f,1f,paint);
        if(colorBlend>.001f){
            paint.setAlpha(Math.min(255,Math.round(255*colorBlend)));
            paint.setShader(lights[id]);
            canvas.drawCircle(0f,0f,1f,paint);
        }
        paint.setAlpha(255);
        canvas.restore();
    }

    @Override protected void onDraw(Canvas canvas){
        super.onDraw(canvas);
        final float w=getWidth(),h=getHeight();
        if(w<2||h<2)return;
        if(background==null)onSizeChanged((int)w,(int)h,0,0);
        // At t=0 the old teal, leaf green and warm amber dominate. The
        // chromatic layer blooms very gradually and then recedes in a loop.
        float t=seconds;
        colorBlend=(.5f-.5f*(float)Math.cos(t*(float)(Math.PI*2/72f)));
        colorBlend=colorBlend*colorBlend*(3f-2f*colorBlend); // smoothstep
        paint.setAlpha(255);
        paint.setShader(background);
        canvas.drawRect(0,0,w,h,paint);
        if(colorBlend>.001f){
            paint.setAlpha(Math.min(255,Math.round(255*colorBlend)));
            paint.setShader(dreamBackground);
            canvas.drawRect(0,0,w,h,paint);
        }
        paint.setAlpha(255);
        // A broad blue current rising from the left and folding back.
        pool(canvas,0,
            w*(.22f+.24f*(float)Math.sin(t*.37f+.38f)),
            h*(.40f+.15f*(float)Math.cos(t*.29f)),
            w*(.63f+.06f*(float)Math.sin(t*.48f)),
            h*(.35f+.035f*(float)Math.sin(t*.32f)),
            9f*(float)Math.sin(t*.40f));
        // Purple glass caustic moves across upper-middle at another speed.
        pool(canvas,1,
            w*(.71f+.23f*(float)Math.cos(t*.29f+.4f)),
            h*(.23f+.14f*(float)Math.sin(t*.39f+1.4f)),
            w*(.57f+.045f*(float)Math.cos(t*.41f)),
            h*(.36f+.055f*(float)Math.cos(t*.30f)),
            -12f*(float)Math.sin(t*.28f));
        // Rose/red liquid ribbon, rendered as a blurry volume with no edge.
        pool(canvas,2,
            w*(.77f+.21f*(float)Math.sin(t*.32f+1.1f)),
            h*(.73f+.15f*(float)Math.cos(t*.33f+.2f)),
            w*(.59f+.05f*(float)Math.cos(t*.38f)),
            h*(.39f+.035f*(float)Math.sin(t*.45f)),
            16f*(float)Math.cos(t*.33f));
        // Cyan folds through the blue and violet rather than merely brightening.
        pool(canvas,3,
            w*(.23f+.25f*(float)Math.sin(t*.25f+2.4f)),
            h*(.84f+.12f*(float)Math.cos(t*.35f+2.0f)),
            w*(.61f+.05f*(float)Math.sin(t*.27f)),
            h*(.31f+.045f*(float)Math.sin(t*.39f)),
            -11f*(float)Math.sin(t*.26f));

        // Inner liquid layers cross at independent rates for depth.
        pool(canvas,4,
            w*(.48f+.23f*(float)Math.sin(t*.42f+2.3f)),
            h*(.53f+.16f*(float)Math.cos(t*.30f+1.2f)),
            w*.44f,h*.25f,18f*(float)Math.sin(t*.35f));
        pool(canvas,5,
            w*(.37f+.18f*(float)Math.cos(t*.37f+2.0f)),
            h*(.20f+.17f*(float)Math.sin(t*.31f+2.1f)),
            w*.48f,h*.22f,-15f*(float)Math.sin(t*.36f));
        pool(canvas,6,
            w*(.48f+.31f*(float)Math.cos(t*.50f+1.6f)),
            h*(.44f+.20f*(float)Math.sin(t*.42f+2.2f)),
            w*.34f,h*.19f,12f*(float)Math.cos(t*.50f));
        pool(canvas,7,
            w*(.64f+.26f*(float)Math.sin(t*.48f)),
            h*(.70f+.17f*(float)Math.cos(t*.37f+1.6f)),
            w*.38f,h*.20f,10f*(float)Math.sin(t*.44f));

        paint.setShader(null);
        // Stationary subtle satin pane: optical haze without rough noise.
        veil.setShader(frost);
        canvas.drawRect(0,0,w,h,veil);
        veil.setShader(null);
        // Avoid artificial film grain on live glass; the dynamic field itself
        // provides the material depth.
        // No grain compositing here (kept as a negligible optional asset).
    }

    private void start(){
        if(ticker!=null||!ValueAnimator.areAnimatorsEnabled())return;
        if(epoch==0L)epoch=SystemClock.uptimeMillis();
        ticker=ValueAnimator.ofFloat(0f,1f);
        ticker.setDuration(60000L);
        ticker.setRepeatCount(ValueAnimator.INFINITE);
        ticker.setInterpolator(new LinearInterpolator());
        ticker.addUpdateListener(a->{
            long now=SystemClock.uptimeMillis();
            if(now-lastDraw<FRAME_MS)return;
            lastDraw=now;
            seconds=(now-epoch)/1000f;
            postInvalidateOnAnimation();
        });
        ticker.start();
    }
    private void stop(){
        if(ticker!=null){ticker.cancel();ticker=null;}
        // Resume from the same visual phase, without a hard reset on tab switch.
    }
    @Override protected void onAttachedToWindow(){
        super.onAttachedToWindow();
        if(getWindowVisibility()==VISIBLE)start();
    }
    @Override protected void onWindowVisibilityChanged(int v){
        super.onWindowVisibilityChanged(v);
        if(v==VISIBLE)start();else stop();
    }
    @Override protected void onDetachedFromWindow(){
        stop();
        if(grain!=null){grain.recycle();grain=null;}
        super.onDetachedFromWindow();
    }
}
