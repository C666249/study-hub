package io.github.c666249.rewarder;

import android.app.Activity;
import android.app.Dialog;
import android.animation.Animator;
import android.animation.AnimatorListenerAdapter;
import android.content.Context;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.os.Bundle;
import android.view.Gravity;
import android.view.HapticFeedbackConstants;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.view.WindowManager;
import android.view.animation.DecelerateInterpolator;
import android.view.animation.OvershootInterpolator;
import android.widget.EditText;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;
import android.text.InputType;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.HashMap;
import android.view.ViewTreeObserver;
import android.view.animation.PathInterpolator;
import eightbitlab.com.blurview.BlurTarget;

public final class MainActivity extends Activity {
    private static final int BG=MotionViews.BG;
    private static final int SURFACE=MotionViews.SURFACE;
    private static final int SURFACE2=MotionViews.SURFACE_2;
    private static final int GOLD=MotionViews.GOLD;
    private static final int INK=MotionViews.INK;
    private static final int MUTED=MotionViews.MUTED;
    private static final int LINE=MotionViews.HAIRLINE;
    private RewardStore store;
    private FrameLayout rootFrame, pages;
    private BlurTarget blurTarget;
    private View balanceGlass;
    private LinearLayout taskList, settingsList, balancePanel;
    private ScrollView homeScroll, settingsScroll;
    private TextView miniBalance, taskCount, settingsCount;
    private MotionViews.RollingAmount totalView;
    private MotionViews.RubberTabs tabs;
    private MotionViews.GoldFlight flight;
    private MotionViews.ImpactRipple impact;
    private View createOrb;
    private TextView createPlus;
    private boolean createOpening=false;
    private boolean rewarding=false;
    private long displayedCents=0;
    private int currentTab=0;

    private int d(float value){return Math.round(MotionViews.dp(this,value));}
    private String money(long cents){return MotionViews.money(cents);}
    private GradientDrawable shape(int color,float radius,int border) {
        GradientDrawable g=new GradientDrawable();
        g.setColor(color);g.setCornerRadius(d(radius));
        if(border!=0)g.setStroke(d(1),border);
        return g;
    }
    private TextView text(String value,float size,int color,boolean medium) {
        TextView v=new TextView(this);
        v.setText(value);v.setTextSize(size);v.setTextColor(color);
        v.setGravity(Gravity.CENTER_VERTICAL);
        v.setFontFeatureSettings("tnum");
        v.setTypeface(Typeface.create(medium?"sans-serif-medium":"sans-serif",Typeface.NORMAL));
        v.setIncludeFontPadding(false);
        return v;
    }
    private LinearLayout column() {
        LinearLayout v=new LinearLayout(this);v.setOrientation(LinearLayout.VERTICAL);
        return v;
    }
    private LinearLayout row() {
        LinearLayout v=new LinearLayout(this);v.setOrientation(LinearLayout.HORIZONTAL);
        v.setGravity(Gravity.CENTER_VERTICAL);return v;
    }
    private LinearLayout.LayoutParams lp(int w,int h){return new LinearLayout.LayoutParams(w<0?w:d(w),h<0?h:d(h));}
    private FrameLayout.LayoutParams fp(int w,int h,int gravity){
        return new FrameLayout.LayoutParams(w<0?w:d(w),h<0?h:d(h),gravity);
    }
    private View line() {
        View v=new View(this);v.setBackgroundColor(LINE);return v;
    }
    private void touch(View v) {
        v.setClickable(true);v.setFocusable(true);
    }

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().setStatusBarColor(BG);
        getWindow().setNavigationBarColor(BG);
        getWindow().getDecorView().setSystemUiVisibility(0);
        store=new RewardStore(this);
        displayedCents=store.balance();

        rootFrame=new FrameLayout(this);
        rootFrame.setBackgroundColor(BG);
        // Target is ONLY the live fluid background; glass views stay outside of it
        // to prevent recursion and preserve legible foreground contents.
        blurTarget=new BlurTarget(this);
        blurTarget.addView(new GlassBackdrop(this),fp(-1,-1,Gravity.FILL));
        rootFrame.addView(blurTarget,fp(-1,-1,Gravity.FILL));
        LinearLayout stack=column();
        rootFrame.addView(stack,fp(-1,-1,Gravity.FILL));
        setContentView(rootFrame);

