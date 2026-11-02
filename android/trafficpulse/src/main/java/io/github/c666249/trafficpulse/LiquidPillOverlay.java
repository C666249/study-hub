package io.github.c666249.trafficpulse;

import android.animation.ValueAnimator;
import android.content.Context;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.graphics.Point;
import android.graphics.PixelFormat;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.os.Handler;
import android.os.Looper;
import android.provider.Settings;
import android.view.Gravity;
import android.view.HapticFeedbackConstants;
import android.view.MotionEvent;
import android.view.View;
import android.view.WindowManager;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.TextView;
import java.util.Locale;

/**
 * PulseFlow native overlay.
 * SAME window, SAME pill, variable width; never destroys/recreates on expand.
 * Collapsed: balance alone. Tap: horizontal 420 ms bilateral expansion.
 * Long-press: reverse from the current width. Drag: move/persist position.
 * Frosted-white translucent material is a safe fallback, NOT screen capture
 * or optical refraction of other apps (which would require extra permission).
 */
public final class LiquidPillOverlay {
    private static final String PREFS = "pulseflow_pill";
    private final Context context;
    private final WindowManager windowManager;
    private final Handler handler = new Handler(Looper.getMainLooper());
    private final int collapsedWidth;
    private final int expandedWidth;
    private final int height;
    private final int screenWidth;
    private final int screenHeight;
    private FrameLayout root;
    private LinearLayout expandedRow;
    private TextView collapsedText, remainingText, usedText, downloadText, uploadText;
    private WindowManager.LayoutParams params;
    private ValueAnimator animator;
    private boolean expanded;
    private float downX, downY;
    private int startX, startY;
    private boolean dragged, longPressed;
    private final Runnable longPress = () -> {
        if (dragged || root == null) return;
        longPressed = true;
        if (expanded || (animator != null && animator.isRunning())) {
            root.performHapticFeedback(HapticFeedbackConstants.LONG_PRESS);
            transition(false);
        }
    };

    private int dp(float d) { return Math.round(d * context.getResources().getDisplayMetrics().density); }
    private static int limit(int value, int min, int max) { return Math.max(min, Math.min(max, value)); }

    public LiquidPillOverlay(Context context) {
        this.context = context.getApplicationContext();
        windowManager = (WindowManager) context.getSystemService(Context.WINDOW_SERVICE);
        Point size = new Point();
        windowManager.getDefaultDisplay().getSize(size);
        screenWidth = size.x;
        screenHeight = size.y;
        collapsedWidth = dp(136);
        expandedWidth = Math.max(collapsedWidth + dp(40), Math.min(dp(350), screenWidth - dp(16)));
        height = dp(42);
    }

    private GradientDrawable material() {
        GradientDrawable d = new GradientDrawable(GradientDrawable.Orientation.TL_BR,
            new int[]{0xF4FFFFFF, 0xDCE9F4FA, 0xC4ECF5FA, 0xE8FFFFFF});
        d.setCornerRadius(dp(25));
        d.setStroke(dp(1), 0xEFFFFFFF);
        return d;
    }

    private TextView label(String text, int color, float size) {
        TextView view = new TextView(context);
        view.setText(text);
        view.setTextColor(color);
        view.setTextSize(size);
        view.setSingleLine(true);
        view.setEllipsize(android.text.TextUtils.TruncateAt.END);
        view.setIncludeFontPadding(false);
        view.setGravity(Gravity.CENTER);
        view.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        return view;
    }

    public void attach() {
        if (root != null || !Settings.canDrawOverlays(context)) return;
        root = new FrameLayout(context);
        root.setBackground(material());
        root.setElevation(dp(9));
        root.setClipChildren(false);
        root.setClipToPadding(false);

        collapsedText = label("剩余  — GB", 0xFF253F47, 13f);
        collapsedText.setPadding(dp(12),0,dp(12),0);
        root.addView(collapsedText, new FrameLayout.LayoutParams(-1,-1));

        expandedRow = new LinearLayout(context);
        expandedRow.setGravity(Gravity.CENTER_VERTICAL);
        expandedRow.setOrientation(LinearLayout.HORIZONTAL);
        expandedRow.setPadding(dp(7),0,dp(7),0);
        expandedRow.setAlpha(0f);
        root.addView(expandedRow, new FrameLayout.LayoutParams(-1,-1));
        remainingText = label("余 —",0xFF1A655A,11.4f);
        usedText = label("用 —",0xFF405562,11.4f);
        downloadText = label("↓ 0K/s",0xFF1C8275,11.4f);
        uploadText = label("↑ 0K/s",0xFF6D5EA4,11.4f);
        for (TextView view : new TextView[]{remainingText,usedText,downloadText,uploadText}) {
            expandedRow.addView(view,new LinearLayout.LayoutParams(0,-1,1f));
        }
        root.setContentDescription("PulseFlow 余量悬浮胶囊。点击展开，长按收起，拖动移动");
        root.setOnTouchListener(this::onTouch);
        SharedPreferences sp=context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        int initialX=limit((screenWidth-collapsedWidth)/2,0,Math.max(0,screenWidth-collapsedWidth));
        int initialY=dp(75);
        params=new WindowManager.LayoutParams(
            collapsedWidth,height,WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE | WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL,
            PixelFormat.TRANSLUCENT);
        params.gravity=Gravity.TOP | Gravity.LEFT;
        params.x=limit(sp.getInt("x",initialX),dp(2),Math.max(dp(2),screenWidth-collapsedWidth-dp(2)));
        params.y=limit(sp.getInt("y",initialY),0,Math.max(0,screenHeight-height));
        try { windowManager.addView(root,params); }
        catch (RuntimeException e) { root=null; params=null; }
    }

