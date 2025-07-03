const axios = require('axios');
const xml2js = require('xml2js');

class WelfareServiceCollector {
  constructor(apiKey, options = {}) {
    this.apiKey = apiKey;
    this.baseUrl = 'http://apis.data.go.kr/B554287/NationalWelfareInformationsV001';
    this.timeout = options.timeout || 30000;
    this.maxRetries = options.maxRetries || 3;
    this.retryDelay = options.retryDelay || 1000;
  }

  async collectWelfareServices(pageSize = 100, maxPages = 10) {
    const allServices = [];
    let currentPage = 1;

    try {
      console.log('Starting welfare services collection...');

      while (currentPage <= maxPages) {
        const services = await this.collectServicesByPage(currentPage, pageSize);
        
        if (services.length === 0) {
          console.log(`No more services found at page ${currentPage}`);
          break;
        }

        allServices.push(...services);
        console.log(`Collected ${services.length} services from page ${currentPage}`);
        
        if (services.length < pageSize) {
          console.log('Reached end of available services');
          break;
        }

        currentPage++;
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      console.log(`Total welfare services collected: ${allServices.length}`);
      return allServices;
    } catch (error) {
      console.error('Welfare services collection failed:', error.message);
      throw error;
    }
  }

  async collectServicesByPage(pageNo = 1, numOfRows = 100) {
    const searchParams = {
      serviceKey: this.apiKey,
      numOfRows: numOfRows,
      pageNo: pageNo
    };

    try {
      const response = await this.makeRequest('/NationalWelfarelistV001', searchParams);
      const items = await this.parseXmlResponse(response.data);
      
      return this.transformItems(items);
    } catch (error) {
      console.error(`Failed to collect services from page ${pageNo}:`, error.message);
      throw error;
    }
  }

  async getServiceDetail(serviceId) {
    const searchParams = {
      serviceKey: this.apiKey,
      serviceId: serviceId
    };

    try {
      const response = await this.makeRequest('/NationalWelfaredetailedV001', searchParams);
      const items = await this.parseXmlResponse(response.data);
      
      return items.length > 0 ? this.transformDetailItem(items[0]) : null;
    } catch (error) {
      console.error(`Failed to get service detail for ${serviceId}:`, error.message);
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
      service_id: item.serviceId || item.servId,
      service_name: this.cleanText(item.serviceName || item.servNm),
      service_purpose: this.cleanText(item.servicePurpose || item.servDgst),
      service_target: this.cleanText(item.serviceTarget || item.servTrgt),
      application_method: this.cleanText(item.applicationMethod || item.applMthd),
      application_deadline: this.cleanText(item.applicationDeadline || item.applDdln),
      support_type: this.cleanText(item.supportType || item.sprtTrgt),
      support_content: this.cleanText(item.supportContent || item.sprtCtt),
      department: this.cleanText(item.department || item.ctpvNm),
      contact_info: this.cleanText(item.contactInfo || item.ctpvCtt),
      life_cycle: this.determineLifeCycle(item.serviceTarget || item.servTrgt || ''),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      original_data: {
        lastModified: item.lastModified || item.lastUpdt,
        categoryCode: item.categoryCode || item.ctgryCode,
        serviceUrl: item.serviceUrl || item.servUrl
      }
    }));
  }

  transformDetailItem(item) {
    return {
      service_id: item.serviceId || item.servId,
      service_name: this.cleanText(item.serviceName || item.servNm),
      service_purpose: this.cleanText(item.servicePurpose || item.servDgst),
      service_target: this.cleanText(item.serviceTarget || item.servTrgt),
      application_method: this.cleanText(item.applicationMethod || item.applMthd),
      application_deadline: this.cleanText(item.applicationDeadline || item.applDdln),
      support_type: this.cleanText(item.supportType || item.sprtTrgt),
      support_content: this.cleanText(item.supportContent || item.sprtCtt),
      department: this.cleanText(item.department || item.ctpvNm),
      contact_info: this.cleanText(item.contactInfo || item.ctpvCtt),
      required_documents: this.cleanText(item.requiredDocuments || item.psblReqDocuments),
      selection_criteria: this.cleanText(item.selectionCriteria || item.slctnCrtfc),
      application_url: this.cleanText(item.applicationUrl || item.applUrl),
      reference_url: this.cleanText(item.referenceUrl || item.refUrl),
      life_cycle: this.determineLifeCycle(item.serviceTarget || item.servTrgt || ''),
      keywords: this.extractKeywords(item.serviceName, item.servicePurpose, item.serviceTarget),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      original_data: {
        lastModified: item.lastModified || item.lastUpdt,
        categoryCode: item.categoryCode || item.ctgryCode,
        serviceUrl: item.serviceUrl || item.servUrl,
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

  determineLifeCycle(target) {
    const targetText = target.toLowerCase();
    
    if (targetText.includes('영유아') || targetText.includes('아동') || targetText.includes('어린이')) {
      return 'childhood';
    }
    if (targetText.includes('청소년') || targetText.includes('학생')) {
      return 'adolescence';
    }
    if (targetText.includes('청년') || targetText.includes('대학생') || targetText.includes('취업준비')) {
      return 'youth';
    }
    if (targetText.includes('성인') || targetText.includes('근로자') || targetText.includes('직장인')) {
      return 'adulthood';
    }
    if (targetText.includes('중년') || targetText.includes('장년')) {
      return 'middle_age';
    }
    if (targetText.includes('노인') || targetText.includes('어르신') || targetText.includes('65세')) {
      return 'elderly';
    }
    if (targetText.includes('임신') || targetText.includes('출산') || targetText.includes('육아')) {
      return 'pregnancy_birth';
    }
    if (targetText.includes('저소득') || targetText.includes('기초생활') || targetText.includes('차상위')) {
      return 'low_income';
    }
    if (targetText.includes('장애') || targetText.includes('장애인')) {
      return 'disability';
    }
    
    return 'general';
  }

  extractKeywords(serviceName, servicePurpose, serviceTarget) {
    const text = `${serviceName} ${servicePurpose} ${serviceTarget}`.toLowerCase();
    const keywords = [
      '복지', '지원', '혜택', '서비스', '급여', '수당', '보조금',
      '의료', '건강', '돌봄', '교육', '주거', '고용', '창업',
      '아동', '청소년', '청년', '노인', '장애인', '저소득층',
      '임신', '출산', '육아', '보육', '취업', '직업훈련'
    ];

    const foundKeywords = keywords.filter(keyword => text.includes(keyword));
    return foundKeywords.slice(0, 10).join(', ');
  }

  async testConnection() {
    try {
      const testParams = {
        serviceKey: this.apiKey,
        numOfRows: 1,
        pageNo: 1
      };

      const response = await this.makeRequest('/NationalWelfarelistV001', testParams);
      await this.parseXmlResponse(response.data);
      
      console.log('Welfare services API connection test successful');
      return true;
    } catch (error) {
      console.error('Welfare services API connection test failed:', error.message);
      return false;
    }
  }
}

module.exports = WelfareServiceCollector;