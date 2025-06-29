import Link from 'next/link';
// import { Search } from 'lucide-react'; // 검색 아이콘 예시 (필요 시)

export default function Navbar() {
  return (
    // 배경색 및 그림자 효과 개선, 상단에 고정
    <header className="sticky top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/80 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"> {/* layout.tsx의 main 너비와 일치시킴 */}
        <div className="flex items-center justify-between h-16 md:h-20"> {/* 높이 반응형 적용 */}
          {/* 로고 */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold tracking-tight text-gray-900 hover:text-primary transition-colors">
              MY7 정책지원
            </Link>
          </div>

          {/* 네비게이션 링크 */}
          <div className="hidden md:flex items-center space-x-6 text-sm font-medium text-gray-700">
            <Link href="/" className="hover:text-primary transition-colors">홈</Link>
            <Link href="/startup" className="hover:text-primary transition-colors">창업지원</Link>
            <Link href="/housing" className="hover:text-primary transition-colors">주택정책</Link>
            <Link href="/employment" className="hover:text-primary transition-colors">취업지원</Link>
            <Link href="/education" className="hover:text-primary transition-colors">교육정책</Link>
            <Link href="/welfare" className="hover:text-primary transition-colors">복지혜택</Link>
            <Link href="/about" className="hover:text-primary transition-colors">소개</Link>
          </div>

          {/* 오른쪽 영역 (예: 검색 버튼, 로그인 버튼 등) */}
          <div className="flex items-center space-x-4">
            {/* <button aria-label="Search" className="text-gray-600 hover:text-primary transition-colors">
              <Search size={20} />
            </button>
            <Link href="/login" className="px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary-hover transition-colors">
              Login
            </Link>
            */}
          </div>

          {/* 모바일 메뉴 버튼 (작은 화면에서 표시) */}
          <div className="md:hidden">
            {/* 모바일 메뉴 토글 버튼 구현 필요 (예: Hamburger icon) */}
            {/* <button className="text-gray-700 hover:text-primary">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
            </button>
            */}
          </div>
        </div>
      </nav>
      {/* 모바일 메뉴 (토글 시 표시되는 드롭다운 또는 슬라이드 메뉴) */}
      {/* <div className="md:hidden"> ... 모바일 메뉴 UI ... </div> */}
    </header>
  );
}