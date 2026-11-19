// API Service for AI College Helpdesk & Student Assistance System

const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (typeof window !== "undefined" && window.location.hostname.includes("onrender.com")
    ? "https://college-helpdesk-backend-sgsu.onrender.com/api/v1"
    : "http://localhost:8000/api/v1");

const getAuthHeaders = () => {
  const token = localStorage.getItem("helpdesk_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const api = {
  // Auth
  login: async (email, password) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) throw new Error((await res.json()).detail || "Login failed");
    return res.json();
  },

  register: async (userData) => {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData)
    });
    if (!res.ok) throw new Error((await res.json()).detail || "Registration failed");
    return res.json();
  },

  switchRole: async (role) => {
    const res = await fetch(`${API_BASE_URL}/auth/demo-switch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role })
    });
    if (!res.ok) throw new Error("Role switch failed");
    return res.json();
  },

  getMe: async () => {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error("Session expired");
    return res.json();
  },

  getUsers: async () => {
    const res = await fetch(`${API_BASE_URL}/auth/users`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  updateUser: async (userId, data) => {
    const res = await fetch(`${API_BASE_URL}/auth/users/${userId}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error((await res.json()).detail || "Failed to update user");
    return res.json();
  },

  // AI Chat & RAG
  askChat: async (query, department_id = null) => {
    const res = await fetch(`${API_BASE_URL}/chat/ask`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ query, department_id })
    });
    if (!res.ok) throw new Error((await res.json()).detail || "AI query failed");
    return res.json();
  },

  sendFeedback: async (query_id, feedback, comment = "") => {
    const res = await fetch(`${API_BASE_URL}/chat/feedback`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ query_id, feedback, comment })
    });
    return res.json();
  },

  getChatHistory: async () => {
    const res = await fetch(`${API_BASE_URL}/chat/history`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // Documents
  getDocuments: async (department_id = null) => {
    const url = department_id
      ? `${API_BASE_URL}/documents/?department_id=${department_id}`
      : `${API_BASE_URL}/documents/`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    return res.json();
  },

  getDocumentChunks: async (docId) => {
    const res = await fetch(`${API_BASE_URL}/documents/${docId}/chunks`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  uploadDocument: async (formData) => {
    const token = localStorage.getItem("helpdesk_token");
    const res = await fetch(`${API_BASE_URL}/documents/upload`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: formData
    });
    if (!res.ok) throw new Error((await res.json()).detail || "Upload failed");
    return res.json();
  },

  deleteDocument: async (docId) => {
    const res = await fetch(`${API_BASE_URL}/documents/${docId}`, {
      method: "DELETE",
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // Support Tickets
  getTickets: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append("status", filters.status);
    if (filters.priority) params.append("priority", filters.priority);
    if (filters.category) params.append("category", filters.category);
    if (filters.assigned_to) params.append("assigned_to", filters.assigned_to);
    if (filters.department_id) params.append("department_id", filters.department_id);

    const res = await fetch(`${API_BASE_URL}/tickets/?${params.toString()}`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  getTicketById: async (id) => {
    const res = await fetch(`${API_BASE_URL}/tickets/${id}`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error("Ticket not found");
    return res.json();
  },

  createTicket: async (ticketData) => {
    const res = await fetch(`${API_BASE_URL}/tickets/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(ticketData)
    });
    if (!res.ok) throw new Error((await res.json()).detail || "Ticket creation failed");
    return res.json();
  },

  updateTicketStatus: async (ticketId, status, resolution_notes = "") => {
    const res = await fetch(`${API_BASE_URL}/tickets/${ticketId}/status`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, resolution_notes })
    });
    return res.json();
  },

  assignTicket: async (ticketId, assigned_to) => {
    const res = await fetch(`${API_BASE_URL}/tickets/${ticketId}/assign`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ assigned_to })
    });
    return res.json();
  },

  addComment: async (ticketId, message, is_internal = false) => {
    const res = await fetch(`${API_BASE_URL}/tickets/${ticketId}/comments`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ message, is_internal })
    });
    return res.json();
  },

  // Departments
  getDepartments: async () => {
    const res = await fetch(`${API_BASE_URL}/departments/`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // Notices
  getNotices: async (department_id = null) => {
    const url = department_id
      ? `${API_BASE_URL}/notices/?department_id=${department_id}`
      : `${API_BASE_URL}/notices/`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    return res.json();
  },

  createNotice: async (noticeData) => {
    const res = await fetch(`${API_BASE_URL}/notices/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(noticeData)
    });
    if (!res.ok) throw new Error((await res.json()).detail || "Failed to publish notice");
    return res.json();
  },

  updateNotice: async (noticeId, updates) => {
    const res = await fetch(`${API_BASE_URL}/notices/${noticeId}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error((await res.json()).detail || "Failed to update notice");
    return res.json();
  },

  togglePinNotice: async (noticeId) => {
    const res = await fetch(`${API_BASE_URL}/notices/${noticeId}/toggle-pin`, {
      method: "POST",
      headers: getAuthHeaders()
    });
    return res.json();
  },

  deleteNotice: async (noticeId) => {
    const res = await fetch(`${API_BASE_URL}/notices/${noticeId}`, {
      method: "DELETE",
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error((await res.json()).detail || "Failed to delete notice");
    return res.json();
  },

  // FAQs
  getFaqs: async (department_id = null) => {
    const url = department_id
      ? `${API_BASE_URL}/faqs/?department_id=${department_id}`
      : `${API_BASE_URL}/faqs/`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    return res.json();
  },

  createFaq: async (faqData) => {
    const res = await fetch(`${API_BASE_URL}/faqs/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(faqData)
    });
    if (!res.ok) throw new Error((await res.json()).detail || "Failed to create FAQ");
    return res.json();
  },

  updateFaq: async (faqId, updates) => {
    const res = await fetch(`${API_BASE_URL}/faqs/${faqId}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  deleteFaq: async (faqId) => {
    const res = await fetch(`${API_BASE_URL}/faqs/${faqId}`, {
      method: "DELETE",
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // System & Supabase
  getSupabaseStatus: async () => {
    const res = await fetch(`${API_BASE_URL}/system/supabase-status`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  saveSupabaseConfig: async (configData) => {
    const res = await fetch(`${API_BASE_URL}/system/supabase-config`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(configData)
    });
    if (!res.ok) throw new Error((await res.json()).detail || "Failed to configure Supabase");
    return res.json();
  },

  // Analytics
  getAnalyticsOverview: async () => {
    const res = await fetch(`${API_BASE_URL}/analytics/overview`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  getUnansweredQueries: async () => {
    const res = await fetch(`${API_BASE_URL}/analytics/unanswered`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  getDepartmentWorkload: async () => {
    const res = await fetch(`${API_BASE_URL}/analytics/department-workload`, {
      headers: getAuthHeaders()
    });
    return res.json();
  }
};
