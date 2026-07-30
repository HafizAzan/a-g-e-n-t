import { MapPin } from "lucide-react";
import { DetailSectionCard } from "@/features/lead-detail/detail-section-card";
import type { LeadDetail } from "@/types/lead-detail";

type MapLocationProps = {
  lead: LeadDetail;
};

/**
 * MapLocation
 * Purpose: static map-style preview (no Maps API / no backend).
 * Uses CSS only to suggest a map surface with a pin.
 */
export function MapLocation({ lead }: MapLocationProps) {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${lead.address}, ${lead.city}, ${lead.country}`
  )}`;

  return (
    <DetailSectionCard
      title="Map Location"
      description="Static preview — open in Google Maps for the real place."
      action={
        <div className="flex size-9 items-center justify-center rounded-lg bg-secondary">
          <MapPin className="size-4 text-muted-foreground" />
        </div>
      }
    >
      <div className="space-y-4">
        {/* Fake map surface */}
        <div className="relative h-52 overflow-hidden rounded-xl border border-border/60 bg-[radial-gradient(circle_at_30%_20%,rgba(56,189,248,0.18),transparent_40%),radial-gradient(circle_at_70%_70%,rgba(52,211,153,0.12),transparent_35%),linear-gradient(145deg,#12151a,#0d1014_45%,#151a20)]">
          {/* Soft grid lines */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />

          {/* Center pin */}
          <div className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-[70%] flex-col items-center">
            <div className="flex size-10 items-center justify-center rounded-full bg-red-500 text-white shadow-lg shadow-red-500/30 ring-4 ring-red-500/20">
              <MapPin className="size-5" />
            </div>
            <div className="mt-1 h-2 w-2 rounded-full bg-red-500/50 blur-[1px]" />
          </div>

          <div className="absolute right-3 bottom-3 rounded-lg border border-white/10 bg-black/50 px-2.5 py-1.5 text-[10px] text-zinc-300 backdrop-blur">
            {lead.latitude.toFixed(4)}, {lead.longitude.toFixed(4)}
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {lead.address}, {lead.city}, {lead.country}
          </p>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-sky-300 hover:underline"
          >
            Open in Google Maps
          </a>
        </div>
      </div>
    </DetailSectionCard>
  );
}
