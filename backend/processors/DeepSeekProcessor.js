const axios = require('axios');

class DeepSeekProcessor {
  constructor(apiKey, options = {}) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.deepseek.com/v1/chat/completions';
    this.model = options.model || 'deepseek-chat';
    this.timeout = options.timeout || 30000;
    this.maxRetries = options.maxRetries || 3;
    this.retryDelay = options.retryDelay || 1000;
  }

  async enhanceContent(title, content, options = {}) {
    const prompt = this.buildEnhancementPrompt(title, content, options);
    
    try {
      const response = await this.makeRequest([
        {
          role: 'system',
          content: '당신은 대한민국 정부 정책과 복지 서비스 정보를 분석하고 요약하는 전문가입니다. 정확하고 이해하기 쉬운 한국어로 응답해주세요.'
        },
        {
          role: 'user',
          content: prompt
        }
      ]);

      return this.parseEnhancementResponse(response);
    } catch (error) {
      console.error('Content enhancement failed:', error.message);
      return this.getFallbackEnhancement(title, content);
    }
  }

  async categorizeContent(title, content) {
    const prompt = `
다음 정책/복지 정보를 분석하여 가장 적합한 카테고리를 선택해주세요:

제목: ${title}
내용: ${content.substring(0, 500)}...

카테고리 옵션:
1. startup-support (창업 지원)
2. housing-policy (주택 정책)  
3. employment-support (취업 지원)
4. education-policy (교육 정책)
5. welfare-benefits (복지 혜택)
6. government-subsidies (정부 지원금)
7. policy-news (정책 뉴스)

응답 형식: 카테고리 slug만 반환 (예: startup-support)
`;

    try {
      const response = await this.makeRequest([
        {
          role: 'system',
          content: '당신은 정책 분류 전문가입니다. 주어진 카테고리 중에서 가장 적합한 하나만 선택해주세요.'
        },
        {
          role: 'user',
          content: prompt
        }
      ]);

      const category = response.trim().toLowerCase();
      const validCategories = ['startup-support', 'housing-policy', 'employment-support', 'education-policy', 'welfare-benefits', 'government-subsidies', 'policy-news'];
      
      return validCategories.includes(category) ? category : 'policy-news';
    } catch (error) {
      console.error('Content categorization failed:', error.message);
      return 'policy-news';
    }
  }

  async generateSummary(title, content, maxLength = 200) {
    const prompt = `
다음 정책/복지 정보를 ${maxLength}자 이내로 핵심 내용만 간결하게 요약해주세요:

제목: ${title}
내용: ${content}

요약 조건:
- 핵심 정보만 포함 (대상, 지원내용, 신청방법 등)
- ${maxLength}자 이내
- 마침표로 끝나는 완전한 문장
- 불필요한 수식어 제거
`;

    try {
      const response = await this.makeRequest([
        {
          role: 'system',
          content: '당신은 정책 정보 요약 전문가입니다. 핵심 정보만 간결하게 요약해주세요.'
        },
        {
          role: 'user',
          content: prompt
        }
      ]);

      let summary = response.trim();
      if (summary.length > maxLength) {
        summary = summary.substring(0, maxLength - 3) + '...';
      }

      return summary;
    } catch (error) {
      console.error('Summary generation failed:', error.message);
      return this.generateFallbackSummary(content, maxLength);
    }
  }

  async extractKeywords(title, content, maxKeywords = 10) {
    const prompt = `
다음 정책/복지 정보에서 검색과 분류에 유용한 핵심 키워드를 추출해주세요:

제목: ${title}
내용: ${content.substring(0, 1000)}

조건:
- 최대 ${maxKeywords}개 키워드
- 쉼표로 구분
- 검색에 유용한 명사 위주
- 정책 분야, 대상, 지원 내용 관련 키워드 포함

예시: 창업지원, 청년, 자금지원, 멘토링, 사업계획서
`;

    try {
      const response = await this.makeRequest([
        {
          role: 'system',
          content: '당신은 키워드 추출 전문가입니다. 검색에 유용한 핵심 키워드만 추출해주세요.'
        },
        {
          role: 'user',
          content: prompt
        }
      ]);

      const keywords = response.trim()
        .split(',')
        .map(k => k.trim())
        .filter(k => k.length > 0)
        .slice(0, maxKeywords);

      return keywords.join(', ');
    } catch (error) {
      console.error('Keyword extraction failed:', error.message);
      return this.extractFallbackKeywords(title, content);
    }
  }

  buildEnhancementPrompt(title, content, options) {
    return `
다음 정책/복지 정보를 분석하고 향상시켜주세요:

제목: ${title}
내용: ${content}

요청사항:
1. 200자 이내 요약 생성
2. 검색용 키워드 10개 추출 (쉼표 구분)
3. 적합한 카테고리 분류 (startup-support, housing-policy, employment-support, education-policy, welfare-benefits, government-subsidies, policy-news 중 선택)
4. 대상자 분석 (해당시)
5. 신청 방법 요약 (해당시)

JSON 형식으로 응답:
{
  "summary": "요약 내용",
  "keywords": "키워드1, 키워드2, ...",
  "category": "카테고리",
  "target": "대상자",
  "applicationMethod": "신청방법"
}
`;
  }

  parseEnhancementResponse(response) {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          summary: parsed.summary || '',
          keywords: parsed.keywords || '',
          category: parsed.category || 'policy-news',
          target: parsed.target || '',
          applicationMethod: parsed.applicationMethod || ''
        };
      }
    } catch (error) {
      console.warn('Failed to parse enhancement response:', error.message);
    }

    return {
      summary: '',
      keywords: '',
      category: 'policy-news',
      target: '',
      applicationMethod: ''
    };
  }

  async makeRequest(messages, retryCount = 0) {
    try {
      const response = await axios.post(this.baseUrl, {
        model: this.model,
        messages: messages,
        max_tokens: 1000,
        temperature: 0.3,
        stream: false
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: this.timeout
      });

      if (response.data && response.data.choices && response.data.choices[0]) {
        return response.data.choices[0].message.content;
      }

      throw new Error('Invalid API response format');
    } catch (error) {
      if (retryCount < this.maxRetries) {
        console.log(`DeepSeek API request failed, retrying... (${retryCount + 1}/${this.maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * (retryCount + 1)));
        return this.makeRequest(messages, retryCount + 1);
      }
      throw error;
    }
  }

  getFallbackEnhancement(title, content) {
    return {
      summary: this.generateFallbackSummary(content, 200),
      keywords: this.extractFallbackKeywords(title, content),
      category: 'policy-news',
      target: '',
      applicationMethod: ''
    };
  }

  generateFallbackSummary(content, maxLength) {
    if (!content) return '';
    
    const cleaned = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    if (cleaned.length <= maxLength) return cleaned;
    
    const truncated = cleaned.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    
    return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
  }

  extractFallbackKeywords(title, content) {
    const text = `${title} ${content}`.toLowerCase();
    const commonKeywords = [
      '정책', '지원', '사업', '제도', '혜택', '서비스', '급여', '수당',
      '창업', '취업', '교육', '주택', '복지', '청년', '노인', '아동',
      '기업', '중소기업', '스타트업', '일자리', '직업', '기술',
      '자금', '융자', '보조금', '장학금', '훈련', '상담'
    ];

    const foundKeywords = commonKeywords.filter(keyword => text.includes(keyword));
    return foundKeywords.slice(0, 10).join(', ');
  }

  async testConnection() {
    try {
      const response = await this.makeRequest([
        {
          role: 'user',
          content: '안녕하세요. 연결 테스트입니다.'
        }
      ]);

      console.log('DeepSeek API connection test successful');
      return true;
    } catch (error) {
      console.error('DeepSeek API connection test failed:', error.message);
      return false;
    }
  }
}

module.exports = DeepSeekProcessor;