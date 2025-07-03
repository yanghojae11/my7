const axios = require('axios');

class EndpointTester {
  constructor(baseUrl = 'http://localhost:3001') {
    this.baseUrl = baseUrl;
    this.results = [];
  }

  async runAllTests() {
    console.log('🚀 Starting MY7 Policy Backend API Tests\n');
    
    const tests = [
      { name: 'Health Check', method: 'testHealthCheck' },
      { name: 'System Status', method: 'testSystemStatus' },
      { name: 'Connection Tests', method: 'testConnections' },
      { name: 'Latest Policies', method: 'testLatestPolicies' },
      { name: 'Category Policies', method: 'testCategoryPolicies' },
      { name: 'Popular Policies', method: 'testPopularPolicies' },
      { name: 'Search Functionality', method: 'testSearch' },
      { name: 'Welfare Recommendations', method: 'testWelfareRecommendations' },
      { name: 'Categories List', method: 'testCategories' },
      { name: 'Government Agencies', method: 'testAgencies' }
    ];

    for (const test of tests) {
      try {
        console.log(`Testing: ${test.name}...`);
        await this[test.method]();
        this.logSuccess(test.name);
      } catch (error) {
        this.logError(test.name, error.message);
      }
    }

    this.printSummary();
  }

  async testHealthCheck() {
    const response = await this.makeRequest('GET', '/api/health');
    this.validateResponse(response, {
      status: 'healthy',
      timestamp: 'string',
      version: 'string'
    });
  }

  async testSystemStatus() {
    const response = await this.makeRequest('GET', '/api/status');
    this.validateResponse(response, {
      totalPolicies: 'number',
      totalWelfareServices: 'number',
      lastUpdated: 'string'
    });
  }

  async testConnections() {
    const response = await this.makeRequest('GET', '/api/test/connections');
    this.validateResponse(response, {
      policyNews: 'boolean',
      welfareServices: 'boolean',
      youthCenter: 'boolean',
      deepSeek: 'boolean'
    });
  }

  async testLatestPolicies() {
    const response = await this.makeRequest('GET', '/api/policies/latest/10');
    
    if (!Array.isArray(response)) {
      throw new Error('Response should be an array');
    }

    if (response.length > 0) {
      this.validatePolicyStructure(response[0]);
    }
  }

  async testCategoryPolicies() {
    const categories = ['startup-support', 'housing-policy', 'employment-support'];
    
    for (const category of categories) {
      const response = await this.makeRequest('GET', `/api/policies/category/${category}/5`);
      
      if (!Array.isArray(response)) {
        throw new Error(`Category ${category} response should be an array`);
      }
    }
  }

  async testPopularPolicies() {
    const response = await this.makeRequest('GET', '/api/policies/popular/10');
    
    if (!Array.isArray(response)) {
      throw new Error('Response should be an array');
    }
  }

  async testSearch() {
    const queries = ['창업', '주택', '복지'];
    
    for (const query of queries) {
      const response = await this.makeRequest('GET', `/api/search?q=${encodeURIComponent(query)}&limit=10`);
      
      this.validateResponse(response, {
        policies: 'array',
        welfareServices: 'array',
        total: 'number'
      });
    }
  }

  async testWelfareRecommendations() {
    const lifeCycles = ['youth', 'general', 'elderly'];
    
    for (const lifeCycle of lifeCycles) {
      const response = await this.makeRequest('GET', `/api/welfare/recommend/${lifeCycle}?limit=10`);
      
      if (!Array.isArray(response)) {
        throw new Error(`Welfare ${lifeCycle} response should be an array`);
      }
    }
  }

  async testCategories() {
    const response = await this.makeRequest('GET', '/api/categories');
    
    if (!Array.isArray(response)) {
      throw new Error('Categories response should be an array');
    }
  }

  async testAgencies() {
    const response = await this.makeRequest('GET', '/api/agencies');
    
    if (!Array.isArray(response)) {
      throw new Error('Agencies response should be an array');
    }
  }

  async makeRequest(method, endpoint, data = null) {
    try {
      const config = {
        method,
        url: `${this.baseUrl}${endpoint}`,
        timeout: 10000
      };

      if (data) {
        config.data = data;
      }

      const response = await axios(config);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(`HTTP ${error.response.status}: ${error.response.statusText}`);
      } else if (error.request) {
        throw new Error('No response received from server');
      } else {
        throw new Error(`Request failed: ${error.message}`);
      }
    }
  }

  validateResponse(response, expectedStructure) {
    for (const [key, expectedType] of Object.entries(expectedStructure)) {
      if (!(key in response)) {
        throw new Error(`Missing required field: ${key}`);
      }

      const actualType = Array.isArray(response[key]) ? 'array' : typeof response[key];
      if (actualType !== expectedType) {
        throw new Error(`Field ${key} should be ${expectedType}, got ${actualType}`);
      }
    }
  }

  validatePolicyStructure(policy) {
    const requiredFields = ['id', 'title', 'created_at', 'status'];
    
    for (const field of requiredFields) {
      if (!(field in policy)) {
        throw new Error(`Policy missing required field: ${field}`);
      }
    }
  }

  logSuccess(testName) {
    console.log(`✅ ${testName}: PASSED`);
    this.results.push({ test: testName, status: 'PASSED' });
  }

  logError(testName, error) {
    console.log(`❌ ${testName}: FAILED - ${error}`);
    this.results.push({ test: testName, status: 'FAILED', error });
  }

  printSummary() {
    console.log('\n📊 Test Summary:');
    console.log('='.repeat(50));
    
    const passed = this.results.filter(r => r.status === 'PASSED').length;
    const failed = this.results.filter(r => r.status === 'FAILED').length;
    
    console.log(`Total Tests: ${this.results.length}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Success Rate: ${((passed / this.results.length) * 100).toFixed(1)}%`);
    
    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results
        .filter(r => r.status === 'FAILED')
        .forEach(r => console.log(`  - ${r.test}: ${r.error}`));
    }
    
    console.log('\n' + '='.repeat(50));
  }
}

async function runTests() {
  const tester = new EndpointTester();
  
  try {
    await tester.runAllTests();
  } catch (error) {
    console.error('Test runner failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  runTests();
}

module.exports = EndpointTester;