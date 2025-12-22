import { randomUUID } from "crypto";
import { readJsonFile, writeJsonFile } from "../utils/jsonStore";

export type NewsStatus = "draft" | "published" | "archived";

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  category: string;
  status: NewsStatus;
  author: string;
  publishDate: string | null;
  views: number;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

const STORE_FILE = "news.json";

async function loadAll(): Promise<NewsArticle[]> {
  return readJsonFile<NewsArticle[]>(STORE_FILE, []);
}

async function saveAll(rows: NewsArticle[]): Promise<void> {
  await writeJsonFile(STORE_FILE, rows);
}

export async function listNews(params: {
  search?: string;
  category?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ data: NewsArticle[]; total: number; page: number; pageSize: number }> {
  const page = params.page && params.page > 0 ? params.page : 1;
  const pageSize = params.pageSize && params.pageSize > 0 ? Math.min(params.pageSize, 100) : 25;

  const search = (params.search ?? "").trim().toLowerCase();
  const category = (params.category ?? "").trim().toLowerCase();
  const status = (params.status ?? "").trim().toLowerCase();

  const all = await loadAll();
  const filtered = all.filter((article) => {
    const matchesSearch =
      !search ||
      article.title.toLowerCase().includes(search) ||
      article.summary.toLowerCase().includes(search) ||
      article.author.toLowerCase().includes(search);

    const matchesCategory = !category || article.category.toLowerCase() === category;
    const matchesStatus = !status || article.status.toLowerCase() === status;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  filtered.sort((a, b) => {
    const aTime = a.publishDate ? Date.parse(a.publishDate) : Date.parse(a.createdAt);
    const bTime = b.publishDate ? Date.parse(b.publishDate) : Date.parse(b.createdAt);
    return bTime - aTime;
  });

  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const pageRows = filtered.slice(start, start + pageSize);

  return { data: pageRows, total, page, pageSize };
}

export async function getNewsById(id: string): Promise<NewsArticle | null> {
  const all = await loadAll();
  return all.find((row) => row.id === id) ?? null;
}

export async function createNews(input: {
  title: string;
  summary: string;
  category: string;
  status: NewsStatus;
  author: string;
  publishDate?: string | null;
  featured?: boolean;
}): Promise<NewsArticle> {
  const now = new Date().toISOString();
  const entry: NewsArticle = {
    id: randomUUID(),
    title: input.title,
    summary: input.summary,
    category: input.category,
    status: input.status,
    author: input.author,
    publishDate:
      input.status === "published"
        ? input.publishDate ?? new Date().toISOString().slice(0, 10)
        : input.publishDate ?? null,
    views: 0,
    featured: Boolean(input.featured ?? false),
    createdAt: now,
    updatedAt: now,
  };

  const all = await loadAll();
  all.push(entry);
  await saveAll(all);
  return entry;
}

export async function updateNews(
  id: string,
  input: Partial<{
    title: string;
    summary: string;
    category: string;
    status: NewsStatus;
    author: string;
    publishDate: string | null;
    featured: boolean;
    views: number;
  }>,
): Promise<NewsArticle | null> {
  const all = await loadAll();
  const index = all.findIndex((row) => row.id === id);
  if (index === -1) {
    return null;
  }

  const current = all[index];
  const nextStatus = input.status ?? current.status;
  const updatedAt = new Date().toISOString();

  const updated: NewsArticle = {
    ...current,
    title: input.title ?? current.title,
    summary: input.summary ?? current.summary,
    category: input.category ?? current.category,
    status: nextStatus,
    author: input.author ?? current.author,
    publishDate:
      input.publishDate !== undefined
        ? input.publishDate
        : nextStatus === "published"
          ? current.publishDate ?? new Date().toISOString().slice(0, 10)
          : current.publishDate,
    featured: input.featured !== undefined ? Boolean(input.featured) : current.featured,
    views: input.views !== undefined ? Number(input.views) : current.views,
    updatedAt,
  };

  all[index] = updated;
  await saveAll(all);
  return updated;
}

export async function deleteNews(id: string): Promise<boolean> {
  const all = await loadAll();
  const next = all.filter((row) => row.id !== id);
  if (next.length === all.length) {
    return false;
  }
  await saveAll(next);
  return true;
}

export async function listNewsCategories(): Promise<string[]> {
  const all = await loadAll();
  const categories = new Set(all.map((row) => row.category).filter(Boolean));
  return Array.from(categories).sort((a, b) => a.localeCompare(b));
}

