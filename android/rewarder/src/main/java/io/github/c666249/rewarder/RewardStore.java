package io.github.c666249.rewarder;

import android.content.Context;
import android.content.SharedPreferences;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import java.time.LocalDate;
import java.time.temporal.WeekFields;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

final class RewardStore {
    static final String DAILY = "daily";
    static final String WEEKLY = "weekly";

    static final class Task {
        final String id;
        final String title;
        final String cadence;
        final long cents;
        Task(String id, String title, String cadence, long cents) {
            this.id = id; this.title = title; this.cadence = cadence; this.cents = cents;
        }
    }

    static final class Receipt {
        final String id, taskId, title, period;
        final long cents, timestamp;
        Receipt(String id, String taskId, String title, String period, long cents, long timestamp) {
            this.id=id; this.taskId=taskId; this.title=title; this.period=period;
            this.cents=cents; this.timestamp=timestamp;
        }
    }

    private final SharedPreferences preferences;
    private final ArrayList<Task> tasks = new ArrayList<>();
    private final ArrayList<Receipt> receipts = new ArrayList<>();
    private boolean readOnly = false;

    RewardStore(Context context) {
        preferences = context.getSharedPreferences("shiguang_v1_ledger", Context.MODE_PRIVATE);
        String raw = preferences.getString("snapshot", null);
        if (raw == null) return;
        try {
            JSONObject root = new JSONObject(raw);
            JSONArray taskList = root.getJSONArray("tasks");
            JSONArray receiptList = root.getJSONArray("receipts");
            ArrayList<Task> recoveredTasks = new ArrayList<>();
            ArrayList<Receipt> recoveredReceipts = new ArrayList<>();
            for (int i=0; i<taskList.length(); i++) {
                JSONObject t = taskList.getJSONObject(i);
                recoveredTasks.add(new Task(t.getString("id"), t.getString("title"),
                    t.getString("cadence"), t.getLong("cents")));
            }
            for (int i=0; i<receiptList.length(); i++) {
                JSONObject r = receiptList.getJSONObject(i);
                recoveredReceipts.add(new Receipt(r.getString("id"), r.getString("taskId"),
                    r.getString("title"), r.getString("period"),
                    r.getLong("cents"), r.getLong("timestamp")));
            }
            tasks.addAll(recoveredTasks);
            receipts.addAll(recoveredReceipts);
        } catch (Exception invalidSavedData) {
            // Never overwrite corrupted data silently. Preserve it for a future recovery.
            tasks.clear(); receipts.clear(); readOnly = true;
        }
    }

    boolean isReadOnly() { return readOnly; }
    List<Task> tasks() { return new ArrayList<>(tasks); }
    List<Receipt> receipts() { return new ArrayList<>(receipts); }

    long balance() {
        // Positive historical receipts are unchanged. v1.7.3 introduces a
        // signed negative cents delta for penalties, stored in the same JSON
        // schema for full backwards compatibility.
        long sum=0L;
        for (Receipt receipt: receipts) {
            long v=receipt.cents;
            if(v>0 && sum>Long.MAX_VALUE-v)sum=Long.MAX_VALUE;
            else if(v<0 && sum<Long.MIN_VALUE-v)sum=Long.MIN_VALUE;
            else sum+=v;
        }
        // Never display a negative reward balance.
        return Math.max(0L,sum);
    }

    int count() { return receipts.size(); }

    private static String periodKey(Task task) {
        LocalDate date = LocalDate.now();
        if (WEEKLY.equals(task.cadence)) {
            WeekFields iso = WeekFields.ISO;
            return "W:" + date.get(iso.weekBasedYear()) + ":" + date.get(iso.weekOfWeekBasedYear());
        }
        return "D:" + date.toString();
    }

    int resolution(Task task) {
        String period=periodKey(task);
        for(Receipt receipt:receipts)
            if(receipt.taskId.equals(task.id)&&receipt.period.equals(period))
                return receipt.cents<0?-1:1;
        return 0;
    }

    boolean alreadyClaimed(Task task) {return resolution(task)!=0;}

    Receipt claim(Task task) {
        if (readOnly || alreadyClaimed(task)) return null;
        Receipt entry = new Receipt(UUID.randomUUID().toString(), task.id, task.title,
            periodKey(task), task.cents, System.currentTimeMillis());
        receipts.add(entry);
        if (!persist()) { receipts.remove(receipts.size()-1); return null; }
        return entry;
    }

    Receipt penalize(Task task) {
        if(readOnly||alreadyClaimed(task))return null;
        long amount=Math.min(balance(),task.cents);
        if(amount<=0L)return null;
        Receipt entry=new Receipt(UUID.randomUUID().toString(),task.id,task.title,
            periodKey(task),-amount,System.currentTimeMillis());
        receipts.add(entry);
        if(!persist()){receipts.remove(receipts.size()-1);return null;}
        return entry;
    }

    boolean undo(Receipt receipt) {
        if (readOnly) return false;
        int index = -1;
        for (int i=0;i<receipts.size();i++)
            if(receipts.get(i).id.equals(receipt.id)) { index=i; break; }
        if(index<0) return false;
        Receipt removed = receipts.remove(index);
        if(!persist()) {receipts.add(index,removed); return false;}
        return true;
    }

    boolean putTask(String id, String title, String cadence, long cents) {
        if(readOnly || title.trim().isEmpty() || cents<=0 || cents>99999999
            || (!DAILY.equals(cadence) && !WEEKLY.equals(cadence))) return false;
        int index=-1;
        for(int i=0;i<tasks.size();i++) if(tasks.get(i).id.equals(id)) {index=i; break;}
        Task old=index<0?null:tasks.get(index);
        Task edited=new Task(old==null?UUID.randomUUID().toString():old.id,
            title.trim(),cadence,cents);
        if(index<0) tasks.add(edited); else tasks.set(index,edited);
        if(!persist()) {
            if(index<0) tasks.remove(tasks.size()-1); else tasks.set(index,old);
            return false;
        }
        return true;
    }

    boolean deleteTask(Task task) {
        if(readOnly) return false;
        int index=-1;
        for(int i=0;i<tasks.size();i++) if(tasks.get(i).id.equals(task.id)) {index=i; break;}
        if(index<0) return false;
        Task removed=tasks.remove(index);
        if(!persist()) {tasks.add(index,removed);return false;}
        // Historical receipts remain even when their task is deleted.
        return true;
    }

    private boolean persist() {
        if(readOnly) return false;
        try {
            JSONObject root=new JSONObject();
            JSONArray ts=new JSONArray(), rs=new JSONArray();
            for(Task t:tasks) {
                JSONObject item=new JSONObject();
                item.put("id",t.id);item.put("title",t.title);
                item.put("cadence",t.cadence);item.put("cents",t.cents);
                ts.put(item);
            }
            for(Receipt r:receipts) {
                JSONObject item=new JSONObject();
                item.put("id",r.id);item.put("taskId",r.taskId);
                item.put("title",r.title);item.put("period",r.period);
                item.put("cents",r.cents);item.put("timestamp",r.timestamp);
                rs.put(item);
            }
            root.put("schema",1);root.put("tasks",ts);root.put("receipts",rs);
            return preferences.edit().putString("snapshot",root.toString()).commit();
        } catch (JSONException error) {return false;}
    }
}
