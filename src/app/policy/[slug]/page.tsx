// src/app/policy/[slug]/page.tsx - 정책 상세 페이지

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Clock, ExternalLink, FileText, Users, DollarSign, Calendar, Building2 } from 'lucide-react';
import { getPolicyBySlug } from '@/lib/policies';
import PolicyInteractionButtons from '@/components/PolicyInteractionButtons';
import PolicyComments from '@/components/PolicyComments';
import { PolicyWithDetails } from '@/types/database';

interface PolicyPageProps {
  params: {
    slug: string;
  };
}

// 메타데이터 생성
export async function generateMetadata({ params }: PolicyPageProps): Promise<Metadata> {
  const policy = await getPolicyBySlug(params.slug);

  if (!policy) {
    return {
      title: '정책을 찾을 수 없습니다 | MY7 정책지원',
    };
  }

  return {
    title: policy.meta_title || `${policy.title} | MY7 정책지원`,
    description: policy.meta_description || policy.summary || policy.content.substring(0, 160),
    keywords: policy.keywords || [policy.category?.name || '정책'],
    openGraph: {
      title: policy.title,
      description: policy.summary || policy.content.substring(0, 160),
      images: policy.featured_image_url ? [policy.featured_image_url] : [],
      type: 'article',
      publishedTime: policy.published_at || undefined,
      modifiedTime: policy.updated_at,
      authors: policy.author?.full_name ? [policy.author.full_name] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: policy.title,
      description: policy.summary || policy.content.substring(0, 160),
      images: policy.featured_image_url ? [policy.featured_image_url] : [],
    },
  };
}

