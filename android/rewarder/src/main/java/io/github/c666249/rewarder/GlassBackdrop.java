package io.github.c666249.rewarder;

import android.animation.ValueAnimator;
import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.LinearGradient;
import android.graphics.Paint;
import android.graphics.Path;
import android.graphics.RadialGradient;
import android.graphics.Shader;
import android.os.SystemClock;
import android.view.View;
import android.view.animation.LinearInterpolator;

/** Frosted window above a softly flowing, multi-layer water-light field.
 * No bitmap assets, network, blur dependencies or animation on top of interactive views.
 */
final class GlassBackdrop extends View {
    private final Paint p=new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Path wave=new Path();
    private ValueAnimator animator;
    private float phase=0f;
    private long lastInvalidation=0;
    GlassBackdrop(Context c) {
        super(c);
        setImportantForAccessibility(IMPORTANT_FOR_ACCESSIBILITY_NO);
        setClickable(false);
    }
    private void start() {
        if(animator!=null || !ValueAnimator.areAnimatorsEnabled())return;
        animator=ValueAnimator.ofFloat(0f,1f);
        animator.setDuration(26000L);
        animator.setRepeatCount(ValueAnimator.INFINITE);
        animator.setInterpolator(new LinearInterpolator());
        animator.addUpdateListener(a->{
            phase=(float)a.getAnimatedValue()*(float)(Math.PI*2);
            long now=SystemClock.uptimeMillis();
            if(now-lastInvalidation>=42){lastInvalidation=now;invalidate();}
        });
        animator.start();
    }
    private void stop(){if(animator!=null){animator.cancel();animator=null;}}
    @Override protected void onAttachedToWindow(){super.onAttachedToWindow();if(getWindowVisibility()==VISIBLE)start();}
    @Override protected void onDetachedFromWindow(){stop();super.onDetachedFromWindow();}
    @Override protected void onWindowVisibilityChanged(int visibility){
        super.onWindowVisibilityChanged(visibility);
        if(visibility==VISIBLE)start();else stop();
    }
    private void halo(Canvas canvas,float x,float y,float radius,int core,int mid) {
        p.setStyle(Paint.Style.FILL);
        p.setShader(new RadialGradient(x,y,radius,
            new int[]{core,mid,Color.TRANSPARENT},new float[]{0f,.43f,1f},Shader.TileMode.CLAMP));
        canvas.drawCircle(x,y,radius,p);
        p.setShader(null);
    }
    @Override protected void onDraw(Canvas c) {
        super.onDraw(c);
        float w=getWidth(), h=getHeight();
        if(w<=0||h<=0)return;
        p.setShader(new LinearGradient(0,0,w*.86f,h,
            new int[]{0xff101818,0xff152322,0xff101919,0xff131a1a},null,Shader.TileMode.CLAMP));
        c.drawRect(0,0,w,h,p);
        p.setShader(null);
        float t=phase;
        // Large blurred light pools create the illusion of depth behind frosted glass.
        halo(c,w*(.13f+.055f*(float)Math.sin(t)),h*(.16f+.08f*(float)Math.cos(t)),
            Math.max(w,h)*.67f,0x625e796b,0x1e739084);
        halo(c,w*(.89f+.09f*(float)Math.sin(t*.77f+1.1f)),
            h*(.62f+.10f*(float)Math.cos(t*.9f)),Math.max(w,h)*.60f,
            0x5baf8355,0x20957961);
        halo(c,w*(.39f+.07f*(float)Math.cos(t*.61f)),
            h*(.98f+.06f*(float)Math.sin(t*.72f)),Math.max(w,h)*.70f,
            0x3e5a847a,0x12577672);

        // Broad translucent water folds are deliberately slow, never flashing.
        for(int i=0;i<8;i++){
            float y=h*(.35f+i*.091f);
            float amp=h*(.022f+i*.0015f);
            wave.reset();
            wave.moveTo(-w*.15f,y);
            for(int step=1;step<=26;step++){
                float x=-w*.15f+w*1.3f*step/26f;
                float yy=y+amp*(float)Math.sin(x/w*5.2f+t*.54f+i*.62f)
                    +amp*.42f*(float)Math.cos(x/w*8.8f-t*.31f+i);
                wave.lineTo(x,yy);
            }
            p.setStyle(Paint.Style.STROKE);
            p.setStrokeCap(Paint.Cap.ROUND);
            p.setStrokeWidth(Math.max(1f,h*(.003f+i*.0006f)));
            p.setColor((i%3==0)?0x1de6d4b2:0x158abbaa);
            c.drawPath(wave,p);
        }
        p.setStyle(Paint.Style.FILL);
        // A milky optical sheet separates content from the light underneath.
        p.setShader(new LinearGradient(0,0,w,h,
            new int[]{0x0ef7f1dc,0x050ef5dd,0x103d5351},null,Shader.TileMode.CLAMP));
        c.drawRect(0,0,w,h,p);
        p.setShader(null);
    }
}
