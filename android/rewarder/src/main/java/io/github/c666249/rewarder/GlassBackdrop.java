package io.github.c666249.rewarder;

import android.animation.ValueAnimator;
import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapShader;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.LinearGradient;
import android.graphics.Paint;
import android.graphics.Rect;
import android.graphics.Shader;
import android.os.SystemClock;
import android.view.View;
import android.view.animation.LinearInterpolator;

/**
 * Deep frosted glass with slowly flowing light BELOW the glass.
 *
 * No drawn wave paths: a domain-warped, smooth liquid color field is sampled
 * into a small filtered bitmap. A translucent milky pane and fixed microscopic
 * grain sit above it. Organic folds move as color and refraction, never lines.
 *
 * The texture is updated at <= 12.5 fps; because movement is extremely slow,
 * this is smooth without burdening a high refresh-rate phone.
 */
final class GlassBackdrop extends View {
    private static final int SAMPLE_WIDTH=104;
    private static final long FRAME_INTERVAL_MS=80L;
    private final Paint fluid=new Paint(Paint.FILTER_BITMAP_FLAG | Paint.DITHER_FLAG);
    private final Paint film=new Paint(Paint.ANTI_ALIAS_FLAG | Paint.DITHER_FLAG);
    private final Paint grainPaint=new Paint(Paint.FILTER_BITMAP_FLAG);
    private final Rect target=new Rect();
    private Bitmap texture;
    private Bitmap grain;
    private int[] pixels;
    private int textureHeight;
    private float phase=0f;
    private long lastRenderTime=0L;
    private ValueAnimator motion;

    GlassBackdrop(Context context) {
        super(context);
        setClickable(false);
        setFocusable(false);
        setImportantForAccessibility(IMPORTANT_FOR_ACCESSIBILITY_NO);
        createGrain();
    }

    private static float blob(float x,float y,float cx,float cy,float sx,float sy) {
        float dx=(x-cx)/sx;
        float dy=(y-cy)/sy;
        return (float)Math.exp(-1.65f*(dx*dx+dy*dy));
    }

    private static int bound(float channel){
        return Math.max(0,Math.min(255,Math.round(channel)));
    }

    private void prepareTexture() {
        if(getWidth()<2 || getHeight()<2)return;
        int nextHeight=Math.max(130,Math.min(300,Math.round(
            SAMPLE_WIDTH*(getHeight()/(float)getWidth()))));
        if(texture!=null && textureHeight==nextHeight)return;
        if(texture!=null)texture.recycle();
        textureHeight=nextHeight;
        pixels=new int[SAMPLE_WIDTH*textureHeight];
        texture=Bitmap.createBitmap(SAMPLE_WIDTH,textureHeight,Bitmap.Config.ARGB_8888);
        lastRenderTime=0L;
    }

    private void createGrain() {
        final int side=96;
        grain=Bitmap.createBitmap(side,side,Bitmap.Config.ARGB_8888);
        int[] specks=new int[side*side];
        int seed=0x2a8195;
        for(int i=0;i<specks.length;i++) {
            // Deterministic, very faint optical diffusion. Stationary, never flickering.
            seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;
            int alpha=2+((seed>>>24)&7);
            specks[i]=Color.argb(alpha,248,250,239);
        }
        grain.setPixels(specks,0,side,0,0,side,side);
        grainPaint.setShader(new BitmapShader(grain,Shader.TileMode.REPEAT,Shader.TileMode.REPEAT));
    }

