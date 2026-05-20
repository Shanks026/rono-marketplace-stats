import { useState } from "react";
import {
  ExternalLink,
  Copy,
  Check,
  Mail,
  Link,
  User,
  Lock,
  Pencil,
  Trash2,
  ShieldCheck,
  Store,
  Package,
  UserPlus,
  UserCheck,
  Globe,
  ShoppingBasket,
  FileCode,
} from "lucide-react";

const PORTAL_STYLES = {
  "Admin Portal": {
    icon: ShieldCheck,
    bg: "bg-pink-100 dark:bg-pink-950",
    text: "text-pink-700 dark:text-pink-300",
  },
  "Store Management Portal": {
    icon: Store,
    bg: "bg-purple-100   dark:bg-purple-950",
    text: "text-purple-700   dark:text-purple-300",
  },
  "Vendor Portal": {
    icon: Package,
    bg: "bg-blue-100   dark:bg-blue-950",
    text: "text-blue-700   dark:text-blue-300",
  },
  "Onboarding Portal": {
    icon: UserPlus,
    bg: "bg-orange-100 dark:bg-orange-950",
    text: "text-orange-700 dark:text-orange-300",
  },
  "Signup Portal": {
    icon: UserCheck,
    bg: "bg-rose-100   dark:bg-rose-950",
    text: "text-rose-700   dark:text-rose-300",
  },
  Storefront: {
    icon: Globe,
    bg: "bg-amber-100  dark:bg-amber-950",
    text: "text-amber-700  dark:text-amber-300",
  },
  "Buyer/Procurement": {
    icon: ShoppingBasket,
    bg: "bg-emerald-100 dark:bg-emerald-950",
    text: "text-emerald-700 dark:text-emerald-300",
  },
};

function PortalIcon({ name }) {
  const key = Object.keys(PORTAL_STYLES).find((k) => name?.toLowerCase().includes(k.toLowerCase()));
  const style = key ? PORTAL_STYLES[key] : null;
  if (!style) return null;
  const Icon = style.icon;
  return (
    <span
      className={`inline-flex items-center justify-center size-7 rounded-lg shrink-0 ${style.bg} ${style.text}`}
    >
      <Icon className="size-3.5" />
    </span>
  );
}
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PortalFormDialog } from "./PortalFormDialog";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

function buildCopyAll(portal) {
  return [
    `Portal:   ${portal.name}`,
    `URL:      ${portal.url}`,
    portal.email ? `Email:    ${portal.email}` : null,
    `Username: ${portal.username}`,
    `Password: ${portal.password}`,
  ]
    .filter(Boolean)
    .join("\n");
}

