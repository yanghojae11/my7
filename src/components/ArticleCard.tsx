import Link from 'next/link';

interface ArticleCardProps {
  title: string;
  summary: string;
  url: string;
}

export default function ArticleCard({ title, summary, url }: ArticleCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow hover:shadow-lg transition-shadow border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
        {title}
      </h3>
      <p className="text-sm text-gray-600 line-clamp-3">
        {summary}
      </p>
      <Link
        href={url}
        target="_blank"
        className="inline-block mt-4 text-blue-600 font-medium hover:underline text-sm"
      >
        Read More →
      </Link>
    </div>
  );
}
