package io.github.c666249.trafficpulse;

import android.app.*;
import android.content.*;
import android.content.pm.ServiceInfo;
import android.graphics.Color;
import android.graphics.PixelFormat;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.os.*;
import android.provider.Settings;
import android.view.*;
import android.widget.TextView;

/** Explicitly user-started monitoring; no server/network permission needed. */
public final class MonitorService extends Service {
    public static final String START="io.github.c666249.trafficpulse.START";
    public static final String STOP="io.github.c666249.trafficpulse.STOP";
    public static final String REFRESH="io.github.c666249.trafficpulse.REFRESH";
    private static final String CHANNEL="traffic_pulse_live";
    private static final int NOTICE_ID=1103;
    private Handler handler;
    private boolean active=false;
    private int ticks;
    private NotificationManager notifications;
    private LiquidPillOverlay floating;
    private final java.util.concurrent.ExecutorService quotaExecutor =
        java.util.concurrent.Executors.newSingleThreadExecutor();
    private boolean quotaQueryInFlight=false;
    private long lastQuotaQuery=0;

    private final Runnable sampler=new Runnable(){
        @Override public void run(){
            if(!active)return;
            SpeedState.I.sample();
            SpeedState.Snapshot s=SpeedState.I.get();
            if((++ticks)%2==0)notifications.notify(NOTICE_ID,notification(s));
            if(floating!=null)floating.speeds(s);
            if(ticks==1 || ticks%60==0) updateOverlayQuota();
            handler.postDelayed(this,1000);
        }
    };

    @Override public void onCreate(){
        super.onCreate();
        handler=new Handler(Looper.getMainLooper());
        notifications=(NotificationManager)getSystemService(NOTIFICATION_SERVICE);
        NotificationChannel channel=new NotificationChannel(CHANNEL,"PulseFlow · Live Traffic",NotificationManager.IMPORTANCE_LOW);
        channel.setDescription("显示设备网络的实时上传和下载速度");
        channel.enableVibration(false);
        notifications.createNotificationChannel(channel);
    }

    @Override public int onStartCommand(Intent intent,int flags,int startId){
        String action=intent==null?START:intent.getAction();
        if(STOP.equals(action)){stopSelf();return START_NOT_STICKY;}
        if(!active){
            try {
                if(Build.VERSION.SDK_INT>=34)
                    startForeground(NOTICE_ID,notification(SpeedState.I.get()),ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE);
                else startForeground(NOTICE_ID,notification(SpeedState.I.get()));
            } catch (RuntimeException e){
                getSharedPreferences("settings",MODE_PRIVATE).edit().putBoolean("active",false).apply();
                stopSelf();return START_NOT_STICKY;
            }
            active=true;
            ticks=0;
            SpeedState.I.begin();
            getSharedPreferences("settings",MODE_PRIVATE).edit().putBoolean("active",true).apply();
            handler.removeCallbacks(sampler);handler.postDelayed(sampler,1000);
        }
        refreshFloating();
        return START_STICKY;
    }

    private PendingIntent serviceIntent(String action,int code){
        Intent i=new Intent(this,MonitorService.class).setAction(action);
        return PendingIntent.getService(this,code,i,PendingIntent.FLAG_IMMUTABLE|PendingIntent.FLAG_UPDATE_CURRENT);
    }

    private Notification notification(SpeedState.Snapshot s){
        Intent main=new Intent(this,MainActivity.class);
        main.addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP|Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent tap=PendingIntent.getActivity(this,10,main,PendingIntent.FLAG_IMMUTABLE|PendingIntent.FLAG_UPDATE_CURRENT);
        return new Notification.Builder(this,CHANNEL)
          .setSmallIcon(R.drawable.ic_stat)
          .setContentTitle("↓ "+SpeedState.rate(s.down)+"   ↑ "+SpeedState.rate(s.up))
          .setContentText("PulseFlow · Live network speed")
          .setOngoing(true).setOnlyAlertOnce(true).setShowWhen(false)
          .setContentIntent(tap)
          .addAction(android.R.drawable.ic_media_pause,"停止监控",serviceIntent(STOP,11))
          .build();
    }
    private void refreshFloating(){
        boolean requested=getSharedPreferences("settings",MODE_PRIVATE).getBoolean("overlay",false);
        if(!active||!requested||!Settings.canDrawOverlays(this)){removeFloating();return;}
        if(floating==null){
            floating=new LiquidPillOverlay(this);
            floating.attach();
            updateOverlayQuota();
        }
        floating.speeds(SpeedState.I.get());
    }

    /** Usage history is expensive; never execute on the main/animation thread. */
    private void updateOverlayQuota(){
        if(!active || floating==null || quotaQueryInFlight) return;
        long now=android.os.SystemClock.elapsedRealtime();
        if(now-lastQuotaQuery<55000L && lastQuotaQuery!=0L)return;
        lastQuotaQuery=now;quotaQueryInFlight=true;
        quotaExecutor.execute(()->{
            QuotaUsage.Result q=QuotaUsage.query(getApplicationContext());
            handler.post(()->{
                quotaQueryInFlight=false;
                if(active && floating!=null)floating.quota(q);
            });
        });
    }

    private void removeFloating(){
        if(floating!=null)floating.detach();
        floating=null;
    }
    @Override public void onDestroy(){
        active=false;
        handler.removeCallbacks(sampler);
        removeFloating();
        quotaExecutor.shutdownNow();
        SpeedState.I.stop();
        getSharedPreferences("settings",MODE_PRIVATE).edit().putBoolean("active",false).apply();
        super.onDestroy();
    }
    @Override public IBinder onBind(Intent intent){return null;}
}
