import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { InstanceFormDialog } from "./InstanceFormDialog";
import { useInstancePortals } from "@/hooks/useInstancePortals";

function getInitials(name) {
  return (name || "U").split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return months < 12 ? `${months}mo ago` : `${Math.floor(months / 12)}y ago`;
}

export function InstanceCardTile({ instance, profileMap = {}, onUpdate, onDelete, backLabel = 'Instances' }) {
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const { portals } = useInstancePortals(instance.id);
  const portalCount = portals.length;

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => navigate(`/instances/${instance.id}`, { state: { backLabel } })}
        onKeyDown={(e) => e.key === "Enter" && navigate(`/instances/${instance.id}`, { state: { backLabel } })}
        className="rounded-xl border bg-card px-5 py-5 space-y-5 cursor-pointer hover:shadow-md transition-shadow select-none"
      >
        {/* Row 1 — portal count + version badges (left) + status (right) */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {instance.version && (
              <Badge variant="secondary" className="text-foreground/70">
                {instance.version}
              </Badge>
            )}
            <Badge variant="outline" className="text-muted-foreground">
              {portalCount} {portalCount === 1 ? "Portal" : "Portals"}
            </Badge>
          </div>
          <Badge
            className={cn(
              "capitalize",
              instance.status === "active"
                ? "border-transparent bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-950 dark:text-green-300"
                : instance.status === "deprecated"
                  ? "border-transparent bg-stone-100 text-stone-500 hover:bg-stone-100 dark:bg-stone-800 dark:text-stone-400"
                  : "border-transparent bg-slate-100 text-slate-500 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400",
            )}
          >
            {instance.status}
          </Badge>
        </div>

        {/* Name + domain */}
        <div className="space-y-3">
          <h3 className="text-xl font-semibold tracking-tight leading-none">
            {instance.name}
          </h3>
          {instance.domain && (
            <p className="text-xs text-muted-foreground truncate">{instance.domain}</p>
          )}
        </div>

        {/* Dashed separator */}
        <div className="border-t border-dashed" />

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <Avatar className="size-5 shrink-0">
              {profileMap[instance.user_id]?.avatar_url && (
                <AvatarImage src={profileMap[instance.user_id].avatar_url} alt="" className="object-cover" />
              )}
              <AvatarFallback className="rounded-full text-[10px] bg-muted text-muted-foreground">
                {getInitials(instance.updated_by_name || instance.created_by_name || "U")}
              </AvatarFallback>
            </Avatar>
            <p className="text-xs text-muted-foreground truncate">
              {instance.updated_by_name ? (
                <><span className="font-medium text-foreground/70">{instance.updated_by_name}</span> updated {timeAgo(instance.updated_at)}</>
              ) : (
                <>Created {new Date(instance.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</>
              )}
            </p>
          </div>

          <div
            className="flex items-center gap-1 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-muted-foreground hover:text-foreground"
                  onClick={() => setEditing(true)}
                  aria-label="Edit instance"
                >
                  <Pencil className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-muted-foreground hover:text-destructive"
                  onClick={() => setConfirming(true)}
                  aria-label="Delete instance"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>

      <InstanceFormDialog
        open={editing}
        onOpenChange={setEditing}
        instance={instance}
        onSave={(data) => onUpdate(instance.id, data)}
      />

      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete &ldquo;{instance.name}&rdquo;?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the instance
              {portalCount > 0
                ? ` and all ${portalCount} portal${portalCount !== 1 ? "s" : ""} with their credentials`
                : ""}
              . This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(instance.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