export default async function PolicyPage({ params }: PolicyPageProps) {
  const policy = await getPolicyBySlug(params.slug);

  if (!policy) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 브레드크럼 */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600">홈</Link>
            <span className="mx-2">/</span>
            {policy.category && (
              <>
                <Link 
                  href={`/category/${policy.category.slug}`} 
                  className="hover:text-blue-600"
                >
                  {policy.category.name}
                </Link>
                <span className="mx-2">/</span>
              </>
            )}
            <span className="text-gray-900 font-medium">{policy.title}</span>
          </nav>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <article className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* 헤더 */}
          <div className="p-6 sm:p-8">
            {/* 카테고리 및 유형 태그 */}
            <div className="flex flex-wrap gap-2 mb-4">
              {policy.category && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {policy.category.icon && <span className="mr-1">{policy.category.icon}</span>}
                  {policy.category.name}
                </span>
              )}
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                policy.policy_type === 'subsidy' ? 'bg-green-100 text-green-800' :
                policy.policy_type === 'support' ? 'bg-purple-100 text-purple-800' :
                policy.policy_type === 'regulation' ? 'bg-orange-100 text-orange-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {policy.policy_type === 'subsidy' ? '💰 지원금' :
                 policy.policy_type === 'support' ? '🤝 지원' :
                 policy.policy_type === 'regulation' ? '📋 규정' :
                 '📢 공지'}
              </span>
            </div>

            {/* 제목 */}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-4">
              {policy.title}
            </h1>

            {/* 요약 */}
            {policy.summary && (
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                {policy.summary}
              </p>
            )}

            {/* 메타 정보 */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
              {policy.published_at && (
                <div className="flex items-center gap-1">
                  <Clock size={16} />
                  <span>{new Date(policy.published_at).toLocaleDateString('ko-KR')}</span>
                </div>
              )}
              {policy.agency && (
                <div className="flex items-center gap-1">
                  <Building2 size={16} />
                  <span>{policy.agency.name}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <FileText size={16} />
                <span>조회 {policy.view_count.toLocaleString()}회</span>
              </div>
            </div>

            {/* 상호작용 버튼 */}
            <PolicyInteractionButtons
              policyId={policy.id}
              initialLikeCount={policy.like_count}
              initialBookmarkCount={policy.bookmark_count}
              className="mb-6"
            />
          </div>

          {/* 대표 이미지 */}
          {policy.featured_image_url && (
            <div className="px-6 sm:px-8 mb-6">
              <div className="relative w-full h-64 sm:h-96 rounded-lg overflow-hidden">
                <Image
                  src={policy.featured_image_url}
                  alt={policy.image_alt || policy.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 800px"
                />
              </div>
            </div>
          )}

          {/* 정책 상세 정보 */}
          {(policy.target_audience?.length || policy.support_amount || policy.application_period_start || policy.application_url) && (
            <div className="px-6 sm:px-8 mb-6">
              <div className="bg-blue-50 rounded-lg p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">📋 정책 정보</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {policy.target_audience?.length && (
                    <div>
                      <dt className="flex items-center gap-2 text-sm font-medium text-blue-800 mb-1">
                        <Users size={16} />
                        대상자
                      </dt>
                      <dd className="text-sm text-blue-700">
                        {policy.target_audience.join(', ')}
                      </dd>
                    </div>
                  )}
                  
                  {policy.support_amount && (
                    <div>
                      <dt className="flex items-center gap-2 text-sm font-medium text-blue-800 mb-1">
                        <DollarSign size={16} />
                        지원 금액
                      </dt>
                      <dd className="text-sm text-blue-700 font-medium">
                        {policy.support_amount}
                      </dd>
                    </div>
                  )}
                  
                  {(policy.application_period_start || policy.application_period_end) && (
                    <div className="sm:col-span-2">
                      <dt className="flex items-center gap-2 text-sm font-medium text-blue-800 mb-1">
                        <Calendar size={16} />
                        신청 기간
                      </dt>
                      <dd className="text-sm text-blue-700">
                        {policy.application_period_start && new Date(policy.application_period_start).toLocaleDateString('ko-KR')}
                        {policy.application_period_start && policy.application_period_end && ' ~ '}
                        {policy.application_period_end && new Date(policy.application_period_end).toLocaleDateString('ko-KR')}
                      </dd>
                    </div>
                  )}
                  
                  {policy.application_url && (
                    <div className="sm:col-span-2">
                      <dt className="flex items-center gap-2 text-sm font-medium text-blue-800 mb-1">
                        <ExternalLink size={16} />
                        신청하기
                      </dt>
                      <dd>
                        <a
                          href={policy.application_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          신청 페이지로 이동
                          <ExternalLink size={14} />
                        </a>
                      </dd>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 본문 내용 */}
          <div className="px-6 sm:px-8 mb-8">
            <div 
              className="prose prose-gray max-w-none prose-headings:text-gray-900 prose-a:text-blue-600 prose-strong:text-gray-900"
              dangerouslySetInnerHTML={{ __html: policy.content }}
            />
          </div>

          {/* 신청 자격 및 필요 서류 */}
          {(policy.eligibility_criteria || policy.required_documents?.length) && (
            <div className="px-6 sm:px-8 mb-8">
              <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📝 신청 안내</h3>
                
                {policy.eligibility_criteria && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-800 mb-2">신청 자격</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {policy.eligibility_criteria}
                    </p>
                  </div>
                )}
                
                {policy.required_documents?.length && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-800 mb-2">필요 서류</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {policy.required_documents.map((doc, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-blue-600 mt-1">•</span>
                          <span>{doc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 기관 정보 */}
          {policy.agency && (
            <div className="px-6 sm:px-8 mb-8">
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">담당 기관</h3>
                <div className="flex items-start gap-4">
                  {policy.agency.logo_url && (
                    <img
                      src={policy.agency.logo_url}
                      alt={policy.agency.name}
                      className="w-12 h-12 object-contain"
                    />
                  )}
                  <div>
                    <h4 className="font-medium text-gray-900">{policy.agency.name}</h4>
                    {policy.agency.description && (
                      <p className="text-sm text-gray-600 mt-1">{policy.agency.description}</p>
                    )}
                    {policy.agency.website_url && (
                      <a
                        href={policy.agency.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mt-2"
                      >
                        기관 웹사이트
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </article>

        {/* 댓글 섹션 */}
        <div className="mt-8">
          <PolicyComments policyId={policy.id} />
        </div>
      </main>
    </div>
  );
}