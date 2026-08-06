// src/lib/api.ts — Frontend API client connecting to Express backend

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://gmail-protal-server.vercel.app/api";

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("gmail_portal_token");
}

export function setAuthToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("gmail_portal_token", token);
  }
}

export function removeAuthToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("gmail_portal_token");
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; message: string; data?: T; errors?: unknown }> {
  const token = getAuthToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.message || `API Error (${response.status})`);
  }

  return json;
}

// API Service Methods

export const authApi = {
  loginWithGoogle: async (accessToken: string, refreshToken?: string) => {
    const res = await request<{ token: string; user: any; isNew: boolean }>(
      "/auth/google",
      {
        method: "POST",
        body: JSON.stringify({ accessToken, refreshToken }),
      }
    );
    if (res.data?.token) {
      setAuthToken(res.data.token);
    }
    return res.data;
  },

  getProfile: async () => {
    const res = await request<any>("/auth/me");
    return res.data;
  },

  logout: async () => {
    try {
      await request("/auth/logout", { method: "POST" });
    } finally {
      removeAuthToken();
    }
  },
};

export const accountsApi = {
  list: async () => {
    const res = await request<any[]>("/accounts");
    return res.data || [];
  },

  add: async (accessToken: string, refreshToken?: string) => {
    const res = await request<any>("/accounts", {
      method: "POST",
      body: JSON.stringify({ accessToken, refreshToken }),
    });
    return res.data;
  },

  delete: async (accountId: string) => {
    const res = await request<null>(`/accounts/${accountId}`, {
      method: "DELETE",
    });
    return res.data;
  },

  updateStatus: async (accountId: string, status: "ACTIVE" | "IDLE" | "ERROR") => {
    const res = await request<any>(`/accounts/${accountId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    return res.data;
  },

  updateNote: async (accountId: string, note: string) => {
    const res = await request<any>(`/accounts/${accountId}/note`, {
      method: "PATCH",
      body: JSON.stringify({ note }),
    });
    return res.data;
  },

  deleteNote: async (accountId: string) => {
    const res = await request<any>(`/accounts/${accountId}/note`, {
      method: "DELETE",
    });
    return res.data;
  },
};

export const otpsApi = {
  getAll: async () => {
    const res = await request<any[]>("/otps");
    return res.data || [];
  },

  getByAccount: async (accountId: string) => {
    const res = await request<any>(`/otps/${accountId}`);
    return res.data;
  },

  refreshAccount: async (accountId: string) => {
    const res = await request<{ otps: any[]; count: number }>(
      `/otps/refresh/${accountId}`,
      { method: "POST" }
    );
    return res.data;
  },

  refreshAll: async () => {
    const res = await request<any[]>("/otps/refresh-all", {
      method: "POST",
    });
    return res.data || [];
  },
};

export const workflowApi = {
  getSession: async () => {
    const res = await request<any>("/workflow");
    return res.data;
  },

  createSession: async (name?: string) => {
    const res = await request<any>("/workflow", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
    return res.data;
  },

  getProgress: async () => {
    const res = await request<any>("/workflow/progress");
    return res.data;
  },

  markDone: async (accountId: string) => {
    const res = await request<any>(`/workflow/items/${accountId}/done`, {
      method: "PATCH",
    });
    return res.data;
  },

  markSkipped: async (accountId: string) => {
    const res = await request<any>(`/workflow/items/${accountId}/skip`, {
      method: "PATCH",
    });
    return res.data;
  },

  reset: async () => {
    const res = await request<any>("/workflow/reset", {
      method: "POST",
    });
    return res.data;
  },
};
