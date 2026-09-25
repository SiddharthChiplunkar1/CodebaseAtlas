// ═══════════════════════════════════════════════════════════════════════════
//  Codebase Atlas — Shared TypeScript Types
//  These interfaces mirror the domain models and API response shapes.
// ═══════════════════════════════════════════════════════════════════════════

// ── Repository ───────────────────────────────────────────────────────────────

export type RepoStatus = "PENDING" | "INDEXING" | "READY" | "FAILED";

export interface Repo {
  id: string;
  githubId: number;
  owner: string;
  name: string;
  fullName: string;
  description: string | null;
  language: string | null;
  status: RepoStatus;
  createdAt: string; // ISO 8601
  updatedAt: string;
}

// ── Code Graph ────────────────────────────────────────────────────────────────

export type NodeType = "function" | "class" | "file" | "route" | "test";

export type EdgeType = "calls" | "imports" | "extends" | "implements";

export interface CodeNode {
  id: string;
  repoId: string;
  nodeKey: string;
  name: string;
  type: NodeType;
  filePath: string;
  startLine: number;
  endLine: number;
  language: string;
  signature: string | null;
}

export interface CodeEdge {
  id: string;
  repoId: string;
  fromNodeId: string;
  toNodeId: string;
  edgeType: EdgeType;
}

export interface GraphData {
  nodes: CodeNode[];
  edges: CodeEdge[];
}

// ── Impact Report ──────────────────────────────────────────────────────────────

export interface ImpactReport {
  targetNodeId: string;
  directCallers: CodeNode[];
  indirectCallers: CodeNode[];
  affectedTests: CodeNode[];
  affectedApiRoutes: CodeNode[];
}

// ── Search ────────────────────────────────────────────────────────────────────

export interface SearchResult {
  nodeId: string;
  nodeName: string;
  nodeType: NodeType;
  filePath: string;
  score: number; // cosine similarity [0, 1]
}

// ── Feature Path ──────────────────────────────────────────────────────────────

export interface FeaturePath {
  nodeIds: string[];
  nodeNames: string[];
  explanation: string;
}

// ── API Responses ─────────────────────────────────────────────────────────────

export interface ApiError {
  status: number;
  message: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

// ── UI State ──────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  contextNodeIds: string[];
  timestamp: string;
}
