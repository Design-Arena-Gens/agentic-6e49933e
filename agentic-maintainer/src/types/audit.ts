export type CheckStatus = "pass" | "warn" | "fail";

export interface AuditCheck {
  id: string;
  label: string;
  status: CheckStatus;
  details: string;
  recommendation: string;
}

export interface MaintenanceTask {
  id: string;
  priority: "low" | "medium" | "high";
  title: string;
  description: string;
}

export interface AuditInsight {
  id: string;
  category: "content" | "seo" | "accessibility" | "performance" | "reliability";
  message: string;
}

export interface AuditResponse {
  targetUrl: string;
  statusCode: number | null;
  responseTimeMs: number | null;
  lastModified: string | null;
  title: string;
  metaDescription: string | null;
  wordCount: number;
  headings: Record<string, number>;
  imageCount: number;
  imagesMissingAlt: number;
  linkSampleSize: number;
  brokenLinks: Array<{ href: string; status: number | null }>;
  checks: AuditCheck[];
  tasks: MaintenanceTask[];
  insights: AuditInsight[];
  generatedAt: string;
}
