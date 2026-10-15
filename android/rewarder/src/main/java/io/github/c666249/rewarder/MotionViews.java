package io.github.c666249.rewarder;

import android.animation.Animator;
import android.animation.AnimatorListenerAdapter;
import android.animation.ValueAnimator;
import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.LinearGradient;
import android.graphics.Paint;
import android.graphics.Path;
import android.graphics.PathMeasure;
import android.graphics.RadialGradient;
import android.graphics.RectF;
import android.graphics.Shader;
import android.graphics.Typeface;
import android.view.MotionEvent;
import android.view.View;
import android.view.animation.DecelerateInterpolator;
import android.view.animation.OvershootInterpolator;
import java.util.Locale;

final class MotionViews {
    static final int BG=0xff101a18;
    static final int SURFACE=0xB72B3B35;
    static final int SURFACE_2=0xff32423B;
    static final int GOLD=0xffEED3A3;
    static final int INK=0xffF7F5EC;
    static final int MUTED=0xffA9B7AB;
    static final int HAIRLINE=0x55536A5D;

    static float dp(Context c,float n) {return n*c.getResources().getDisplayMetrics().density;}
    static float sp(Context c,float n) {return n*c.getResources().getDisplayMetrics().scaledDensity;}
    static String money(long cents) {
        return String.format(Locale.US,"¥%,d.%02d",cents/100,cents%100);
    }

    static final class RollingAmount extends View {
        private final Paint paint=new Paint(Paint.ANTI_ALIAS_FLAG);
        private final Paint oldPaint=new Paint(Paint.ANTI_ALIAS_FLAG);
        private String oldValue="¥0.00",newValue="¥0.00";
        private float progress=1f;
        private float fontSp=43f;
        private ValueAnimator motion;
        RollingAmount(Context c) {
            super(c);
            paint.setTypeface(Typeface.create("sans-serif-medium",Typeface.NORMAL));
            oldPaint.setTypeface(paint.getTypeface());
            paint.setColor(INK);oldPaint.setColor(INK);
            setContentDescription("累计奖励 ¥0.00");
        }
        void initialize(long cents) {
            if(motion!=null) motion.cancel();
            oldValue=newValue=money(cents);progress=1;
            updateFont(); requestLayout();invalidate();
            setContentDescription("累计奖励 "+newValue);
        }
        void roll(long cents) {
            String next=money(cents);
            if(next.equals(newValue)) return;
            if(motion!=null) motion.cancel();
            oldValue=newValue;newValue=next;progress=0;
            updateFont();requestLayout();
            if(!ValueAnimator.areAnimatorsEnabled()) {
                oldValue=newValue;progress=1;invalidate();return;
            }
            motion=ValueAnimator.ofFloat(0,1);
            motion.setDuration(580);
            motion.setInterpolator(new OvershootInterpolator(.35f));
            motion.addUpdateListener(a->{progress=(float)a.getAnimatedValue();invalidate();});
            motion.addListener(new AnimatorListenerAdapter(){
                @Override public void onAnimationEnd(Animator animation){
                    if(animation==motion) {progress=1;oldValue=newValue;invalidate();}
                }
            });
            motion.start();
            setContentDescription("累计奖励 "+newValue);
        }
        private void updateFont() {
            fontSp=newValue.length()>11?29:newValue.length()>9?35:43;
            paint.setTextSize(sp(getContext(),fontSp));
            oldPaint.setTextSize(sp(getContext(),fontSp));
        }
        @Override protected void onMeasure(int w,int h) {
            updateFont();
            float width=paint.measureText(newValue)+dp(getContext(),6);
            setMeasuredDimension(resolveSize((int)Math.ceil(width),w),
                resolveSize((int)dp(getContext(),64),h));
        }
        @Override protected void onDraw(Canvas canvas) {
            super.onDraw(canvas);
            float baseline=getHeight()/2f - (paint.ascent()+paint.descent())/2f;
            float x=0f,travel=dp(getContext(),29);
            float p=Math.max(0,Math.min(1,progress));
            for(int i=0;i<newValue.length();i++) {
                char next=newValue.charAt(i);
                int beforeIndex=oldValue.length()-(newValue.length()-i);
                char before=beforeIndex>=0?oldValue.charAt(beforeIndex):next;
                float cw=paint.measureText(String.valueOf(next));
                if(Character.isDigit(next) && next!=before && progress<1f) {
                    canvas.save();
                    canvas.clipRect(x,baseline-dp(getContext(),47),x+cw+1,baseline+dp(getContext(),20));
                    oldPaint.setAlpha((int)(255*(1-p)));
                    paint.setAlpha((int)(255*p));
                    canvas.drawText(String.valueOf(before),x,baseline-travel*p,oldPaint);
                    canvas.drawText(String.valueOf(next),x,baseline+travel*(1-p),paint);
                    canvas.restore();
                    paint.setAlpha(255);
                } else {
                    paint.setAlpha(255);
                    canvas.drawText(String.valueOf(next),x,baseline,paint);
                }
                x+=cw;
            }
        }
        @Override protected void onDetachedFromWindow() {
            if(motion!=null) motion.cancel();
            super.onDetachedFromWindow();
        }
    }

