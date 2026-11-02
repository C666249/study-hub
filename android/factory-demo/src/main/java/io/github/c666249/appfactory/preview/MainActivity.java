package io.github.c666249.appfactory.preview;

import android.animation.LayoutTransition;
import android.animation.ValueAnimator;
import android.app.Activity;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.os.Bundle;
import android.view.Gravity;
import android.view.HapticFeedbackConstants;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
import android.view.animation.DecelerateInterpolator;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;
import java.util.ArrayList;
import java.util.List;

public final class MainActivity extends Activity {
    private final int bg = Color.rgb(13,17,25);
    private final int panel = Color.rgb(26,32,44);
    private final int gold = Color.rgb(233,188,109);
    private final int muted = Color.rgb(149,159,174);
    private final List<String> sample = new ArrayList<>();
    private LinearLayout cards;
    private FrameLayout nav;
    private View thumb;
    private TextView status;
    private int tab = 0;
    private ValueAnimator activeTabAnimation;
    private final List<TextView> tabTextViews = new ArrayList<>();
    private int dp(float n) { return Math.round(n * getResources().getDisplayMetrics().density); }
    private GradientDrawable shape(int color, float corner, Integer border) {
        GradientDrawable d = new GradientDrawable();
        d.setColor(color); d.setCornerRadius(dp(corner));
        if (border != null) d.setStroke(dp(1), border);
        return d;
    }
    private TextView text(String s, int size, int color, boolean bold) {
        TextView t = new TextView(this);
        t.setText(s); t.setTextSize(size); t.setTextColor(color);
        t.setTypeface(Typeface.DEFAULT, bold ? Typeface.BOLD : Typeface.NORMAL);
        t.setIncludeFontPadding(false);
        return t;
    }
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().setStatusBarColor(bg);
        getWindow().setNavigationBarColor(bg);
        sample.add("FMV · 弹性导航体验");
        sample.add("Motion · 橡胶阻力卡片");
        sample.add("Quality · 交互反馈");
        sample.add("Pipeline · 自动构建流程");

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(bg);
        root.setPadding(dp(24), dp(24), dp(24), dp(24));
        setContentView(root);

        TextView eyebrow = text("PERSONAL    /    APP FACTORY", 12, gold, true);
        root.addView(eyebrow);
        TextView heading = text("Make. Move. Ship.", 30, Color.WHITE, true);
        heading.setPadding(0, dp(18), 0, dp(9));
        root.addView(heading);
        TextView desc = text("把你的设计资产，变成可持续交付的应用。", 14, muted, false);
        root.addView(desc);

        LinearLayout summary = new LinearLayout(this);
        summary.setOrientation(LinearLayout.VERTICAL);
        summary.setPadding(dp(20), dp(18), dp(20), dp(18));
        summary.setBackground(shape(panel, 20, Color.rgb(48,56,70)));
        LinearLayout.LayoutParams summaryP = new LinearLayout.LayoutParams(-1, -2);
        summaryP.topMargin = dp(26); root.addView(summary, summaryP);
        summary.addView(text("FACTORY STATUS   /   PREVIEW 01", 11, gold, true));
        TextView strong = text("Android 构建样板", 21, Color.WHITE, true);
        strong.setPadding(0, dp(10), 0, dp(6));
        summary.addView(strong);
        status = text("三通道架构 · Public Demo · 无网络权限", 12, muted, false);
        summary.addView(status);

        TextView section = text("交互实验  /  Motion cases", 16, Color.WHITE, true);
        section.setPadding(0, dp(27), 0, dp(14));
        root.addView(section);
        ScrollView scroller = new ScrollView(this);
        scroller.setFillViewport(true);
        scroller.setVerticalScrollBarEnabled(false);
        LinearLayout.LayoutParams scrollp = new LinearLayout.LayoutParams(-1, 0, 1);
        root.addView(scroller, scrollp);
        cards = new LinearLayout(this);
        cards.setOrientation(LinearLayout.VERTICAL);
        cards.setLayoutTransition(new LayoutTransition());
        scroller.addView(cards);
        for (int i = 0; i < sample.size(); i++) addCard(sample.get(i), i);
        TextView help = text("向左滑动卡片以移除 · 底部可切换三种页面状态", 12, muted, false);
        help.setGravity(Gravity.CENTER);
        help.setPadding(0, dp(16), 0, dp(16));
        root.addView(help);

