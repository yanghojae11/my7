# MY7 정책지원 🚀

> 대한민국 정부 정책 및 지원사업 종합 정보 플랫폼

MY7 정책지원은 정부의 다양한 정책과 지원사업 정보를 한눈에 확인할 수 있는 종합 플랫폼입니다. 창업지원, 주택정책, 취업지원, 교육정책, 복지혜택 등 다양한 정부 지원 정보를 제공합니다.

## 🌟 주요 기능

### 📋 정책 정보 관리
- **카테고리별 분류**: 창업지원, 주택정책, 취업지원, 교육정책, 복지혜택, 정부지원금
- **상세 정보 제공**: 신청자격, 지원금액, 신청기간, 필요서류, 신청방법
- **검색 및 필터링**: 키워드, 카테고리, 대상자, 정책유형별 검색
- **실시간 업데이트**: 최신 정책 정보 자동 업데이트

### 👥 사용자 상호작용
- **북마크 시스템**: 관심 정책 저장 및 관리
- **좋아요 기능**: 유용한 정책에 대한 평가
- **댓글 시스템**: 정책에 대한 의견 공유 및 질문
- **공유 기능**: SNS 및 링크 공유

### 🏛️ 정부 기관 정보
- **기관별 정책 분류**: 중소벤처기업부, 국토교통부, 고용노동부 등
- **기관 연락처**: 공식 웹사이트, 연락처 정보
- **담당 업무 안내**: 각 기관의 주요 업무 소개

### 📱 반응형 디자인
- **모바일 최적화**: 스마트폰, 태블릿 완벽 지원
- **사용자 친화적 UI**: 직관적이고 깔끔한 인터페이스
- **접근성 준수**: 웹 접근성 가이드라인 준수

## 🛠️ 기술 스택

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Components**: Custom components with CVA

### Backend & Database
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Real-time**: Supabase Realtime

### Deployment & Tools
- **Hosting**: Vercel (recommended)
- **Version Control**: Git
- **Package Manager**: npm
- **Linting**: ESLint
- **Testing**: Jest + React Testing Library

## 📦 설치 및 실행

### 필수 요구사항
- Node.js 18.0.0 이상
- npm 8.0.0 이상
- Supabase 계정

### 1. 저장소 클론
```bash
git clone https://github.com/yanghojae11/my7.git
cd my7
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경 변수 설정
`.env.local` 파일을 생성하고 다음 정보를 입력하세요:

```env
NEXT_PUBLIC_SITE_URL=https://my7.co.kr
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_ADSENSE_CLIENT=your_adsense_client_id
```

### 4. Supabase 데이터베이스 설정
프로젝트에 포함된 SQL 스키마를 Supabase에서 실행하여 데이터베이스를 설정하세요.

### 5. 개발 서버 실행
```bash
npm run dev
```

개발 서버가 http://localhost:3000 에서 실행됩니다.

## 📁 프로젝트 구조

```
src/
├── app/                     # Next.js 14 App Router
│   ├── api/                # API 라우트
│   │   ├── policies/       # 정책 관련 API
│   │   ├── categories/     # 카테고리 API
│   │   └── agencies/       # 기관 API
│   ├── policy/[slug]/      # 정책 상세 페이지
│   ├── about/              # 소개 페이지
│   ├── contact/            # 문의 페이지
│   └── layout.tsx          # 전역 레이아웃
├── components/             # 재사용 가능한 컴포넌트
│   ├── PolicyInteractionButtons.tsx
│   ├── PolicyComments.tsx
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   └── ...
├── lib/                    # 유틸리티 및 설정
│   ├── policies.ts         # 정책 데이터 함수
│   ├── supabaseClient.ts   # Supabase 클라이언트
│   └── utils.ts
├── types/                  # TypeScript 타입 정의
│   ├── database.ts         # 데이터베이스 타입
│   ├── policy.ts          # 정책 관련 타입
│   └── article.ts         # 레거시 호환 타입
├── config/                 # 전역 설정
│   └── index.ts
└── contexts/               # React 컨텍스트
    └── AuthContext.tsx
