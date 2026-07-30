"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DEFAULT_TEMPLATES,
  loadTemplates,
  saveTemplates,
} from "@/lib/templates";
import type { AttachmentPayload, EmailTemplate } from "@/types/outreach";

type EmailComposerProps = {
  selectedCount: number;
  generating: boolean;
  reviewing: boolean;
  onGenerate: (input: {
    template: EmailTemplate;
    senderName: string;
  }) => void;
  onAttachmentsChange: (files: AttachmentPayload[]) => void;
};

async function fileToAttachment(file: File): Promise<AttachmentPayload> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return {
    filename: file.name,
    mimeType: file.type || "application/octet-stream",
    contentBase64: btoa(binary),
  };
}

export function EmailComposer({
  selectedCount,
  generating,
  reviewing,
  onGenerate,
  onAttachmentsChange,
}: EmailComposerProps) {
  const [templates, setTemplates] = useState<EmailTemplate[]>(DEFAULT_TEMPLATES);
  const [templateId, setTemplateId] = useState(DEFAULT_TEMPLATES[0].id);
  const [senderName, setSenderName] = useState("Your Name");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    setTemplates(loadTemplates());
  }, []);

  const active = templates.find((t) => t.id === templateId) || templates[0];

  function updateActive(patch: Partial<EmailTemplate>) {
    const next = templates.map((t) =>
      t.id === active.id ? { ...t, ...patch } : t
    );
    setTemplates(next);
    saveTemplates(next);
  }

  return (
    <section className="space-y-4 rounded-xl border border-border bg-card/40 p-5 sm:p-6">
      <div>
        <h2 className="text-lg font-medium">Email Composer</h2>
        <p className="text-sm text-muted-foreground">
          Choose a template, personalize it, then generate unique emails for
          selected leads.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Template</Label>
          <Select
            value={templateId}
            onValueChange={(value) =>
              setTemplateId(value as EmailTemplate["id"])
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select template" />
            </SelectTrigger>
            <SelectContent>
              {templates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="senderName">Sender name</Label>
          <Input
            id="senderName"
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => setEditing((v) => !v)}
        >
          {editing ? "Hide template editor" : "Edit template"}
        </Button>
        <Button
          type="button"
          disabled={selectedCount === 0 || generating || reviewing}
          onClick={() => onGenerate({ template: active, senderName })}
        >
          {generating
            ? "Generating emails..."
            : `Generate emails (${selectedCount})`}
        </Button>
      </div>

      {editing ? (
        <div className="grid gap-3 rounded-lg border border-border p-4">
          <div className="space-y-2">
            <Label>Subject hint</Label>
            <Input
              value={active.subjectHint}
              onChange={(e) => updateActive({ subjectHint: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Offer</Label>
            <Textarea
              value={active.offer}
              onChange={(e) => updateActive({ offer: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Call to action</Label>
            <Textarea
              value={active.callToAction}
              onChange={(e) => updateActive({ callToAction: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Signature</Label>
            <Textarea
              value={active.signature}
              onChange={(e) => updateActive({ signature: e.target.value })}
            />
          </div>
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="attachments">Optional attachments</Label>
        <Input
          id="attachments"
          type="file"
          multiple
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            void Promise.all(files.map(fileToAttachment)).then(
              onAttachmentsChange
            );
          }}
        />
        <p className="text-xs text-muted-foreground">
          Example: Portfolio.pdf, Company Profile.pdf, Pricing.pdf
        </p>
      </div>
    </section>
  );
}
