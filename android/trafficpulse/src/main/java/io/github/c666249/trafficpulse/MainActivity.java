package io.github.c666249.trafficpulse;

import android.Manifest;
import android.app.Activity;
import android.app.AlertDialog;
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
    private TextView quotaUsedValue, quotaPlanValue, quotaGrant;
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
    private static final int DARK=0xFF0C1522, SURFACE=0xFF172433;
    private LinearLayout panel(int color, int radius, int border, int padding) {
        LinearLayout p=column();
        p.setPadding(dp(padding),dp(padding),dp(padding),dp(padding));
        p.setBackground(round(color,radius,border));
        return p;
    }
    private String shortRate(double b) {
        if(b < 1024) return String.format(Locale.US,"%.0fB/s",b);
        if(b < 1048576) return String.format(Locale.US,"%.0fK/s",b/1024.0);
        return String.format(Locale.US,"%.1fM/s",b/1048576.0);
    }

    @Override public void onCreate(Bundle saved){
        super.onCreate(saved);
        getWindow().setStatusBarColor(DARK);getWindow().setNavigationBarColor(DARK);
        ScrollView scroll=new ScrollView(this);
        scroll.setFillViewport(true);
        scroll.setVerticalScrollBarEnabled(false);
        scroll.setBackgroundColor(DARK);
        setContentView(scroll);
        LinearLayout root=column();
        root.setPadding(dp(19),dp(26),dp(19),dp(22));
        scroll.addView(root,new ScrollView.LayoutParams(-1,-2));

        // Minimal editorial header.
        root.addView(label("NETWORK INTELLIGENCE  /  PULSEFLOW",10,MINT,true));
        gap(root,10);
        LinearLayout brand=row();brand.setGravity(Gravity.CENTER_VERTICAL);
        root.addView(brand);
        brand.addView(label("PulseFlow",33,WHITE,true));
        View spacer=new View(this);brand.addView(spacer,new LinearLayout.LayoutParams(0,1,1));
        activity=label("● LIVE",11,MINT,true);
        brand.addView(activity);
        gap(root,19);

        // One compact status line: network on the left, RX / TX on the right.
        LinearLayout status=row();
        status.setGravity(Gravity.CENTER_VERTICAL);
        status.setPadding(dp(10),dp(9),dp(10),dp(9));
        status.setBackground(round(SURFACE,20,BORDER));
        root.addView(status,new LinearLayout.LayoutParams(-1,dp(60)));
        network=label("NETWORK",12,MINT,true);
        network.setGravity(Gravity.CENTER);
        network.setBackground(round(0xFF204037,15,0));
        network.setPadding(dp(11),dp(9),dp(11),dp(9));
        status.addView(network);
        View flex=new View(this);status.addView(flex,new LinearLayout.LayoutParams(0,1,1));
        down=label("↓ 0B/s",13,MINT,true);
        status.addView(down);
        View rateGap=new View(this);status.addView(rateGap,new LinearLayout.LayoutParams(dp(12),1));
        up=label("↑ 0B/s",13,VIOLET,true);
        status.addView(up);
        gap(root,16);

        // Main plan card: remaining / progress / compact metadata.
        LinearLayout quotaCard=panel(0xFF172C37,24,0xFF3D6D6B,19);
        GradientDrawable planBackground=new GradientDrawable(
            GradientDrawable.Orientation.TL_BR,
            new int[]{0xFF1A4840,0xFF172D39,0xFF252A41});
        planBackground.setCornerRadius(dp(24));
        planBackground.setStroke(dp(1),0xFF4D847C);
        quotaCard.setBackground(planBackground);
        root.addView(quotaCard,new LinearLayout.LayoutParams(-1,-2));
        LinearLayout top=row();top.setGravity(Gravity.CENTER_VERTICAL);
        quotaCard.addView(top);
        top.addView(label("CHINA MOBILE  /  PLAN",11,0xFFD0E8E6,true));
        View space=new View(this);top.addView(space,new LinearLayout.LayoutParams(0,1,1));
        TextView edit=label("⚙",22,MINT,false);
        edit.setGravity(Gravity.CENTER);
        edit.setContentDescription("设置流量总额与账期");
        edit.setPadding(dp(10),0,dp(2),0);
        top.addView(edit,new LinearLayout.LayoutParams(dp(42),dp(36)));
        edit.setOnClickListener(v->editQuota());
        gap(quotaCard,10);
        quotaCard.addView(label("REMAINING",10,0xFFB2D5D1,true));
        gap(quotaCard,2);
        quotaRemaining=label("— GB",39,MINT,true);
        quotaCard.addView(quotaRemaining);
        gap(quotaCard,12);
        quotaProgress=new ProgressBar(this,null,android.R.attr.progressBarStyleHorizontal);
        quotaProgress.setMax(1000);
        quotaProgress.setProgressTintList(ColorStateList.valueOf(MINT));
        quotaProgress.setProgressBackgroundTintList(ColorStateList.valueOf(0xFF304956));
        quotaCard.addView(quotaProgress,new LinearLayout.LayoutParams(-1,dp(6)));
        gap(quotaCard,11);
        quotaDetail=label("USED  —    /    PLAN  130 GB",12,0xFFB7D5D6,false);
        quotaCard.addView(quotaDetail);
        gap(quotaCard,6);
        quotaStatus=label("1st RESET  ·  DEVICE ESTIMATE",11,0xFF8FAFAB,false);
        quotaCard.addView(quotaStatus);
        quotaStatus.setOnClickListener(v->{if(!QuotaUsage.hasAccess(this))openUsageAccess();});
        gap(root,12);

        // Compact two-tile quota statistics, no redundant text paragraphs.
        LinearLayout totals=row();
        root.addView(totals,new LinearLayout.LayoutParams(-1,-2));
        LinearLayout usedCard=panel(SURFACE,20,BORDER,15);
        LinearLayout.LayoutParams tile=new LinearLayout.LayoutParams(0,-2,1);
        totals.addView(usedCard,tile);
        usedCard.addView(label("USED",10,MUTED,true));
        gap(usedCard,7);
        quotaUsedValue=label("— GB",20,MINT,true);
        usedCard.addView(quotaUsedValue);
        View tileGap=new View(this);totals.addView(tileGap,new LinearLayout.LayoutParams(dp(10),1));
        LinearLayout planCard=panel(0xFF20253B,20,0xFF37395A,15);
        totals.addView(planCard,new LinearLayout.LayoutParams(0,-2,1));
        planCard.addView(label("PLAN",10,0xFFC6BAF4,true));
        gap(planCard,7);
        quotaPlanValue=label("130 GB",20,VIOLET,true);
        planCard.addView(quotaPlanValue);
        gap(root,12);

        // Last content card is the graph; values below are auxiliary.
        LinearLayout graphCard=panel(SURFACE,23,BORDER,16);
        root.addView(graphCard);
        LinearLayout graphHeading=row();
        graphHeading.setGravity(Gravity.CENTER_VERTICAL);
        graphCard.addView(graphHeading);
        graphHeading.addView(label("REAL-TIME SPEED",15,WHITE,true));
        View blank=new View(this);graphHeading.addView(blank,new LinearLayout.LayoutParams(0,1,1));
        graphHeading.addView(label("60S",11,MUTED,true));
        gap(graphCard,9);
        graph=new SpeedGraph(this);
        graphCard.addView(graph,new LinearLayout.LayoutParams(-1,dp(148)));
        gap(graphCard,4);
        LinearLayout legend=row();legend.setGravity(Gravity.CENTER);
        graphCard.addView(legend);
        legend.addView(label("● DOWNLOAD",11,MINT,true));
        legend.addView(label("     ● UPLOAD",11,VIOLET,true));
        gap(graphCard,10);
        LinearLayout mini=row();mini.setGravity(Gravity.CENTER);
        graphCard.addView(mini);
        mini.addView(label("SESSION  ",10,MUTED,true));
        sessionDown=label("↓ 0 B",11,MINT,false);
        sessionUp=label("   ↑ 0 B",11,VIOLET,false);
        mini.addView(sessionDown);mini.addView(sessionUp);
        gap(root,12);

        // Quiet, bottom-aligned actions instead of full-page instructional text.
        LinearLayout controls=row();
        root.addView(controls);
        action=label("▶  Start",14,DARK,true);
        action.setGravity(Gravity.CENTER);
        action.setBackground(round(MINT,17,0));
        controls.addView(action,new LinearLayout.LayoutParams(0,dp(52),1));
        action.setOnClickListener(v->toggleService());
        View between=new View(this);controls.addView(between,new LinearLayout.LayoutParams(dp(10),1));
        overlay=label("◉  Glass Pill",14,WHITE,true);
        overlay.setGravity(Gravity.CENTER);
        overlay.setBackground(round(0xFF2B3B4E,17,0));
        controls.addView(overlay,new LinearLayout.LayoutParams(0,dp(52),1));
        overlay.setOnClickListener(v->toggleOverlay());
        gap(root,10);
        quotaGrant=label("SETUP  ·  Usage access",11,MUTED,true);
        quotaGrant.setGravity(Gravity.CENTER);
        quotaGrant.setPadding(0,dp(7),0,dp(7));
        root.addView(quotaGrant);
        quotaGrant.setOnClickListener(v->openUsageAccess());
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
        down.setText("↓ "+shortRate(s.down));up.setText("↑ "+shortRate(s.up));
        sessionDown.setText(SpeedState.size(s.totalDown));
        sessionUp.setText(SpeedState.size(s.totalUp));
        graph.setSamples(s.downHistory,s.upHistory);
        if(android.os.SystemClock.elapsedRealtime()-lastQuotaQueryAt>60000L)refreshQuota(false);
        activity.setText(s.running?"● LIVE":"○ IDLE");
        activity.setTextColor(s.running?MINT:MUTED);
        action.setText(s.running?"■  Stop":"▶  Start");
        action.setTextColor(s.running?WHITE:BACK);
        action.setBackground(round(s.running?0xFF334455:MINT,16,0));
        boolean enabled=getSharedPreferences("settings",MODE_PRIVATE).getBoolean("overlay",false) && Settings.canDrawOverlays(this);
        overlay.setText(enabled?"◉  Hide Pill":"◉  Glass Pill");
        network.setText(currentNetwork());
    }

    private void openUsageAccess(){
        try {
            startActivity(new Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS));
        } catch(RuntimeException ex) {
            Toast.makeText(this,"请在系统设置里允许 PulseFlow 访问使用情况",Toast.LENGTH_LONG).show();
        }
    }

    private void editQuota(){
        android.content.SharedPreferences prefs=getSharedPreferences(QuotaUsage.PREFS,MODE_PRIVATE);
        LinearLayout body=column();
        body.setPadding(dp(22),dp(15),dp(22),dp(8));
        body.addView(label("MONTHLY ALLOWANCE   /   GB",11,MINT,true));
        EditText totalField=new EditText(this);
        totalField.setSingleLine(true);
        totalField.setTextSize(21);
        totalField.setTextColor(WHITE);
        totalField.setBackgroundTintList(ColorStateList.valueOf(MINT));
        totalField.setInputType(InputType.TYPE_CLASS_NUMBER|InputType.TYPE_NUMBER_FLAG_DECIMAL);
        totalField.setText(String.format(Locale.US,"%.1f",prefs.getFloat(QuotaUsage.KEY_TOTAL,(float)QuotaUsage.DEFAULT_GB)));
        body.addView(totalField);
        gap(body,19);
        body.addView(label("RESET DAY   /   1—31",11,MINT,true));
        EditText dayField=new EditText(this);
        dayField.setSingleLine(true);
        dayField.setTextSize(21);
        dayField.setTextColor(WHITE);
        dayField.setBackgroundTintList(ColorStateList.valueOf(MINT));
        dayField.setInputType(InputType.TYPE_CLASS_NUMBER);
        dayField.setText(String.valueOf(prefs.getInt(QuotaUsage.KEY_DAY,QuotaUsage.DEFAULT_DAY)));
        body.addView(dayField);
        AlertDialog dialog=new AlertDialog.Builder(this,AlertDialog.THEME_DEVICE_DEFAULT_DARK)
            .setTitle("Plan settings")
            .setView(body)
            .setNegativeButton("Cancel",null)
            .setPositiveButton("Save",null)
            .create();
        dialog.setOnShowListener(ignore->{
            if(dialog.getWindow()!=null)
                dialog.getWindow().setBackgroundDrawable(round(0xFF182A39,24,0xFF42615E));
            dialog.getButton(AlertDialog.BUTTON_POSITIVE).setTextColor(MINT);
            dialog.getButton(AlertDialog.BUTTON_NEGATIVE).setTextColor(MUTED);
            dialog.getButton(AlertDialog.BUTTON_POSITIVE).setOnClickListener(v->{
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
                    Toast.makeText(this,"Please enter a valid plan and reset day.",Toast.LENGTH_LONG).show();
                }
            });
        });
        dialog.show();
    }

    private void refreshQuota(boolean force){
        if(quotaRemaining==null||quotaBusy)return;
        if(!force && android.os.SystemClock.elapsedRealtime()-lastQuotaQueryAt<60000L)return;
        lastQuotaQueryAt=android.os.SystemClock.elapsedRealtime();
        quotaBusy=true;
        quotaWorker.execute(()->{
            QuotaUsage.Result result=QuotaUsage.query(getApplicationContext());
            runOnUiThread(()->{
                quotaBusy=false;
                if(isFinishing()||isDestroyed()||quotaRemaining==null)return;
                quotaPlanValue.setText(String.format(Locale.US,"%.1f GB",result.totalGb));
                quotaGrant.setVisibility(result.success?View.GONE:View.VISIBLE);
                if(result.success){
                    double used=result.usedBytes/QuotaUsage.GIB;
                    quotaRemaining.setText(String.format(Locale.US,"%.2f GB",result.remainingGb));
                    quotaUsedValue.setText(String.format(Locale.US,"%.2f GB",used));
                    quotaDetail.setText(String.format(Locale.US,"USED %.2f GB   /   PLAN %.1f GB",used,result.totalGb));
                    quotaProgress.setProgress((int)Math.min(1000,Math.round(1000*used/result.totalGb)));
                    quotaStatus.setText(String.format(Locale.US,"%d%s RESET   ·   DEVICE ESTIMATE",
                        result.cycleDay, result.cycleDay==1?"ST":"TH"));
                }else{
                    quotaRemaining.setText("— GB");
                    quotaUsedValue.setText("— GB");
                    quotaProgress.setProgress(0);
                    quotaDetail.setText(String.format(Locale.US,"PLAN %.1f GB",result.totalGb));
                    quotaStatus.setText("TAP TO GRANT USAGE ACCESS  ›");
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
