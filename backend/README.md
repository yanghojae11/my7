# MY7 Policy Backend - Government API Integration

A production-ready Node.js Express backend that integrates government APIs with the existing MY7 policy support platform.

## 🚀 Features

- **Government API Integration**: Policy Briefing, Welfare Services, Youth Center APIs
- **AI-Powered Enhancement**: DeepSeek AI for content summarization and categorization
- **Auto-Classification**: Intelligent content categorization using keyword matching
- **Database Integration**: Seamless Supabase integration with existing schema
- **Scheduled Collection**: Automated daily data updates
- **RESTful API**: Complete API matching frontend expectations
- **Error Handling**: Robust error handling and retry mechanisms
- **Testing Suite**: Comprehensive endpoint testing

## 📁 Project Structure

```
backend/
├── server.js                 # Main Express server
├── package.json              # Dependencies and scripts
├── .env.example              # Environment variables template
├── README.md                 # This file
├── collectors/               # Government API collectors
│   ├── PolicyNewsCollector.js
│   ├── WelfareServiceCollector.js
│   └── YouthCenterCollector.js
├── processors/               # AI content processing
│   └── DeepSeekProcessor.js
├── database/                 # Database management
│   └── DatabaseManager.js
├── utils/                    # Utility functions
│   └── categoryClassifier.js
└── test/                     # Testing utilities
    └── test-endpoints.js
```

## 🛠 Installation & Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env` and configure:

```env
# Government API Keys
POLICY_NEWS_API_KEY=your_policy_briefing_api_key
WELFARE_API_KEY=your_welfare_service_api_key
YOUTH_API_KEY=your_youth_center_api_key

# AI Processing
DEEPSEEK_API_KEY=sk-your_deepseek_api_key

# Database
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Server Configuration
PORT=3001
NODE_ENV=production
FRONTEND_URL=http://localhost:3000
```

### 3. Database Setup
Ensure your Supabase database has the required tables:
- `policies` (existing)
- `policy_categories` (existing)  
- `welfare_services` (new table added)
- `government_agencies` (existing)

### 4. Start the Server
```bash
# Development
npm run dev

# Production
npm start
```

## 🔗 API Endpoints

### Core Endpoints
- `GET /api/health` - Health check
- `GET /api/status` - System status and statistics
- `POST /api/sync` - Manual data synchronization

### Policy Endpoints
- `GET /api/policies/latest/:limit` - Latest policies
- `GET /api/policies/popular/:limit` - Popular policies by view count
- `GET /api/policies/category/:category/:limit` - Policies by category

### Category Endpoints
Categories supported:
- `startup-support` - 창업 지원
- `housing-policy` - 주택 정책
- `employment-support` - 취업 지원
- `education-policy` - 교육 정책
- `welfare-benefits` - 복지 혜택
- `government-subsidies` - 정부 지원금
- `policy-news` - 정책 뉴스

### Search & Welfare
- `GET /api/search?q=query&limit=20` - Integrated search
- `GET /api/welfare/recommend/:lifeCycle` - Welfare by life cycle
- `GET /api/welfare/detail/:serviceId` - Welfare service details

### System Endpoints
- `GET /api/categories` - All policy categories
- `GET /api/agencies` - Government agencies
- `GET /api/test/connections` - API connection tests

## 🤖 AI Enhancement

The system uses DeepSeek AI to:
- Generate concise summaries (200 characters)
- Extract relevant keywords for search
- Auto-categorize content
- Enhance content quality

## 📊 Data Collection

### Automated Collection
- Runs every 24 hours (configurable)
- Collects from all 3 government APIs
- Processes with AI enhancement
- Prevents duplicate entries

### Manual Collection
```bash
curl -X POST http://localhost:3001/api/sync
```

## 🧪 Testing

Run comprehensive endpoint tests:
```bash
npm test
```

Tests cover:
- Health checks
- All API endpoints
- Response structure validation
- Error handling
- Connection tests

## 🔧 Configuration

### Environment Variables
- `COLLECTION_INTERVAL_HOURS`: Data collection frequency (default: 24)
- `MAX_RETRY_ATTEMPTS`: API request retries (default: 3)
- `REQUEST_TIMEOUT_MS`: Request timeout (default: 30000)

### Logging
All operations are logged with timestamps:
- API requests and responses
- Data collection progress
- Error handling
- System status changes

## 🔗 Government APIs

### 1. Policy Briefing API
- **URL**: `http://apis.data.go.kr/1371000/policyNewsService`
- **Endpoint**: `/policyNewsList`
- **Format**: XML
- **Rate Limit**: Standard government API limits

### 2. Welfare Services API
- **URL**: `http://apis.data.go.kr/B554287/NationalWelfareInformationsV001`
- **Endpoints**: `/NationalWelfarelistV001`, `/NationalWelfaredetailedV001`
- **Format**: XML
- **Rate Limit**: Standard government API limits

### 3. Youth Center API
- **URL**: `https://www.youthcenter.go.kr/opi`
- **Endpoint**: `/youthPlcyList.do`
- **Format**: XML
- **Rate Limit**: Standard government API limits

## 📈 Monitoring

### System Status
Check system health at `/api/status`:
```json
{
  "totalPolicies": 1234,
  "totalWelfareServices": 567,
  "lastUpdated": "2024-01-01T00:00:00.000Z",
  "isCollectionRunning": false,
  "lastCollectionTime": "2024-01-01T00:00:00.000Z",
  "errors": []
}
```

### Connection Tests
Test all API connections at `/api/test/connections`:
```json
{
  "policyNews": true,
  "welfareServices": true,
  "youthCenter": true,
  "deepSeek": true
}
```

## 🚨 Error Handling

- **Retry Logic**: Automatic retries with exponential backoff
- **Graceful Degradation**: System continues if one API fails
- **Error Logging**: Comprehensive error tracking
- **Health Monitoring**: Real-time system status

## 🔒 Security

- **API Key Management**: Secure environment variable storage
- **Rate Limiting**: Respects government API limits
- **Input Validation**: Comprehensive request validation
- **CORS Configuration**: Proper cross-origin handling

## 📝 Development

### Adding New Data Sources
1. Create collector in `/collectors/`
2. Implement required methods: `collect()`, `testConnection()`
3. Add to main server collection process
4. Update tests and documentation

### Extending Categories
1. Add keywords to `categoryClassifier.js`
2. Ensure category exists in database
3. Update API documentation

## 🤝 Contributing

1. Follow existing code patterns
2. Add comprehensive error handling
3. Include tests for new features
4. Update documentation

## 📄 License

MIT License - see LICENSE file for details.

---

Built with ❤️ for the MY7 Policy Support Platform