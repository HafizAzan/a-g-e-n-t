/**
 * map-lead.ts — backend LeadDto → UI types used by tables / detail.
 */
import type { LeadDto } from "@/api/search.api";
import type { LeadDetail } from "@/types/lead-detail";
import type { ResultLead, WebsiteStatus } from "@/types/result-lead";
import type { SearchRun, SearchRunStatus } from "@/types/search";
import type { SearchStatus } from "@/api/search.api";
import type { DashboardStats } from "@/types/dashboard";

function asWebsiteStatus(value?: string): WebsiteStatus {
  if (value === "good" || value === "poor" || value === "none") return value;
  return "unknown";
}

/** Results table + shared card row shape */
export function toResultLead(dto: LeadDto): ResultLead {
  return {
    id: dto.id,
    searchId: dto.searchId,
    business: dto.businessName || "Untitled",
    phone: dto.phone || "",
    email: dto.email || "",
    website: dto.website || "",
    websiteStatus: asWebsiteStatus(dto.websiteStatus),
    leadScore: dto.leadScore ?? 0,
    rating: dto.rating ?? 0,
    reviews: dto.reviewCount ?? 0,
    city: dto.city || dto.address || "",
    country: dto.country || "",
  };
}

/**
 * Detail page — enrichment sections stay empty until website/AI APIs exist.
 */
export function toLeadDetail(dto: LeadDto): LeadDetail {
  const base = toResultLead(dto);
  const notes = Array.isArray(dto.aiNotes)
    ? dto.aiNotes.map(String)
    : [];

  return {
    ...base,
    address: dto.address || base.city || "",
    state: "",
    category: dto.category || "",
    description: notes[0] || "No AI notes yet.",
    latitude: 0,
    longitude: 0,
    websiteAnalysis: {
      loadSpeed: "—",
      mobileFriendly: false,
      https: (dto.website || "").startsWith("https"),
      brokenLinks: 0,
      lastChecked: dto.createdAt || new Date().toISOString(),
      summary: "Website analysis not run yet.",
    },
    seoAnalysis: {
      titleTag: "—",
      metaDescription: "—",
      h1Count: 0,
      indexedPages: 0,
      score: 0,
      issues: ["SEO scan not available yet."],
    },
    technologyStack: [],
    googleReviews: [],
    aiNotes: notes,
    scoreBreakdown: [
      { label: "Lead score", value: dto.leadScore ?? 0 },
    ],
  };
}

export function toSearchRun(search: SearchStatus): SearchRun {
  const status = (search.status || "queued") as SearchRunStatus;
  const progressPercent =
    status === "completed"
      ? 100
      : status === "running"
        ? 55
        : status === "failed"
          ? 0
          : 10;

  return {
    id: search.id,
    title: search.query || "Search",
    summary: [search.city, search.country].filter(Boolean).join(", "),
    status,
    leadCount: search.leadCount ?? search.totalFound ?? 0,
    createdAt: search.createdAt || "",
    progressPercent,
  };
}

export function buildDashboardStats(
  searches: SearchStatus[],
  leadsCount: number
): DashboardStats {
  const activeRuns = searches.filter(
    (s) => s.status === "running" || s.status === "queued"
  ).length;

  return {
    totalSearches: searches.length,
    leadsFound: leadsCount,
    activeRuns,
    exportsThisWeek: 0,
  };
}
