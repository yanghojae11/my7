// src/components/ArticleList.tsx
import Link from 'next/link';
import Image from 'next/image';
import { getArticleImageUrl } from '@/utils/imageUtils';

// Article 타입 정의 수정
interface Article {
  slug: string;
  title: string;
  crawled_at: string | null;
  source: string | null;
  image_url: string[] | string | null; // 배열 또는 문자열로 수정
}

interface ArticleListProps {
  articles: Article[];
}

export default function ArticleList({ articles }: ArticleListProps) {
  if (!articles || articles.length === 0) {
    return <p>표시할 기사가 없습니다.</p>;
  }

  return (
    <section className="grid gap-6">
      {articles.map((article) => {
        // 이미지 URL 처리
        const imageUrl = getArticleImageUrl(article.image_url);
        
        return (
          <article
            key={article.slug}
            className="p-4 border rounded shadow-sm hover:shadow-md transition flex gap-4"
          >
            {/* 이미지 항상 표시 - onError 제거 */}
            <div className="w-32 h-20 relative flex-shrink-0">
              <Image
                src={imageUrl}
                alt={article.title}
                fill
                sizes="128px"
                className="rounded object-cover"
                // onError 제거됨 - prerendering 오류 방지
              />
            </div>
            
            <div className="flex-grow">
              <h2 className="text-lg font-bold leading-snug">
                <Link href={`/article/${article.slug}`} className="hover:underline">
                  {article.title}
                </Link>
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {article.crawled_at ? new Date(article.crawled_at).toLocaleDateString() : '날짜 정보 없음'}
                {article.source && ` · ${article.source}`}
              </p>
            </div>
          </article>
        );
      })}
    </section>
  );
}