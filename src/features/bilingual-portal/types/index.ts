export type LocalizedText = {
  en: string;
  my: string;
};

export type ColumnConfig = {
  key: string;
  label: LocalizedText;
};

export type ScreenKey =
  | "branches"
  | "branchForm"
  | "merchants"
  | "merchantAccounts"
  | "transactions"
  | "users"
  | "roles"
  | "permissions"
  | "partners"
  | "affiliates"
  | "accounting";

export type ScreenConfig = {
  key: ScreenKey;
  title: LocalizedText;
  description: LocalizedText;
  endpoint: string;
  mergeCandidateKeys?: string[];
  columns: ColumnConfig[];
};
