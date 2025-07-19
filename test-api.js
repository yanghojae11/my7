// test-api.js - API 엔드포인트 테스트 스크립트
// 사용법: node test-api.js

const BASE_URL = 'http://localhost:3000/api';

// 색상 코드
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// API 테스트 함수
async function testAPI(endpoint, description) {
  console.log(`\n${colors.cyan}테스트: ${description}${colors.reset}`);
  console.log(`URL: ${BASE_URL}${endpoint}`);
  
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`);
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log(`${colors.green}✓ 성공${colors.reset} - Status: ${response.status}`);
      console.log(`  - 데이터 개수: ${data.data?.length || 0}`);
      console.log(`  - 전체 개수: ${data.count || 0}`);
      if (data.data && data.data[0]) {
        console.log(`  - 첫 번째 항목: ${data.data[0].title || 'N/A'}`);
      }
    } else {
      console.log(`${colors.red}✗ 실패${colors.reset} - Status: ${response.status}`);
      console.log(`  - 에러: ${data.error || 'Unknown error'}`);
    }
    
    return { success: response.ok && data.success, data };
  } catch (error) {
    console.log(`${colors.red}✗ 네트워크 에러${colors.reset}`);
    console.log(`  - 에러: ${error.message}`);
    return { success: false, error };
  }
}

// 카테고리별 API 테스트
async function testCategoryAPIs() {
  console.log(`${colors.blue}=== 카테고리별 API 테스트 ===${colors.reset}`);
  
  const categoryEndpoints = [
    { path: '/startup', name: '창업 지원' },
    { path: '/housing', name: '주택 정책' },
    { path: '/employment', name: '취업 지원' },
    { path: '/education', name: '교육 정책' },
    { path: '/welfare', name: '복지 혜택' }
  ];
  
  for (const endpoint of categoryEndpoints) {
    await testAPI(endpoint.path, `${endpoint.name} 데이터 조회`);
  }
}

// 검색 API 테스트
async function testSearchAPI() {
  console.log(`\n${colors.blue}=== 검색 API 테스트 ===${colors.reset}`);
  
  const searchQueries = [
    { query: '지원', desc: '일반 검색 - "지원"' },
    { query: '창업 지원', desc: '복수 키워드 검색 - "창업 지원"' },
    { query: '주택', category: 'housing-policy', desc: '카테고리 필터링 검색' }
  ];
  
  for (const search of searchQueries) {
    let endpoint = `/search?keywords=${encodeURIComponent(search.query)}`;
    if (search.category) {
      endpoint += `&category=${search.category}`;
    }
    await testAPI(endpoint, search.desc);
  }
}

// 일반 articles API 테스트
async function testArticlesAPI() {
  console.log(`\n${colors.blue}=== Articles API 테스트 ===${colors.reset}`);
  
  await testAPI('/articles', '전체 아티클 조회');
  await testAPI('/articles?category=startup-support', '카테고리 필터링 - 창업지원');
  await testAPI('/articles?page=2&limit=5', '페이지네이션 테스트');
}

// POST 요청 테스트 (Bearer 토큰 필요)
async function testPostAPI() {
  console.log(`\n${colors.blue}=== POST API 테스트 ===${colors.reset}`);
  console.log(`${colors.yellow}주의: Bearer 토큰이 필요합니다${colors.reset}`);
  
  const testArticle = {
    title: '테스트 정책 공고',
    content: '이것은 테스트 내용입니다. 정부에서 새로운 지원 정책을 발표했습니다.',
    category: 'startup-support',
    keywords: ['테스트', '정책', '지원'],
    image_url: 'https://example.com/test-image.jpg'
  };
  
  try {
    const response = await fetch(`${BASE_URL}/articles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk_live_b8d81e8adbdc499ebcf6bb3b6fc41827_KEY'
      },
      body: JSON.stringify(testArticle)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log(`${colors.green}✓ POST 성공${colors.reset}`);
      console.log(`  - 생성된 ID: ${data.data?.id || 'N/A'}`);
      console.log(`  - 제목: ${data.data?.title || 'N/A'}`);
    } else {
      console.log(`${colors.red}✗ POST 실패${colors.reset} - Status: ${response.status}`);
      console.log(`  - 에러: ${data.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.log(`${colors.red}✗ 네트워크 에러${colors.reset}`);
    console.log(`  - 에러: ${error.message}`);
  }
}

// 전체 테스트 실행
async function runAllTests() {
  console.log(`${colors.blue}${'='.repeat(50)}${colors.reset}`);
  console.log(`${colors.blue}MY7 정책지원 API 테스트 시작${colors.reset}`);
  console.log(`${colors.blue}${'='.repeat(50)}${colors.reset}`);
  console.log(`\n서버 URL: ${BASE_URL}`);
  console.log(`시작 시간: ${new Date().toLocaleString('ko-KR')}`);
  
  try {
    // 서버 연결 확인
    console.log(`\n${colors.cyan}서버 연결 확인 중...${colors.reset}`);
    const testResponse = await fetch('http://localhost:3000');
    if (!testResponse.ok) {
      throw new Error('서버에 연결할 수 없습니다. 서버가 실행 중인지 확인하세요.');
    }
    console.log(`${colors.green}✓ 서버 연결 성공${colors.reset}`);
    
    // 각 테스트 실행
    await testCategoryAPIs();
    await testSearchAPI();
    await testArticlesAPI();
    
    // POST 테스트는 선택적으로 실행
    if (process.argv.includes('--with-post')) {
      await testPostAPI();
    } else {
      console.log(`\n${colors.yellow}팁: POST 테스트를 실행하려면 --with-post 옵션을 추가하세요${colors.reset}`);
    }
    
  } catch (error) {
    console.error(`\n${colors.red}테스트 실행 중 오류 발생:${colors.reset}`, error.message);
  }
  
  console.log(`\n${colors.blue}${'='.repeat(50)}${colors.reset}`);
  console.log(`${colors.blue}테스트 완료${colors.reset}`);
  console.log(`종료 시간: ${new Date().toLocaleString('ko-KR')}`);
  console.log(`${colors.blue}${'='.repeat(50)}${colors.reset}\n`);
}

// 테스트 실행
runAllTests();