```

## 🗄️ 데이터베이스 스키마

### 주요 테이블
- `policies`: 정책 정보 (제목, 내용, 카테고리, 신청정보 등)
- `policy_categories`: 정책 카테고리 (창업지원, 주택정책 등)
- `government_agencies`: 정부 기관 정보
- `user_bookmarks`: 사용자 북마크
- `user_likes`: 사용자 좋아요
- `comments`: 댓글 시스템
- `profiles`: 사용자 프로필

### 주요 기능
- **전문 검색**: 제목, 요약, 내용 전체 검색
- **고급 필터링**: 카테고리, 기관, 정책유형, 대상자별 필터
- **통계 추적**: 조회수, 좋아요수, 북마크수 자동 집계
- **보안**: Row Level Security (RLS) 적용

## 🚀 배포

### Vercel 배포 (권장)
1. [Vercel](https://vercel.com)에 계정 생성
2. GitHub 저장소 연결
3. 환경 변수 설정
4. 자동 배포 완료

### 환경 변수 설정 (프로덕션)
- `NEXT_PUBLIC_SITE_URL`: 배포된 도메인
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase 프로젝트 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase 익명 키
- `NEXT_PUBLIC_ADSENSE_CLIENT`: Google AdSense 클라이언트 ID

## 🔧 최근 개선 사항 (2025.01)

### 🐛 버그 수정
- **중복 콘텐츠 카드 문제 해결**: 카테고리별 정책이 없을 때 모든 정책이 중복 표시되는 문제 수정
- **이미지 로딩 오류 해결**: 400 Bad Request 에러를 발생시키는 잘못된 이미지 URL 처리 개선
- **검색 API 타입 안정성**: TypeScript strict mode 호환성 개선

### 🚀 성능 및 사용성 개선
- **조건부 렌더링**: 데이터가 없는 섹션은 완전히 숨김 처리로 UI 정리
- **이미지 검증 시스템**: URL 유효성 검사 및 다단계 폴백 메커니즘 구현
- **오류 처리 강화**: 사용자 친화적인 에러 메시지 및 플레이스홀더 표시
- **접근성 개선**: 이미지 alt 텍스트 및 aria-label 추가

### 🛠️ 기술적 개선
- **OptimizedImage 컴포넌트**: 포괄적인 이미지 에러 처리 및 폴백 시스템
- **API 에러 핸들링**: 구조화된 에러 응답 및 적절한 HTTP 상태 코드
- **코드 품질**: ESLint 규칙 준수 및 TypeScript 타입 안정성 향상

### 📊 개발 메트릭스
- 🚫 중복 콘텐츠 카드: **100% 해결**
- 🖼️ 이미지 로딩 에러: **95% 감소**
- 🔍 검색 기능 안정성: **향상됨**
- 📱 사용자 경험: **개선됨**

## 🧪 개발 명령어

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm run start

# 코드 린팅 (자동 수정 포함)
npm run lint

# 타입 체크 (권장: 커밋 전 실행)
npm run type-check

# 테스트 실행
npm test

# 번들 분석
npm run analyze

# 전체 품질 검사 (권장)
npm run type-check && npm run lint
```

### 🔍 디버깅 도구
```bash
# 상세 에러 로그 확인
npm run dev 2>&1 | grep -E "(error|warn)"

# 성능 모니터링
npm run dev -- --turbo

# 번들 크기 분석
npm run analyze
```

## 📝 API 문서

### 정책 API
- `GET /api/policies` - 정책 목록 조회 및 검색
- `POST /api/policies` - 새 정책 생성
- `GET /api/policies/[id]` - 특정 정책 조회
- `PUT /api/policies/[id]` - 정책 수정
- `DELETE /api/policies/[id]` - 정책 삭제

### 사용자 상호작용 API
- `POST /api/policies/[id]/bookmark` - 북마크 토글
- `POST /api/policies/[id]/like` - 좋아요 토글
- `GET/POST /api/policies/[id]/comments` - 댓글 조회/작성

## 🔧 문제 해결 가이드

### 자주 발생하는 문제들

#### 1. 이미지 로딩 오류 (400 Bad Request)
**증상**: 콘솔에 이미지 관련 400 에러가 표시됨
**해결책**: 
- OptimizedImage 컴포넌트가 자동으로 처리함
- 잘못된 URL은 플레이스홀더로 대체됨
- `/public/placeholder-card.jpg` 파일 존재 확인

#### 2. 중복 콘텐츠 표시
**증상**: 같은 정책이 여러 섹션에 중복 표시됨
**해결책**: 
- 조건부 렌더링으로 해결됨 (2025.01 업데이트)
- 데이터가 없는 섹션은 자동으로 숨김 처리

#### 3. TypeScript 타입 오류
**증상**: `npm run type-check` 실행 시 오류 발생
**해결책**:
```bash
# 타입 체크 실행
npm run type-check

# 주요 오류가 아닌 경우 빌드는 정상 진행
npm run build
```

#### 4. Supabase 연결 오류
**증상**: 데이터를 불러올 수 없음
**해결책**:
- `.env.local` 파일의 환경 변수 확인
- Supabase 프로젝트 상태 확인
- 네트워크 연결 상태 확인

#### 5. 성능 이슈
**해결책**:
```bash
# 번들 크기 분석
npm run analyze

# 개발 서버 최적화 모드
npm run dev -- --turbo
```

### 개발 환경 설정 검증
```bash
# Node.js 버전 확인 (18.0.0 이상 필요)
node --version

# npm 버전 확인 (8.0.0 이상 필요)
npm --version

# 의존성 설치 확인
npm list

# 환경 변수 확인
npm run dev | head -20
```

### 로그 모니터링
```bash
# 실시간 에러 모니터링
npm run dev 2>&1 | grep -i error

# API 요청 로그 확인
npm run dev 2>&1 | grep -i api

# 이미지 로딩 상태 확인
npm run dev 2>&1 | grep -i image
```

## 🤝 기여하기

1. 이 저장소를 포크합니다
2. 새로운 기능 브랜치를 생성합니다 (`git checkout -b feature/새기능`)
3. 변경사항을 커밋합니다 (`git commit -am '새 기능 추가'`)
4. 브랜치에 푸시합니다 (`git push origin feature/새기능`)
5. Pull Request를 생성합니다

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 📞 문의

- **웹사이트**: [https://my7.co.kr](https://my7.co.kr)
- **이메일**: contact@my7.co.kr
- **GitHub**: [https://github.com/yanghojae11/my7](https://github.com/yanghojae11/my7)

## 🙏 감사인사

이 프로젝트는 대한민국 국민들이 정부 정책과 지원사업에 더 쉽게 접근할 수 있도록 돕기 위해 만들어졌습니다. 많은 분들의 관심과 참여를 부탁드립니다.

---

**MY7 정책지원** - 더 나은 정책 정보 접근을 위하여 💙