    interface TabCallback {void selected(int index);}
    static final class RubberTabs extends View {
        private final Paint paint=new Paint(Paint.ANTI_ALIAS_FLAG);
        private final RectF rect=new RectF();
        private int selected=0;
        private float center=-1, thumbWidth=-1,thumbScale=1;
        private ValueAnimator moving;
        private TabCallback callback;
        RubberTabs(Context c,TabCallback callback) {
            super(c);
            this.callback=callback;
            setLayerType(View.LAYER_TYPE_SOFTWARE,null);
            setContentDescription("底部导航：奖励、设置");
            setClickable(true);
        }
        private float d(float x){return dp(getContext(),x);}
        private float mid(int n){return d(7)+(getWidth()-d(14))*(n+.5f)/2;}
        @Override protected void onDraw(Canvas canvas) {
            super.onDraw(canvas);
            float radius=getHeight()/2f;
            rect.set(0,0,getWidth(),getHeight());
            paint.setColor(SURFACE);
            paint.setShadowLayer(d(17),0,d(6),0x37000000);
            canvas.drawRoundRect(rect,radius,radius,paint);
            paint.clearShadowLayer();
            paint.setStyle(Paint.Style.STROKE);paint.setStrokeWidth(d(.85f));
            paint.setColor(0x72C4D0BB);canvas.drawRoundRect(rect,radius,radius,paint);
            paint.setStyle(Paint.Style.FILL);
            if(center<0) {center=mid(selected);thumbWidth=(getWidth()-d(14))/2f-d(4);}
            float th= getHeight()-d(12);
            rect.set(center-thumbWidth/2,d(6)+(th*(1-thumbScale))/2,
                center+thumbWidth/2,getHeight()-d(6)-(th*(1-thumbScale))/2);
            paint.setColor(0xDF485C50);
            canvas.drawRoundRect(rect,th/2,th/2,paint);
            paint.setStyle(Paint.Style.STROKE);paint.setStrokeWidth(d(.65f));
            paint.setColor(0xACB7C6B1);
            canvas.drawRoundRect(rect,th/2,th/2,paint);
            paint.setStyle(Paint.Style.FILL);
            paint.setTypeface(Typeface.create("sans-serif-medium",Typeface.NORMAL));
            paint.setTextAlign(Paint.Align.CENTER);
            paint.setTextSize(sp(getContext(),14.5f));
            for(int i=0;i<2;i++){
                float x=mid(i);
                boolean active=i==selected;
                paint.setColor(active?GOLD:MUTED);
                // Draw a minimalist icon rather than a decorative font glyph.
                paint.setStrokeWidth(d(1.65f));paint.setStrokeCap(Paint.Cap.ROUND);
                if(i==0) {
                    paint.setStyle(Paint.Style.STROKE);
                    canvas.drawCircle(x,getHeight()/2-d(11),d(6),paint);
                    canvas.drawLine(x,getHeight()/2-d(14),x,getHeight()/2-d(8),paint);
                    canvas.drawLine(x-d(3),getHeight()/2-d(11),x+d(3),getHeight()/2-d(11),paint);
                    paint.setStyle(Paint.Style.FILL);
                } else {
                    paint.setStyle(Paint.Style.STROKE);
                    float y=getHeight()/2-d(15);
                    canvas.drawLine(x-d(7),y,x+d(7),y,paint);
                    canvas.drawLine(x-d(7),y+d(8),x+d(7),y+d(8),paint);
                    canvas.drawCircle(x-d(2),y,d(2.2f),paint);
                    canvas.drawCircle(x+d(3),y+d(8),d(2.2f),paint);
                    paint.setStyle(Paint.Style.FILL);
                }
                canvas.drawText(i==0?"奖励":"设置",x,getHeight()/2+d(16),paint);
            }
            paint.setTextAlign(Paint.Align.LEFT);
        }
        @Override public boolean onTouchEvent(MotionEvent e) {
            if(e.getAction()==MotionEvent.ACTION_DOWN) return true;
            if(e.getAction()==MotionEvent.ACTION_UP) {
                performClick();animateTo(e.getX()>=getWidth()/2f?1:0);return true;
            }
            return true;
        }
        @Override public boolean performClick(){super.performClick();return true;}
        private void animateTo(int target) {
            if(target==selected) return;
            if(moving!=null) moving.cancel();
            float from=center<0?mid(selected):center;
            float startW=thumbWidth<0?(getWidth()-d(14))/2-d(4):thumbWidth;
            float end=mid(target),endW=(getWidth()-d(14))/2-d(4);
            float distance=end-from;
            selected=target;
            if(callback!=null)callback.selected(target);
            if(!ValueAnimator.areAnimatorsEnabled()){center=end;thumbWidth=endW;thumbScale=1;invalidate();return;}
            moving=ValueAnimator.ofFloat(0,1);
            moving.setDuration(420);
            moving.addUpdateListener(a->{
                float p=(float)a.getAnimatedValue();
                float ease=1-(float)Math.pow(1-p,3);
                float recoil=(float)Math.sin(2*Math.PI*p)*(1-p)*distance*.045f;
                center=from+distance*ease+recoil;
                thumbWidth=startW+(endW-startW)*ease
                    +(float)Math.sin(Math.PI*p)*Math.min(d(28),Math.abs(distance)*.24f);
                thumbScale=1-.045f*(float)Math.sin(Math.PI*p);
                invalidate();
            });
            moving.addListener(new AnimatorListenerAdapter(){
                @Override public void onAnimationEnd(Animator a) {
                    if(a==moving) {center=mid(selected);thumbWidth=endW;thumbScale=1;invalidate();}
                }
            });
            moving.start();
        }
        void select(int index) {animateTo(index);}
    }

