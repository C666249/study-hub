package io.github.c666249.trafficpulse;

import android.Manifest;
import android.app.AppOpsManager;
import android.app.usage.NetworkStats;
import android.app.usage.NetworkStatsManager;
import android.content.Context;
import android.content.SharedPreferences;
import android.net.ConnectivityManager;
import android.os.Process;
import android.os.Build;
import java.util.Calendar;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

/**
 * Monthly mobile data estimate from OS historical network accounting.
 *
 * Does not require keeping an app service alive. Does not use Wi-Fi TrafficStats,
 * carrier passwords, SMS access, or any external API.
 * subscriberId=null deliberately includes ALL mobile subscriptions: not per-SIM billing.
 */
public final class QuotaUsage {
    public static final String PREFS = "quota_settings";
    public static final String KEY_TOTAL = "total_gb";
    public static final String KEY_DAY = "cycle_day";
    public static final double DEFAULT_GB = 130.0;
    public static final int DEFAULT_DAY = 1;
    public static final double GIB = 1024.0 * 1024.0 * 1024.0;
    private QuotaUsage() {}

    public static boolean hasAccess(Context context) {
        if (Build.VERSION.SDK_INT < 23) return false;
        AppOpsManager ops = (AppOpsManager) context.getSystemService(Context.APP_OPS_SERVICE);
        if (ops == null) return false;
        int mode = ops.checkOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS,
                                      Process.myUid(), context.getPackageName());
        return mode == AppOpsManager.MODE_ALLOWED;
    }

    public static long cycleStartMillis(int cycleDay, long nowMillis) {
        if (cycleDay < 1 || cycleDay > 31) throw new IllegalArgumentException("cycle day must be 1–31");
        Calendar now = Calendar.getInstance();
        now.setTimeInMillis(nowMillis);
        Calendar start = Calendar.getInstance();
        start.setTimeInMillis(nowMillis);
        start.set(Calendar.DAY_OF_MONTH, 1);
        zeroTime(start);
        int d = Math.min(cycleDay, start.getActualMaximum(Calendar.DAY_OF_MONTH));
        start.set(Calendar.DAY_OF_MONTH, d);
        if (nowMillis < start.getTimeInMillis()) {
            start.add(Calendar.MONTH, -1);
            start.set(Calendar.DAY_OF_MONTH, Math.min(cycleDay, start.getActualMaximum(Calendar.DAY_OF_MONTH)));
        }
        return start.getTimeInMillis();
    }

    private static void zeroTime(Calendar c) {
        c.set(Calendar.HOUR_OF_DAY, 0);
        c.set(Calendar.MINUTE, 0);
        c.set(Calendar.SECOND, 0);
        c.set(Calendar.MILLISECOND, 0);
    }

    public static Result query(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        double totalGb = (double)prefs.getFloat(KEY_TOTAL, (float) DEFAULT_GB);
        int cycleDay = prefs.getInt(KEY_DAY, DEFAULT_DAY);
        if (!hasAccess(context)) return Result.needsPermission(totalGb, cycleDay);
        long now = System.currentTimeMillis();
        long start = cycleStartMillis(cycleDay, now);
        try {
            NetworkStatsManager manager = (NetworkStatsManager) context.getSystemService(Context.NETWORK_STATS_SERVICE);
            if (manager == null) return Result.error(totalGb, cycleDay, "系统不提供网络用量统计服务");
            // This API can take seconds; caller MUST run on a background worker thread.
            NetworkStats.Bucket bucket = manager.querySummaryForDevice(
                    ConnectivityManager.TYPE_MOBILE, null, start, now);
            if (bucket == null) return Result.error(totalGb, cycleDay, "系统未返回流量记录");
            long rx = Math.max(0, bucket.getRxBytes());
            long tx = Math.max(0, bucket.getTxBytes());
            long usedBytes = rx + tx;
            double remainingGb = Math.max(0, totalGb - usedBytes / GIB);
            return new Result(true, false, totalGb, cycleDay, start, usedBytes, remainingGb, null);
        } catch (SecurityException e) {
            return Result.needsPermission(totalGb, cycleDay);
        } catch (Exception e) {
            return Result.error(totalGb, cycleDay, "读取失败，请检查设备使用情况访问权限");
        }
    }

    public static String date(long time) {
        return new SimpleDateFormat("yyyy/MM/dd", Locale.CHINA).format(new Date(time));
    }

    public static final class Result {
        public final boolean success, needsPermission;
        public final double totalGb, remainingGb;
        public final int cycleDay;
        public final long cycleStart, usedBytes;
        public final String error;
        private Result(boolean success, boolean needsPermission, double totalGb, int cycleDay,
                       long cycleStart, long usedBytes, double remainingGb, String error) {
            this.success=success; this.needsPermission=needsPermission;
            this.totalGb=totalGb; this.cycleDay=cycleDay;
            this.cycleStart=cycleStart; this.usedBytes=usedBytes;
            this.remainingGb=remainingGb; this.error=error;
        }
        private static Result needsPermission(double g, int d) {
            return new Result(false,true,g,d,0,0,0,"需要授权「使用情况访问权限」");
        }
        private static Result error(double g, int d, String message) {
            return new Result(false,false,g,d,0,0,0,message);
        }
    }
}