        nav = new FrameLayout(this);
        nav.setBackground(shape(Color.rgb(28,35,47), 24, Color.rgb(52,60,74)));
        root.addView(nav, new LinearLayout.LayoutParams(-1, dp(66)));
        thumb = new View(this);
        thumb.setBackground(shape(gold, 20, null));
        FrameLayout.LayoutParams thumbLp = new FrameLayout.LayoutParams(dp(100), dp(54));
        thumbLp.gravity = Gravity.TOP | Gravity.LEFT;
        thumbLp.leftMargin = dp(6); thumbLp.topMargin = dp(6);
        nav.addView(thumb, thumbLp);
        LinearLayout navLabels = new LinearLayout(this);
        navLabels.setOrientation(LinearLayout.HORIZONTAL);
        String[] labels = {"创建", "动效", "发布"};
        for (int i = 0; i < labels.length; i++) {
            final int which = i;
            TextView v = text(labels[i], 15, i==0 ? bg : muted, true);
            tabTextViews.add(v);
            v.setGravity(Gravity.CENTER);
            v.setOnClickListener(ignored -> switchTab(which));
            navLabels.addView(v, new LinearLayout.LayoutParams(0, -1, 1));
        }
        nav.addView(navLabels, new FrameLayout.LayoutParams(-1,-1));
        nav.post(() -> {
            int slot = Math.max(1, (nav.getWidth() - dp(12)) / 3);
            FrameLayout.LayoutParams p = (FrameLayout.LayoutParams)thumb.getLayoutParams();
            p.width = slot; thumb.setLayoutParams(p);
        });
        TextView footer = text("BETA PREVIEW    ·    TEMPORARY DEBUG SIGNING", 10, muted, false);
        footer.setGravity(Gravity.CENTER);
        footer.setPadding(0, dp(16), 0, 0);
        root.addView(footer);
    }

    private void addCard(String label, int index) {
        LinearLayout row = new LinearLayout(this);
        row.setOrientation(LinearLayout.VERTICAL);
        row.setPadding(dp(18), dp(17), dp(18), dp(17));
        row.setBackground(shape(panel, 17, Color.rgb(49,57,71)));
        TextView tag = text(String.format(java.util.Locale.US, "MODULE 0%d", index+1), 10, gold, true);
        row.addView(tag);
        TextView title = text(label, 16, Color.WHITE, true);
        title.setPadding(0, dp(10), 0, dp(5));
        row.addView(title);
        TextView sub = text(index==0 ? "420ms 弹性选择动效" : index==1 ? "滑动反馈和连续状态" : index==2 ? "自动化验证与可追溯结果" : "版本构建、校验与分发", 12, muted, false);
        row.addView(sub);
        LinearLayout.LayoutParams p = new LinearLayout.LayoutParams(-1,-2);
        p.bottomMargin=dp(12); cards.addView(row, p);
        row.setOnClickListener(v -> Toast.makeText(this, label, Toast.LENGTH_SHORT).show());
        row.setOnTouchListener(new View.OnTouchListener() {
            float x,y; boolean dragging=false; boolean pulsed=false;
            @Override public boolean onTouch(View v, MotionEvent event) {
                switch(event.getActionMasked()) {
                    case MotionEvent.ACTION_DOWN:
                        x=event.getRawX();y=event.getRawY();dragging=false;pulsed=false; return true;
                    case MotionEvent.ACTION_MOVE:
                        float dx=event.getRawX()-x, dy=event.getRawY()-y;
                        if(!dragging && Math.abs(dx)>dp(8) && Math.abs(dx)>Math.abs(dy)) dragging=true;
                        if(dragging) {
                            float travel=Math.max(0,-dx);
                            float offset=dp(180)*(1-(float)Math.exp(-travel/dp(180)));
                            row.setTranslationX(-offset);
                            if(travel>dp(90) && !pulsed) { row.performHapticFeedback(HapticFeedbackConstants.LONG_PRESS);pulsed=true; }
                        }
                        return dragging;
                    case MotionEvent.ACTION_UP:
                        if(!dragging) { row.performClick(); return true; }
                        if(event.getRawX()-x < -dp(100)) {
                            row.animate().translationX(-getResources().getDisplayMetrics().widthPixels).alpha(0).setDuration(360).withEndAction(() -> cards.removeView(row)).start();
                            status.setText("卡片操作已完成 · 可以重新进入实验室");
                        } else row.animate().translationX(0).setDuration(310).start();
                        return true;
                    case MotionEvent.ACTION_CANCEL:
                        row.animate().translationX(0).setDuration(220).start(); return true;
                }
                return false;
            }
        });
    }

    private void switchTab(int index) {
        if (index == tab) return;
        int prev = tab;
        tab = index;
        if (nav.getWidth()==0) return;
        float distance = (nav.getWidth()-dp(12)) / 3f;
        float from=thumb.getTranslationX(), to=index*distance;
        if (activeTabAnimation != null) activeTabAnimation.cancel();
        ValueAnimator a=ValueAnimator.ofFloat(0f,1f);
        a.setDuration(420);
        a.setInterpolator(new DecelerateInterpolator(1.7f));
        a.addUpdateListener(anim->{
            float f=(float)anim.getAnimatedValue();
            thumb.setTranslationX(from+(to-from)*f);
            thumb.setScaleX(1f+0.12f*(float)Math.sin(Math.PI*f));
        });
        activeTabAnimation = a;
        a.start();
        for (int i = 0; i < tabTextViews.size(); i++) tabTextViews.get(i).setTextColor(i == index ? bg : muted);
        cards.removeAllViews();
        final String[] titles = index == 0 ?
            new String[]{"模板创建器", "独立包名", "Stable / Beta / Cloud", "项目来源追溯"} : index == 1 ?
            new String[]{"FMV · 弹性导航体验", "Motion · 橡胶阻力卡片", "动效复用规则", "动画时序与触觉"} :
            new String[]{"GitHub Actions 构建", "三通道安装身份", "APK SHA256 校验", "交付状态和版本记录"};
        for (int i=0; i<titles.length; i++) addCard(titles[i], i);
        status.setText(index==0 ? "三通道架构 · Public Demo · 无网络权限" :
            index==1 ? "动效案例 · 点击和滑动可测试" :
            "GitHub Actions 构建 · APK & SHA256 · Debug 预览");
    }
}