    private boolean onTouch(View view, MotionEvent event) {
        if (root == null || params == null) return false;
        switch (event.getActionMasked()) {
            case MotionEvent.ACTION_DOWN:
                downX=event.getRawX();downY=event.getRawY();
                startX=params.x;startY=params.y;
                dragged=false;longPressed=false;
                handler.removeCallbacks(longPress);
                handler.postDelayed(longPress,490);
                return true;
            case MotionEvent.ACTION_MOVE:
                float dx=event.getRawX()-downX;
                float dy=event.getRawY()-downY;
                if (!dragged && (Math.abs(dx)>dp(9) || Math.abs(dy)>dp(9))) {
                    dragged=true;handler.removeCallbacks(longPress);
                    if (animator!=null) animator.cancel();
                }
                if (dragged) {
                    params.x=limit(startX+Math.round(dx),dp(2),Math.max(dp(2),screenWidth-params.width-dp(2)));
                    params.y=limit(startY+Math.round(dy),0,Math.max(0,screenHeight-height));
                    relayout();
                }
                return true;
            case MotionEvent.ACTION_UP:
                handler.removeCallbacks(longPress);
                if (dragged) persistPosition();
                else if (!longPressed && !expanded) {
                    root.performHapticFeedback(HapticFeedbackConstants.KEYBOARD_TAP);
                    transition(true);
                }
                return true;
            case MotionEvent.ACTION_CANCEL:
                handler.removeCallbacks(longPress);
                if (dragged) persistPosition();
                return true;
            default: return true;
        }
    }

    private void transition(boolean expand) {
        if (root==null||params==null) return;
        if (animator!=null) animator.cancel();
        expanded=expand;
        int from=params.width;
        int target=expand?expandedWidth:collapsedWidth;
        if (from==target) { setBlend(expand?1f:0f); return; }
        final float center=params.x+from/2f;
        animator=ValueAnimator.ofInt(from,target);
        animator.setDuration(420L);
        animator.setInterpolator(new android.view.animation.PathInterpolator(0.2f,0f,0.2f,1f));
        animator.addUpdateListener(a->{
            if (root==null||params==null) return;
            int width=(int)a.getAnimatedValue();
            params.width=width;
            params.x=limit(Math.round(center-width/2f),dp(2),Math.max(dp(2),screenWidth-width-dp(2)));
            // Text reveal follows the actual continuous width, never changes view identity.
            float mix=(float)(width-collapsedWidth)/(expandedWidth-collapsedWidth);
            setBlend(Math.max(0,Math.min(1,mix)));
            relayout();
        });
        animator.start();
    }

    private void setBlend(float mix) {
        if (collapsedText==null || expandedRow==null) return;
        float smooth=mix*mix*(3-2*mix);
        collapsedText.setAlpha(Math.max(0f,1f-smooth*1.7f));
        expandedRow.setAlpha(Math.max(0f,Math.min(1f,(smooth-0.30f)/0.60f)));
    }

    private void relayout() {
        if (root==null||params==null) return;
        try { windowManager.updateViewLayout(root,params); }
        catch (RuntimeException ignored) {}
    }

    private void persistPosition() {
        if (params!=null) context.getSharedPreferences(PREFS,Context.MODE_PRIVATE)
            .edit().putInt("x",params.x).putInt("y",params.y).apply();
    }

    public void speeds(SpeedState.Snapshot state) {
        if (root==null) return;
        downloadText.setText("↓"+compactRate(state.down));
        uploadText.setText("↑"+compactRate(state.up));
    }

    public void quota(QuotaUsage.Result result) {
        if (root==null) return;
        if (!result.success) {
            collapsedText.setText("剩余  — GB");
            remainingText.setText("余 —");
            usedText.setText("用 —");
            return;
        }
        double used=result.usedBytes/QuotaUsage.GIB;
        collapsedText.setText(String.format(Locale.US,"剩余 %.2fG",result.remainingGb));
        remainingText.setText(String.format(Locale.US,"余 %.1fG",result.remainingGb));
        usedText.setText(String.format(Locale.US,"用 %.1fG",used));
    }

    private static String compactRate(double rate) {
        if (rate < 1024) return String.format(Locale.US,"%.0fB/s",rate);
        if (rate < 1024*1024) return String.format(Locale.US,"%.0fK/s",rate/1024.0);
        return String.format(Locale.US,"%.1fM/s",rate/1048576.0);
    }

    public void detach() {
        handler.removeCallbacks(longPress);
        if (animator!=null) {animator.cancel();animator=null;}
        if (root!=null) {
            try {windowManager.removeView(root);}catch(RuntimeException ignored){}
            root=null;params=null;
        }
    }
}
