"use client";

import { useUIStore } from "@/store/ui";
import { Issue } from "@/lib/db/schema";
import { deleteIssue } from "@/actions/issue";
import { useState } from "react";

export function ProfileIssueCard({ issue }: { issue: Issue }) {
  const openIssueDetail = useUIStore((state) => state.openIssueDetail);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const triggerDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowConfirm(true);
  };

  const cancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowConfirm(false);
  };

  const confirmDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleting(true);
    try {
      await deleteIssue(issue.id);
    } catch (err: any) {
      alert(err.message || "Failed to delete issue");
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div 
        onClick={() => openIssueDetail(issue.id)}
        className="glass-card rounded-2xl p-4 sm:p-5 flex gap-4 cursor-pointer hover:bg-white/5 hover:border-white/10 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all group"
      >
        <div className="flex-1 min-w-0 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider cat-${issue.category}`}>
                  {issue.category}
                </span>
                <span className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider status-${issue.status}`}>
                  {issue.status.replace("_", " ")}
                </span>
              </div>
              <p className="font-semibold text-[var(--text-primary)] leading-snug text-base sm:text-lg group-hover:text-emerald-400 transition-colors line-clamp-1">{issue.title}</p>
            </div>
            
            <button
              onClick={triggerDelete}
              disabled={isDeleting}
              className="text-xs px-2.5 py-2 rounded-lg border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-300 transition-all flex items-center gap-1.5 disabled:opacity-50 shrink-0"
              title="Delete Issue"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
              <span className="font-medium hidden sm:inline">Delete</span>
            </button>
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
            <span className="text-xs font-medium text-[var(--text-muted)] flex items-center gap-1.5 ml-auto">
              <svg className="w-3.5 h-3.5 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {new Date(issue.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={cancelDelete} />
          <div 
            className="glass-card bg-[#0a0a0f] border border-red-500/30 relative z-10 w-full max-w-sm rounded-2xl p-6 shadow-2xl flex flex-col gap-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-2 text-center">
              <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
              </div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Delete Report?</h3>
              <p className="text-sm text-[var(--text-secondary)]">This action cannot be undone. Are you sure you want to permanently delete this report?</p>
            </div>
            
            <div className="flex gap-3 mt-4">
              <button
                onClick={cancelDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl border border-[var(--glass-border)] text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 text-sm font-medium hover:bg-red-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-[0_0_15px_rgba(239,68,68,0.15)]"
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
