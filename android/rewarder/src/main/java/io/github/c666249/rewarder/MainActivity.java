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
    private LinearLayout taskList, settingsList, balancePanel;
    private ScrollView homeScroll, settingsScroll;
    private TextView miniBalance, taskCount, settingsCount;
    private MotionViews.RollingAmount totalView;
    private MotionViews.RubberTabs tabs;
    private MotionViews.GoldFlight flight;
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
        tabArea.addView(tabs,t);

        flight=new MotionViews.GoldFlight(this);
        rootFrame.addView(flight,fp(-1,-1,Gravity.FILL));
        renderRewardList();
        renderSettingsList();
        if(store.isReadOnly())Toast.makeText(this,"本地数据无法读取，已保护原始数据并禁用修改",Toast.LENGTH_LONG).show();
    }

    private View createHeader() {
        LinearLayout bar=row();bar.setPadding(d(24),d(10),d(24),0);
        TextView emblem=text("✳",23,GOLD,true);
        emblem.setGravity(Gravity.CENTER);
        emblem.setBackground(shape(0xff27231D,13,0xff584B38));
        bar.addView(emblem,lp(39,39));
        TextView name=text("拾光",17,INK,true);
        LinearLayout.LayoutParams nm=lp(-2,39);nm.leftMargin=d(11);
        bar.addView(name,nm);
        View spacer=new View(this);bar.addView(spacer,new LinearLayout.LayoutParams(0,1,1));
        miniBalance=text(money(displayedCents),14,GOLD,true);
        miniBalance.setGravity(Gravity.CENTER);
        miniBalance.setPadding(d(15),0,d(15),0);
        miniBalance.setBackground(shape(0xff24211C,20,0xff484032));
        miniBalance.setContentDescription("查看累计奖励流水");
        touch(miniBalance);
        miniBalance.setOnClickListener(v->showHistory());
        bar.addView(miniBalance,lp(-2,39));
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
        body.setPadding(d(25),d(21),d(25),d(30));
        sc.addView(body,new ScrollView.LayoutParams(-1,-2));

        TextView kicker=text("A MOMENT FOR YOURSELF",10.5f,GOLD,true);
        kicker.setLetterSpacing(.20f);
        body.addView(kicker,lp(-1,21));

        TextView headline=text("每次坚持，都值得。",27,INK,true);
        LinearLayout.LayoutParams hl=lp(-1,49);hl.topMargin=d(5);
        body.addView(headline,hl);

        TextView subtitle=text("完成一件小事，给自己一点奖励。",13.5f,MUTED,false);
        body.addView(subtitle,lp(-1,29));

        balancePanel=column();
        balancePanel.setPadding(d(23),d(20),d(20),d(17));
        balancePanel.setBackground(shape(0xff1C1B1A,25,0xff3B352D));
        LinearLayout.LayoutParams panel=lp(-1,-2);panel.topMargin=d(26);
        body.addView(balancePanel,panel);

        LinearLayout brow=row();
        TextView balanceTitle=text("累计奖励",13,0xffC4BBAE,false);
        brow.addView(balanceTitle,new LinearLayout.LayoutParams(0,d(23),1));
        TextView spark=text("✦",22,GOLD,true);
        spark.setGravity(Gravity.CENTER);
        brow.addView(spark,lp(30,28));
        balancePanel.addView(brow,lp(-1,28));

        totalView=new MotionViews.RollingAmount(this);
        totalView.initialize(displayedCents);
        LinearLayout.LayoutParams totalParams=lp(-1,67);
        totalParams.topMargin=d(6);
        balancePanel.addView(totalView,totalParams);

        TextView caption=text("一点一点，积少成多。",12,0xff958D82,false);
        LinearLayout.LayoutParams cp=lp(-1,27);
        cp.topMargin=d(1);balancePanel.addView(caption,cp);

        LinearLayout section=row();
        LinearLayout.LayoutParams sl=lp(-1,62);sl.topMargin=d(28);
        body.addView(section,sl);
        TextView listTitle=text("我的奖励任务",18,INK,true);
        section.addView(listTitle,new LinearLayout.LayoutParams(0,-1,1));
        taskCount=text("",12,MUTED,false);
        section.addView(taskCount,lp(-2,-1));

        taskList=column();
        body.addView(taskList,lp(-1,-2));
        return sc;
    }

    private ScrollView makeSettings() {
        ScrollView sc=scroll();
        LinearLayout body=column();
        body.setPadding(d(25),d(23),d(25),d(28));
        sc.addView(body,new ScrollView.LayoutParams(-1,-2));

        TextView kicker=text("YOUR OWN RULES",10.5f,GOLD,true);
        kicker.setLetterSpacing(.20f);
        body.addView(kicker,lp(-1,20));

        TextView headline=text("奖励，由你定义。",28,INK,true);
        LinearLayout.LayoutParams hp=lp(-1,55);hp.topMargin=d(5);
        body.addView(headline,hp);
        TextView sub=text("只保留真正想坚持的事。",13.5f,MUTED,false);
        body.addView(sub,lp(-1,29));

        TextView add=text("＋  添加奖励任务",16,BG,true);
        add.setGravity(Gravity.CENTER);
        add.setBackground(shape(GOLD,20,0));
        LinearLayout.LayoutParams addParams=lp(-1,54);addParams.topMargin=d(32);
        body.addView(add,addParams);
        touch(add);add.setOnClickListener(v->openEditor(null));

        LinearLayout section=row();
        LinearLayout.LayoutParams sec=lp(-1,65);sec.topMargin=d(21);
        body.addView(section,sec);
        TextView title=text("任务管理",18,INK,true);
        section.addView(title,new LinearLayout.LayoutParams(0,-1,1));
        settingsCount=text("",12,MUTED,false);
        section.addView(settingsCount,lp(-2,-1));

        settingsList=column();
        body.addView(settingsList,lp(-1,-2));

        TextView foot=text("所有奖励仅记录在本机，删除任务不会清空已获得的金额。",12,0xff75716C,false);
        foot.setLineSpacing(d(3),1f);
        LinearLayout.LayoutParams fp=lp(-1,-2);fp.topMargin=d(29);
        body.addView(foot,fp);
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
            empty.setPadding(d(20),d(27),d(20),d(27));
            empty.setBackground(shape(SURFACE,23,LINE));
            TextView glyph=text("✧",32,GOLD,true);glyph.setGravity(Gravity.CENTER);
            empty.addView(glyph,lp(-1,45));
            TextView note=text("还没有设定奖励",16,INK,true);note.setGravity(Gravity.CENTER);
            empty.addView(note,lp(-1,32));
            TextView hint=text("先去设置一个想坚持的目标吧。",12.5f,MUTED,false);
            hint.setGravity(Gravity.CENTER);
            empty.addView(hint,lp(-1,31));
            TextView go=text("前往设置  ↗",13.5f,GOLD,true);
            go.setGravity(Gravity.CENTER);touch(go);
            go.setOnClickListener(v->tabs.select(1));
            empty.addView(go,lp(-1,46));
            taskList.addView(empty,lp(-1,-2));return;
        }
        for(int i=0;i<all.size();i++) {
            RewardStore.Task task=all.get(i);
            boolean claimed=store.alreadyClaimed(task);
            LinearLayout item=row();
            item.setMinimumHeight(d(82));
            LinearLayout content=column();
            content.setGravity(Gravity.CENTER_VERTICAL);
            TextView name=text(task.title,16.5f,INK,true);
            name.setMaxLines(2);
            name.setEllipsize(android.text.TextUtils.TruncateAt.END);
            content.addView(name,lp(-1,-2));
            TextView meta=text((RewardStore.WEEKLY.equals(task.cadence)?"每周":"每天")
                +"  ·  "+money(task.cents),12.5f,MUTED,false);
            LinearLayout.LayoutParams mp=lp(-1,25);mp.topMargin=d(5);
            content.addView(meta,mp);
            item.addView(content,new LinearLayout.LayoutParams(0,-2,1));
            TextView claim=text(claimed?"✓ 已领取":"领取",13.5f,claimed?0xff8B877F:BG,true);
            claim.setGravity(Gravity.CENTER);
            claim.setBackground(shape(claimed?SURFACE2:GOLD,18,claimed?LINE:0));
            LinearLayout.LayoutParams cl=lp(claimed?88:75,41);cl.leftMargin=d(10);
            item.addView(claim,cl);
            touch(claim);
            claim.setEnabled(!claimed&&!rewarding&&!store.isReadOnly());
            claim.setContentDescription(claimed?"当前周期已领取 "+task.title:"领取 "+task.title+" 奖励 "+money(task.cents));
            claim.setOnClickListener(v->collect(task,claim));
            taskList.addView(item,lp(-1,-2));
            if(i<all.size()-1)taskList.addView(line(),lp(-1,1));
        }
    }

    private void renderSettingsList() {
        if(settingsList==null)return;
        int restore=settingsScroll.getScrollY();
        settingsList.removeAllViews();
        List<RewardStore.Task> tasks=store.tasks();
        settingsCount.setText(tasks.size()+" 项");
        if(tasks.isEmpty()) {
            TextView hint=text("暂时没有任务。点击上方按钮创建第一项。",13,MUTED,false);
            hint.setGravity(Gravity.CENTER);
            hint.setPadding(d(13),d(30),d(13),d(30));
            hint.setBackground(shape(SURFACE,19,LINE));
            settingsList.addView(hint,lp(-1,-2));
        }
        for(int i=0;i<tasks.size();i++) {
            RewardStore.Task task=tasks.get(i);
            LinearLayout item=row();item.setMinimumHeight(d(76));
            LinearLayout labels=column();labels.setGravity(Gravity.CENTER_VERTICAL);
            TextView title=text(task.title,16,INK,true);
            title.setMaxLines(2);
            title.setEllipsize(android.text.TextUtils.TruncateAt.END);
            labels.addView(title,lp(-1,-2));
            TextView hint=text((RewardStore.WEEKLY.equals(task.cadence)?"每周":"每天")
                +"  /  "+money(task.cents),12,MUTED,false);
            LinearLayout.LayoutParams hp=lp(-1,27);hp.topMargin=d(5);
            labels.addView(hint,hp);
            item.addView(labels,new LinearLayout.LayoutParams(0,-2,1));
            TextView edit=iconButton("✎");
            edit.setContentDescription("编辑 "+task.title);
            edit.setOnClickListener(v->openEditor(task));
            LinearLayout.LayoutParams ep=lp(43,43);ep.leftMargin=d(5);
            item.addView(edit,ep);
            TextView remove=iconButton("×");
            remove.setContentDescription("删除 "+task.title);
            remove.setOnClickListener(v->confirmDelete(task));
            LinearLayout.LayoutParams rp=lp(43,43);rp.leftMargin=d(5);
            item.addView(remove,rp);
            settingsList.addView(item,lp(-1,-2));
            if(i<tasks.size()-1)settingsList.addView(line(),lp(-1,1));
        }
        settingsScroll.post(()->settingsScroll.scrollTo(0,restore));
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
            miniBalance.animate().cancel();
            miniBalance.setScaleX(1.12f);miniBalance.setScaleY(1.12f);
            miniBalance.animate().scaleX(1).scaleY(1).setDuration(420)
                .setInterpolator(new OvershootInterpolator(.58f)).start();
            renderRewardList();
        });
    }

    private void switchTab(int index) {
        if(index==currentTab)return;
        currentTab=index;
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

    private void confirmDelete(RewardStore.Task task) {
        Dialog sheet=new Dialog(this,R.style.RewardSheet);
        LinearLayout body=column();
        body.setPadding(d(24),d(27),d(24),d(28));
        body.setBackground(shape(0xff202022,27,0xff49443C));
        TextView title=text("删除这项任务？",21,INK,true);
        body.addView(title,lp(-1,43));
        TextView message=text("「"+task.title+"」将不再显示。已经获得的奖励金额和历史记录会完整保留。",13.5f,MUTED,false);
        message.setLineSpacing(d(5),1);
        LinearLayout.LayoutParams m=lp(-1,-2);m.bottomMargin=d(27);
        body.addView(message,m);
        LinearLayout actions=row();
        TextView cancel=text("取消",15,INK,true);
        cancel.setGravity(Gravity.CENTER);
        cancel.setBackground(shape(SURFACE2,16,0));
        actions.addView(cancel,new LinearLayout.LayoutParams(0,d(52),1));
        touch(cancel);cancel.setOnClickListener(v->sheet.dismiss());
        TextView remove=text("删除任务",15,0xffFFE1DA,true);
        remove.setGravity(Gravity.CENTER);
        remove.setBackground(shape(0xff74443E,16,0));
        LinearLayout.LayoutParams rp=new LinearLayout.LayoutParams(0,d(52),1);rp.leftMargin=d(10);
        actions.addView(remove,rp);touch(remove);
        remove.setOnClickListener(v->{
            if(store.deleteTask(task)){sheet.dismiss();renderRewardList();renderSettingsList();}
            else Toast.makeText(this,"删除失败",Toast.LENGTH_SHORT).show();
        });
        body.addView(actions,lp(-1,-2));
        showBottomSheet(sheet,body);
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
        e.setBackground(shape(SURFACE2,15,0));
        return e;
    }

    private void openEditor(RewardStore.Task previous) {
        if(store.isReadOnly()){Toast.makeText(this,"本地数据已保护，不能修改",Toast.LENGTH_SHORT).show();return;}
        Dialog sheet=new Dialog(this,R.style.RewardSheet);
        LinearLayout content=column();
        content.setPadding(d(24),d(27),d(24),d(30));
        content.setBackground(shape(0xff202022,27,0xff49443C));
        String titleText=previous==null?"新增奖励任务":"编辑奖励任务";
        TextView title=text(titleText,22,INK,true);
        content.addView(title,lp(-1,42));
        TextView desc=text("让坚持成为一件值得期待的小事。",12.5f,MUTED,false);
        content.addView(desc,lp(-1,28));

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
        LinearLayout segment=row();
        segment.setPadding(d(4),d(4),d(4),d(4));
        segment.setBackground(shape(0xff161719,18,0));
        content.addView(segment,lp(-1,56));
        final String[] cadence={previous==null?RewardStore.DAILY:previous.cadence};
        TextView daily=text("每天",14,INK,true),weekly=text("每周",14,INK,true);
        daily.setGravity(Gravity.CENTER);weekly.setGravity(Gravity.CENTER);
        segment.addView(daily,new LinearLayout.LayoutParams(0,-1,1));
        segment.addView(weekly,new LinearLayout.LayoutParams(0,-1,1));
        Runnable updateChoice=()->{
            daily.setBackground(shape(RewardStore.DAILY.equals(cadence[0])?0xff3F382D:Color.TRANSPARENT,15,0));
            weekly.setBackground(shape(RewardStore.WEEKLY.equals(cadence[0])?0xff3F382D:Color.TRANSPARENT,15,0));
            daily.setTextColor(RewardStore.DAILY.equals(cadence[0])?GOLD:MUTED);
            weekly.setTextColor(RewardStore.WEEKLY.equals(cadence[0])?GOLD:MUTED);
        };
        touch(daily);touch(weekly);
        daily.setOnClickListener(v->{cadence[0]=RewardStore.DAILY;updateChoice.run();});
        weekly.setOnClickListener(v->{cadence[0]=RewardStore.WEEKLY;updateChoice.run();});
        updateChoice.run();

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

    private void showHistory() {
        Dialog sheet=new Dialog(this,R.style.RewardSheet);
        LinearLayout shell=column();
        shell.setPadding(d(22),d(24),d(22),d(20));
        shell.setBackground(shape(0xff202022,27,0xff49443C));
        LinearLayout heading=row();
        TextView title=text("奖励账本",21,INK,true);
        heading.addView(title,new LinearLayout.LayoutParams(0,d(42),1));
        TextView close=iconButton("×");
        heading.addView(close,lp(40,40));close.setOnClickListener(v->sheet.dismiss());
        shell.addView(heading,lp(-1,43));
        TextView summary=text(money(store.balance())+"  ·  共 "+store.count()+" 次",14,GOLD,true);
        LinearLayout.LayoutParams sm=lp(-1,37);sm.bottomMargin=d(8);
        shell.addView(summary,sm);
        ScrollView listScroll=scroll();
        LinearLayout content=column();
        List<RewardStore.Receipt> items=store.receipts();
        if(items.isEmpty()){
            TextView empty=text("尚无奖励记录。第一次领取后会出现在这里。",13,MUTED,false);
            empty.setGravity(Gravity.CENTER);empty.setPadding(0,d(40),0,d(42));
            content.addView(empty,lp(-1,-2));
        }else{
            SimpleDateFormat fmt=new SimpleDateFormat("MM.dd  HH:mm",Locale.CHINA);
            for(int i=items.size()-1;i>=0;i--){
                RewardStore.Receipt r=items.get(i);
                LinearLayout item=row();item.setMinimumHeight(d(64));
                LinearLayout labels=column();labels.setGravity(Gravity.CENTER_VERTICAL);
                TextView n=text(r.title,14.5f,INK,true);
                n.setMaxLines(1);n.setEllipsize(android.text.TextUtils.TruncateAt.END);
                labels.addView(n,lp(-1,25));
                TextView time=text(fmt.format(new Date(r.timestamp)),11.5f,MUTED,false);
                labels.addView(time,lp(-1,23));
                item.addView(labels,new LinearLayout.LayoutParams(0,-2,1));
                TextView amount=text("+"+money(r.cents),14,GOLD,true);
                item.addView(amount,lp(-2,-1));
                content.addView(item,lp(-1,-2));
                if(i>0)content.addView(line(),lp(-1,1));
            }
        }
        listScroll.addView(content,new ScrollView.LayoutParams(-1,-2));
        shell.addView(listScroll,lp(-1,Math.min(438,100+items.size()*65)));
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