    private void renderFluid() {
        if(texture==null)return;
        final float t=phase;
        // Light pools move independently and cross-fade through deep spruce glass.
        final float ax=.26f+.12f*(float)Math.sin(t*.74f);
        final float ay=.26f+.08f*(float)Math.cos(t*.63f);
        final float bx=.84f+.13f*(float)Math.cos(t*.55f+1.1f);
        final float by=.59f+.13f*(float)Math.sin(t*.67f+.7f);
        final float cx=.25f+.10f*(float)Math.sin(t*.47f+1.8f);
        final float cy=.93f+.07f*(float)Math.cos(t*.7f);
        final float dx=.7f+.075f*(float)Math.cos(t*.41f);
        final float dy=.18f+.08f*(float)Math.sin(t*.46f+1.4f);

        for(int y=0;y<textureHeight;y++) {
            float v=(y+.5f)/textureHeight;
            float bendA=.051f*(float)Math.sin(v*5.8f+t*.65f);
            float bendB=.030f*(float)Math.sin(v*11.2f-t*.34f);
            for(int x=0;x<SAMPLE_WIDTH;x++) {
                float u=(x+.5f)/SAMPLE_WIDTH;
                // Smooth domain warping: visually akin to light refracted through
                // liquid under a frosted surface. No explicit stroke or edge.
                float ux=u+bendA+bendB*(float)Math.cos(u*2.5f+t*.21f);
                float vy=v+.043f*(float)Math.sin(u*5.2f-t*.48f)
                    +.023f*(float)Math.cos(u*9.0f+t*.31f+v*2.4f);

                float jade=blob(ux,vy,ax,ay,.68f,.49f);
                float amber=blob(ux,vy,bx,by,.50f,.48f);
                float aqua=blob(ux,vy,cx,cy,.64f,.43f);
                float pearl=blob(ux,vy,dx,dy,.46f,.34f);

                // Luminous cloudy volume: wide soft pools rather than caustic
                // stripes. The final undulation modulates color, not geometry.
                float fold=(float)(Math.sin(ux*5.1f+vy*2.9f+t*.28f)
                    *Math.sin(vy*4.6f-ux*3.4f-t*.24f));
                float flow=2.4f*fold*(jade+amber+aqua);
                float r=13f+25f*jade+63f*amber+12f*aqua+24f*pearl+flow;
                float g=25f+64f*jade+41f*amber+47f*aqua+25f*pearl+flow;
                float b=24f+53f*jade+30f*amber+51f*aqua+22f*pearl+flow;

                // Dark, softly curved falloff anchors text legibility.
                float edge=(float)(Math.pow(Math.abs(u-.5f)*1.18f,2)
                    +Math.pow(Math.abs(v-.49f)*.7f,2));
                float shade=1f-Math.min(.20f,edge*.13f);
                pixels[y*SAMPLE_WIDTH+x]=Color.rgb(
                    bound(r*shade),bound(g*shade),bound(b*shade));
            }
        }
        texture.setPixels(pixels,0,SAMPLE_WIDTH,0,0,SAMPLE_WIDTH,textureHeight);
    }

    private void start() {
        if(motion!=null || !ValueAnimator.areAnimatorsEnabled())return;
        motion=ValueAnimator.ofFloat(0f,(float)(Math.PI*2));
        motion.setDuration(42000);
        motion.setRepeatCount(ValueAnimator.INFINITE);
        motion.setInterpolator(new LinearInterpolator());
        motion.addUpdateListener(a->{
            phase=(float)a.getAnimatedValue();
            long now=SystemClock.uptimeMillis();
            if(now-lastRenderTime>=FRAME_INTERVAL_MS)invalidate();
        });
        motion.start();
    }

    private void stop() {
        if(motion!=null){motion.cancel();motion=null;}
    }

    @Override protected void onSizeChanged(int w,int h,int oldw,int oldh){
        super.onSizeChanged(w,h,oldw,oldh);
        prepareTexture();
    }
    @Override protected void onAttachedToWindow(){
        super.onAttachedToWindow();
        if(getWindowVisibility()==VISIBLE)start();
    }
    @Override protected void onDetachedFromWindow(){
        stop();
        if(texture!=null){texture.recycle();texture=null;}
        pixels=null;
        if(grain!=null){grain.recycle();grain=null;}
        super.onDetachedFromWindow();
    }
    @Override protected void onWindowVisibilityChanged(int visibility){
        super.onWindowVisibilityChanged(visibility);
        if(visibility==VISIBLE)start();else stop();
    }
    @Override protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);
        int w=getWidth(),h=getHeight();
        if(w<=0||h<=0)return;
        if(texture==null)prepareTexture();
        if(texture==null)return;
        long now=SystemClock.uptimeMillis();
        if(lastRenderTime==0 || now-lastRenderTime>=FRAME_INTERVAL_MS) {
            lastRenderTime=now;
            renderFluid();
        }
        target.set(0,0,w,h);
        canvas.drawBitmap(texture,null,target,fluid);

        // The matte pane above the moving field: gradual pale haze,
        // not decorative strokes, with imperceptible static micro-grain.
        film.setShader(new LinearGradient(0,0,w,h,
            new int[]{0x1cf2f4e9,0x0bc8dcd0,0x0ac1c6ba,0x1acfd7c7},
            new float[]{0f,.39f,.66f,1f},Shader.TileMode.CLAMP));
        canvas.drawRect(0,0,w,h,film);
        film.setShader(null);
        if(grain!=null)canvas.drawRect(0,0,w,h,grainPaint);
    }
}
