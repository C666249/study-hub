package io.github.c666249.trafficpulse;

import android.Manifest;
import android.app.Activity;
import android.content.*;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.net.*;
import android.os.*;
import android.provider.Settings;
import android.view.*;
import android.widget.*;
import android.text.InputType;
import android.content.res.ColorStateList;
import java.util.Locale;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/** Polished, fully native on-device bandwidth dashboard, without Internet permission. */
public final class MainActivity extends Activity {
    private static final int BACK=0xFF0D1520, CARD=0xFF16222F, BORDER=0xFF263A48;
    private static final int MINT=0xFF7DEFCF, VIOLET=0xFFB9AAFF, MUTED=0xFF98AABA, WHITE=0xFFECF7F6;
    private final Handler ui=new Handler(Looper.getMainLooper());
    private TextView down,up,sessionDown,sessionUp,network,activity,action,overlay,foot;
    private SpeedGraph graph;
    private TextView quotaRemaining, quotaDetail, quotaStatus;
    private ProgressBar quotaProgress;
    private final ExecutorService quotaWorker=Executors.newSingleThreadExecutor();
    private volatile boolean quotaBusy=false;
    private long lastQuotaQueryAt=0;
    private boolean pendingOverlay=false;
    private final Runnable refresh=new Runnable(){
        @Override public void run(){drawLive();ui.postDelayed(this,1000);}
    };
    private int dp(float d){return Math.round(d*getResources().getDisplayMetrics().density);}
    private GradientDrawable round(int color,int radius,int stroke){
        GradientDrawable d=new GradientDrawable();
        d.setColor(color);d.setCornerRadius(dp(radius));
        if(stroke!=0)d.setStroke(dp(1),stroke);
        return d;
    }
    private TextView label(String s,float size,int color,boolean bold){
        TextView t=new TextView(this);
        t.setText(s);t.setTextSize(size);t.setTextColor(color);
        t.setIncludeFontPadding(false);
        if(bold)t.setTypeface(Typeface.DEFAULT,Typeface.BOLD);
        return t;
    }
    private LinearLayout column(){
        LinearLayout c=new LinearLayout(this);c.setOrientation(LinearLayout.VERTICAL);return c;
    }
    private LinearLayout row(){
        LinearLayout r=new LinearLayout(this);r.setOrientation(LinearLayout.HORIZONTAL);return r;
    }
    private void gap(LinearLayout view,int height){
        View v=new View(this);view.addView(v,new LinearLayout.LayoutParams(1,dp(height)));
    }
    private TextView speedCard(String title,int accent,LinearLayout target){
        LinearLayout card=column();
        card.setPadding(dp(18),dp(19),dp(16),dp(18));
        card.setBackground(round(CARD,21,BORDER));
        LinearLayout.LayoutParams lp=new LinearLayout.LayoutParams(0,-2,1);
        target.addView(card,lp);
        TextView heading=label(title,13,MUTED,false);card.addView(heading);
        TextView value=label("0 B/s",23,accent,true);
        value.setPadding(0,dp(14),0,dp(3));card.addView(value);
        card.addView(label("REAL-TIME",10,MUTED,true));
        return value;
    }
    private void configureClick(TextView t,int background){
        t.setGravity(Gravity.CENTER);
        t.setBackground(round(background,16,0));
        t.setPadding(dp(14),dp(17),dp(14),dp(17));
        t.setTypeface(Typeface.DEFAULT,Typeface.BOLD);
        t.setTextSize(15);
    }
    @Override public void onCreate(Bundle saved){
        super.onCreate(saved);
        getWindow().setStatusBarColor(BACK);getWindow().setNavigationBarColor(BACK);
        ScrollView scroll=new ScrollView(this);
        scroll.setFillViewport(true);scroll.setClipToPadding(false);
        scroll.setVerticalScrollBarEnabled(false);scroll.setBackgroundColor(BACK);
        setContentView(scroll);
        LinearLayout root=column();
        root.setPadding(dp(22),dp(32),dp(22),dp(26));
        scroll.addView(root,new ScrollView.LayoutParams(-1,-2));

        TextView eyebrow=label("NETWORK INTELLIGENCE   /   PULSE",11,MINT,true);
        root.addView(eyebrow);gap(root,13);
        root.addView(label("流速 Pulse",31,WHITE,true));gap(root,9);
        root.addView(label("每秒更新 · 本机统计 · 无需联网权限",13,MUTED,false));
        gap(root,25);

        LinearLayout top=row();
        top.setGravity(Gravity.CENTER_VERTICAL);
        root.addView(top);
        network=label("检测网络中",13,MINT,true);
        network.setBackground(round(0xFF18372F,12,0));
        network.setPadding(dp(12),dp(9),dp(12),dp(9));
        top.addView(network);
        View spring=new View(this);top.addView(spring,new LinearLayout.LayoutParams(0,1,1));
        activity=label("● 已暂停",13,MUTED,true);
        top.addView(activity);gap(root,16);

        LinearLayout rates=row();
        root.addView(rates,new LinearLayout.LayoutParams(-1,-2));
        down=speedCard("↓ 下载 DOWNLOAD",MINT,rates);
        View space=new View(this);rates.addView(space,new LinearLayout.LayoutParams(dp(11),1));
        up=speedCard("↑ 上传 UPLOAD",VIOLET,rates);
        gap(root,16);

        LinearLayout graphCard=column();
        graphCard.setPadding(dp(17),dp(19),dp(17),dp(15));
        graphCard.setBackground(round(CARD,21,BORDER));
        root.addView(graphCard,new LinearLayout.LayoutParams(-1,-2));
        LinearLayout graphHead=row();graphHead.setGravity(Gravity.CENTER_VERTICAL);graphCard.addView(graphHead);
        graphHead.addView(label("实时速度曲线",17,WHITE,true));
        View blank=new View(this);graphHead.addView(blank,new LinearLayout.LayoutParams(0,1,1));
        graphHead.addView(label("最近 60 秒",11,MUTED,false));
        gap(graphCard,15);
        graph=new SpeedGraph(this);
        graphCard.addView(graph,new LinearLayout.LayoutParams(-1,dp(160)));
        LinearLayout legends=row();legends.setGravity(Gravity.CENTER);graphCard.addView(legends);
        legends.addView(label("● 下载",12,MINT,true));
        TextView u=label("    ● 上传",12,VIOLET,true);legends.addView(u);
        gap(root,16);


        // Monthly mobile-data allowance estimate; independent of live SpeedState.
        LinearLayout quotaCard=column();
        quotaCard.setPadding(dp(19),dp(19),dp(19),dp(20));
        quotaCard.setBackground(round(CARD,21,BORDER));
        root.addView(quotaCard,new LinearLayout.LayoutParams(-1,-2));
        LinearLayout quotaHeading=row();
        quotaHeading.setGravity(Gravity.CENTER_VERTICAL);
        quotaCard.addView(quotaHeading);
        quotaHeading.addView(label("中国移动 · 套餐余量估算",16,WHITE,true));
        View titleGap=new View(this);
        quotaHeading.addView(titleGap,new LinearLayout.LayoutParams(0,1,1));
        TextView editQuota=label("设置  ›",13,MINT,true);
        editQuota.setPadding(dp(8),dp(5),dp(1),dp(5));
        quotaHeading.addView(editQuota);
        editQuota.setOnClickListener(v->editQuota());
        gap(quotaCard,14);
        quotaRemaining=label("— GB",31,MINT,true);
        quotaCard.addView(quotaRemaining);
        gap(quotaCard,11);
        quotaProgress=new ProgressBar(this,null,android.R.attr.progressBarStyleHorizontal);
        quotaProgress.setMax(1000);
        quotaProgress.setProgressTintList(ColorStateList.valueOf(MINT));
        quotaProgress.setProgressBackgroundTintList(ColorStateList.valueOf(0xFF2F4050));
        quotaCard.addView(quotaProgress,new LinearLayout.LayoutParams(-1,dp(7)));
        gap(quotaCard,12);
        quotaDetail=label("请授权读取移动网络用量",12,MUTED,false);
        quotaCard.addView(quotaDetail);
        gap(quotaCard,8);
        quotaStatus=label("读取系统网络统计历史，无需始终开启测速服务",12,MUTED,false);
        quotaStatus.setLineSpacing(dp(3),1);
        quotaCard.addView(quotaStatus);
        gap(quotaCard,12);
        TextView grant=label("授予使用情况访问权限",13,MINT,true);
        grant.setPadding(0,dp(10),0,dp(10));
        quotaCard.addView(grant);
        grant.setOnClickListener(v->openUsageAccess());
        TextView official=label("打开中国移动官方套餐余量查询",13,MUTED,true);
        official.setPadding(0,dp(9),0,dp(4));
        quotaCard.addView(official);
        official.setOnClickListener(v->{
            try {
                startActivity(new Intent(Intent.ACTION_VIEW,android.net.Uri.parse("https://touch.10086.cn/i/mobile/packremainqry.html")));
            } catch(RuntimeException ex) {
                Toast.makeText(this,"没有可用浏览器",Toast.LENGTH_SHORT).show();
            }
        });
        gap(root,16);

        LinearLayout usage=column();usage.setPadding(dp(19),dp(18),dp(19),dp(18));
        usage.setBackground(round(CARD,21,BORDER));root.addView(usage);
        usage.addView(label("本次监控累计流量",16,WHITE,true));gap(usage,14);
        LinearLayout usageRow=row();usage.addView(usageRow);
        LinearLayout rxcol=column(),txcol=column();
        usageRow.addView(rxcol,new LinearLayout.LayoutParams(0,-2,1));
        usageRow.addView(txcol,new LinearLayout.LayoutParams(0,-2,1));
        rxcol.addView(label("累计下载",12,MUTED,false));
        sessionDown=label("0 B",20,MINT,true);sessionDown.setPadding(0,dp(7),0,0);rxcol.addView(sessionDown);
        txcol.addView(label("累计上传",12,MUTED,false));
        sessionUp=label("0 B",20,VIOLET,true);sessionUp.setPadding(0,dp(7),0,0);txcol.addView(sessionUp);
        gap(root,20);

        action=label("开始实时监控",15,BACK,true);
        configureClick(action,MINT);root.addView(action,new LinearLayout.LayoutParams(-1,-2));
        action.setOnClickListener(v->toggleService());
        gap(root,10);
        overlay=label("开启桌面悬浮测速窗",15,WHITE,true);
        configureClick(overlay,0xFF28374A);
        root.addView(overlay,new LinearLayout.LayoutParams(-1,-2));
        overlay.setOnClickListener(v->toggleOverlay());
        gap(root,20);
        foot=label("说明：实时速率来自 Android TrafficStats 全设备网络计数器。\n累计数据仅计算本次监控期间的增量；不等于运营商账单流量。\nVPN、多网卡与系统统计可能产生偏差。",12,MUTED,false);
        foot.setLineSpacing(dp(4),1.0f);root.addView(foot);
        requestNoticePermission();
        drawLive();
    }
    @Override protected void onResume(){
        super.onResume();
        if(pendingOverlay && Settings.canDrawOverlays(this)){
            pendingOverlay=false;
            getSharedPreferences("settings",MODE_PRIVATE).edit().putBoolean("overlay",true).apply();
            refreshOverlayService();
        }
        ui.removeCallbacks(refresh);ui.post(refresh);
        refreshQuota(true);
    }
    @Override protected void onPause(){
        ui.removeCallbacks(refresh);
        super.onPause();
    }
    private void requestNoticePermission(){
        if(Build.VERSION.SDK_INT>=33 && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS)!=PackageManager.PERMISSION_GRANTED)
            requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS},1301);
    }
    private void toggleService(){
        SpeedState.Snapshot current=SpeedState.I.get();
        Intent intent=new Intent(this,MonitorService.class).setAction(current.running?MonitorService.STOP:MonitorService.START);
        try {
            if(!current.running && Build.VERSION.SDK_INT>=26)startForegroundService(intent);
            else startService(intent);
        } catch(RuntimeException err){
            Toast.makeText(this,"启动失败，请检查系统后台运行权限："+err.getClass().getSimpleName(),Toast.LENGTH_LONG).show();
        }
        ui.postDelayed(this::drawLive,250);
    }
    private void toggleOverlay(){
        if(!Settings.canDrawOverlays(this)){
            pendingOverlay=true;
            Toast.makeText(this,"请允许“显示在其他应用上层”，返回后自动开启悬浮窗",Toast.LENGTH_LONG).show();
            Intent intent=new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION,android.net.Uri.parse("package:"+getPackageName()));
            startActivity(intent);return;
        }
        boolean next=!getSharedPreferences("settings",MODE_PRIVATE).getBoolean("overlay",false);
        getSharedPreferences("settings",MODE_PRIVATE).edit().putBoolean("overlay",next).apply();
        refreshOverlayService();drawLive();
    }
    private void refreshOverlayService(){
        if(SpeedState.I.get().running)
            startService(new Intent(this,MonitorService.class).setAction(MonitorService.REFRESH));
    }
    private void drawLive(){
        if(down==null)return;
        SpeedState.Snapshot s=SpeedState.I.get();
        down.setText(SpeedState.rate(s.down));up.setText(SpeedState.rate(s.up));
        sessionDown.setText(SpeedState.size(s.totalDown));
        sessionUp.setText(SpeedState.size(s.totalUp));
        graph.setSamples(s.downHistory,s.upHistory);
        if(android.os.SystemClock.elapsedRealtime()-lastQuotaQueryAt>60000L)refreshQuota(false);
        activity.setText(s.running?"● 正在监控":"● 已暂停");
        activity.setTextColor(s.running?MINT:MUTED);
        action.setText(s.running?"停止实时监控":"开始实时监控");
        action.setTextColor(s.running?WHITE:BACK);
        action.setBackground(round(s.running?0xFF334455:MINT,16,0));
        boolean enabled=getSharedPreferences("settings",MODE_PRIVATE).getBoolean("overlay",false) && Settings.canDrawOverlays(this);
        overlay.setText(enabled?"关闭桌面悬浮测速窗":"开启桌面悬浮测速窗");
        network.setText(currentNetwork());
    }

    private void openUsageAccess(){
        try {
            startActivity(new Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS));
        } catch(RuntimeException ex) {
            Toast.makeText(this,"请在系统设置里允许 Pulse 访问使用情况",Toast.LENGTH_LONG).show();
        }
    }

    private void editQuota(){
        android.content.SharedPreferences prefs=getSharedPreferences(QuotaUsage.PREFS,MODE_PRIVATE);
        LinearLayout body=column();
        body.setPadding(dp(20),dp(12),dp(20),dp(5));
        body.addView(label("每月套餐流量总额（GB，1GB=1024MB）",13,MUTED,false));
        EditText totalField=new EditText(this);
        totalField.setSingleLine(true);
        totalField.setInputType(InputType.TYPE_CLASS_NUMBER|InputType.TYPE_NUMBER_FLAG_DECIMAL);
        totalField.setText(String.format(Locale.US,"%.1f",prefs.getFloat(QuotaUsage.KEY_TOTAL,(float)QuotaUsage.DEFAULT_GB)));
        body.addView(totalField);
        gap(body,12);
        body.addView(label("每月账期起始日（1–31日）",13,MUTED,false));
        EditText dayField=new EditText(this);
        dayField.setSingleLine(true);
        dayField.setInputType(InputType.TYPE_CLASS_NUMBER);
        dayField.setText(String.valueOf(prefs.getInt(QuotaUsage.KEY_DAY,QuotaUsage.DEFAULT_DAY)));
        body.addView(dayField);
        gap(body,8);
        body.addView(label("例如130GB，每月1日重置。账期按手机当前时区计算。",12,MUTED,false));
        AlertDialog dialog=new AlertDialog.Builder(this)
            .setTitle("设置每月移动流量套餐")
            .setView(body)
            .setNegativeButton("取消",null)
            .setPositiveButton("保存",null)
            .create();
        dialog.setOnShowListener(ignore->dialog.getButton(AlertDialog.BUTTON_POSITIVE).setOnClickListener(v->{
            try {
                double total=Double.parseDouble(totalField.getText().toString().trim());
                int day=Integer.parseInt(dayField.getText().toString().trim());
                if(!Double.isFinite(total)||total<0.1||total>100000||day<1||day>31)
                    throw new IllegalArgumentException();
                prefs.edit().putFloat(QuotaUsage.KEY_TOTAL,(float)total)
                    .putInt(QuotaUsage.KEY_DAY,day).apply();
                dialog.dismiss();
                lastQuotaQueryAt=0;
                refreshQuota(true);
            } catch(Exception bad){
                Toast.makeText(this,"请填写有效总额（0.1–100000GB）和账期日（1–31）",Toast.LENGTH_LONG).show();
            }
        }));
        dialog.show();
    }

    private void refreshQuota(boolean force){
        if(quotaRemaining==null || quotaBusy)return;
        if(!force && android.os.SystemClock.elapsedRealtime()-lastQuotaQueryAt<60000L)return;
        lastQuotaQueryAt=android.os.SystemClock.elapsedRealtime();
        quotaBusy=true;
        quotaWorker.execute(()->{
            QuotaUsage.Result result=QuotaUsage.query(getApplicationContext());
            runOnUiThread(()->{
                quotaBusy=false;
                if(isFinishing()||isDestroyed()||quotaRemaining==null)return;
                if(result.success){
                    double usedGb=result.usedBytes/QuotaUsage.GIB;
                    quotaRemaining.setText(String.format(Locale.CHINA,"%.2f GB",result.remainingGb));
                    quotaDetail.setText(String.format(Locale.CHINA,"已用 %.2f GB  /  套餐 %.1f GB",
                        usedGb,result.totalGb));
                    quotaProgress.setProgress((int)Math.min(1000,Math.round(1000*usedGb/result.totalGb)));
                    quotaStatus.setText("账期自 "+QuotaUsage.date(result.cycleStart)+" 起 · 每月"
                        +result.cycleDay+"日重置\n全设备所有 SIM 卡的移动网络用量合计，非运营商官方余额");
                }else{
                    quotaRemaining.setText("— GB");
                    quotaProgress.setProgress(0);
                    quotaDetail.setText(String.format(Locale.CHINA,"套餐 %.1f GB · 每月%d日重置",result.totalGb,result.cycleDay));
                    quotaStatus.setText(result.error+"\n无需持续后台运行，授权后可读取历史累计用量");
                }
            });
        });
    }

    @Override protected void onDestroy(){
        ui.removeCallbacks(refresh);
        quotaWorker.shutdownNow();
        super.onDestroy();
    }

    private String currentNetwork(){
        ConnectivityManager cm=(ConnectivityManager)getSystemService(CONNECTIVITY_SERVICE);
        if(cm==null)return "网络未知";
        Network n=cm.getActiveNetwork();
        if(n==null)return "无网络连接";
        NetworkCapabilities caps=cm.getNetworkCapabilities(n);
        if(caps==null)return "网络未知";
        if(caps.hasTransport(NetworkCapabilities.TRANSPORT_VPN))return "VPN / 网络";
        if(caps.hasTransport(NetworkCapabilities.TRANSPORT_WIFI))return "Wi-Fi";
        if(caps.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR))return "移动数据";
        if(caps.hasTransport(NetworkCapabilities.TRANSPORT_ETHERNET))return "有线网络";
        return "其他网络";
    }
}
