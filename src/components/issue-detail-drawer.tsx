"use client";

import { useUIStore } from "@/store/ui";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { IssueWithUser } from "@/lib/issues";
import { updateIssueStatus } from "@/actions/issue";
import { toggleUpvote } from "@/actions/upvote";
import { useMutation } from "@tanstack/react-query";

const CATEGORY_CSS: Record<string, string> = {
  road: "cat-road",
  lighting: "cat-lighting",
  waste: "cat-waste",
  water: "cat-water",
  park: "cat-park",
  other: "cat-other",
};

export function IssueDetailDrawer({ sessionUserId }: { sessionUserId: string | null }) {
  const { isIssueDetailOpen, selectedIssueId, closeIssueDetail } = useUIStore();
  const qc = useQueryClient();
  const [updating, setUpdating] = useState(false);

  // We can fetch from the existing query cache or fetch single issue.
  // We'll reuse the 'issues' cache if available, otherwise fetch all again.
  const { data: issues = [], isLoading } = useQuery<IssueWithUser[]>({
    queryKey: ["issues"],
    queryFn: async () => {
      const res = await fetch("/api/issues");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: isIssueDetailOpen,
  });

  const { data: myUpvotes = [] } = useQuery({
    queryKey: ["my-upvotes"],
    queryFn: async () => {
      const res = await fetch("/api/my-upvotes");
      if (!res.ok) return [];
      return res.json();
    },
    enabled: isIssueDetailOpen && !!sessionUserId,
  });

  const upvoteMutation = useMutation({
    mutationFn: (issueId: string) => toggleUpvote(issueId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["issues"] });
      qc.invalidateQueries({ queryKey: ["my-upvotes"] });
    },
  });

  const issue = issues.find((i) => i.id === selectedIssueId);

  if (!isIssueDetailOpen) return null;

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!issue) return;
    const newStatus = e.target.value as any;
    setUpdating(true);
    try {
      await updateIssueStatus(issue.id, newStatus);
      // Optimistically update cache
      qc.setQueryData(["issues"], (old: IssueWithUser[] | undefined) => {
        if (!old) return old;
        return old.map((i) => (i.id === issue.id ? { ...i, status: newStatus } : i));
      });
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000] animate-in fade-in duration-200"
        onClick={closeIssueDetail}
      />
      
      {/* Drawer */}
      <div className="fixed bottom-0 left-0 right-0 md:left-1/2 md:-translate-x-1/2 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl bg-[var(--bg-primary)] md:rounded-2xl rounded-t-2xl shadow-2xl z-[2001] max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-full md:slide-in-from-bottom-12 duration-300 border border-[var(--glass-border)]">
        {/* Mobile handle */}
        <div className="md:hidden flex justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 bg-white/20 rounded-full" />
        </div>

        {/* Close button */}
        <button 
          onClick={closeIssueDetail}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors z-10"
        >
          ✕
        </button>

        {isLoading ? (
          <div className="p-8 flex items-center justify-center min-h-[300px]">
            <span className="animate-spin text-2xl text-[var(--text-accent)]">⟳</span>
          </div>
        ) : !issue ? (
          <div className="p-8 text-center text-[var(--text-secondary)] min-h-[300px] flex items-center justify-center">
            Issue not found.
          </div>
        ) : (
          <div className="flex flex-col">
            {/* Image header */}
            {issue.imageUrl && (
              <div className="relative w-full h-48 sm:h-64 md:h-72 shrink-0">
                <img 
                  src={issue.imageUrl} 
                  alt={issue.title}
                  className="w-full h-full object-cover rounded-t-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] to-transparent" />
              </div>
            )}

            <div className={`p-5 sm:p-6 md:p-8 flex flex-col gap-5 sm:gap-6 ${!issue.imageUrl ? 'mt-4' : '-mt-12 relative z-10'}`}>
              
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${CATEGORY_CSS[issue.category] ?? 'cat-other'}`}>
                      {issue.category}
                    </span>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full status-${issue.status}`}>
                      {issue.status.replace("_", " ")}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] leading-snug">
                    {issue.title}
                  </h2>
                </div>

                {/* Upvotes */}
                <button 
                  onClick={() => {
                    if (!sessionUserId) return;
                    upvoteMutation.mutate(issue.id);
                  }}
                  disabled={!sessionUserId || upvoteMutation.isPending}
                  className={`flex flex-col items-center justify-center border px-3 py-2 rounded-xl shrink-0 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                    myUpvotes.includes(issue.id) 
                      ? "bg-emerald-400/15 border-emerald-400/40 text-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.15)]" 
                      : "bg-white/5 border-white/10 text-[var(--text-muted)] hover:border-[var(--glass-border-hover)] hover:text-[var(--text-primary)]"
                  }`}
                  title={sessionUserId ? (myUpvotes.includes(issue.id) ? "Remove upvote" : "Upvote") : "Sign in to upvote"}
                >
                  <span className="text-xs font-medium">▲</span>
                  <span className="text-sm font-bold">{issue.upvoteCount}</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                {issue.description}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between border-t border-[var(--glass-border)] pt-5">
                <div className="flex flex-col gap-1 text-xs text-[var(--text-muted)]">
                  <span className="flex items-center gap-1.5">
                    <span className="text-sm">📍</span> 
                    {issue.address || "Location not specified"}
                  </span>
                  <span className="flex items-center gap-1.5 mt-1">
                    <span className="text-sm">🕒</span>
                    Reported on {new Date(issue.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                  {issue.userName && (
                    <span className="flex items-center gap-1.5 mt-1">
                      <span className="text-sm">👤</span>
                      By {issue.userName}
                    </span>
                  )}
                </div>

                {sessionUserId === issue.userId && (
                  <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto bg-white/5 p-3 rounded-xl border border-white/10">
                    <label className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider">Status:</label>
                    <div className="relative">
                      <select 
                        value={issue.status}
                        onChange={handleStatusChange}
                        disabled={updating}
                        className="appearance-none bg-[var(--bg-card)] border border-[var(--glass-border)] text-sm text-[var(--text-primary)] px-3 py-1.5 pr-8 rounded-lg cursor-pointer focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                      {updating && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                          <span className="animate-spin text-xs">⟳</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}
      </div>
    </>
  );
}
