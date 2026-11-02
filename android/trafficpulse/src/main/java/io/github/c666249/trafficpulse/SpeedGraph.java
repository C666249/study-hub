package io.github.c666249.trafficpulse;
import android.content.Context;
import android.graphics.*;
import android.view.View;
/** Local Canvas graph: 60 seconds, separate RX/TX tracks. */
public final class SpeedGraph extends View{
 private final Paint paint=new Paint(3);
 private float[] down=new float[0],up=new float[0];
 private float dp(float n){return n*getResources().getDisplayMetrics().density;}
 public SpeedGraph(Context c){super(c);setLayerType(View.LAYER_TYPE_SOFTWARE,null);}
 public void setSamples(float[] d,float[] u){down=d;up=u;invalidate();}
 @Override protected void onDraw(Canvas c){
  super.onDraw(c);
  float l=dp(5),r=getWidth()-dp(5),t=dp(8),b=getHeight()-dp(12);
  paint.setColor(0xFF304151);paint.setStrokeWidth(dp(1));paint.setStyle(Paint.Style.STROKE);
  for(int i=0;i<4;i++){float y=t+(b-t)*i/3;c.drawLine(l,y,r,y,paint);}
  float max=8192;
  for(float v:down)max=Math.max(max,v);
  for(float v:up)max=Math.max(max,v);
  line(c,down,0xFF67E8C2,l,r,t,b,max);line(c,up,0xFFA99CFF,l,r,t,b,max);
 }
 private void line(Canvas c,float[] values,int color,float l,float r,float t,float b,float max){
  if(values.length==0)return;
  Path path=new Path();
  for(int i=0;i<values.length;i++){
   float x=l+(r-l)*(60-values.length+i)/59f;
   float y=b-(b-t)*Math.max(0,values[i])/max;
   if(i==0)path.moveTo(x,y);else path.lineTo(x,y);
  }
  paint.setStyle(Paint.Style.STROKE);paint.setStrokeWidth(dp(2.5f));
  paint.setStrokeJoin(Paint.Join.ROUND);paint.setStrokeCap(Paint.Cap.ROUND);paint.setColor(color);
  c.drawPath(path,paint);
  float y=b-(b-t)*Math.max(0,values[values.length-1])/max;
  paint.setStyle(Paint.Style.FILL);c.drawCircle(r,y,dp(3),paint);
 }
}
