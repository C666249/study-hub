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
    private WindowManager wm;
    private TextView floating;
    private WindowManager.LayoutParams floatingParams;

    private final Runnable sampler=new Runnable(){
        @Override public void run(){
            if(!active)return;
            SpeedState.I.sample();
            SpeedState.Snapshot s=SpeedState.I.get();
            if((++ticks)%2==0)notifications.notify(NOTICE_ID,notification(s));
            if(floating!=null)floating.setText("↓ "+SpeedState.rate(s.down)+"\n↑ "+SpeedState.rate(s.up));
            handler.postDelayed(this,1000);
        }
    };

    @Override public void onCreate(){
        super.onCreate();
        handler=new Handler(Looper.getMainLooper());
        notifications=(NotificationManager)getSystemService(NOTIFICATION_SERVICE);
        NotificationChannel channel=new NotificationChannel(CHANNEL,"流速 Pulse · 实时测速",NotificationManager.IMPORTANCE_LOW);
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
          .setContentText("流速 Pulse · 全设备实时监测")
          .setOngoing(true).setOnlyAlertOnce(true).setShowWhen(false)
          .setContentIntent(tap)
          .addAction(android.R.drawable.ic_media_pause,"停止监控",serviceIntent(STOP,11))
          .build();
    }
    private int dp(float v){return Math.round(v*getResources().getDisplayMetrics().density);}
    private GradientDrawable bg(){
        GradientDrawable d=new GradientDrawable();
        d.setColor(Color.argb(246,13,24,32));d.setCornerRadius(dp(17));
        d.setStroke(dp(1),0xFF35554F);return d;
    }
    private void refreshFloating(){
        boolean requested=getSharedPreferences("settings",MODE_PRIVATE).getBoolean("overlay",false);
        if(!active||!requested||!Settings.canDrawOverlays(this)){removeFloating();return;}
        if(floating!=null)return;
        wm=(WindowManager)getSystemService(WINDOW_SERVICE);
        floating=new TextView(this);
        floating.setText("↓ 0 B/s\n↑ 0 B/s");
        floating.setTextColor(0xFF8CF4D8);
        floating.setTextSize(12.5f);
        floating.setTypeface(Typeface.DEFAULT,Typeface.BOLD);
        floating.setPadding(dp(17),dp(11),dp(17),dp(11));
        floating.setBackground(bg());floating.setElevation(dp(8));
        floating.setGravity(Gravity.CENTER_VERTICAL);
        floatingParams=new WindowManager.LayoutParams(
          WindowManager.LayoutParams.WRAP_CONTENT,WindowManager.LayoutParams.WRAP_CONTENT,
          WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
          WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE|WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL,
          PixelFormat.TRANSLUCENT);
        floatingParams.gravity=Gravity.TOP|Gravity.RIGHT;
        floatingParams.x=dp(13);floatingParams.y=dp(100);
        floating.setOnTouchListener(new View.OnTouchListener(){
            float downX,downY;int ox,oy;boolean moved;
            @Override public boolean onTouch(View view,android.view.MotionEvent e){
                switch(e.getActionMasked()){
                    case android.view.MotionEvent.ACTION_DOWN:
                        downX=e.getRawX();downY=e.getRawY();ox=floatingParams.x;oy=floatingParams.y;moved=false;return true;
                    case android.view.MotionEvent.ACTION_MOVE:
                        float dx=e.getRawX()-downX,dy=e.getRawY()-downY;
                        if(Math.abs(dx)>dp(5)||Math.abs(dy)>dp(5))moved=true;
                        if(moved&&wm!=null){
                            floatingParams.x=Math.max(0,ox-Math.round(dx));
                            floatingParams.y=Math.max(0,oy+Math.round(dy));
                            try{wm.updateViewLayout(floating,floatingParams);}catch(Exception ignored){}
                        }
                        return true;
                    case android.view.MotionEvent.ACTION_UP:
                        if(!moved){
                            Intent open=new Intent(MonitorService.this,MainActivity.class);
                            open.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK|Intent.FLAG_ACTIVITY_SINGLE_TOP);
                            startActivity(open);
                        }
                        return true;
                }
                return true;
            }
        });
        try{wm.addView(floating,floatingParams);}
        catch(RuntimeException e){floating=null;floatingParams=null;wm=null;}
    }
    private void removeFloating(){
        if(floating!=null && wm!=null){try{wm.removeView(floating);}catch(Exception ignored){}}
        floating=null;floatingParams=null;wm=null;
    }
    @Override public void onDestroy(){
        active=false;
        handler.removeCallbacks(sampler);
        removeFloating();
        SpeedState.I.stop();
        getSharedPreferences("settings",MODE_PRIVATE).edit().putBoolean("active",false).apply();
        super.onDestroy();
    }
    @Override public IBinder onBind(Intent intent){return null;}
}
