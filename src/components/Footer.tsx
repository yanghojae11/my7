import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-gray-400 border-t border-gray-700"> {/* 배경색 약간 밝게, 상단 구분선 추가 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* 회사 정보 및 로고 (옵션) */}
          <div className="space-y-2">
            <Link href="/" className="text-xl font-semibold text-white hover:text-gray-200 transition-colors">
              MY7 정책지원
            </Link>
            <p className="text-sm">
              정부 정책 및 지원사업 정보를 실시간으로 제공합니다.
            </p>
            <p className="text-sm">
              문의: <a href="mailto:contact@my7.co.kr" className="text-gray-300 hover:text-white underline">contact@my7.co.kr</a>
            </p>
          </div>

          {/* 네비게이션 링크 (2열로 배치 가능) */}
          <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-6">
            <div>
              <h5 className="text-sm font-semibold text-gray-200 tracking-wider uppercase mb-3">정보</h5>
              <ul className="space-y-2">
                <li><Link href="/about" className="hover:text-white hover:underline">소개</Link></li>
                <li><Link href="/contact" className="hover:text-white hover:underline">문의하기</Link></li>
                {/* <li><Link href="/careers" className="hover:text-white hover:underline">채용</Link></li> */}
              </ul>
            </div>
            <div>
              <h5 className="text-sm font-semibold text-gray-200 tracking-wider uppercase mb-3">법적고지</h5>
              <ul className="space-y-2">
                <li><Link href="/terms" className="hover:text-white hover:underline">이용약관</Link></li>
                <li><Link href="/privacy" className="hover:text-white hover:underline">개인정보처리방침</Link></li>
                {/* <li><Link href="/cookies" className="hover:text-white hover:underline">쿠키 정책</Link></li> */}
              </ul>
            </div>
            <div>
              <h5 className="text-sm font-semibold text-gray-200 tracking-wider uppercase mb-3">소셜</h5>
              <ul className="space-y-2">
                {/* <li><a href="#" target="_blank" rel="noopener noreferrer" className="hover:text-white hover:underline">Facebook</a></li> */}
                {/* <li><a href="#" target="_blank" rel="noopener noreferrer" className="hover:text-white hover:underline">Twitter (X)</a></li> */}
                {/* <li><a href="#" target="_blank" rel="noopener noreferrer" className="hover:text-white hover:underline">LinkedIn</a></li> */}
              </ul>
            </div>
          </div>
        </div>

        {/* 하단 저작권 정보 */}
        <div className="pt-8 border-t border-gray-700 text-center text-sm">
          <p>&copy; {currentYear} MY7 정책지원. All rights reserved.</p>
          {/* <p className="mt-1 text-xs">
            Built with <a href="https://nextjs.org" target="_blank" rel="noopener noreferrer" className="hover:text-white underline">Next.js</a> and 
            <a href="https://tailwindcss.com" target="_blank" rel="noopener noreferrer" className="hover:text-white underline ml-1">Tailwind CSS</a>.
          </p> */}
        </div>
      </div>
    </footer>
  );
}