    static final class GoldFlight extends View {
        private final Paint paint=new Paint(Paint.ANTI_ALIAS_FLAG);
        private final Paint trail=new Paint(Paint.ANTI_ALIAS_FLAG);
        private final Path path=new Path();
        private final PathMeasure measure=new PathMeasure();
        private float fraction=0f;
        private float[] point=new float[2];
        private float[] oldPoint=new float[2];
        private ValueAnimator animation;
        private Runnable finished;
        private boolean cancelled;
        GoldFlight(Context c) {
            super(c);setVisibility(GONE);setImportantForAccessibility(IMPORTANT_FOR_ACCESSIBILITY_NO);
        }
        private float d(float x){return dp(getContext(),x);}
        void launch(float sx,float sy,float tx,float ty,Runnable done) {
            if(animation!=null){animation.cancel();}
            cancelled=false;finished=done;
            if(!ValueAnimator.areAnimatorsEnabled()) {setVisibility(GONE);done.run();return;}
            path.reset();
            path.moveTo(sx,sy);
            path.cubicTo(sx+d(42),sy-d(110),tx-d(64),ty-d(85),tx,ty);
            measure.setPath(path,false);
            setVisibility(VISIBLE);
            animation=ValueAnimator.ofFloat(0,1);
            animation.setDuration(760);
            animation.setInterpolator(new DecelerateInterpolator(1.36f));
            animation.addUpdateListener(a->{fraction=(float)a.getAnimatedValue();invalidate();});
            animation.addListener(new AnimatorListenerAdapter(){
                @Override public void onAnimationCancel(Animator a){cancelled=true;}
                @Override public void onAnimationEnd(Animator a) {
                    if(a!=animation || cancelled)return;
                    setVisibility(GONE);
                    if(finished!=null)finished.run();
                }
            });
            animation.start();
        }
        @Override protected void onDraw(Canvas canvas) {
            if(getVisibility()!=VISIBLE)return;
            measure.getPosTan(measure.getLength()*fraction,point,null);
            float x=point[0],y=point[1];
            for(int i=1;i<7;i++){
                float t=Math.max(0,fraction-i*.036f);
                measure.getPosTan(measure.getLength()*t,oldPoint,null);
                trail.setColor(GOLD);
                trail.setAlpha((int)((1f-i/7f)*115*fraction));
                canvas.drawCircle(oldPoint[0],oldPoint[1],d(5-i*.45f),trail);
            }
            float radius=d(14)*(1-.15f*fraction);
            paint.setShader(new RadialGradient(x,y,d(29),
                new int[]{0x88EFCB8B,0x10EFCB8B,0x00EFCB8B},null,Shader.TileMode.CLAMP));
            canvas.drawCircle(x,y,d(29),paint);
            paint.setShader(new LinearGradient(x-radius,y-radius,x+radius,y+radius,
                0xffFFF3D8,0xffD6A85D,Shader.TileMode.CLAMP));
            canvas.drawCircle(x,y,radius,paint);
            paint.setShader(null);
            paint.setColor(0xff8A6535);
            paint.setStrokeWidth(d(1.3f));
            paint.setStyle(Paint.Style.STROKE);
            canvas.drawCircle(x,y,radius-d(3),paint);
            paint.setStyle(Paint.Style.FILL);
            paint.setColor(0xff75512B);
            Path star=new Path();
            star.moveTo(x,y-d(7));star.lineTo(x+d(2),y-d(2));star.lineTo(x+d(7),y);
            star.lineTo(x+d(2),y+d(2));star.lineTo(x,y+d(7));
            star.lineTo(x-d(2),y+d(2));star.lineTo(x-d(7),y);
            star.lineTo(x-d(2),y-d(2));star.close();
            canvas.drawPath(star,paint);
        }
        @Override protected void onDetachedFromWindow() {
            if(animation!=null)animation.cancel();
            super.onDetachedFromWindow();
        }
    }
}
