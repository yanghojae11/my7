// src/lib/articles.ts - Article data functions that work with existing API

export interface Article {
  id: number;
  title: string;
  slug: string;
  body: string;
  html_content?: string;
  category: string;
  original_url?: string | null;
  image_url?: string | null;
  keywords?: string[];
  status: string;
  word_count?: number;
  view_count: number;
  created_at: string;
  updated_at?: string;
}

export interface ArticleResponse {
  success: boolean;
  data: Article[];
  count: number;
  error: string | null;
  page?: number;
  limit?: number;
  totalPages?: number;
}

/**
 * Get the base URL for API calls
 */
function getBaseUrl(): string {
  // Browser environment
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // Server environment
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  
  // Local development fallback
  return 'http://localhost:3000';
}

/**
 * Fetch articles from the API
 */
export async function getArticles(params: {
  category?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
} = {}): Promise<Article[]> {
  try {
    const searchParams = new URLSearchParams();
    
    if (params.category) searchParams.set('category', params.category);
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);

    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/api/articles${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
    
    console.log('Fetching articles from:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result: ArticleResponse = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch articles');
    }
    
    console.log(`Successfully fetched ${result.data?.length || 0} articles`);
    return result.data || [];
  } catch (error) {
    console.error('Error fetching articles:', error);
    return [];
  }
}

/**
 * Get latest articles
 */
export async function getLatestArticles(limit: number = 10): Promise<Article[]> {
  return getArticles({
    limit,
    sortBy: 'created_at',
    sortOrder: 'desc'
  });
}

/**
 * Get articles by category
 */
export async function getArticlesByCategory(category: string, limit?: number): Promise<Article[]> {
  const params: Parameters<typeof getArticles>[0] = {
    category,
    sortBy: 'created_at',
    sortOrder: 'desc'
  };
  
  if (limit !== undefined) {
    params.limit = limit;
  }
  
  return getArticles(params);
}

/**
 * Get popular articles (sorted by view count)
 */
export async function getPopularArticles(limit: number = 10): Promise<Article[]> {
  return getArticles({
    limit,
    sortBy: 'view_count',
    sortOrder: 'desc'
  });
}

// Category mappings for Korean categories
export const CATEGORY_MAPPINGS: Record<string, string> = {
  'startup-support': '창업지원',
  'housing-policy': '주택정책', 
  'employment-support': '취업지원',
  'education-policy': '교육정책',
  'welfare-benefits': '복지혜택',
  'government-subsidies': '정부지원금',
  'policy-news': '정책뉴스'
};

/**
 * Convert article to slide item for main slider
 */
export function convertArticleToSlideItem(article: Article) {
  return {
    id: article.id,
    title: article.title,
    image_url: article.image_url || '/placeholder-card.jpg',
    tag: article.category || '정책',
    time: new Date(article.created_at).toLocaleDateString('ko-KR'),
    summary: article.body ? article.body.substring(0, 100) + '...' : '',
    url: `/article/${article.slug}`,
    slug: article.slug
  };
}

/**
 * Convert article to ranking item
 */
export function convertArticleToRankingItem(article: Article, rank: number) {
  return {
    id: article.id,
    title: article.title,
    rank,
    thumbnail: article.image_url || null,
    url: `/article/${article.slug}`,
    view_count: article.view_count
  };
}

/**
 * Convert article to feed item
 */
export function convertArticleToFeedItem(article: Article) {
  return {
    id: article.id,
    title: article.title,
    timestamp: article.created_at,
    summary: article.body ? article.body.substring(0, 70) + '...' : '',
    tag: article.category || null,
    url: `/article/${article.slug}`,
    image_url: article.image_url || null,
    slug: article.slug,
    created_at: article.created_at,
    source: article.original_url || null
  };
}

/**
 * Convert article to card item
 */
export function convertArticleToCardItem(article: Article) {
  return {
    id: article.id,
    title: article.title,
    summary: article.body ? article.body.substring(0, 100) + '...' : '',
    description: article.body ? article.body.substring(0, 150) + '...' : '',
    image: article.image_url || '/placeholder-card.jpg',
    image_url: article.image_url || '/placeholder-card.jpg',
    url: `/article/${article.slug}`,
    category: article.category || '정책'
  };
}