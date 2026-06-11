import { useState } from "react";
import { ExternalLink, Copy, Check, Mail, User, Lock, Pencil, Trash2, FileCode, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PortalFormDialog } from "./PortalFormDialog";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

function credentialTitle(portal) {
  switch (portal.name) {
    case 'Admin Portal':
      return portal.username || null
    case 'Vendor Portal':
      return [portal.store, portal.vendor].filter(Boolean).join(' · ') || null
    case 'Store Management Portal':
    case 'Onboarding Portal':
    case 'Buyer/Procurement':
    case 'Storefront':
    case 'Signup Portal':
      return portal.store || null
    default:
      return portal.store || null
  }
}

function buildCopyAll(portal) {
  return [
    `URL:      ${portal.url}`,
    portal.email ? `Email:    ${portal.email}` : null,
    `Username: ${portal.username}`,
    `Password: ${portal.password}`,
  ].filter(Boolean).join("\n");
}

function InlineCopy({ value, copyKey, copiedKey, copy }) {
  const copied = copiedKey === copyKey;
  return (
    <button
      onClick={() => copy(value, copyKey)}
      className="flex items-center justify-center h-full px-3 border-l text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
    >
      {copied
        ? <Check className="size-3.5 text-green-600" />
        : <Copy className="size-3.5" />}
    </button>
  );
}

function FileRow({ file, fileKey, copiedKey, copy, onView }) {
  return (
    <div className="flex items-center h-9 rounded-md border bg-background text-sm overflow-hidden">
      <div className="flex items-center gap-2 flex-1 min-w-0 px-3">
        <FileCode className="size-3.5 shrink-0 text-muted-foreground" />
        <span className="text-muted-foreground font-mono truncate">{file.name}</span>
      </div>
      <InlineCopy value={file.content} copyKey={fileKey} copiedKey={copiedKey} copy={copy} />
      <button
        onClick={onView}
        className="flex items-center justify-center h-full px-3 border-l text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        <Maximize2 className="size-3.5" />
      </button>
    </div>
  );
}

export function PortalCredentialRow({ portal, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [viewingFile, setViewingFile] = useState(null);
  const { copy, copiedKey } = useCopyToClipboard();

  const keys = {
    url:      `${portal.id}-url`,
    email:    `${portal.id}-email`,
    username: `${portal.id}-username`,
    password: `${portal.id}-password`,
    all:      `${portal.id}-all`,
  };

  const title = credentialTitle(portal);

  // Support both new `files` array and legacy `env_content`
  const files = Array.isArray(portal.files) && portal.files.length > 0
    ? portal.files
    : (portal.env_content ? [{ name: '.env', content: portal.env_content }] : []);

  return (
    <>
      <div className="rounded-xl border bg-card p-4 space-y-3">

        {/* Header: title + actions */}
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            {title && (
              <span className="text-sm font-semibold text-foreground capitalize">{title}</span>
            )}
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs px-2.5 text-muted-foreground hover:text-foreground"
              onClick={() => copy(buildCopyAll(portal), keys.all)}>
              {copiedKey === keys.all
                ? <><Check className="size-3 text-green-600" /> Copied!</>
                : <><Copy className="size-3" /> Copy all</>}
            </Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-foreground"
                  onClick={() => setEditing(true)}>
                  <Pencil className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-destructive"
                  onClick={() => setConfirming(true)}>
                  <Trash2 className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* URL field */}
        <div className="flex items-center h-9 rounded-md border bg-background text-sm overflow-hidden">
          <span className="flex-1 min-w-0 px-3 truncate text-muted-foreground select-all">
            {portal.url}
          </span>
          <button
            onClick={() => copy(portal.url, keys.url)}
            className="flex items-center justify-center h-full px-3 border-l text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            {copiedKey === keys.url
              ? <Check className="size-3.5 text-green-600" />
              : <Copy className="size-3.5" />}
          </button>
          <a
            href={portal.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center h-full px-3 border-l text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <ExternalLink className="size-3.5" />
          </a>
        </div>

        {/* Username + Password */}
        <div className="flex items-center gap-2">
          <div className="flex items-center h-9 rounded-md border bg-background text-sm overflow-hidden flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-1 min-w-0 px-3">
              <User className="size-3.5 shrink-0 text-muted-foreground" />
              <span className="flex-1 truncate">{portal.username}</span>
            </div>
            <InlineCopy value={portal.username} copyKey={keys.username} copiedKey={copiedKey} copy={copy} />
          </div>
          <div className="flex items-center h-9 rounded-md border bg-background text-sm overflow-hidden flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-1 min-w-0 px-3">
              <Lock className="size-3.5 shrink-0 text-muted-foreground" />
              <span className="flex-1 truncate font-mono tracking-wide">{portal.password}</span>
            </div>
            <InlineCopy value={portal.password} copyKey={keys.password} copiedKey={copiedKey} copy={copy} />
          </div>
        </div>

        {/* Email */}
        {portal.email && (
          <div className="flex items-center h-9 rounded-md border bg-background text-sm overflow-hidden">
            <div className="flex items-center gap-2 flex-1 min-w-0 px-3">
              <Mail className="size-3.5 shrink-0 text-muted-foreground" />
              <span className="flex-1 truncate">{portal.email}</span>
            </div>
            <InlineCopy value={portal.email} copyKey={keys.email} copiedKey={copiedKey} copy={copy} />
          </div>
        )}

        {/* Files */}
        {files.map((file, i) => (
          <FileRow
            key={i}
            file={file}
            fileKey={`${portal.id}-file-${i}`}
            copiedKey={copiedKey}
            copy={copy}
            onView={() => setViewingFile(file)}
          />
        ))}
      </div>

      {/* File viewer dialog */}
      {viewingFile && (
        <Dialog open={!!viewingFile} onOpenChange={(open) => !open && setViewingFile(null)}>
          <DialogContent className="sm:max-w-4xl w-full flex flex-col h-[80vh]">
            <DialogHeader>
              <div className="flex items-center justify-between pr-8">
                <DialogTitle className="text-base font-mono">
                  {viewingFile.name}
                </DialogTitle>
                <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs shrink-0"
                  onClick={() => copy(viewingFile.content, `${portal.id}-viewer`)}>
                  {copiedKey === `${portal.id}-viewer`
                    ? <><Check className="size-3 text-green-600" /> Copied!</>
                    : <><Copy className="size-3" /> Copy</>}
                </Button>
              </div>
            </DialogHeader>
            <div className="flex flex-col flex-1 min-h-0">
              <textarea
                readOnly
                value={viewingFile.content}
                className="flex-1 w-full rounded-md border bg-background text-foreground font-mono text-sm px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-ring leading-relaxed"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}

      <PortalFormDialog open={editing} onOpenChange={setEditing} portal={portal}
        onSave={(data) => onUpdate(portal.id, data)} />

      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete credentials?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete these credentials.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => onDelete(portal.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
