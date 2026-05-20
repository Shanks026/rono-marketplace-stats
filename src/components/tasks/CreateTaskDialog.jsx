import { useState } from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTasks } from "@/hooks/useTasks";
import { useGoals } from "@/hooks/useGoals";
import { usePortals } from "@/hooks/usePortals";
import { getCurrentQuarter } from "@/lib/quarter";
import { TASK_TYPES, TaskTypeSelectItem } from "@/lib/taskTypes.jsx";
import { TASK_STATUSES } from "@/lib/taskStatus.jsx";

export function CreateTaskDialog({ open, onClose }) {
  const { createTask } = useTasks();
  const { goals } = useGoals();
  const { portals } = usePortals();

  const [summary, setSummary] = useState("");
  const [goalIds, setGoalIds] = useState([]);
  const [portalId, setPortalId] = useState("");
  const [taskType, setTaskType] = useState("other");
  const [status, setStatus] = useState("todo");
  const [effortHours, setEffortHours] = useState('');
  const [jiraRef, setJiraRef] = useState("");
  const [loggedDate, setLoggedDate] = useState(
    format(new Date(), "yyyy-MM-dd"),
  );
  const [saving, setSaving] = useState(false);

  function toggleGoal(id) {
    setGoalIds((prev) =>
      prev.includes(id)
        ? prev.filter((g) => g !== id)
        : prev.length < 2
          ? [...prev, id]
          : prev,
    );
  }

  async function handleSave() {
    if (!summary.trim()) return;
    setSaving(true);
    try {
      await createTask({
        raw_input: summary,
        summary,
        portal_id: portalId || null,
        task_type: taskType,
        status,
        effort_hours: Number(effortHours),
        jira_ref: jiraRef || null,
        logged_date: loggedDate,
        quarter: getCurrentQuarter(),
        goal_ids: goalIds,
        confidence: goalIds.map(() => 1.0),
      });
      onClose();
      // Reset
      setSummary("");
      setGoalIds([]);
      setPortalId("");
      setTaskType("other");
      setStatus("todo");
      setEffortHours('');
      setJiraRef("");
      setLoggedDate(format(new Date(), "yyyy-MM-dd"));
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-xl max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            Log task manually
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Summary</Label>
            <Input
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="What did you work on?"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label>
              Goals{" "}
              <span className="text-muted-foreground font-normal">(max 2)</span>
            </Label>
            <div className="flex flex-wrap gap-2">
              {goals.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => toggleGoal(g.id)}
                  className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
                    goalIds.includes(g.id)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                  }`}
                >
                  {g.title.split(" ").slice(0, 4).join(" ")}…
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Portal</Label>
              <Select value={portalId} onValueChange={setPortalId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select portal" />
                </SelectTrigger>
                <SelectContent>
                  {portals.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={taskType} onValueChange={setTaskType}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      <TaskTypeSelectItem type={t.value} />
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Effort (hrs)</Label>
              <Input
                type="number"
                min="0.5"
                max="24"
                step="0.5"
                value={effortHours}
                onChange={(e) => setEffortHours(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Jira ref</Label>
              <Input
                placeholder="MP-123 or paste URL"
                value={jiraRef}
                onChange={(e) => {
                  const val = e.target.value;
                  const match = val.match(/\/browse\/([A-Z][A-Z0-9]*-\d+)/i);
                  setJiraRef(match ? match[1].toUpperCase() : val);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={loggedDate}
                onChange={(e) => setLoggedDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !summary.trim()}>
            {saving ? "Saving…" : "Log task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
