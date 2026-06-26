import { create } from "zustand";

type Category = "all" | "road" | "lighting" | "waste" | "water" | "park" | "other";
type Status = "all" | "open" | "in_progress" | "resolved";
type SortBy = "newest" | "oldest" | "most_upvoted";

interface MapCenter {
  lat: number;
  lng: number;
  zoom: number;
}

interface UIStore {
  // ─── filters ───────────────────────────────────────────────────
  activeCategory: Category;
  activeStatus: Status;
  sortBy: SortBy;
  searchQuery: string;

  setActiveCategory: (category: Category) => void;
  setActiveStatus: (status: Status) => void;
  setSortBy: (sort: SortBy) => void;
  setSearchQuery: (query: string) => void;
  resetFilters: () => void;

  // ─── map ───────────────────────────────────────────────────────
  mapCenter: MapCenter;
  selectedIssueId: string | null;

  setMapCenter: (center: MapCenter) => void;
  setSelectedIssueId: (id: string | null) => void;

  // ─── bottom sheet / drawer ─────────────────────────────────────
  isReportDrawerOpen: boolean;
  isIssueDetailOpen: boolean;

  openReportDrawer: () => void;
  closeReportDrawer: () => void;
  openIssueDetail: (issueId: string) => void;
  closeIssueDetail: () => void;
}

const DEFAULT_MAP_CENTER: MapCenter = {
  lat: 23.2599,  // Bhopal — change to your city
  lng: 77.4126,
  zoom: 13,
};

export const useUIStore = create<UIStore>((set) => ({
  // ─── filters ───────────────────────────────────────────────────
  activeCategory: "all",
  activeStatus: "all",
  sortBy: "newest",
  searchQuery: "",

  setActiveCategory: (category) => set({ activeCategory: category }),
  setActiveStatus: (status) => set({ activeStatus: status }),
  setSortBy: (sort) => set({ sortBy: sort }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  resetFilters: () =>
    set({
      activeCategory: "all",
      activeStatus: "all",
      sortBy: "newest",
      searchQuery: "",
    }),

  // ─── map ───────────────────────────────────────────────────────
  mapCenter: DEFAULT_MAP_CENTER,
  selectedIssueId: null,

  setMapCenter: (center) => set({ mapCenter: center }),
  setSelectedIssueId: (id) => set({ selectedIssueId: id }),

  // ─── bottom sheet / drawer ─────────────────────────────────────
  isReportDrawerOpen: false,
  isIssueDetailOpen: false,

  openReportDrawer: () => set({ isReportDrawerOpen: true }),
  closeReportDrawer: () => set({ isReportDrawerOpen: false }),

  openIssueDetail: (issueId) =>
    set({ selectedIssueId: issueId, isIssueDetailOpen: true }),
  closeIssueDetail: () =>
    set({ selectedIssueId: null, isIssueDetailOpen: false }),
}));