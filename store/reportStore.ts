import { create } from 'zustand';

export type ReportModule = {
  name: string;
  label: string;
  fields: string[];
};

export type RelatedModule = {
  name: string;
  label: string;
  relation: string; // e.g. 'accounts', 'contacts', etc.
};

export type ReportColumn = {
  module: string;
  field: string;
};

export type ReportFilter = {
  module: string;
  field: string;
  operator: string;
  value: unknown;
};

export interface ReportState {
  step: 1 | 2 | 3;
  selectedModule: ReportModule | null;
  relatedModules: RelatedModule[];
  selectedColumns: ReportColumn[];
  filters: ReportFilter[];
  previewData: unknown[];
  reportName: string;
  reportFolder: string;
  setStep: (step: 1 | 2 | 3) => void;
  setSelectedModule: (mod: ReportModule) => void;
  setRelatedModules: (mods: RelatedModule[]) => void;
  setSelectedColumns: (cols: ReportColumn[]) => void;
  setFilters: (filters: ReportFilter[]) => void;
  setPreviewData: (data: unknown[]) => void;
  setReportName: (name: string) => void;
  setReportFolder: (folder: string) => void;
  reset: () => void;
}

export const useReportStore = create<ReportState>((set) => ({
  step: 1,
  selectedModule: null,
  relatedModules: [],
  selectedColumns: [],
  filters: [],
  previewData: [],
  reportName: '',
  reportFolder: '',
  setStep: (step) => set({ step }),
  setSelectedModule: (selectedModule) => set({ selectedModule }),
  setRelatedModules: (relatedModules) => set({ relatedModules }),
  setSelectedColumns: (selectedColumns) => set({ selectedColumns }),
  setFilters: (filters) => set({ filters }),
  setPreviewData: (previewData) => set({ previewData }),
  setReportName: (reportName) => set({ reportName }),
  setReportFolder: (reportFolder) => set({ reportFolder }),
  reset: () => set({
    step: 1,
    selectedModule: null,
    relatedModules: [],
    selectedColumns: [],
    filters: [],
    previewData: [],
    reportName: '',
    reportFolder: '',
  }),
}));