        stack.addView(createHeader(),lp(-1,76));
        pages=new FrameLayout(this);
        stack.addView(pages,new LinearLayout.LayoutParams(-1,0,1));
        homeScroll=makeHome();
        settingsScroll=makeSettings();
        pages.addView(homeScroll,fp(-1,-1,Gravity.FILL));
        pages.addView(settingsScroll,fp(-1,-1,Gravity.FILL));
        settingsScroll.setVisibility(View.GONE);

        FrameLayout tabArea=new FrameLayout(this);
        stack.addView(tabArea,lp(-1,86));
        tabs=new MotionViews.RubberTabs(this,this::switchTab);
        FrameLayout.LayoutParams t=fp(282,67,Gravity.TOP|Gravity.CENTER_HORIZONTAL);
        t.topMargin=d(5);
        tabArea.addView(GlassMaterial.navigation(this,blurTarget,tabs,36),t);

        flight=new MotionViews.GoldFlight(this);
        rootFrame.addView(flight,fp(-1,-1,Gravity.FILL));
        impact=new MotionViews.ImpactRipple(this);
        rootFrame.addView(impact,fp(-1,-1,Gravity.FILL));
        installCreateOrb();
        renderRewardList();
        renderSettingsList();
        if(store.isReadOnly())Toast.makeText(this,"本地数据无法读取，已保护原始数据并禁用修改",Toast.LENGTH_LONG).show();
    }

    private View createHeader() {
        LinearLayout bar=row();bar.setPadding(d(23),d(12),d(23),0);
        TextView emblem=text("✦",20,0xffF5DCAC,true);
        emblem.setGravity(Gravity.CENTER);
        emblem.setBackground(shape(0xA22D3933,15,0x8DACAA94));
        bar.addView(emblem,lp(40,40));
        TextView name=text("Aurea",18,INK,true);
        LinearLayout.LayoutParams nm=lp(-2,40);nm.leftMargin=d(11);
        bar.addView(name,nm);
        View spacer=new View(this);bar.addView(spacer,new LinearLayout.LayoutParams(0,1,1));
        miniBalance=text(money(displayedCents),13,0xffF0D0A1,true);
        miniBalance.setGravity(Gravity.CENTER);
        miniBalance.setPadding(d(15),0,d(15),0);
        miniBalance.setMinimumHeight(d(40));
        miniBalance.setContentDescription("查看累计奖励与领取记录");
        touch(miniBalance);miniBalance.setOnClickListener(v->showHistory());
        bar.addView(GlassMaterial.balancePill(this,blurTarget,miniBalance,23),lp(-2,40));
        return bar;
    }

    private ScrollView scroll() {
        ScrollView sc=new ScrollView(this);
        sc.setFillViewport(true);
        sc.setClipToPadding(false);
        sc.setOverScrollMode(View.OVER_SCROLL_NEVER);
        sc.setVerticalScrollBarEnabled(false);
        return sc;
    }

    private ScrollView makeHome() {
        ScrollView sc=scroll();
        LinearLayout body=column();
        body.setPadding(d(23),d(24),d(23),d(28));
        sc.addView(body,new ScrollView.LayoutParams(-1,-2));

        TextView headline=text("坚持，值得奖励。",28,INK,true);
        body.addView(headline,lp(-1,44));
        TextView subtitle=text("完成一次，就奖励自己一次。",12.5f,0xffB0BDB4,false);
        LinearLayout.LayoutParams sub=lp(-1,26);sub.topMargin=d(1);
        body.addView(subtitle,sub);

        balancePanel=column();
        balancePanel.setPadding(d(23),d(23),d(22),d(19));
        // The translucent, blurred shell is separate from sharp foreground text.
        LinearLayout.LayoutParams panel=lp(-1,-2);panel.topMargin=d(30);
        balanceGlass=GlassMaterial.panel(this,blurTarget,balancePanel,29);
        body.addView(balanceGlass,panel);

        LinearLayout brow=row();
        TextView balanceTitle=text("累计奖励",13,0xffD6D7C7,false);
        brow.addView(balanceTitle,new LinearLayout.LayoutParams(0,d(26),1));
        TextView spark=text("✧",22,0xffEED5A5,true);
        spark.setGravity(Gravity.CENTER);
        brow.addView(spark,lp(32,28));
        balancePanel.addView(brow,lp(-1,28));

        totalView=new MotionViews.RollingAmount(this);
        totalView.initialize(displayedCents);
        LinearLayout.LayoutParams total=lp(-1,73);total.topMargin=d(6);
        balancePanel.addView(totalView,total);
        TextView caption=text("属于你的每一次坚持",12,0xffA5B4A8,false);
        balancePanel.addView(caption,lp(-1,25));

        LinearLayout section=row();
        LinearLayout.LayoutParams sl=lp(-1,62);sl.topMargin=d(23);
        body.addView(section,sl);
        TextView title=text("正在坚持",18,INK,true);
        section.addView(title,new LinearLayout.LayoutParams(0,-1,1));
        taskCount=text("",12,0xffADB9AD,false);
        section.addView(taskCount,lp(-2,-1));

        taskList=column();
        body.addView(taskList,lp(-1,-2));
        return sc;
    }

    private ScrollView makeSettings() {
        ScrollView sc=scroll();
        LinearLayout body=column();
        body.setPadding(d(23),d(24),d(23),d(30));
        sc.addView(body,new ScrollView.LayoutParams(-1,-2));

        LinearLayout top=row();
        TextView headline=text("任务管理",28,INK,true);
        top.addView(headline,new LinearLayout.LayoutParams(0,d(54),1));
        body.addView(top,lp(-1,57));

        TextView instruction=text("左滑编辑 · 继续左滑删除",12,0xffABB9AF,false);
        body.addView(instruction,lp(-1,32));

        LinearLayout section=row();
        LinearLayout.LayoutParams sec=lp(-1,51);sec.topMargin=d(15);
        body.addView(section,sec);
        TextView groupTitle=text("我的任务",16,INK,true);
        section.addView(groupTitle,new LinearLayout.LayoutParams(0,-1,1));
        settingsCount=text("",12,0xffAAB8A9,false);
        section.addView(settingsCount,lp(-2,-1));

        settingsList=column();
        settingsList.setClipChildren(false);
        body.addView(settingsList,lp(-1,-2));
        return sc;
    }

    private void renderRewardList() {
        if(taskList==null)return;
        taskList.removeAllViews();
        List<RewardStore.Task> all=store.tasks();
        taskCount.setText(all.size()+" 项");
        if(all.isEmpty()) {
            LinearLayout empty=column();
            empty.setGravity(Gravity.CENTER);
            empty.setPadding(d(18),d(32),d(18),d(29));
            // Blurred live light replaces the old solid empty-state surface.
            TextView glyph=text("✧",31,GOLD,true);
            glyph.setGravity(Gravity.CENTER);empty.addView(glyph,lp(-1,51));
            TextView hint=text("还没有奖励任务",15,INK,true);
            hint.setGravity(Gravity.CENTER);empty.addView(hint,lp(-1,33));
            TextView go=text("创建第一项  ↗",13.5f,GOLD,true);
            go.setGravity(Gravity.CENTER);touch(go);
            go.setOnClickListener(v->tabs.select(1));
            empty.addView(go,lp(-1,43));
            taskList.addView(GlassMaterial.floatingCard(this,blurTarget,empty,25),lp(-1,-2));return;
        }
        for(RewardStore.Task task:all) {
            boolean claimed=store.alreadyClaimed(task);
            LinearLayout item=row();
            item.setPadding(d(18),d(13),d(14),d(13));
            item.setMinimumHeight(d(83));
            // Foreground must remain sharp, while the live background shines through.
            LinearLayout content=column();
            content.setGravity(Gravity.CENTER_VERTICAL);
            TextView name=text(task.title,16.5f,INK,true);
            name.setMaxLines(2);
            name.setEllipsize(android.text.TextUtils.TruncateAt.END);
            content.addView(name,lp(-1,-2));
            TextView meta=text((RewardStore.WEEKLY.equals(task.cadence)?"每周":"每天")
                +"  ·  "+money(task.cents),12.5f,0xffADBEB0,false);
            LinearLayout.LayoutParams mp=lp(-1,25);mp.topMargin=d(5);
            content.addView(meta,mp);
            item.addView(content,new LinearLayout.LayoutParams(0,-2,1));
            TextView claim=text(claimed?"✓ 完成":"奖励",13.5f,
                claimed?0xffAFBEAE:0xffF3DDB8,true);
            claim.setGravity(Gravity.CENTER);
            claim.setMinimumWidth(d(claimed?74:67));
            claim.setMinimumHeight(d(42));
            LinearLayout.LayoutParams cl=lp(claimed?74:67,42);cl.leftMargin=d(8);
            item.addView(GlassMaterial.pill(this,blurTarget,claim,16),cl);
            touch(claim);
            claim.setEnabled(!claimed&&!rewarding&&!store.isReadOnly());
            claim.setContentDescription(claimed?"当前周期已领取 "+task.title:"领取 "+task.title+" 奖励 "+money(task.cents));
            claim.setOnClickListener(v->collect(task,claim));
            LinearLayout.LayoutParams card=lp(-1,-2);card.bottomMargin=d(11);
            taskList.addView(GlassMaterial.floatingCard(this,blurTarget,item,22),card);
        }
    }

    private void renderSettingsList() {
        if(settingsList==null)return;
        int restore=settingsScroll.getScrollY();
        settingsList.removeAllViews();
        List<RewardStore.Task> tasks=store.tasks();
        settingsCount.setText(tasks.size()+" 项");
        if(tasks.isEmpty()) {
            TextView hint=text("点击右上角，创建一个想坚持的目标。",13,MUTED,false);
            hint.setGravity(Gravity.CENTER);
            hint.setPadding(d(12),d(29),d(12),d(29));
            // Empty-state is a frosted glass pane, not an opaque tile.
            settingsList.addView(GlassMaterial.floatingCard(this,blurTarget,hint,22),lp(-1,-2));
        }
        for(RewardStore.Task task:tasks) {
            GestureTaskRow item=new GestureTaskRow(this,blurTarget);
            item.setTag(task.id);
            LinearLayout labels=column();
            labels.setGravity(Gravity.CENTER_VERTICAL);
            TextView title=text(task.title,16,INK,true);
            title.setMaxLines(2);
            title.setEllipsize(android.text.TextUtils.TruncateAt.END);
            labels.addView(title,lp(-1,-2));
            TextView hint=text((RewardStore.WEEKLY.equals(task.cadence)?"每周":"每天")
                +"  ·  "+money(task.cents),12.5f,0xffB6C6BA,false);
            LinearLayout.LayoutParams hp=lp(-1,26);hp.topMargin=d(4);
            labels.addView(hint,hp);
            item.surface.addView(labels,new LinearLayout.LayoutParams(0,-2,1));
            item.setContentDescription(task.title+"，向左滑动一点编辑，继续左滑删除");
            item.onEdit=()->openEditor(task);
            item.onDelete=()->deleteFromSwipe(task);
            LinearLayout.LayoutParams card=lp(-1,-2);
            card.bottomMargin=d(11);
            settingsList.addView(item,card);
        }
        settingsScroll.post(()->settingsScroll.scrollTo(0,restore));
    }

    // FMV LedgerListReflow: preserve old screen positions, then spring surviving
    // rows up into the removed row's footprint after the flight completes.
    private void deleteFromSwipe(RewardStore.Task task) {
        Map<String,Float> positions=new HashMap<>();
        for(int i=0;i<settingsList.getChildCount();i++){
            View child=settingsList.getChildAt(i);
            if(child.getTag() instanceof String)
                positions.put((String)child.getTag(),child.getY());
        }
        if(!store.deleteTask(task)){
            renderSettingsList();
            Toast.makeText(this,"删除失败，请重试",Toast.LENGTH_SHORT).show();
            return;
        }
        renderRewardList();
        renderSettingsList();
        if(!android.animation.ValueAnimator.areAnimatorsEnabled())return;
        ViewTreeObserver observer=settingsList.getViewTreeObserver();
        if(!observer.isAlive())return;
        observer.addOnPreDrawListener(new ViewTreeObserver.OnPreDrawListener(){
            @Override public boolean onPreDraw(){
                if(observer.isAlive())observer.removeOnPreDrawListener(this);
                for(int i=0;i<settingsList.getChildCount();i++){
                    View child=settingsList.getChildAt(i);
                    if(!(child.getTag() instanceof String))continue;
                    Float old=positions.get((String)child.getTag());
                    if(old==null)continue;
                    float delta=old-child.getTop();
                    if(Math.abs(delta)<1f)continue;
                    child.setTranslationY(delta);
                    child.animate().translationY(0).setDuration(370)
                        .setInterpolator(new PathInterpolator(.18f,.80f,.24f,1f)).start();
                }
                return true;
            }
        });
    }

    private TextView iconButton(String character) {
        TextView icon=text(character,22,0xffC7C0B6,true);
        icon.setGravity(Gravity.CENTER);icon.setBackground(shape(SURFACE2,16,0));
        touch(icon);return icon;
    }

    private void collect(RewardStore.Task task,View source) {
        if(rewarding||store.isReadOnly())return;
        RewardStore.Receipt receipt=store.claim(task);
        if(receipt==null) {
            Toast.makeText(this,store.alreadyClaimed(task)?"本周期已领取":"保存失败，请重试",Toast.LENGTH_SHORT).show();
            renderRewardList();return;
        }
        rewarding=true;
        source.performHapticFeedback(HapticFeedbackConstants.VIRTUAL_KEY);
        int[] from=new int[2],to=new int[2],origin=new int[2];
        source.getLocationOnScreen(from);
        miniBalance.getLocationOnScreen(to);
        rootFrame.getLocationOnScreen(origin);
        float sx=from[0]-origin[0]+source.getWidth()/2f;
        float sy=from[1]-origin[1]+source.getHeight()/2f;
        float tx=to[0]-origin[0]+miniBalance.getWidth()/2f;
        float ty=to[1]-origin[1]+miniBalance.getHeight()/2f;
        source.setEnabled(false);
        flight.launch(sx,sy,tx,ty,()->{
            rewarding=false;
            long newTotal=store.balance();
            displayedCents=newTotal;
            miniBalance.setText(money(newTotal));
            totalView.roll(newTotal);
            // One physical event: coin arrives -> diffuse water ripples,
            // amount pill depresses then gently overshoots its resting size.
            impact.burst(tx,ty,miniBalance.getWidth(),miniBalance.getHeight());
            miniBalance.performHapticFeedback(HapticFeedbackConstants.CLOCK_TICK);
            miniBalance.animate().cancel();
            miniBalance.setScaleX(1f);
            miniBalance.setScaleY(1f);
            miniBalance.animate().scaleX(.945f).scaleY(.91f).setDuration(105)
                .setInterpolator(new DecelerateInterpolator(1.35f))
                .withEndAction(()->miniBalance.animate()
                    .scaleX(1f).scaleY(1f).setDuration(410)
                    .setInterpolator(new OvershootInterpolator(1.12f)).start())
                .start();
            // The large ledger settles with the same subtle liquid inertia.
            balanceGlass.animate().cancel();
            balanceGlass.setScaleX(.988f);
            balanceGlass.setScaleY(.985f);
            balanceGlass.animate().scaleX(1f).scaleY(1f).setDuration(440)
                .setInterpolator(new OvershootInterpolator(.64f)).start();
            renderRewardList();
        });
    }


    /**
     * Settings-only floating glass orb, above the bottom rubber Tab.
     * It is a genuine QWEA0 Clear lens against the existing moving backdrop,
     * never a new solid colored drawable.
     */
    private void installCreateOrb(){
        createPlus=text("＋",31,0xffF5E6C4,true);
        createPlus.setGravity(Gravity.CENTER);
        createPlus.setMinWidth(d(58));
        createPlus.setMinHeight(d(58));
        createPlus.setContentDescription("新建奖励任务");
        createOrb=GlassMaterial.pill(this,blurTarget,createPlus,30);
        FrameLayout.LayoutParams params=fp(58,58,Gravity.RIGHT|Gravity.BOTTOM);
        params.rightMargin=d(25);
        // Floating over settings content, 16dp above the 86dp nav area.
        params.bottomMargin=d(104);
        rootFrame.addView(createOrb,params);
        createOrb.setElevation(d(14));
        createOrb.setVisibility(View.GONE);
        createOrb.setAlpha(0f);
        touch(createOrb);
        createOrb.setContentDescription("新建奖励任务");
        createOrb.setOnClickListener(v->openFromOrb());
        touch(createPlus);
        createPlus.setOnClickListener(v->openFromOrb());
    }

    private void showCreateOrb(boolean visible){
        if(createOrb==null)return;
        createOrb.animate().cancel();
        if(visible){
            createOrb.setVisibility(View.VISIBLE);
            if(!android.animation.ValueAnimator.areAnimatorsEnabled()){
                createOrb.setTranslationY(0);
                createOrb.setScaleX(1);createOrb.setScaleY(1);createOrb.setAlpha(1);
                return;
            }
            createOrb.setTranslationY(d(16));
            createOrb.setScaleX(.77f);createOrb.setScaleY(.77f);
            createOrb.setAlpha(0f);
            createOrb.animate().translationY(0).scaleX(1).scaleY(1).alpha(1f)
                .setDuration(380).setInterpolator(new OvershootInterpolator(.83f)).start();
        }else{
            if(!android.animation.ValueAnimator.areAnimatorsEnabled()){
                createOrb.setVisibility(View.GONE);
                createOrb.setAlpha(0);return;
            }
            createOrb.animate().alpha(0).scaleX(.83f).scaleY(.83f)
                .translationY(d(14)).setDuration(185)
                .withEndAction(()->{if(currentTab!=1)createOrb.setVisibility(View.GONE);}).start();
        }
    }

    private void openFromOrb(){
        if(createOpening||currentTab!=1)return;
        if(store.isReadOnly()){
            Toast.makeText(this,"本地数据受保护，暂不能创建任务",Toast.LENGTH_SHORT).show();
            return;
        }
        createOpening=true;
        createPlus.performHapticFeedback(HapticFeedbackConstants.VIRTUAL_KEY);
        createPlus.animate().cancel();
        createPlus.animate().rotation(135f).scaleX(.88f).scaleY(.88f)
            .setDuration(370).setInterpolator(new OvershootInterpolator(.56f)).start();
        // Rotate the glass + first; then hand off to the native bottom-sheet.
        createPlus.postDelayed(()->{
            if(createOpening&&currentTab==1)openEditor(null);
            else resetCreateOrb();
        },140);
    }

    private void resetCreateOrb(){
        createOpening=false;
        if(createPlus==null)return;
        createPlus.animate().cancel();
        createPlus.animate().rotation(0f).scaleX(1f).scaleY(1f)
            .setDuration(350).setInterpolator(new OvershootInterpolator(.56f)).start();
    }

    private void switchTab(int index) {
        if(index==currentTab)return;
        currentTab=index;
        if(index!=1&&createOpening)resetCreateOrb();
        showCreateOrb(index==1);
        View shown=index==0?homeScroll:settingsScroll;
        View hidden=index==0?settingsScroll:homeScroll;
        hidden.animate().cancel();shown.animate().cancel();
        if(!android.animation.ValueAnimator.areAnimatorsEnabled()) {
            hidden.setVisibility(View.GONE);shown.setVisibility(View.VISIBLE);
            shown.setAlpha(1);shown.setTranslationX(0);return;
        }
        float travel=d(22)*(index==0?-1:1);
        shown.setVisibility(View.VISIBLE);
        shown.setTranslationX(travel);shown.setAlpha(0.35f);
        shown.animate().translationX(0).alpha(1).setDuration(370)
            .setInterpolator(new DecelerateInterpolator(1.6f)).start();
        hidden.animate().translationX(-travel*.4f).alpha(0).setDuration(230)
            .withEndAction(()->{if(hidden!=(currentTab==0?homeScroll:settingsScroll)){
                hidden.setVisibility(View.GONE);hidden.setAlpha(1);hidden.setTranslationX(0);
            }}).start();
    }



    private TextView formLabel(String label) {
        TextView t=text(label,12.5f,0xffB4AEA3,true);
        return t;
    }
    private EditText input(String hint,String value,int inputType) {
        EditText e=new EditText(this);
        e.setSingleLine(true);
        e.setText(value);e.setSelection(e.getText().length());
        e.setHint(hint);e.setHintTextColor(0xff736F69);
        e.setTextColor(INK);e.setTextSize(16);
        e.setInputType(inputType);
        e.setPadding(d(15),0,d(15),0);
        e.setBackground(shape(0xff34413D,15,0x776C7E72));
        return e;
    }

    private void openEditor(RewardStore.Task previous) {
        if(store.isReadOnly()){Toast.makeText(this,"本地数据已保护，不能修改",Toast.LENGTH_SHORT).show();return;}
        Dialog sheet=new Dialog(this,R.style.RewardSheet);
        // Spinning + returns to its resting orientation on save, cancel,
        // Android back, or tapping outside of the sheet.
        if(previous==null)sheet.setOnDismissListener(dialog->resetCreateOrb());
        LinearLayout content=column();
        content.setPadding(d(24),d(27),d(24),d(30));
        content.setBackground(shape(0xff22302C,27,0xff758477));
        String titleText=previous==null?"新增奖励任务":"编辑奖励任务";
        TextView title=text(titleText,22,INK,true);
        content.addView(title,lp(-1,42));

        LinearLayout.LayoutParams nlabel=lp(-1,24);nlabel.topMargin=d(17);
        content.addView(formLabel("任务名称"),nlabel);
        EditText name=input("例如：每天阅读 30 分钟",previous==null?"":previous.title,InputType.TYPE_CLASS_TEXT|InputType.TYPE_TEXT_FLAG_CAP_SENTENCES);
        content.addView(name,lp(-1,51));

        LinearLayout.LayoutParams alabel=lp(-1,24);alabel.topMargin=d(17);
        content.addView(formLabel("奖励金额（元）"),alabel);
        EditText amount=input("5.00",previous==null?"":String.format(Locale.US,"%.2f",previous.cents/100.0),
            InputType.TYPE_CLASS_NUMBER|InputType.TYPE_NUMBER_FLAG_DECIMAL);
        content.addView(amount,lp(-1,51));

        LinearLayout.LayoutParams flabel=lp(-1,24);flabel.topMargin=d(17);
        content.addView(formLabel("奖励周期"),flabel);
        final String[] cadence={previous==null?RewardStore.DAILY:previous.cadence};
        MotionViews.JellyCadence segment=new MotionViews.JellyCadence(
            this,RewardStore.WEEKLY.equals(cadence[0])?1:0,
            index->cadence[0]=index==0?RewardStore.DAILY:RewardStore.WEEKLY);
        content.addView(segment,lp(-1,56));

        TextView error=text("",12,0xffFFAA97,false);
        error.setVisibility(View.GONE);
        LinearLayout.LayoutParams el=lp(-1,-2);el.topMargin=d(9);
        content.addView(error,el);

        TextView save=text(previous==null?"创建任务":"保存修改",16,BG,true);
        save.setGravity(Gravity.CENTER);save.setBackground(shape(GOLD,17,0));
        LinearLayout.LayoutParams sl=lp(-1,53);sl.topMargin=d(24);
        content.addView(save,sl);touch(save);
        save.setOnClickListener(v->{
            String n=name.getText().toString().trim();
            String a=amount.getText().toString().trim();
            try {
                if(n.isEmpty()||n.length()>36)throw new IllegalArgumentException("名称请填写 1–36 个字符");
                BigDecimal precise=new BigDecimal(a).movePointRight(2)
                    .setScale(0,RoundingMode.UNNECESSARY);
                long cents=precise.longValueExact();
                if(cents<1||cents>99999999)throw new IllegalArgumentException("金额需在 0.01 至 999999.99 元之间");
                if(!store.putTask(previous==null?"":previous.id,n,cadence[0],cents))
                    throw new IllegalArgumentException("保存失败，请检查手机存储空间");
                sheet.dismiss();renderRewardList();renderSettingsList();
            }catch(IllegalArgumentException ex){
                error.setText(ex.getMessage()==null?"请填写正确的名称与金额":ex.getMessage());
                error.setVisibility(View.VISIBLE);
            }catch(ArithmeticException ex){
                error.setText("金额最多两位小数");error.setVisibility(View.VISIBLE);
            }
        });
        showBottomSheet(sheet,content);
    }

    private void showBottomSheet(Dialog dialog,View content) {
        dialog.setContentView(content);
        Window window=dialog.getWindow();
        if(window!=null){
            window.setBackgroundDrawableResource(android.R.color.transparent);
            window.addFlags(WindowManager.LayoutParams.FLAG_DIM_BEHIND);
            window.setDimAmount(.68f);
        }
        dialog.show();
        window=dialog.getWindow();
        if(window!=null){
            window.setLayout(getResources().getDisplayMetrics().widthPixels-d(16),-2);
            window.setGravity(Gravity.BOTTOM);
            window.setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE);
        }
        if(android.animation.ValueAnimator.areAnimatorsEnabled()){
            content.setTranslationY(d(55));content.setAlpha(.5f);
            content.animate().translationY(0).alpha(1).setDuration(410)
                .setInterpolator(new OvershootInterpolator(.45f)).start();
        }
    }

    // The v1.7.0 home screen and optical rendering are untouched.
    // Only receipt rows reuse the same FMV rubber resistance and upper-right
    // deletion flight as the existing task management list.
    private void renderHistoryRows(LinearLayout content,TextView summary,ScrollView sc){
        int oldScroll=sc.getScrollY();
        Map<String,Float> oldY=new HashMap<>();
        for(int i=0;i<content.getChildCount();i++){
            View v=content.getChildAt(i);
            if(v.getTag() instanceof String)oldY.put((String)v.getTag(),v.getY());
        }
        content.removeAllViews();
        summary.setText(money(store.balance())+"  ·  共 "+store.count()+" 次");
        List<RewardStore.Receipt> entries=store.receipts();
        if(entries.isEmpty()){
            TextView empty=text("尚无奖励记录。第一次领取后会出现在这里。",13,MUTED,false);
            empty.setGravity(Gravity.CENTER);
            empty.setPadding(0,d(37),0,d(40));
            content.addView(empty,lp(-1,-2));
        }else{
            SimpleDateFormat fmt=new SimpleDateFormat("MM.dd  HH:mm",Locale.CHINA);
            for(int i=entries.size()-1;i>=0;i--){
                RewardStore.Receipt receipt=entries.get(i);
                GestureTaskRow row=new GestureTaskRow(this,blurTarget);
                row.setDeletionOnly(true);
                row.setTag(receipt.id);
                row.setContentDescription(receipt.title+"，"+money(receipt.cents)+"，深度左滑后松手删除该奖励记录");
                LinearLayout labels=column();
                labels.setGravity(Gravity.CENTER_VERTICAL);
                TextView title=text(receipt.title,14.5f,INK,true);
                title.setMaxLines(1);
                title.setEllipsize(android.text.TextUtils.TruncateAt.END);
                labels.addView(title,lp(-1,25));
                labels.addView(text(fmt.format(new Date(receipt.timestamp)),11.5f,MUTED,false),lp(-1,23));
                row.surface.addView(labels,new LinearLayout.LayoutParams(0,-2,1));
                TextView amount=text("+"+money(receipt.cents),14,GOLD,true);
                row.surface.addView(amount,lp(-2,-1));
                row.onDelete=()->{
                    // Existing RewardStore.undo() atomically removes a receipt
                    // by id and rolls it back if saving fails. Task stays intact.
                    if(!store.undo(receipt)){
                        Toast.makeText(this,"删除失败，原有奖励记录已保留",Toast.LENGTH_SHORT).show();
                        renderHistoryRows(content,summary,sc);
                        return;
                    }
                    long newBalance=store.balance();
                    displayedCents=newBalance;
                    miniBalance.setText(money(newBalance));
                    totalView.roll(newBalance);
                    miniBalance.performHapticFeedback(HapticFeedbackConstants.CLOCK_TICK);
                    renderRewardList(); // Re-evaluate today/week claim status.
                    renderHistoryRows(content,summary,sc);
                    summary.animate().cancel();
                    summary.setScaleX(.97f);
                    summary.setScaleY(.97f);
                    summary.animate().scaleX(1).scaleY(1).setDuration(330)
                        .setInterpolator(new OvershootInterpolator(.6f)).start();
                };
                LinearLayout.LayoutParams rlp=lp(-1,-2);
                rlp.bottomMargin=d(9);
                content.addView(row,rlp);
            }
        }
        sc.post(()->sc.scrollTo(0,oldScroll));
        if(!oldY.isEmpty()&&android.animation.ValueAnimator.areAnimatorsEnabled()){
            ViewTreeObserver tree=content.getViewTreeObserver();
            tree.addOnPreDrawListener(new ViewTreeObserver.OnPreDrawListener(){
                @Override public boolean onPreDraw(){
                    if(tree.isAlive())tree.removeOnPreDrawListener(this);
                    for(int i=0;i<content.getChildCount();i++){
                        View v=content.getChildAt(i);
                        if(!(v.getTag() instanceof String))continue;
                        Float before=oldY.get((String)v.getTag());
                        if(before==null)continue;
                        float delta=before-v.getTop();
                        if(Math.abs(delta)<1f)continue;
                        v.setTranslationY(delta);
                        v.animate().translationY(0).setDuration(390)
                            .setInterpolator(new PathInterpolator(.20f,.76f,.23f,1f)).start();
                    }
                    return true;
                }
            });
        }
    }

    private void showHistory() {
        Dialog sheet=new Dialog(this,R.style.RewardSheet);
        LinearLayout shell=column();
        shell.setPadding(d(22),d(24),d(22),d(20));
        shell.setBackground(shape(0xff22302C,27,0xff758477));
        LinearLayout heading=row();
        TextView title=text("奖励账本",21,INK,true);
        heading.addView(title,new LinearLayout.LayoutParams(0,d(42),1));
        TextView close=iconButton("×");
        heading.addView(close,lp(40,40));
        close.setOnClickListener(v->sheet.dismiss());
        shell.addView(heading,lp(-1,43));
        TextView summary=text("",14,GOLD,true);
        LinearLayout.LayoutParams sm=lp(-1,37);
        sm.bottomMargin=d(6);
        shell.addView(summary,sm);
        TextView help=text("左滑有阻力 · 深滑后松手删除",11.5f,MUTED,false);
        shell.addView(help,lp(-1,27));
        ScrollView listScroll=scroll();
        LinearLayout content=column();
        listScroll.addView(content,new ScrollView.LayoutParams(-1,-2));
        shell.addView(listScroll,lp(-1,Math.min(438,Math.max(100,store.count()*90))));
        renderHistoryRows(content,summary,listScroll);
        showBottomSheet(sheet,shell);
    }

    @Override protected void onResume() {
        super.onResume();
        if(taskList!=null && !rewarding)renderRewardList();
    }

    @Override public void onBackPressed() {
        if(currentTab==1){tabs.select(0);return;}
        super.onBackPressed();
    }
}
