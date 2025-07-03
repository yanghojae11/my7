const axios = require('axios');
const xml2js = require('xml2js');

class PolicyNewsCollector {
  constructor(apiKey, options = {}) {
    this.apiKey = apiKey;
    this.baseUrl = 'http://apis.data.go.kr/1371000/policyNewsService';
    this.timeout = options.timeout || 30000;
    this.maxRetries = options.maxRetries || 3;
    this.retryDelay = options.retryDelay || 1000;
  }

  async collectPolicyNews(days = 1, pageSize = 100) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const searchParams = {
      serviceKey: this.apiKey,
      numOfRows: pageSize,
      pageNo: 1,
      startDate: this.formatDate(startDate),
      endDate: this.formatDate(endDate)
    };

    try {
      console.log(`Collecting policy news from ${searchParams.startDate} to ${searchParams.endDate}`);
      
      const response = await this.makeRequest('/policyNewsList', searchParams);
      const items = await this.parseXmlResponse(response.data);
      
      return this.transformItems(items);
    } catch (error) {
      console.error('Policy news collection failed:', error.message);
      throw error;
    }
  }

  async makeRequest(endpoint, params, retryCount = 0) {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await axios.get(url, {
        params,
        timeout: this.timeout,
        headers: {
          'User-Agent': 'MY7-Policy-Collector/1.0'
        }
      });

      if (response.status !== 200) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    } catch (error) {
      if (retryCount < this.maxRetries) {
        console.log(`Request failed, retrying... (${retryCount + 1}/${this.maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * (retryCount + 1)));
        return this.makeRequest(endpoint, params, retryCount + 1);
      }
      throw error;
    }
  }

  async parseXmlResponse(xmlData) {
    try {
      const parser = new xml2js.Parser({
        explicitArray: false,
        ignoreAttrs: true,
        trim: true
      });

      const result = await parser.parseStringPromise(xmlData);
      
      if (result.response && result.response.header && result.response.header.resultCode !== '00') {
        throw new Error(`API Error: ${result.response.header.resultMsg}`);
      }

      const items = result.response?.body?.items?.item;
      
      if (!items) {
        console.log('No policy news items found');
        return [];
      }

      return Array.isArray(items) ? items : [items];
    } catch (error) {
      console.error('XML parsing failed:', error.message);
      throw new Error(`Failed to parse API response: ${error.message}`);
    }
  }

  transformItems(items) {
    return items.map(item => ({
      title: this.cleanText(item.title),
      content: this.cleanText(item.content),
      summary: this.generateSummary(item.content),
      source_url: item.link || null,
      published_at: this.parseDate(item.regDate),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'published',
      view_count: 0,
      keywords: this.extractKeywords(item.title, item.content),
      source_type: 'policy_briefing',
      original_data: {
        regDate: item.regDate,
        department: item.department,
        category: item.category,
        originalId: item.id
      }
    }));
  }

  cleanText(text) {
    if (!text) return '';
    
    return text
      .replace(/<[^>]*>/g, '')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
  }

  generateSummary(content, maxLength = 200) {
    if (!content) return '';
    
    const cleaned = this.cleanText(content);
    if (cleaned.length <= maxLength) return cleaned;
    
    const truncated = cleaned.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    
    return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
  }

  extractKeywords(title, content) {
    const text = `${title} ${content}`.toLowerCase();
    const commonKeywords = [
      '정책', '지원', '사업', '제도', '계획', '방안', '개선', '확대', '신설',
      '정부', '부처', '지자체', '공공', '민간', '기업', '시민', '국민',
      '경제', '사회', '문화', '교육', '복지', '환경', '안전', '건강'
    ];

    const foundKeywords = commonKeywords.filter(keyword => text.includes(keyword));
    return foundKeywords.slice(0, 10).join(', ');
  }

  parseDate(dateString) {
    if (!dateString) return new Date().toISOString();
    
    try {
      if (dateString.includes('-')) {
        return new Date(dateString).toISOString();
      }
      
      if (dateString.length === 8) {
        const year = dateString.substring(0, 4);
        const month = dateString.substring(4, 6);
        const day = dateString.substring(6, 8);
        return new Date(`${year}-${month}-${day}`).toISOString();
      }
      
      return new Date(dateString).toISOString();
    } catch (error) {
      console.warn('Date parsing failed, using current date:', error.message);
      return new Date().toISOString();
    }
  }

  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }

  async testConnection() {
    try {
      const testParams = {
        serviceKey: this.apiKey,
        numOfRows: 1,
        pageNo: 1
      };

      const response = await this.makeRequest('/policyNewsList', testParams);
      await this.parseXmlResponse(response.data);
      
      console.log('Policy news API connection test successful');
      return true;
    } catch (error) {
      console.error('Policy news API connection test failed:', error.message);
      return false;
    }
  }
}

module.exports = PolicyNewsCollector;