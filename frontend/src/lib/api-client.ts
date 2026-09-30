const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export interface Matter {
  id: string;
  title: string;
  client_name: string;
  status: string;
  practice_area: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  document_count: number;
}

export interface Clause {
  id: string;
  document_id: string;
  clause_type: string;
  original_text: string;
  simplified_text?: string;
  risk_rating: 'PASS' | 'ATTENTION' | 'HIGH_RISK';
  recommendation?: string;
  section_number: number;
  created_at: string;
}

export interface DocumentItem {
  id: string;
  matter_id: string;
  title: string;
  file_type: string;
  file_size_bytes: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  risk_score: number;
  summary?: string;
  status: 'INGESTED' | 'ANALYZED' | 'FLAGGED' | 'APPROVED';
  uploaded_at: string;
  matter_title?: string;
  matter_client?: string;
  clauses?: Clause[];
}

export interface AnalyticsData {
  total_matters: number;
  active_matters: number;
  total_documents: number;
  analyzed_documents: number;
  high_risk_clauses: number;
  compliance_score: number;
  risk_distribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  practice_areas: { area: string; count: number }[];
  recent_activity: {
    id: string;
    action: string;
    document_title: string;
    user_name: string;
    details: any;
    timestamp: string;
  }[];
}

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}/api/v1${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error ${response.status}: ${errorText}`);
  }

  return response.json();
}

export const api = {
  // Analytics
  getAnalytics: () => fetchJson<AnalyticsData>('/analytics/overview'),
  getAuditLogs: () => fetchJson<any[]>('/analytics/audit-logs'),

  // Matters
  getMatters: (params?: { status?: string; practice_area?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.practice_area) query.append('practice_area', params.practice_area);
    if (params?.search) query.append('search', params.search);
    return fetchJson<Matter[]>(`/matters/?${query.toString()}`);
  },
  getMatter: (id: string) => fetchJson<Matter & { documents: DocumentItem[] }>(`/matters/${id}`),
  createMatter: (data: Partial<Matter>) =>
    fetchJson<Matter>('/matters/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Documents
  getDocuments: (params?: { matter_id?: string; risk_level?: string; status?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.matter_id) query.append('matter_id', params.matter_id);
    if (params?.risk_level) query.append('risk_level', params.risk_level);
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);
    return fetchJson<DocumentItem[]>(`/documents/?${query.toString()}`);
  },
  getDocument: (id: string) => fetchJson<DocumentItem>(`/documents/${id}`),
  createDocument: (data: Partial<DocumentItem>) =>
    fetchJson<DocumentItem>('/documents/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  analyzeDocument: (id: string) =>
    fetchJson<DocumentItem>(`/documents/${id}/analyze`, {
      method: 'POST',
    }),

  // Clauses
  getDocumentClauses: (docId: string) => fetchJson<Clause[]>(`/clauses/document/${docId}`),
  updateClause: (clauseId: string, data: Partial<Clause>) =>
    fetchJson<Clause>(`/clauses/${clauseId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};
