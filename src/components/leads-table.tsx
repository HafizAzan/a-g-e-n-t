"use client";

import { useEffect, useMemo, useState } from "react";
import { Eye } from "lucide-react";
import type { Lead } from "@/types/lead";
import type { EmailSendStatus } from "@/types/outreach";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmailStatusBadge } from "@/components/outreach/email-status-badge";
import { LeadsPagination } from "@/components/leads-pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type LeadsTableProps = {
  leads: Lead[];
  selectedIndexes: number[];
  statusByIndex: Record<number, EmailSendStatus>;
  onToggle: (index: number) => void;
  onToggleAll: () => void;
};

type NotesModalState = {
  businessName: string;
  notes: string;
} | null;

function CellText({ value }: { value: string }) {
  if (!value) {
    return <span className="text-muted-foreground">—</span>;
  }
  return <span className="wrap-break-word whitespace-normal">{value}</span>;
}

function CellLink({ value }: { value: string }) {
  if (!value) {
    return <span className="text-muted-foreground">—</span>;
  }

  if (/^https?:\/\//i.test(value)) {
    return (
      <a
        href={value}
        target="_blank"
        rel="noreferrer"
        className="break-all text-sky-400 underline-offset-2 hover:underline"
      >
        {value}
      </a>
    );
  }

  return <span className="wrap-break-word whitespace-normal">{value}</span>;
}

export function LeadsTable({
  leads,
  selectedIndexes,
  statusByIndex,
  onToggle,
  onToggleAll,
}: LeadsTableProps) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [notesModal, setNotesModal] = useState<NotesModalState>(null);

  useEffect(() => {
    setPage(1);
  }, [leads.length]);

  const totalPages = Math.max(1, Math.ceil(leads.length / pageSize));

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const pageRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return leads
      .map((lead, index) => ({ lead, index }))
      .slice(start, start + pageSize);
  }, [leads, page, pageSize]);

  if (leads.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/20 px-4 py-14 text-center">
        <p className="text-sm text-muted-foreground">
          No leads yet. Enter a prompt and click Generate Leads.
        </p>
      </div>
    );
  }

  const allSelected =
    leads.length > 0 && selectedIndexes.length === leads.length;

  return (
    <div className="rounded-xl border border-border bg-card/30">
      <div className="leads-table-scroll w-full overflow-x-auto">
        <Table className="w-full min-w-[960px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-12">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={() => onToggleAll()}
                  aria-label="Select all leads"
                />
              </TableHead>
              <TableHead className="w-28">Status</TableHead>
              <TableHead className="w-40">Business</TableHead>
              <TableHead className="w-32">Category</TableHead>
              <TableHead className="w-36">Location</TableHead>
              <TableHead className="w-40">Email</TableHead>
              <TableHead className="w-32">Phone</TableHead>
              <TableHead className="w-40">Website</TableHead>
              <TableHead className="w-24 text-center">AI Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.map(({ lead, index }) => {
              const selected = selectedIndexes.includes(index);
              const status = statusByIndex[index] || "pending";

              return (
                <TableRow key={`${lead.businessName}-${index}`}>
                  <TableCell>
                    <Checkbox
                      checked={selected}
                      onCheckedChange={() => onToggle(index)}
                      aria-label={`Select ${lead.businessName}`}
                    />
                  </TableCell>
                  <TableCell>
                    <EmailStatusBadge status={status} />
                  </TableCell>
                  <TableCell className="font-medium">
                    <CellText value={lead.businessName} />
                  </TableCell>
                  <TableCell>
                    <CellText value={lead.category} />
                  </TableCell>
                  <TableCell>
                    <CellText
                      value={
                        [lead.city, lead.country].filter(Boolean).join(", ")
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <CellText value={lead.email} />
                  </TableCell>
                  <TableCell>
                    <CellText value={lead.phone} />
                  </TableCell>
                  <TableCell>
                    <CellLink value={lead.website} />
                  </TableCell>
                  <TableCell className="text-center">
                    {lead.aiNotes ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        aria-label={`View AI notes for ${lead.businessName}`}
                        onClick={() =>
                          setNotesModal({
                            businessName: lead.businessName,
                            notes: lead.aiNotes,
                          })
                        }
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <LeadsPagination
        page={page}
        pageSize={pageSize}
        totalItems={leads.length}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
      />

      <Dialog
        open={Boolean(notesModal)}
        onOpenChange={(open) => {
          if (!open) setNotesModal(null);
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>AI Notes</DialogTitle>
            <DialogDescription>
              {notesModal?.businessName || "Lead"}
            </DialogDescription>
          </DialogHeader>
          <p className="max-h-[60vh] overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {notesModal?.notes}
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
