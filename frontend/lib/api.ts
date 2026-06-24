import axios from "axios";

// On Vercel: NEXT_PUBLIC_API_URL=/_/backend → browser calls FastAPI directly via Vercel's service routing
// Locally: NEXT_PUBLIC_API_URL unset → browser uses "" (relative) → Next.js proxies to http://localhost:8000
const BASE = process.env.NEXT_PUBLIC_API_URL ?? (typeof window !== "undefined" ? "" : "http://localhost:8000");

export const api = axios.create({
  baseURL: BASE,
  headers: { "Content-Type": "application/json" },
});

// Attach auth token from localStorage
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth
export const authApi = {
  register: (data: RegisterPayload) => api.post("/api/auth/register", data),
  login: (data: LoginPayload) => api.post("/api/auth/login", data),
  me: () => api.get("/api/auth/me"),
  updateProfile: (data: Partial<UserProfile>) => api.patch("/api/auth/me", data),
};

// Schemes
export const schemesApi = {
  list: (params?: SchemeFilters) => api.get("/api/schemes", { params }),
  get: (id: string) => api.get(`/api/schemes/${id}`),
  match: (payload: SchemeMatchRequest) => api.post("/api/schemes/match", payload),
  search: (q: string) => api.get(`/api/schemes/search/${encodeURIComponent(q)}`),
  meta: () => api.get("/api/schemes/meta"),
};

// Chat (non-streaming)
export const chatApi = {
  message: (payload: ChatPayload) => api.post("/api/chat/message", payload),
  clearHistory: (sessionId: string) => api.delete(`/api/chat/history?session_id=${sessionId}`),
};

// Types
export interface RegisterPayload {
  email: string;
  name: string;
  password: string;
  startup_name?: string;
  startup_stage?: string;
  sector?: string;
  city?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface UserProfile {
  id: number;
  email: string;
  name: string;
  startup_name?: string;
  startup_stage?: string;
  sector?: string;
  city?: string;
}

export interface SchemeFilters {
  search?: string;
  sector?: string;
  stage?: string;
  ministry?: string;
  funding_type?: string;
  requires_dpiit?: boolean;
  limit?: number;
  offset?: number;
}

export interface SchemeMatchRequest {
  sector: string;
  stage: string;
  entity_type?: string;
  city?: string;
  dpiit_registered?: boolean;
  founder_gender?: string;
  founder_caste?: string;
  description?: string;
}

export interface ChatPayload {
  message: string;
  session_id?: string;
  startup_context?: Record<string, string>;
}

export interface Scheme {
  id: string;
  name: string;
  ministry: string;
  implementing_agency?: string;
  type: string;
  category: string[];
  sectors: string[];
  stages: string[];
  description: string;
  benefits: string[];
  funding_amount?: string;
  funding_type?: string;
  eligibility: {
    entity_age_years?: number;
    max_turnover_cr?: number;
    entity_types?: string[];
    requires_dpiit?: boolean;
    gender_specific?: string;
    caste_specific?: string;
  };
  application_url?: string;
  deadline?: string;
  tags: string[];
  relevance_score?: number;
}
