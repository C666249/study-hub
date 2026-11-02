package io.github.c666249.trafficpulse;
import android.net.TrafficStats;
import android.os.SystemClock;
import java.util.Arrays;
import java.util.Locale;
/** System TrafficStats reports device-level network-layer bytes, not operator billing totals. */
public final class SpeedState {
 public static final SpeedState I=new SpeedState();
 private static final int N=60;
 private long lastMs,lastRx,lastTx,totalRx,totalTx;
 private double down,up;
 private boolean running;
 private float[] dh=new float[N],uh=new float[N];
 private int count;
 private SpeedState(){}
 public synchronized void begin(){
  lastMs=SystemClock.elapsedRealtime();
  lastRx=TrafficStats.getTotalRxBytes();lastTx=TrafficStats.getTotalTxBytes();
  totalRx=0;totalTx=0;down=0;up=0;count=0;
  Arrays.fill(dh,0);Arrays.fill(uh,0);running=true;
 }
 public synchronized void sample(){
  if(!running)return;
  long ms=SystemClock.elapsedRealtime(),r=TrafficStats.getTotalRxBytes(),t=TrafficStats.getTotalTxBytes();
  long delta=ms-lastMs;
  if(delta<1||r<0||t<0||lastRx<0||lastTx<0){
   down=0;up=0;lastMs=ms;lastRx=r;lastTx=t;return;
  }
  long dr=r>=lastRx?r-lastRx:0,dt=t>=lastTx?t-lastTx:0;
  if(dr>2000000000L||dt>2000000000L){dr=0;dt=0;}
  down=dr*1000.0/delta;up=dt*1000.0/delta;
  totalRx+=dr;totalTx+=dt;lastMs=ms;lastRx=r;lastTx=t;
  dh[count%N]=(float)down;uh[count%N]=(float)up;count++;
 }
 public synchronized void stop(){running=false;down=0;up=0;}
 public synchronized Snapshot get(){
  int n=Math.min(count,N);float[] x=new float[n],y=new float[n];
  for(int i=0;i<n;i++){int j=(count-n+i)%N;x[i]=dh[j];y[i]=uh[j];}
  return new Snapshot(running,down,up,totalRx,totalTx,x,y);
 }
 public static final class Snapshot{
  public final boolean running;public final double down,up;public final long totalDown,totalUp;
  public final float[] downHistory,upHistory;
  Snapshot(boolean b,double d,double u,long rd,long ru,float[] x,float[] y){
   running=b;down=d;up=u;totalDown=rd;totalUp=ru;downHistory=x;upHistory=y;
  }
 }
 public static String rate(double b){
  if(b<0)return "—";
  if(b<1024)return String.format(Locale.US,"%.0f B/s",b);
  if(b<1048576)return String.format(Locale.US,"%.1f KB/s",b/1024);
  return String.format(Locale.US,"%.2f MB/s",b/1048576);
 }
 public static String size(long b){
  if(b<1024)return b+" B";
  if(b<1048576)return String.format(Locale.US,"%.1f KB",b/1024.0);
  if(b<1073741824)return String.format(Locale.US,"%.2f MB",b/1048576.0);
  return String.format(Locale.US,"%.2f GB",b/1073741824.0);
 }
}
