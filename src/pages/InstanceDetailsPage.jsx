import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAllProfiles } from "@/hooks/useProfile";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { PORTAL_NAMES } from "@/lib/portalStyles";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
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
import { PortalCredentialRow } from "@/components/instances/PortalCredentialRow";
import { PortalFormDialog } from "@/components/instances/PortalFormDialog";
import { InstanceFormDialog } from "@/components/instances/InstanceFormDialog";
import { useInstancePortals } from "@/hooks/useInstancePortals";

function statusClass(status) {
  if (status === "active")
    return "border-transparent bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300";
  if (status === "deprecated")
    return "border-transparent bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400";
  return "border-transparent bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400";
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

export default function InstanceDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const qc = useQueryClient();

  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [activeTab, setActiveTab] = useState(PORTAL_NAMES[0]);
  const [addingPortal, setAddingPortal] = useState(false);
  const profileMap = useAllProfiles();

  const { data: instance, isLoading } = useQuery({
    queryKey: ["instance", id],
    enabled: !!user && !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("instances")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (!user || !id) return;
    const channel = supabase
      .channel(`instance-${id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "instances", filter: `id=eq.${id}` },
        () => qc.invalidateQueries({ queryKey: ["instance", id] }))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, id, qc]);

  function getUserName() {
    return user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "Unknown";
  }

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const { error } = await supabase
        .from("instances")
        .update({ ...data, updated_at: new Date().toISOString(), updated_by_name: getUserName() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["instance", id] });
      qc.invalidateQueries({ queryKey: ["instances"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("instances").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["instances"] });
      navigate("/instances");
    },
  });

  const { portals, isLoading: portalsLoading, createPortal, updatePortal, deletePortal } =
    useInstancePortals(id);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Spinner />
      </div>
    );
  }

  if (!instance) {
    return (
      <div className="mx-auto max-w-5xl px-12 py-10 text-center">
        <p className="text-sm text-muted-foreground">Instance not found.</p>
        <Button variant="ghost" size="sm" className="mt-4" onClick={() => navigate("/instances")}>
          ← Back to Instances
        </Button>
      </div>
    );
  }

  return (
    // Two-section layout: header (fixed) + portals (scrollable content area)
    <div className="flex flex-col h-[calc(100svh-3.5rem)] overflow-hidden">

      {/* ── Section 1: Instance header ── */}
      <div className="shrink-0 px-12 py-6 space-y-3">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/instances">Instances</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{instance.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-foreground" onClick={() => setEditing(true)}>
              <Pencil className="size-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-destructive" onClick={() => setConfirming(true)}>
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </div>

        {/* Instance info */}
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-semibold tracking-tight">{instance.name}</h1>
            {instance.version && (
              <Badge variant="secondary" className="text-foreground/70">{instance.version}</Badge>
            )}
            <Badge className={cn("capitalize", statusClass(instance.status))}>
              {instance.status}
            </Badge>
          </div>
          <div className="flex items-center justify-between gap-4">
            {instance.domain
              ? <p className="text-sm text-muted-foreground">{instance.domain}</p>
              : <span />
            }
            <div className="flex items-center gap-4 shrink-0 text-xs text-muted-foreground">
              <span>
                Created by <span className="text-foreground/70 font-medium">{profileMap[instance.user_id]?.full_name || instance.created_by_name || "Unknown"}</span>
                {' · '}
                {new Date(instance.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                {' '}
                {new Date(instance.created_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
              </span>
              {(instance.updated_by_id || instance.updated_by_name) && (
                <span>
                  Updated by <span className="text-foreground/70 font-medium">{profileMap[instance.updated_by_id]?.full_name || instance.updated_by_name || "Unknown"}</span>
                  {' · '}
                  {timeAgo(instance.updated_at)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 2: Portals ── */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 min-h-0 flex flex-col gap-0"
      >
        {/* Horizontal tab list below header */}
        <TabsList className="shrink-0 h-auto w-full bg-transparent rounded-none p-0 pb-px pl-12 pr-6 flex items-center justify-start gap-6 border-b overflow-x-auto no-scrollbar">
          {PORTAL_NAMES.map((name) => {
            const count = portals.filter(p => p.name === name).length
            return (
              <TabsTrigger
                key={name}
                value={name}
                className="h-auto flex-none gap-1.5 rounded-none border-0 border-b-2 border-transparent px-0 py-3 text-sm font-normal text-muted-foreground shadow-none bg-transparent transition-colors hover:text-foreground data-[state=active]:border-foreground data-[state=active]:text-foreground data-[state=active]:font-medium data-[state=active]:shadow-none data-[state=active]:bg-transparent dark:data-[state=active]:border-foreground dark:data-[state=active]:bg-transparent"
              >
                {name}
                {count > 0 && (
                  <Badge variant="secondary" className="px-1.5 py-0 text-xs font-normal">
                    {count}
                  </Badge>
                )}
              </TabsTrigger>
            )
          })}
        </TabsList>

        {/* Scrollable content */}
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-12 py-6">
          {PORTAL_NAMES.map((name) => {
            const tabPortals = portals.filter(p => p.name === name)
            return (
              <TabsContent key={name} value={name} className="mt-0 space-y-4">
                <div className="flex items-center justify-between">
                  <Button size="sm" variant="outline" className="gap-1.5 ml-auto" onClick={() => setAddingPortal(true)}>
                    <Plus className="size-3.5" />
                    Add credentials
                  </Button>
                </div>

                {portalsLoading ? (
                  <div className="flex justify-center py-10"><Spinner /></div>
                ) : tabPortals.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-6">
                    No {name} credentials yet.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 3xl:grid-cols-3 gap-4">
                    {tabPortals.map((portal) => (
                      <PortalCredentialRow
                        key={portal.id}
                        portal={portal}
                        onUpdate={updatePortal}
                        onDelete={deletePortal}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            )
          })}
        </div>
      </Tabs>

      {/* Dialogs */}
      <InstanceFormDialog
        open={editing}
        onOpenChange={setEditing}
        instance={instance}
        onSave={(data) => updateMutation.mutateAsync(data)}
      />

      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{instance.name}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the instance and all portal credentials. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutateAsync()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <PortalFormDialog
        open={addingPortal}
        onOpenChange={setAddingPortal}
        lockedName={activeTab}
        onSave={createPortal}
      />
    </div>
  );
}
