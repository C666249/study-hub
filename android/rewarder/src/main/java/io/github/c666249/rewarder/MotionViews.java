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
    interface ThumbListener {void onGeometry(float center,float width,float scaleY);}
    static final class RubberTabs extends View {
        private final Paint paint=new Paint(Paint.ANTI_ALIAS_FLAG);
        private final RectF rect=new RectF();
        private int selected=0;
        private float center=-1, thumbWidth=-1,thumbScale=1;
        private ValueAnimator moving;
        private TabCallback callback;
        private ThumbListener thumbListener;
        RubberTabs(Context c,TabCallback callback) {
            super(c);
            this.callback=callback;
            setLayerType(View.LAYER_TYPE_SOFTWARE,null);
            setContentDescription("底部导航：奖励、设置");
            setClickable(true);
        }
        private float d(float x){return dp(getContext(),x);}
        private float mid(int n){return d(7)+(getWidth()-d(14))*(n+.5f)/2;}
        void setThumbListener(ThumbListener listener) {
            thumbListener=listener;
            post(this::reportThumb);
        }
        void reportThumb() {
            if(thumbListener==null||getWidth()<10)return;
            if(center<0f){center=mid(selected);thumbWidth=(getWidth()-d(14))/2f-d(4);}
            thumbListener.onGeometry(center,thumbWidth,thumbScale);
        }
        @Override protected void onSizeChanged(int w,int h,int oldw,int oldh) {
            super.onSizeChanged(w,h,oldw,oldh);
            if(w>0&&w!=oldw){center=mid(selected);thumbWidth=(w-d(14))/2f-d(4);post(this::reportThumb);}
        }
        @Override protected void onDraw(Canvas canvas) {
            super.onDraw(canvas);
            float radius=getHeight()/2f;
            rect.set(0,0,getWidth(),getHeight());
            // The real blurred glass is behind this view. Drawing a filled
            // navigation background here would hide the moving light.
            paint.setStyle(Paint.Style.STROKE);paint.setStrokeWidth(d(.75f));
            paint.setColor(0x42E2EDFB);
            canvas.drawRoundRect(rect,radius,radius,paint);
            paint.setStyle(Paint.Style.FILL);
            if(center<0) {center=mid(selected);thumbWidth=(getWidth()-d(14))/2f-d(4);}
            float th= getHeight()-d(12);
            rect.set(center-thumbWidth/2,d(6)+(th*(1-thumbScale))/2,
                center+thumbWidth/2,getHeight()-d(6)-(th*(1-thumbScale))/2);
            // Selection is a refractive clear-glass child behind these labels.
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
            if(!ValueAnimator.areAnimatorsEnabled()){center=end;thumbWidth=endW;thumbScale=1;reportThumb();invalidate();return;}
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
                reportThumb();
                invalidate();
            });
            moving.addListener(new AnimatorListenerAdapter(){
                @Override public void onAnimationEnd(Animator a) {
                    if(a==moving) {center=mid(selected);thumbWidth=endW;thumbScale=1;reportThumb();invalidate();}
                }
            });
            moving.start();
        }
        void select(int index) {animateTo(index);}
    }


    /**
     * FMV JellyCadence: the same rubber-width, inertial travel and tactile
     * settle principle as RubberTabs, adapted to the daily/weekly bottom sheet.
     * Draws its selection natively so it remains smooth over modal dimming.
     */
    interface CadenceCallback {void selected(int index);}
    static final class JellyCadence extends View {
        private final Paint bg=new Paint(Paint.ANTI_ALIAS_FLAG);
        private final Paint thumb=new Paint(Paint.ANTI_ALIAS_FLAG);
        private final Paint text=new Paint(Paint.ANTI_ALIAS_FLAG);
        private final RectF rect=new RectF();
        private final CadenceCallback callback;
        private ValueAnimator movement;
        private int chosen;
        private float center=-1f, thumbWidth=-1f, thumbScale=1f;

        JellyCadence(Context context,int initial,CadenceCallback cb){
            super(context);
            chosen=initial==1?1:0;
            callback=cb;
            text.setTypeface(Typeface.create("sans-serif-medium",Typeface.NORMAL));
            text.setTextSize(sp(context,14.5f));
            text.setTextAlign(Paint.Align.CENTER);
            setClickable(true);
            setFocusable(true);
            setContentDescription(chosen==0?"奖励周期：每天":"奖励周期：每周");
        }
        private float d(float value){return dp(getContext(),value);}
        private float middle(int i){return getWidth()*(i+.5f)/2f;}
        @Override protected void onSizeChanged(int w,int h,int oldw,int oldh){
            super.onSizeChanged(w,h,oldw,oldh);
            if(w>0&&(oldw!=w || center<0)){
                center=middle(chosen);thumbWidth=w/2f-d(9);
            }
        }
        @Override protected void onDraw(Canvas canvas){
            super.onDraw(canvas);
            float w=getWidth(),h=getHeight();
            if(w<2||h<2)return;
            float rad=h/2f;
            bg.setStyle(Paint.Style.FILL);
            bg.setColor(0xff1B2826);
            rect.set(0,0,w,h);
            canvas.drawRoundRect(rect,rad,rad,bg);
            bg.setStyle(Paint.Style.STROKE);
            bg.setStrokeWidth(d(.7f));
            bg.setColor(0x506F8A83);
            rect.inset(d(.5f),d(.5f));
            canvas.drawRoundRect(rect,rad,rad,bg);
            bg.setStyle(Paint.Style.FILL);

            if(center<0){center=middle(chosen);thumbWidth=w/2f-d(9);}
            float hh=(h-d(9))*thumbScale;
            float r=hh/2f;
            rect.set(center-thumbWidth/2f,(h-hh)/2f,center+thumbWidth/2f,(h+hh)/2f);
            thumb.setStyle(Paint.Style.FILL);
            thumb.setColor(0x9E64776A);
            canvas.drawRoundRect(rect,r,r,thumb);
            thumb.setStyle(Paint.Style.STROKE);
            thumb.setStrokeWidth(d(.85f));
            thumb.setColor(0x8EC9DDC9);
            canvas.drawRoundRect(rect,r,r,thumb);
            thumb.setStyle(Paint.Style.FILL);

            float baseline=h/2f-(text.ascent()+text.descent())/2f;
            for(int i=0;i<2;i++){
                text.setColor(i==chosen?GOLD:0xffB1BDB3);
                canvas.drawText(i==0?"每天":"每周",middle(i),baseline,text);
            }
        }
        private void choose(int target){
            if(target==chosen)return;
            if(movement!=null)movement.cancel();
            float from=center<0?middle(chosen):center;
            float startW=thumbWidth<0?getWidth()/2f-d(9):thumbWidth;
            float to=middle(target),endW=getWidth()/2f-d(9);
            float distance=to-from;
            chosen=target;
            setContentDescription(chosen==0?"奖励周期：每天":"奖励周期：每周");
            performHapticFeedback(android.view.HapticFeedbackConstants.CLOCK_TICK);
            if(callback!=null)callback.selected(target);
            if(!ValueAnimator.areAnimatorsEnabled()){
                center=to;thumbWidth=endW;thumbScale=1f;invalidate();return;
            }
            final ValueAnimator animator=ValueAnimator.ofFloat(0f,1f);
            movement=animator;
            animator.setDuration(440);
            animator.addUpdateListener(a->{
                float p=(float)a.getAnimatedValue();
                float ease=1f-(float)Math.pow(1f-p,3f);
                float recoil=(float)Math.sin(Math.PI*2*p)*(1-p)*distance*.047f;
                center=from+distance*ease+recoil;
                thumbWidth=startW+(endW-startW)*ease
                    +(float)Math.sin(Math.PI*p)*Math.min(d(29),Math.abs(distance)*.23f);
                thumbScale=1f-.058f*(float)Math.sin(Math.PI*p);
                invalidate();
            });
            animator.addListener(new AnimatorListenerAdapter(){
                @Override public void onAnimationEnd(Animator a){
                    if(movement==animator){center=to;thumbWidth=endW;thumbScale=1f;invalidate();}
                }
            });
            animator.start();
        }
        @Override public boolean onTouchEvent(MotionEvent e){
            if(e.getActionMasked()==MotionEvent.ACTION_DOWN)return true;
            if(e.getActionMasked()==MotionEvent.ACTION_UP){
                performClick();
                choose(e.getX()>=getWidth()/2f?1:0);
                return true;
            }
            return true;
        }
        @Override public boolean performClick(){super.performClick();return true;}
        @Override protected void onDetachedFromWindow(){
            if(movement!=null){movement.cancel();movement=null;}
            super.onDetachedFromWindow();
        }
    }

    /**
     * Two translucent, elliptical water rings bloom from the landing balance.
     * Drawn in the window overlay; no clipping to the rounded capsule.
     */
    static final class ImpactRipple extends View {
        private final Paint ring=new Paint(Paint.ANTI_ALIAS_FLAG);
        private final Paint glow=new Paint(Paint.ANTI_ALIAS_FLAG);
        private final Path path=new Path();
        private float centerX,centerY,halfWidth,halfHeight;
        private float progress=1f;
        private ValueAnimator animator;

        ImpactRipple(Context context){
            super(context);
            setVisibility(GONE);
            setClickable(false);
            setFocusable(false);
            setImportantForAccessibility(IMPORTANT_FOR_ACCESSIBILITY_NO);
        }
        private float d(float v){return dp(getContext(),v);}

        void burst(float x,float y,float width,float height){
            if(animator!=null)animator.cancel();
            centerX=x;centerY=y;
            halfWidth=Math.max(d(34),width*.46f);
            halfHeight=Math.max(d(17),height*.50f);
            progress=0f;
            if(!ValueAnimator.areAnimatorsEnabled()){setVisibility(GONE);return;}
            setVisibility(VISIBLE);
            animator=ValueAnimator.ofFloat(0,1);
            animator.setDuration(740);
            animator.setInterpolator(new DecelerateInterpolator(1.05f));
            animator.addUpdateListener(a->{
                progress=(float)a.getAnimatedValue();
                invalidate();
            });
            animator.addListener(new AnimatorListenerAdapter(){
                private boolean canceled=false;
                @Override public void onAnimationCancel(Animator a){canceled=true;}
                @Override public void onAnimationEnd(Animator a){
                    if(animator==a){setVisibility(GONE);animator=null;}
                }
            });
            animator.start();
        }

        private void wave(Canvas canvas,float p,float intensity,int rgb){
            if(p<0||p>=1)return;
            float expand=1f-(1f-p)*(1f-p);
            float rx=halfWidth+d(73)*expand;
            float ry=halfHeight+d(59)*expand;
            float wobble=d(3.1f)*(1f-p)*(1f-p);
            path.reset();
            for(int i=0;i<=64;i++){
                float theta=i*(float)(Math.PI*2/64);
                float ripple=1f+(.075f*(1f-p))*(float)Math.sin(theta*4-5*p)
                    +(.035f*(1f-p))*(float)Math.sin(theta*7+4*p);
                float x=centerX+(rx*ripple+wobble*(float)Math.cos(theta*5+4*p))*(float)Math.cos(theta);
                float y=centerY+(ry*ripple+wobble*(float)Math.sin(theta*5-4*p))*(float)Math.sin(theta);
                if(i==0)path.moveTo(x,y);else path.lineTo(x,y);
            }
            path.close();
            float fade=(1f-p)*(1f-p)*intensity;
            ring.setStyle(Paint.Style.STROKE);
            ring.setStrokeJoin(Paint.Join.ROUND);
            ring.setStrokeWidth(d(9f)*(1-p)+d(1.5f));
            ring.setColor((rgb&0x00ffffff)|((int)(32*fade)<<24));
            canvas.drawPath(path,ring);
            ring.setStrokeWidth(d(1.6f));
            ring.setColor((rgb&0x00ffffff)|((int)(173*fade)<<24));
            canvas.drawPath(path,ring);
            ring.setStyle(Paint.Style.FILL);
        }

        @Override protected void onDraw(Canvas canvas){
            super.onDraw(canvas);
            float p=progress;
            float impact=Math.max(0f,1f-p*3.1f);
            if(impact>0f){
                glow.setShader(new RadialGradient(centerX,centerY,d(72),
                    new int[]{Color.argb((int)(92*impact),253,227,176),
                        Color.argb((int)(28*impact),171,199,244),Color.TRANSPARENT},
                    new float[]{0f,.39f,1f},Shader.TileMode.CLAMP));
                canvas.drawCircle(centerX,centerY,d(72),glow);
                glow.setShader(null);
            }
            wave(canvas,p,1f,0xfff8dcac); // warm impact pulse
            wave(canvas,(p-.115f)/.885f,.75f,0xffadcaff); // cooler echo
        }

        @Override protected void onDetachedFromWindow(){
            if(animator!=null)animator.cancel();
            super.onDetachedFromWindow();
        }
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
