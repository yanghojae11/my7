import Image from 'next/image';

export default function EditorProfile() {
  return (
    <section className="bg-white rounded-xl shadow-sm p-4 flex flex-col items-center text-center">
      {/* 아바타 이미지 */}
      <Image
        src="/hero.jpg"                          /* 필요 시 실제 아바타 경로로 변경 */
        alt="MY7 정책 전문가 아바타"
        width={96}
        height={96}
        className="w-24 h-24 rounded-full object-cover mb-3"
        priority                                  /* LCP 최적화 */
      />

      <h4 className="text-sm font-bold text-gray-800 mb-1">MY7 정책 전문가</h4>

      <p className="text-xs text-gray-600 mb-2">
        정확하고 신뢰할 수 있는 정부 정책 정보, MY7 정책 전문가가 직접 분석하고 제공합니다.
      </p>

      <a href="#" className="text-xs text-blue-600 font-medium hover:underline">
        문의하기
      </a>

      <div className="mt-4 w-full">
        <div className="bg-blue-50 border border-blue-100 text-blue-700 rounded-md px-3 py-2 text-xs font-semibold">
          [공지] MY7 정책지원 오픈!
        </div>
      </div>
    </section>
  );
}
