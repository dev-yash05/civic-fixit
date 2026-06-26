"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleUpvote } from "@/actions/upvote";
import { useUIStore } from "@/store/ui";
import { IssueWithUser } from "@/lib/issues";

const CATEGORIES = ["all", "road", "lighting", "waste", "water", "park", "other"] as const;
const STATUSES = ["all", "open", "in_progress", "resolved"] as const;

const STATUS_STYLES: Record<string, string> = {
  open: "bg-red-100 text-red-700",
  in_progress: "bg-yellow-100 text-yellow-700",
  resolved: "bg-green-100 text-green-700",
};

const CATEGORY_COLORS: Record<string, string> = {
  road: "bg-red-100 text-red-700",
  lighting: "bg-amber-100 text-amber-700",
  waste: "bg-emerald-100 text-emerald-700",
  water: "bg-blue-100 text-blue-700",
  park: "bg-violet-100 text-violet-700",
  other: "bg-gray-100 text-gray-600",
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
  const { activeCategory, activeStatus, sortBy, searchQuery } = useUIStore();
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

  // filter + sort
  const filtered = issues
    .filter((issue) => {
      if (localCategory !== "all" && issue.category !== localCategory) return false;
      if (localStatus !== "all" && issue.status !== localStatus) return false;
      if (
        localSearch &&
        !issue.title.toLowerCase().includes(localSearch.toLowerCase()) &&
        !issue.description.toLowerCase().includes(localSearch.toLowerCase())
      )
        return false;
      return true;
    })
    .sort((a, b) => {
      if (localSort === "newest")
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (localSort === "oldest")
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (localSort === "most_upvoted") return b.upvoteCount - a.upvoteCount;
      return 0;
    });

  return (
    <div className="flex flex-col gap-5">
      {/* search */}
      <input
        type="text"
        value={localSearch}
        onChange={(e) => setLocalSearch(e.target.value)}
        placeholder="Search issues..."
        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
      />

      {/* filters row */}
      <div className="flex flex-wrap gap-2">
        {/* category pills */}
        <div className="flex gap-1.5 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setLocalCategory(cat)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium capitalize transition-colors ${
                localCategory === cat
                  ? "bg-black text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* status + sort row */}
      <div className="flex items-center gap-3 flex-wrap">
        <select
          value={localStatus}
          onChange={(e) => setLocalStatus(e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-black bg-white"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s === "all" ? "All statuses" : s.replace("_", " ")}
            </option>
          ))}
        </select>

        <select
          value={localSort}
          onChange={(e) => setLocalSort(e.target.value as any)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-black bg-white"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="most_upvoted">Most upvoted</option>
        </select>

        <span className="text-sm text-gray-400 ml-auto">
          {filtered.length} issue{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* list */}
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 rounded-2xl p-5 h-32 animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
          <p className="text-gray-500 text-sm">No issues match your filters.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((issue) => {
            const hasUpvoted = myUpvotes.includes(issue.id);

            return (
              <div
                key={issue.id}
                className="bg-white border border-gray-200 rounded-2xl p-5 flex gap-4 hover:border-gray-300 transition-colors"
              >
                {/* upvote column */}
                <div className="flex flex-col items-center gap-1 shrink-0 pt-1">
                  <button
                    onClick={() => {
                      if (!sessionUserId) return;
                      upvoteMutation.mutate(issue.id);
                    }}
                    disabled={!sessionUserId || upvoteMutation.isPending}
                    className={`flex flex-col items-center gap-0.5 px-2.5 py-2 rounded-xl border transition-colors disabled:opacity-40 ${
                      hasUpvoted
                        ? "bg-black border-black text-white"
                        : "border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-900"
                    }`}
                    title={sessionUserId ? (hasUpvoted ? "Remove upvote" : "Upvote") : "Sign in to upvote"}
                  >
                    <span className="text-xs">▲</span>
                    <span className="text-xs font-semibold">{issue.upvoteCount}</span>
                  </button>
                </div>

                {/* content */}
                <div className="flex-1 min-w-0 flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-gray-900 leading-snug">
                      {issue.title}
                    </p>
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${
                        STATUS_STYLES[issue.status]
                      }`}
                    >
                      {issue.status.replace("_", " ")}
                    </span>
                  </div>

                  <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                    {issue.description}
                  </p>

                  {issue.imageUrl && (
                    <img
                      src={issue.imageUrl}
                      alt={issue.title}
                      className="w-full max-h-48 object-cover rounded-xl mt-1"
                    />
                  )}

                  <div className="flex items-center gap-2 flex-wrap mt-1">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${
                        CATEGORY_COLORS[issue.category]
                      }`}
                    >
                      {issue.category}
                    </span>
                    {issue.address && (
                      <span className="text-xs text-gray-400 truncate max-w-xs">
                        📍 {issue.address}
                      </span>
                    )}
                    <span className="text-xs text-gray-400 ml-auto">
                      {issue.userName && `by ${issue.userName} · `}
                      {new Date(issue.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!sessionUserId && (
        <p className="text-xs text-center text-gray-400">
          <a href="/sign-in" className="underline hover:text-gray-600">
            Sign in
          </a>{" "}
          to upvote issues
        </p>
      )}
    </div>
  );
}