function CopyBtn({ value, copyKey, label, copiedKey, copy }) {
  const copied = copiedKey === copyKey;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-6 shrink-0"
          onClick={() => copy(value, copyKey)}
          aria-label={label}
        >
          {copied ? (
            <Check className="size-3.5 text-green-600" />
          ) : (
            <Copy className="size-3.5 text-muted-foreground" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{copied ? "Copied!" : label}</TooltipContent>
    </Tooltip>
  );
}

export function PortalCredentialRow({ portal, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [envOpen, setEnvOpen] = useState(false);
  const { copy, copiedKey } = useCopyToClipboard();

  const keys = {
    url: `${portal.id}-url`,
    email: `${portal.id}-email`,
    username: `${portal.id}-username`,
    password: `${portal.id}-password`,
    all: `${portal.id}-all`,
  };

  return (
    <>
      <div>
        {/* Portal header row */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2 min-w-0">
            <PortalIcon name={portal.name} />
            <span className="text-sm font-medium truncate">{portal.name}</span>
            {portal.store && (
              <>
                <span className="size-1 rounded-full bg-muted-foreground/40 shrink-0" />
                <span className="text-sm font-medium truncate">
                  {portal.store}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0 ml-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1.5 text-xs"
              onClick={() => copy(buildCopyAll(portal), keys.all)}
            >
              {copiedKey === keys.all ? (
                <>
                  <Check className="size-3 text-green-600" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="size-3" />
                  Copy All
                </>
              )}
            </Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6"
                  onClick={() => setEditing(true)}
                  aria-label="Edit portal"
                >
                  <Pencil className="size-3.5 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6 hover:text-destructive"
                  onClick={() => setConfirming(true)}
                  aria-label="Delete portal"
                >
                  <Trash2 className="size-3.5 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Dashed separator between title and credentials */}
        <div className="mx-4 border-t border-dashed" />

        {/* Credential rows */}
        <div className="p-4 space-y-2">
          {/* URL */}
          <div className="flex items-center gap-2">
            <Link className="size-4 shrink-0 text-muted-foreground" />
            <a
              href={portal.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 min-w-0 flex items-center gap-1 text-sm hover:underline truncate"
            >
              <span className="truncate">{portal.url}</span>
              <ExternalLink className="size-3.5 shrink-0 text-muted-foreground" />
            </a>
            <CopyBtn
              value={portal.url}
              copyKey={keys.url}
              label="Copy URL"
              copiedKey={copiedKey}
              copy={copy}
            />
          </div>

          {/* Email — only if set */}
          {portal.email && (
            <div className="flex items-center gap-2">
              <Mail className="size-4 shrink-0 text-muted-foreground" />
              <span className="flex-1 min-w-0 truncate text-sm">
                {portal.email}
              </span>
              <CopyBtn
                value={portal.email}
                copyKey={keys.email}
                label="Copy email"
                copiedKey={copiedKey}
                copy={copy}
              />
            </div>
          )}

          {/* Username */}
          <div className="flex items-center gap-2">
            <User className="size-4 shrink-0 text-muted-foreground" />
            <span className="flex-1 min-w-0 truncate text-sm">
              {portal.username}
            </span>
            <CopyBtn
              value={portal.username}
              copyKey={keys.username}
              label="Copy username"
              copiedKey={copiedKey}
              copy={copy}
            />
          </div>

          {/* Password — always visible */}
          <div className="flex items-center gap-2">
            <Lock className="size-4 shrink-0 text-muted-foreground" />
            <span className="flex-1 min-w-0 truncate text-sm font-mono tracking-wide">
              {portal.password}
            </span>
            <CopyBtn
              value={portal.password}
              copyKey={keys.password}
              label="Copy password"
              copiedKey={copiedKey}
              copy={copy}
            />
          </div>

          {/* .env link */}
          {portal.env_content && (
            <div className="flex items-center gap-2">
              <FileCode className="size-4 shrink-0 text-muted-foreground" />
              <button
                onClick={() => setEnvOpen(true)}
                className="flex-1 min-w-0 text-sm text-left text-blue-600 dark:text-blue-400 underline"
              >
                .env
              </button>
            </div>
          )}
        </div>
      </div>

      {/* .env viewer */}
      <Dialog open={envOpen} onOpenChange={setEnvOpen}>
        <DialogContent className="sm:max-w-4xl w-full flex flex-col h-[80vh]">
          <DialogHeader>
            <div className="flex items-center justify-between pr-8">
              <DialogTitle className="text-base">
                .env — {portal.name}{portal.store ? ` · ${portal.store}` : ''}
              </DialogTitle>
              <Button
                variant="outline"
                size="sm"
                className="h-7 gap-1.5 text-xs shrink-0"
                onClick={() => copy(portal.env_content, `${portal.id}-env`)}
              >
                {copiedKey === `${portal.id}-env`
                  ? <><Check className="size-3 text-green-600" /> Copied!</>
                  : <><Copy className="size-3" /> Copy</>
                }
              </Button>
            </div>
          </DialogHeader>
          <div className="flex flex-col flex-1 min-h-0">
            <textarea
              readOnly
              value={portal.env_content}
              className="flex-1 w-full rounded-md border bg-background text-foreground font-mono text-sm px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-ring leading-relaxed"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <PortalFormDialog
        open={editing}
        onOpenChange={setEditing}
        portal={portal}
        onSave={(data) => onUpdate(portal.id, data)}
      />

      {/* Delete confirmation */}
      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete &ldquo;{portal.name}&rdquo;?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This portal and its credentials will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(portal.id)}
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
