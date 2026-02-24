const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

// ─── types ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  role: string;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  summary?: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  user?: { id: string; email: string };
  _count?: { likes: number; comments: number };
}

export interface FeedResponse {
  data: Blog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: { id: string; email: string };
}

// ─── helpers ──────────────────────────────────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new ApiError(res.status, (body as { message?: string }).message ?? res.statusText);
  }

  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

// ─── auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  register: (email: string, password: string) =>
    request<{ user: User; accessToken: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  login: (email: string, password: string) =>
    request<{ user: User; accessToken: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  logout: (token: string) =>
    request<void>('/auth/logout', { method: 'POST' }, token),

  refresh: () =>
    request<{ accessToken: string }>('/auth/refresh', { method: 'POST' }),
};

// ─── blogs (private) ─────────────────────────────────────────────────────────

export const blogsApi = {
  getAll: (token: string) =>
    request<Blog[]>('/blogs', {}, token),

  getOne: (id: string, token: string) =>
    request<Blog>(`/blogs/${id}`, {}, token),

  create: (data: { title: string; content: string; isPublished?: boolean }, token: string) =>
    request<Blog>('/blogs', { method: 'POST', body: JSON.stringify(data) }, token),

  update: (
    id: string,
    data: { title?: string; content?: string; isPublished?: boolean },
    token: string,
  ) =>
    request<Blog>(`/blogs/${id}`, { method: 'PATCH', body: JSON.stringify(data) }, token),

  remove: (id: string, token: string) =>
    request<void>(`/blogs/${id}`, { method: 'DELETE' }, token),
};

// ─── public ───────────────────────────────────────────────────────────────────

export const publicApi = {
  getFeed: (page = 1, limit = 10) =>
    request<FeedResponse>(`/public/feed?page=${page}&limit=${limit}`),

  getBlog: (slug: string) =>
    request<Blog>(`/public/blogs/${slug}`),
};

// ─── likes ────────────────────────────────────────────────────────────────────

export const likesApi = {
  like: (blogId: string, token: string) =>
    request<{ likeCount: number }>(`/blogs/${blogId}/like`, { method: 'POST' }, token),

  unlike: (blogId: string, token: string) =>
    request<{ likeCount: number }>(`/blogs/${blogId}/like`, { method: 'DELETE' }, token),
};

// ─── comments ─────────────────────────────────────────────────────────────────

export const commentsApi = {
  getAll: (blogId: string) =>
    request<Comment[]>(`/blogs/${blogId}/comments`),

  create: (blogId: string, content: string, token: string) =>
    request<Comment>(
      `/blogs/${blogId}/comments`,
      { method: 'POST', body: JSON.stringify({ content }) },
      token,
    ),
};
