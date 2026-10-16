package io.github.c666249.rewarder;

import android.animation.Animator;
import android.animation.AnimatorListenerAdapter;
import android.animation.ValueAnimator;
import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Path;
import android.graphics.PathMeasure;
import android.graphics.drawable.GradientDrawable;
import android.view.Gravity;
import android.view.HapticFeedbackConstants;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewConfiguration;
import android.view.ViewGroup;
import android.view.animation.OvershootInterpolator;
import android.view.animation.PathInterpolator;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;
import eightbitlab.com.blurview.BlurTarget;

/** Java port of personal-app-stack FMV 3.1 LedgerSwipeRow / LedgerDeleteFlight.
 * Finger thresholds are separate from bounded rubber translation.
 */
final class GestureTaskRow extends FrameLayout {
    interface Handler { void run(); }
    final LinearLayout surface;
    private final GlassMaterial.GlassShell movingGlass;
    private final FrameLayout underlay;
    private final TextView hint;
    private final int slop;
    private float downX,downY;
    private boolean tracking=false,committed=false;
    private boolean deletionOnly=false;
    private int stage=0;
    Handler onEdit,onDelete;
    private int d(float n){return Math.round(MotionViews.dp(getContext(),n));}
    private GradientDrawable bg(int fill,int outline) {
        GradientDrawable b=new GradientDrawable();
        b.setColor(fill);b.setCornerRadius(d(22));
        b.setStroke(d(1),outline);
        return b;
    }
    GestureTaskRow(Context context, BlurTarget blurTarget) {
        super(context);
        slop=ViewConfiguration.get(context).getScaledTouchSlop();
        setClipChildren(false);setClipToPadding(false);
        underlay=new FrameLayout(context);
        underlay.setBackground(bg(0x92302D28,0x3FE6D2AE));
        hint=new TextView(context);
        hint.setGravity(Gravity.RIGHT|Gravity.CENTER_VERTICAL);
        hint.setTextSize(12f);
        hint.setTextColor(0xffe3c99f);
        hint.setPadding(0,0,d(17),0);
        hint.setAlpha(0);
        underlay.addView(hint,new FrameLayout.LayoutParams(-1,-1));
        addView(underlay,new FrameLayout.LayoutParams(-1,-1));
        surface=new LinearLayout(context);
        surface.setGravity(Gravity.CENTER_VERTICAL);
        surface.setOrientation(LinearLayout.HORIZONTAL);
        surface.setPadding(d(18),d(13),d(17),d(13));
        surface.setMinimumHeight(d(79));
        // The whole swipeable material samples the animated background.
        // Keep surface itself completely clear so no opaque card masks the blur.
        surface.setClickable(true);
        surface.setOnClickListener(v->{if(!committed&&onEdit!=null)onEdit.run();});
        movingGlass=GlassMaterial.floatingCard(context,blurTarget,surface,22);
        addView(movingGlass,new FrameLayout.LayoutParams(-1,-2));
        setMinimumHeight(d(79));
    }
    void setDeletionOnly(boolean value){deletionOnly=value;}
    private float rubber(float travel,float width){
        float knee=width*.17f,cap=width*.34f,base=knee*.81f;
        if(travel<=knee)return Math.min(cap,travel*.81f);
        float remaining=Math.max(1f,cap-base);
        return Math.min(cap,base+remaining*(1f-(float)Math.exp(-(travel-knee)*.72f/remaining)));
    }
    private void changeStage(int next,float distance,float width){
        if(next!=stage){
            stage=next;
            if(next>0){
                performHapticFeedback(next==2?HapticFeedbackConstants.LONG_PRESS:HapticFeedbackConstants.CLOCK_TICK);
                if(next==2){
                    movingGlass.animate().cancel();
                    movingGlass.animate().scaleX(1.018f).scaleY(.978f).setDuration(100)
                        .withEndAction(()->{
                            if(!committed)movingGlass.animate().scaleX(1).scaleY(1).setDuration(190)
                                .setInterpolator(new OvershootInterpolator(.8f)).start();
                        }).start();
                    hint.setScaleX(.93f);hint.setScaleY(.93f);
                    hint.animate().scaleX(1).scaleY(1).setDuration(240)
                        .setInterpolator(new OvershootInterpolator(1.1f)).start();
                }
            }
            underlay.setBackground(bg(next==2?0xB0513437:0x983B382F,
                next==2?0x99DA8990:0x6AE4C59C));
        }
        hint.setText(stage==2?"松手删除":stage==1?(deletionOnly?"继续左滑删除":"松手编辑"):"向左滑动");
        hint.setTextColor(stage==2?0xffffb5b9:0xffebd6b2);
        hint.setAlpha(Math.min(1f,.12f+distance/Math.max(1f,width*.19f)));
    }
    @Override public boolean onInterceptTouchEvent(MotionEvent e){
        if(committed)return true;
        switch(e.getActionMasked()){
            case MotionEvent.ACTION_DOWN:
                downX=e.getX();downY=e.getY();tracking=false;break;
            case MotionEvent.ACTION_MOVE:
                float dx=e.getX()-downX,dy=e.getY()-downY;
                if(dx < -slop && Math.abs(dx)>Math.abs(dy)*1.16f){
                    tracking=true;getParent().requestDisallowInterceptTouchEvent(true);return true;
                }
                break;
        }
        return tracking;
    }
    @Override public boolean onTouchEvent(MotionEvent e){
        if(committed)return true;
        switch(e.getActionMasked()){
            case MotionEvent.ACTION_DOWN:
                downX=e.getX();downY=e.getY();return true;
            case MotionEvent.ACTION_MOVE:
                float dx=e.getX()-downX,dy=e.getY()-downY;
                if(!tracking && dx < -slop && Math.abs(dx)>Math.abs(dy)*1.16f){
                    tracking=true;getParent().requestDisallowInterceptTouchEvent(true);
                }
                if(!tracking)return true;
                float travel=Math.max(0,-dx);
                float width=Math.max(getWidth(),d(200));
                int next=travel>=Math.max(d(116),width*.37f)?2:
                    travel>=Math.max(d(52),width*.16f)?1:0;
                movingGlass.setTranslationX(-rubber(travel,width));
                changeStage(next,travel,width);
                return true;
            case MotionEvent.ACTION_UP:
                boolean dragged=tracking;int action=stage;
                tracking=false;getParent().requestDisallowInterceptTouchEvent(false);
                if(dragged&&action==2){
                    committed=true;launchDeletion();
                } else if(dragged&&action==1&&!deletionOnly){
                    committed=true;settle(()->{committed=false;stage=0;if(onEdit!=null)onEdit.run();});
                } else reset();
                return true;
            case MotionEvent.ACTION_CANCEL:
                tracking=false;getParent().requestDisallowInterceptTouchEvent(false);reset();return true;
        }
        return super.onTouchEvent(e);
    }
    private void settle(Runnable done){
        movingGlass.animate().cancel();
        movingGlass.animate().translationX(0).scaleX(1).scaleY(1).setDuration(225)
            .setInterpolator(new OvershootInterpolator(.9f)).withEndAction(done).start();
        hint.animate().alpha(0).setDuration(160).start();
    }
    private void reset(){committed=false;stage=0;settle(()->{});}
    private void launchDeletion(){
        if(onDelete==null){reset();return;}
        Handler callback=onDelete;
        if(!ValueAnimator.areAnimatorsEnabled()||movingGlass.getWidth()<2){callback.run();return;}
        View root=movingGlass.getRootView();
        if(!(root instanceof FrameLayout)){callback.run();return;}
        FrameLayout host=(FrameLayout)root;
        Bitmap pixels=null;
        ImageView ghost=null;
        try{
            pixels=Bitmap.createBitmap(movingGlass.getWidth(),movingGlass.getHeight(),Bitmap.Config.ARGB_8888);
            movingGlass.draw(new Canvas(pixels));
            int[] a=new int[2],b=new int[2];
            movingGlass.getLocationOnScreen(a);host.getLocationOnScreen(b);
            float sx=a[0]-b[0],sy=a[1]-b[1];
            ImageView sprite=new ImageView(getContext());
            sprite.setImageBitmap(pixels);sprite.setScaleType(ImageView.ScaleType.FIT_XY);
            sprite.setElevation(d(20));sprite.setPivotX(movingGlass.getWidth()*.5f);
            sprite.setPivotY(movingGlass.getHeight()*.5f);
            host.addView(sprite,new FrameLayout.LayoutParams(movingGlass.getWidth(),movingGlass.getHeight()));
            sprite.setX(sx);sprite.setY(sy);sprite.bringToFront();
            ghost=sprite;
            setAlpha(0f);
            float carry=Math.min(d(16),movingGlass.getWidth()*.045f);
            float ex=sx+Math.max(movingGlass.getWidth()*.88f,d(300));
            float ey=sy-Math.max(d(275),movingGlass.getHeight()*3.5f);
            Path path=new Path();
            path.moveTo(sx,sy);
            path.cubicTo(sx-carry*2.2f,sy-d(6),
                sx+movingGlass.getWidth()*.24f,sy-movingGlass.getHeight()*1.95f,ex,ey);
            PathMeasure measure=new PathMeasure(path,false);
            float[] pos=new float[2];
            Bitmap capture=pixels;
            ValueAnimator anim=ValueAnimator.ofFloat(0f,1f);
            anim.setDuration(640);
            anim.setInterpolator(new PathInterpolator(.19f,.47f,.25f,1f));
            anim.addUpdateListener(v->{
                float t=(float)v.getAnimatedValue();
                measure.getPosTan(measure.getLength()*t,pos,null);
                sprite.setX(pos[0]);sprite.setY(pos[1]);
                sprite.setRotation(-12*t);
                sprite.setScaleX(1-.2f*t);sprite.setScaleY(1-.2f*t);
                float fade=Math.max(0,Math.min(1,(t-.48f)/.50f));
                sprite.setAlpha(1-fade*fade*(3-2*fade));
            });
            anim.addListener(new AnimatorListenerAdapter(){
                boolean finished=false;
                private void finish(){
                    if(finished)return;finished=true;
                    host.removeView(sprite);
                    sprite.setImageDrawable(null);
                    capture.recycle();
                    callback.run();
                }
                @Override public void onAnimationEnd(Animator a){finish();}
                @Override public void onAnimationCancel(Animator a){finish();}
            });
            anim.start();
        }catch(Exception error){
            if(ghost!=null)host.removeView(ghost);
            if(pixels!=null&&!pixels.isRecycled())pixels.recycle();
            callback.run();
        }
    }
}
