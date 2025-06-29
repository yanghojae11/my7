// src/lib/mockArticles.ts
import { createDummyArticle } from "./articleUtils";

export const mockArticles = Array.from({ length: 10 }).map((_, i) =>
  createDummyArticle(i)
);
