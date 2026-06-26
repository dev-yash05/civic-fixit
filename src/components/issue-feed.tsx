"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleUpvote } from "@/actions/upvote";
import { useUIStore } from "@/store/ui";
import { IssueWithUser } from "@/lib/issues";

const CATEGORIES = ["all", "road", "lighting", "waste", "water", "park", "other"] as const;
const STATUSES = ["all", "open", "in_progress", "resolved"] as const;

const CATEGORY_CSS: Record<string, string> = {
  road: "cat-road",
  lighting: "cat-lighting",
  waste: "cat-waste",
  water: "cat-water",
  park: "cat-park",
  other: "cat-other",
};

async function fetchIssues(): Promise<IssueWithUser[]> {
  const res = await fetch("/api/issues");
  if (!res.ok) throw new Error("Failed to fetch issues");
  return res.json();
}

async function fetchMyUpvotes(): Promise<string[]> {
  const res = await fetch("/api/my-upvotes");
  if (!res.ok) return [];
  return res.json();
}

export function IssueFeed({ sessionUserId }: { sessionUserId: string | null }) {
  const qc = useQueryClient();
  const [localCategory, setLocalCategory] = useState<string>("all");
  const [localStatus, setLocalStatus] = useState<string>("all");
  const [localSort, setLocalSort] = useState<"newest" | "oldest" | "most_upvoted">("newest");
  const [localSearch, setLocalSearch] = useState("");

  const { data: issues = [], isLoading } = useQuery({
    queryKey: ["issues"],
    queryFn: fetchIssues,
  });

  const { data: myUpvotes = [] } = useQuery({
    queryKey: ["my-upvotes"],
    queryFn: fetchMyUpvotes,
    enabled: !!sessionUserId,
  });

  const upvoteMutation = useMutation({
    mutationFn: (issueId: string) => toggleUpvote(issueId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["issues"] });
      qc.invalidateQueries({ queryKey: ["my-upvotes"] });
    },
  });

  const filtered = issues
    .filter((issue) => {
      if (localCategory !== "all" && issue.category !== localCategory) return false;
      if (localStatus !== "all" && issue.status !== localStatus) return false;
      if (localSearch && !issue.title.toLowerCase().includes(localSearch.toLowerCase()) && !issue.description.toLowerCase().includes(localSearch.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (localSort === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (localSort === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (localSort === "most_upvoted") return b.upvoteCount - a.upvoteCount;
      return 0;
    });

  return (
    <div className="flex flex-col gap-4 sm:gap-5 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
      {/* Search */}
      <input
        type="text"
        value={localSearch}
        onChange={(e) => setLocalSearch(e.target.value)}
        placeholder="Search issues..."
        className="glass-input w-full px-4 py-3 text-sm"
      />

      {/* Category pills */}
      <div className="flex gap-1.5 flex-wrap">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setLocalCategory(cat)}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium capitalize transition-all cursor-pointer ${
              localCategory === cat
                ? "bg-gradient-to-r from-emerald-400 to-cyan-400 text-[#0a0a0f]"
                : "glass-input text-[var(--text-secondary)] hover:bg-white/5"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Status + sort */}
      <div className="flex items-center gap-3 flex-wrap">
        <select
          value={localStatus}
          onChange={(e) => setLocalStatus(e.target.value)}
          className="glass-input text-sm px-3 py-2 rounded-lg text-[var(--text-primary)] cursor-pointer"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s} className="bg-[var(--bg-card)] text-[var(--text-primary)]">
              {s === "all" ? "All statuses" : s.replace("_", " ")}
            </option>
          ))}
        </select>
        <select
          value={localSort}
          onChange={(e) => setLocalSort(e.target.value as any)}
          className="glass-input text-sm px-3 py-2 rounded-lg text-[var(--text-primary)] cursor-pointer"
        >
          <option value="newest" className="bg-[var(--bg-card)]">Newest first</option>
          <option value="oldest" className="bg-[var(--bg-card)]">Oldest first</option>
          <option value="most_upvoted" className="bg-[var(--bg-card)]">Most upvoted</option>
        </select>
        <span className="text-sm text-[var(--text-muted)] ml-auto">
          {filtered.length} issue{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card rounded-2xl p-5 h-32 animate-shimmer" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <p className="text-[var(--text-secondary)] text-sm">No issues match your filters.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((issue) => {
            const hasUpvoted = myUpvotes.includes(issue.id);
            return (
              <div 
                key={issue.id} 
                onClick={() => useUIStore.getState().openIssueDetail(issue.id)}
                className="glass-card rounded-2xl p-4 sm:p-5 flex gap-4 cursor-pointer hover:bg-white/5 hover:border-white/10 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all group"
              >
                {/* Upvote */}
                <div className="flex flex-col items-center shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!sessionUserId) return;
                      upvoteMutation.mutate(issue.id);
                    }}
                    disabled={!sessionUserId || upvoteMutation.isPending}
                    className={`flex flex-col items-center gap-0.5 px-2.5 py-2 rounded-xl border transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                      hasUpvoted
                        ? "bg-emerald-400/15 border-emerald-400/40 text-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.15)]"
                        : "border-[var(--glass-border)] text-[var(--text-muted)] hover:border-[var(--glass-border-hover)] hover:text-[var(--text-primary)]"
                    }`}
                    title={sessionUserId ? (hasUpvoted ? "Remove upvote" : "Upvote") : "Sign in to upvote"}
                  >
                    <span className="text-xs">▲</span>
                    <span className="text-xs font-semibold">{issue.upvoteCount}</span>
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${CATEGORY_CSS[issue.category] ?? "cat-other"}`}>
                          {issue.category}
                        </span>
                        <span className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider status-${issue.status}`}>
                          {issue.status.replace("_", " ")}
                        </span>
                      </div>
                      <p className="font-semibold text-[var(--text-primary)] leading-snug text-base sm:text-lg group-hover:text-emerald-400 transition-colors line-clamp-1">{issue.title}</p>
                    </div>
                    {/* Timestamp */}
                    <span className="text-xs font-medium text-[var(--text-muted)] shrink-0 hidden sm:block">
                      {new Date(issue.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                  
                  <div className="flex gap-4 items-start">
                    <p className="text-sm text-[var(--text-secondary)] line-clamp-2 sm:line-clamp-3 leading-relaxed flex-1">
                      {issue.description}
                    </p>
                    {issue.imageUrl && (
                      <div className="shrink-0 w-20 h-20 sm:w-28 sm:h-28 rounded-xl overflow-hidden relative border border-white/10 shadow-lg">
                        <img 
                          src={issue.imageUrl} 
                          alt={issue.title} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 flex-wrap mt-auto pt-1">
                    {issue.address && (
                      <span className="text-xs font-medium text-[var(--text-muted)] truncate max-w-[200px] sm:max-w-xs flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        {issue.address}
                      </span>
                    )}
                    <span className="text-xs font-medium text-[var(--text-muted)] sm:hidden flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {new Date(issue.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </span>
                    {issue.userName && (
                      <span className="text-xs font-medium text-[var(--text-muted)] ml-auto flex items-center gap-1.5 border border-white/5 bg-white/5 px-2.5 py-1 rounded-full">
                        <svg className="w-3.5 h-3.5 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        {issue.userName}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!sessionUserId && (
        <p className="text-xs text-center text-[var(--text-muted)]">
          <a href="/sign-in" className="text-[var(--text-accent)] hover:underline">Sign in</a>{" "}to upvote issues
        </p>
      )}
    </div>
  );
}