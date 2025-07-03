const axios = require('axios');
const xml2js = require('xml2js');

class YouthCenterCollector {
  constructor(apiKey, options = {}) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://www.youthcenter.go.kr/opi';
    this.timeout = options.timeout || 30000;
    this.maxRetries = options.maxRetries || 3;
    this.retryDelay = options.retryDelay || 1000;
  }

  async collectYouthPolicies(pageSize = 100, maxPages = 5) {
    const allPolicies = [];
    let currentPage = 1;

    try {
      console.log('Starting youth policies collection...');

      while (currentPage <= maxPages) {
        const policies = await this.collectPoliciesByPage(currentPage, pageSize);
        
        if (policies.length === 0) {
          console.log(`No more youth policies found at page ${currentPage}`);
          break;
        }

        allPolicies.push(...policies);
        console.log(`Collected ${policies.length} youth policies from page ${currentPage}`);
        
        if (policies.length < pageSize) {
          console.log('Reached end of available youth policies');
          break;
        }

        currentPage++;
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      console.log(`Total youth policies collected: ${allPolicies.length}`);
      return allPolicies;
    } catch (error) {
      console.error('Youth policies collection failed:', error.message);
      throw error;
    }
  }

  async collectPoliciesByPage(pageNo = 1, numOfRows = 100) {
    const searchParams = {
      openApiVlak: this.apiKey,
      display: numOfRows,
      pageIndex: pageNo,
      srchPolicyId: '',
      query: '',
      bizTycdSel: '',
      srchPolyBizSecd: ''
    };

    try {
      const response = await this.makeRequest('/youthPlcyList.do', searchParams);
      const items = await this.parseXmlResponse(response.data);
      
      return this.transformItems(items);
    } catch (error) {
      console.error(`Failed to collect youth policies from page ${pageNo}:`, error.message);
      throw error;
    }
  }

  async getPolicyDetail(policyId) {
    const searchParams = {
      openApiVlak: this.apiKey,
      srchPolicyId: policyId
    };

    try {
      const response = await this.makeRequest('/youthPlcyList.do', searchParams);
      const items = await this.parseXmlResponse(response.data);
      
      return items.length > 0 ? this.transformDetailItem(items[0]) : null;
    } catch (error) {
      console.error(`Failed to get youth policy detail for ${policyId}:`, error.message);
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
          'User-Agent': 'MY7-Policy-Collector/1.0',
          'Accept': 'application/xml'
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
      
      if (result.empsInfo && result.empsInfo.emp) {
        const items = result.empsInfo.emp;
        return Array.isArray(items) ? items : [items];
      }

      return [];
    } catch (error) {
      console.error('XML parsing failed:', error.message);
      throw new Error(`Failed to parse API response: ${error.message}`);
    }
  }

  transformItems(items) {
    return items.map(item => ({
      title: this.cleanText(item.polyBizSjnm),
      content: this.cleanText(item.polyItcnCn),
      summary: this.generateSummary(item.polyItcnCn),
      source_url: item.rfrncUrla1 || null,
      published_at: this.parseDate(item.regDt),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'published',
      view_count: 0,
      keywords: this.extractKeywords(item.polyBizSjnm, item.polyItcnCn, item.sporCn),
      source_type: 'youth_center',
      target_age: this.parseAge(item.ageInfo),
      application_period: this.cleanText(item.rqutPrdCn),
      support_content: this.cleanText(item.sporCn),
      support_scale: this.cleanText(item.sporScvl),
      contact_info: this.cleanText(item.cnsgNmor),
      original_data: {
        policyId: item.bizId,
        policyArea: item.polyRlmCd,
        businessType: item.polyBizTy,
        department: item.cnsgNmor,
        ageInfo: item.ageInfo,
        majrTrgtCn: item.majrTrgtCn,
        empmSttsCn: item.empmSttsCn,
        splzRlmRqisCn: item.splzRlmRqisCn,
        accrRqisCn: item.accrRqisCn,
        prcpCn: item.prcpCn,
        aditRscn: item.aditRscn,
        prcpLmttTrgtCn: item.prcpLmttTrgtCn,
        rqutProcCn: item.rqutProcCn,
        pstnPaprCn: item.pstnPaprCn,
        jdgnPresCn: item.jdgnPresCn,
        rfrncUrla1: item.rfrncUrla1,
        rfrncUrla2: item.rfrncUrla2
      }
    }));
  }

  transformDetailItem(item) {
    return {
      title: this.cleanText(item.polyBizSjnm),
      content: this.cleanText(item.polyItcnCn),
      summary: this.generateSummary(item.polyItcnCn),
      source_url: item.rfrncUrla1 || null,
      published_at: this.parseDate(item.regDt),
      target_age: this.parseAge(item.ageInfo),
      target_employment: this.cleanText(item.empmSttsCn),
      target_education: this.cleanText(item.accrRqisCn),
      target_specialization: this.cleanText(item.splzRlmRqisCn),
      application_period: this.cleanText(item.rqutPrdCn),
      application_process: this.cleanText(item.rqutProcCn),
      required_documents: this.cleanText(item.pstnPaprCn),
      support_content: this.cleanText(item.sporCn),
      support_scale: this.cleanText(item.sporScvl),
      selection_criteria: this.cleanText(item.jdgnPresCn),
      participation_restrictions: this.cleanText(item.prcpLmttTrgtCn),
      additional_notes: this.cleanText(item.aditRscn),
      contact_info: this.cleanText(item.cnsgNmor),
      reference_url_1: item.rfrncUrla1,
      reference_url_2: item.rfrncUrla2,
      keywords: this.extractKeywords(item.polyBizSjnm, item.polyItcnCn, item.sporCn),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      original_data: {
        policyId: item.bizId,
        policyArea: item.polyRlmCd,
        businessType: item.polyBizTy,
        detailFetched: true
      }
    };
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

  parseAge(ageInfo) {
    if (!ageInfo) return null;
    
    const ageMatch = ageInfo.match(/(\d+)(?:세|년)/g);
    if (ageMatch) {
      const ages = ageMatch.map(age => parseInt(age.replace(/[세년]/g, '')));
      return {
        min: Math.min(...ages),
        max: Math.max(...ages),
        description: ageInfo
      };
    }
    
    return { description: ageInfo };
  }

  extractKeywords(title, content, support) {
    const text = `${title} ${content} ${support}`.toLowerCase();
    const keywords = [
      '청년', '청소년', '취업', '창업', '교육', '훈련', '지원',
      '일자리', '직업', '진로', '상담', '멘토링', '인턴',
      '기술', '역량', '개발', '성장', '도전', '기회',
      '자금', '융자', '보조금', '장학금', '수당'
    ];

    const foundKeywords = keywords.filter(keyword => text.includes(keyword));
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

  async testConnection() {
    try {
      const testParams = {
        openApiVlak: this.apiKey,
        display: 1,
        pageIndex: 1
      };

      const response = await this.makeRequest('/youthPlcyList.do', testParams);
      await this.parseXmlResponse(response.data);
      
      console.log('Youth center API connection test successful');
      return true;
    } catch (error) {
      console.error('Youth center API connection test failed:', error.message);
      return false;
    }
  }
}

module.exports = YouthCenterCollector;