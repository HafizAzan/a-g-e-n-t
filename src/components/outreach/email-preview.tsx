"use client";

import { Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EmailStatusBadge } from "@/components/outreach/email-status-badge";
import { buildEmailBody } from "@/lib/templates";
import type { OutreachDraft } from "@/types/outreach";

type EmailPreviewProps = {
  draft: OutreachDraft;
  fixing?: boolean;
  onChange: (draft: OutreachDraft) => void;
  onFix?: () => void;
};

export function EmailPreview({
  draft,
  fixing = false,
  onChange,
  onFix,
}: EmailPreviewProps) {
  function update(patch: Partial<OutreachDraft>) {
    const next = { ...draft, ...patch };
    if (
      patch.greeting !== undefined ||
      patch.introduction !== undefined ||
      patch.offer !== undefined ||
      patch.callToAction !== undefined ||
      patch.signature !== undefined
    ) {
      next.body = buildEmailBody({
        greeting: next.greeting,
        introduction: next.introduction,
        offer: next.offer,
        callToAction: next.callToAction,
        signature: next.signature,
      });
    }
    onChange(next);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-medium">{draft.lead.businessName}</p>
          <p className="text-sm text-muted-foreground">
            {draft.lead.email || "No email address"}
          </p>
        </div>
        <EmailStatusBadge status={draft.status} />
      </div>

      <div className="space-y-2">
        <Label>Subject</Label>
        <Input
          value={draft.subject}
          onChange={(e) => update({ subject: e.target.value })}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Greeting</Label>
          <Input
            value={draft.greeting}
            onChange={(e) => update({ greeting: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Call to action</Label>
          <Input
            value={draft.callToAction}
            onChange={(e) => update({ callToAction: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Introduction</Label>
        <Textarea
          value={draft.introduction}
          onChange={(e) => update({ introduction: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Offer</Label>
        <Textarea
          value={draft.offer}
          onChange={(e) => update({ offer: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Signature</Label>
        <Textarea
          value={draft.signature}
          onChange={(e) => update({ signature: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Full body preview</Label>
        <Textarea
          className="min-h-[180px] font-mono text-xs"
          value={draft.body}
          onChange={(e) => update({ body: e.target.value })}
        />
      </div>

      {draft.aiReviewNotes ? (
        <div className="space-y-3 rounded-md border border-sky-500/30 bg-sky-500/10 px-3 py-3 text-sm text-sky-200">
          <div>
            <p className="mb-1 font-medium">AI review</p>
            <p>{draft.aiReviewNotes}</p>
          </div>
          {draft.needsFix && onFix ? (
            <Button
              type="button"
              size="sm"
              disabled={fixing}
              onClick={onFix}
            >
              <Wrench />
              {fixing ? "AI fixing..." : "Fix"}
            </Button>
          ) : null}
        </div>
      ) : null}

      {draft.error ? (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {draft.error}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          onClick={() =>
            onChange({
              ...draft,
              approved: true,
              status: draft.status === "sent" ? "sent" : "approved",
            })
          }
        >
          Approve
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            onChange({
              ...draft,
              approved: false,
              status: "draft",
            })
          }
        >
          Unapprove
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() =>
            onChange({
              ...draft,
              approved: false,
              status: "skipped",
            })
          }
        >
          Skip
        </Button>
      </div>
    </div>
  );
}
