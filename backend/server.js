require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');

const DatabaseManager = require('./database/DatabaseManager');
const CategoryClassifier = require('./utils/categoryClassifier');
const PolicyNewsCollector = require('./collectors/PolicyNewsCollector');
const WelfareServiceCollector = require('./collectors/WelfareServiceCollector');
const YouthCenterCollector = require('./collectors/YouthCenterCollector');
const DeepSeekProcessor = require('./processors/DeepSeekProcessor');
const ThumbnailGenerator = require('./generators/ThumbnailGenerator');
const KeyPointGenerator = require('./generators/KeyPointGenerator');
const InfographicGenerator = require('./generators/InfographicGenerator');
const HtmlEnhancer = require('./utils/htmlEnhancer');
const fs = require('fs');
const path = require('path');

class MY7PolicyServer {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3001;
    
    this.initializeServices();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupCronJobs();
  }

  initializeServices() {
    this.db = new DatabaseManager(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
    );
    
    this.classifier = new CategoryClassifier(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );
    
    this.policyCollector = new PolicyNewsCollector(process.env.POLICY_NEWS_API_KEY);
    this.welfareCollector = new WelfareServiceCollector(process.env.WELFARE_API_KEY);
    this.youthCollector = new YouthCenterCollector(process.env.YOUTH_API_KEY);
    this.aiProcessor = new DeepSeekProcessor(process.env.DEEPSEEK_API_KEY);
    
    // Visual generation services
    this.thumbnailGenerator = new ThumbnailGenerator();
    this.keyPointGenerator = new KeyPointGenerator();
    this.infographicGenerator = new InfographicGenerator();
    this.htmlEnhancer = new HtmlEnhancer();
    
    this.isCollectionRunning = false;
    this.isVisualGenerationRunning = false;
    this.lastCollectionTime = null;
    this.collectionStats = {
      totalPolicies: 0,
      totalWelfareServices: 0,
      lastUpdated: null,
      errors: []
    };
  }

  setupMiddleware() {
    this.app.use(cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true
    }));
    
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

  setupRoutes() {
    // Health check
    this.app.get('/api/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      });
    });

    // System status
    this.app.get('/api/status', async (req, res) => {
      try {
        const stats = await this.db.getCollectionStats();
        res.json({
          ...stats,
          isCollectionRunning: this.isCollectionRunning,
          lastCollectionTime: this.lastCollectionTime,
          errors: this.collectionStats.errors.slice(-10)
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Main slider data - Latest policies
    this.app.get('/api/policies/latest/:limit', async (req, res) => {
      try {
        const limit = parseInt(req.params.limit) || 10;
        const policies = await this.db.getLatestPolicies(limit);
        res.json(policies);
      } catch (error) {
        console.error('Latest policies fetch failed:', error);
        res.status(500).json({ error: 'Failed to fetch latest policies' });
      }
    });

    // Category-based endpoints
    this.app.get('/api/policies/category/:category/:limit', async (req, res) => {
      try {
        const { category, limit } = req.params;
        const limitNum = parseInt(limit) || 10;
        const policies = await this.db.getPoliciesByCategory(category, limitNum);
        res.json(policies);
      } catch (error) {
        console.error(`Category ${req.params.category} policies fetch failed:`, error);
        res.status(500).json({ error: 'Failed to fetch category policies' });
      }
    });

    // Popular policies
    this.app.get('/api/policies/popular/:limit', async (req, res) => {
      try {
        const limit = parseInt(req.params.limit) || 10;
        const policies = await this.db.getPopularPolicies(limit);
        res.json(policies);
      } catch (error) {
        console.error('Popular policies fetch failed:', error);
        res.status(500).json({ error: 'Failed to fetch popular policies' });
      }
    });

    // Integrated search
    this.app.get('/api/search', async (req, res) => {
      try {
        const { q: query, limit = 20 } = req.query;
        
        if (!query) {
          return res.status(400).json({ error: 'Query parameter is required' });
        }

        const [policies, welfareServices] = await Promise.all([
          this.db.searchPolicies(query, Math.ceil(limit / 2)),
          this.db.searchWelfareServices(query, Math.ceil(limit / 2))
        ]);

        res.json({
          policies,
          welfareServices,
          total: policies.length + welfareServices.length
        });
      } catch (error) {
        console.error('Search failed:', error);
        res.status(500).json({ error: 'Search failed' });
      }
    });

    // Welfare-specific endpoints
    this.app.get('/api/welfare/recommend/:lifeCycle', async (req, res) => {
      try {
        const { lifeCycle } = req.params;
        const limit = parseInt(req.query.limit) || 20;
        const services = await this.db.getWelfareServicesByLifeCycle(lifeCycle, limit);
        res.json(services);
      } catch (error) {
        console.error(`Welfare lifecycle ${req.params.lifeCycle} fetch failed:`, error);
        res.status(500).json({ error: 'Failed to fetch welfare recommendations' });
      }
    });

    this.app.get('/api/welfare/detail/:serviceId', async (req, res) => {
      try {
        const { serviceId } = req.params;
        const service = await this.db.getWelfareServiceDetail(serviceId);
        
        if (!service) {
          return res.status(404).json({ error: 'Welfare service not found' });
        }
        
        res.json(service);
      } catch (error) {
        console.error(`Welfare service ${req.params.serviceId} detail fetch failed:`, error);
        res.status(500).json({ error: 'Failed to fetch welfare service detail' });
      }
    });

    // Data collection endpoints
    this.app.post('/api/sync', async (req, res) => {
      if (this.isCollectionRunning) {
        return res.status(409).json({ error: 'Collection already running' });
      }

      try {
        this.startDataCollection();
        res.json({ message: 'Data collection started', timestamp: new Date().toISOString() });
      } catch (error) {
        console.error('Manual sync failed:', error);
        res.status(500).json({ error: 'Failed to start data collection' });
      }
    });

    // Categories and agencies
    this.app.get('/api/categories', async (req, res) => {
      try {
        const categories = await this.db.getCategories();
        res.json(categories);
      } catch (error) {
        console.error('Categories fetch failed:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
      }
    });

    this.app.get('/api/agencies', async (req, res) => {
      try {
        const agencies = await this.db.getGovernmentAgencies();
        res.json(agencies);
      } catch (error) {
        console.error('Agencies fetch failed:', error);
        res.status(500).json({ error: 'Failed to fetch agencies' });
      }
    });

    // View count increment
    this.app.post('/api/policies/:id/view', async (req, res) => {
      try {
        const { id } = req.params;
        await this.db.incrementPolicyViewCount(id);
        res.json({ success: true });
      } catch (error) {
        console.error(`View count increment failed for policy ${req.params.id}:`, error);
        res.status(500).json({ error: 'Failed to increment view count' });
      }
    });

    // === VISUAL GENERATION API ROUTES ===
    
    // Generate thumbnail for policy
    this.app.get('/api/visuals/thumbnail/:policyId', async (req, res) => {
      try {
        const { policyId } = req.params;
        const policyData = await this.db.getPolicyById(policyId);
        
        if (!policyData) {
          return res.status(404).json({ error: 'Policy not found' });
        }

        // Check if thumbnail already exists
        if (policyData.thumbnail_url) {
          return res.redirect(policyData.thumbnail_url);
        }

        // Generate thumbnail
        const thumbnailBuffer = await this.thumbnailGenerator.generateForPolicy(policyData);
        
        res.set({
          'Content-Type': 'image/png',
          'Content-Length': thumbnailBuffer.length,
          'Cache-Control': 'public, max-age=86400' // 24 hour cache
        });
        
        res.send(thumbnailBuffer);
      } catch (error) {
        console.error(`Thumbnail generation failed for policy ${req.params.policyId}:`, error);
        res.status(500).json({ error: 'Failed to generate thumbnail' });
      }
    });

    // Generate key point cards for policy
    this.app.get('/api/visuals/keypoints/:policyId', async (req, res) => {
      try {
        const { policyId } = req.params;
        const cardIndex = parseInt(req.query.card) || null;
        
        const policyData = await this.db.getPolicyById(policyId);
        
        if (!policyData) {
          return res.status(404).json({ error: 'Policy not found' });
        }

        // Extract key points from content
        const keyPoints = await this.keyPointGenerator.extractKeyPoints(
          policyData.content, 
          policyData
        );
        
        if (cardIndex !== null) {
          // Return specific card
          if (cardIndex >= keyPoints.length) {
            return res.status(404).json({ error: 'Card not found' });
          }
          
          const cards = await this.keyPointGenerator.generateCards([keyPoints[cardIndex]], policyData);
          
          res.set({
            'Content-Type': 'image/png',
            'Content-Length': cards[0].length,
            'Cache-Control': 'public, max-age=86400'
          });
          
          res.send(cards[0]);
        } else {
          // Return array of card URLs
          const cardUrls = keyPoints.map((_, index) => 
            `/api/visuals/keypoints/${policyId}?card=${index}`
          );
          
          res.json({
            keyPoints: keyPoints,
            cardUrls: cardUrls,
            totalCards: keyPoints.length
          });
        }
      } catch (error) {
        console.error(`Key points generation failed for policy ${req.params.policyId}:`, error);
        res.status(500).json({ error: 'Failed to generate key points' });
      }
    });

    // Generate infographic for policy
    this.app.get('/api/visuals/infographic/:policyId', async (req, res) => {
      try {
        const { policyId } = req.params;
        const policyData = await this.db.getPolicyById(policyId);
        
        if (!policyData) {
          return res.status(404).json({ error: 'Policy not found' });
        }

        // Check if infographic already exists
        if (policyData.infographic_url) {
          return res.redirect(policyData.infographic_url);
        }

        // Extract key points for infographic
        const keyPoints = await this.keyPointGenerator.extractKeyPoints(
          policyData.content, 
          policyData
        );
        
        // Generate infographic
        const infographicBuffer = await this.infographicGenerator.generateForPolicy(
          policyData, 
          keyPoints
        );
        
        res.set({
          'Content-Type': 'image/png',
          'Content-Length': infographicBuffer.length,
          'Cache-Control': 'public, max-age=86400'
        });
        
        res.send(infographicBuffer);
      } catch (error) {
        console.error(`Infographic generation failed for policy ${req.params.policyId}:`, error);
        res.status(500).json({ error: 'Failed to generate infographic' });
      }
    });

    // Enhance HTML content with animations
    this.app.post('/api/content/enhance', async (req, res) => {
      try {
        const { htmlContent } = req.body;
        
        if (!htmlContent) {
          return res.status(400).json({ error: 'HTML content is required' });
        }

        const enhancedHtml = this.htmlEnhancer.enhanceDeepSeekHTML(htmlContent);
        
        res.json({
          originalHtml: htmlContent,
          enhancedHtml: enhancedHtml,
          animationCssUrl: '/api/styles/animations.css',
          animationJsUrl: '/api/scripts/animations.js'
        });
      } catch (error) {
        console.error('HTML enhancement failed:', error);
        res.status(500).json({ error: 'Failed to enhance HTML content' });
      }
    });

    // Serve animation CSS
    this.app.get('/api/styles/animations.css', (req, res) => {
      try {
        const cssPath = path.join(__dirname, 'styles', 'animations.css');
        const css = fs.readFileSync(cssPath, 'utf8');
        
        res.set({
          'Content-Type': 'text/css',
          'Cache-Control': 'public, max-age=86400'
        });
        
        res.send(css);
      } catch (error) {
        console.error('Failed to serve animation CSS:', error);
        res.status(500).send('/* Animation CSS not available */');
      }
    });

    // Serve animation JavaScript
    this.app.get('/api/scripts/animations.js', (req, res) => {
      try {
        const animationJS = this.htmlEnhancer.generateAnimationJS();
        
        res.set({
          'Content-Type': 'application/javascript',
          'Cache-Control': 'public, max-age=86400'
        });
        
        res.send(animationJS);
      } catch (error) {
        console.error('Failed to serve animation JS:', error);
        res.status(500).send('// Animation JS not available');
      }
    });

    // Batch visual generation for policy
    this.app.post('/api/visuals/generate/:policyId', async (req, res) => {
      try {
        const { policyId } = req.params;
        const { types = ['thumbnail', 'keypoints', 'infographic'] } = req.body;
        
        if (this.isVisualGenerationRunning) {
          return res.status(409).json({ error: 'Visual generation already running' });
        }

        const policyData = await this.db.getPolicyById(policyId);
        
        if (!policyData) {
          return res.status(404).json({ error: 'Policy not found' });
        }

        // Start background generation
        this.generateVisualsForPolicy(policyId, types).catch(console.error);
        
        res.json({ 
          message: 'Visual generation started',
          policyId: policyId,
          types: types,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error(`Visual generation failed for policy ${req.params.policyId}:`, error);
        res.status(500).json({ error: 'Failed to start visual generation' });
      }
    });

    // Test endpoints
    this.app.get('/api/test/connections', async (req, res) => {
      try {
        const results = await Promise.allSettled([
          this.policyCollector.testConnection(),
          this.welfareCollector.testConnection(),
          this.youthCollector.testConnection(),
          this.aiProcessor.testConnection()
        ]);

        res.json({
          policyNews: results[0].status === 'fulfilled' ? results[0].value : false,
          welfareServices: results[1].status === 'fulfilled' ? results[1].value : false,
          youthCenter: results[2].status === 'fulfilled' ? results[2].value : false,
          deepSeek: results[3].status === 'fulfilled' ? results[3].value : false
        });
      } catch (error) {
        res.status(500).json({ error: 'Connection test failed' });
      }
    });

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({ error: 'Endpoint not found' });
    });
  }

  setupCronJobs() {
    const interval = process.env.COLLECTION_INTERVAL_HOURS || 24;
    const cronPattern = `0 */${interval} * * *`;

    // Data collection cron job
    cron.schedule(cronPattern, () => {
      console.log(`Scheduled data collection started at ${new Date().toISOString()}`);
      this.startDataCollection();
    });

    // Visual generation cron job - runs every 2 hours
    cron.schedule('0 */2 * * *', () => {
      console.log(`Scheduled visual generation started at ${new Date().toISOString()}`);
      this.batchGenerateVisuals();
    });

    console.log(`Scheduled data collection every ${interval} hours`);
    console.log('Scheduled visual generation every 2 hours');
  }

  async startDataCollection() {
    if (this.isCollectionRunning) {
      console.log('Data collection already running, skipping...');
      return;
    }

    this.isCollectionRunning = true;
    this.lastCollectionTime = new Date().toISOString();
    this.collectionStats.errors = [];

    try {
      console.log('Starting data collection process...');
      
      await this.classifier.initializeCategories();
      
      const collections = await Promise.allSettled([
        this.collectPolicyNews(),
        this.collectWelfareServices(),
        this.collectYouthPolicies()
      ]);

      let totalCollected = 0;
      collections.forEach((result, index) => {
        const source = ['Policy News', 'Welfare Services', 'Youth Policies'][index];
        if (result.status === 'fulfilled') {
          totalCollected += result.value;
          console.log(`${source}: ${result.value} items collected`);
        } else {
          console.error(`${source} collection failed:`, result.reason.message);
          this.collectionStats.errors.push(`${source}: ${result.reason.message}`);
        }
      });

      console.log(`Data collection completed. Total items: ${totalCollected}`);
      this.collectionStats = await this.db.getCollectionStats();
    } catch (error) {
      console.error('Data collection process failed:', error);
      this.collectionStats.errors.push(`General error: ${error.message}`);
    } finally {
      this.isCollectionRunning = false;
    }
  }

  async collectPolicyNews() {
    const items = await this.policyCollector.collectPolicyNews(3, 100);
    let processedCount = 0;

    for (const item of items) {
      try {
        const isDuplicate = await this.db.checkDuplicatePolicy(item.title, item.published_at);
        if (isDuplicate) continue;

        const categoryId = await this.classifier.classifyAndGetCategoryId(item.title, item.content);
        
        const enhancement = await this.aiProcessor.enhanceContent(item.title, item.content);
        
        const policyData = {
          ...item,
          category_id: categoryId,
          summary: enhancement.summary || item.summary,
          keywords: enhancement.keywords || item.keywords,
          ai_enhanced: true
        };

        await this.db.insertPolicy(policyData);
        processedCount++;
      } catch (error) {
        console.error(`Failed to process policy: ${item.title}`, error.message);
      }
    }

    return processedCount;
  }

  async collectWelfareServices() {
    const items = await this.welfareCollector.collectWelfareServices(100, 5);
    let processedCount = 0;

    for (const item of items) {
      try {
        const isDuplicate = await this.db.checkDuplicateWelfareService(item.service_id);
        if (isDuplicate) continue;

        const categoryId = await this.classifier.classifyAndGetCategoryId(
          item.service_name, 
          item.service_purpose
        );

        const serviceData = {
          ...item,
          category_id: categoryId
        };

        await this.db.insertWelfareService(serviceData);
        processedCount++;
      } catch (error) {
        console.error(`Failed to process welfare service: ${item.service_name}`, error.message);
      }
    }

    return processedCount;
  }

  async collectYouthPolicies() {
    const items = await this.youthCollector.collectYouthPolicies(100, 3);
    let processedCount = 0;

    for (const item of items) {
      try {
        const isDuplicate = await this.db.checkDuplicatePolicy(item.title, item.published_at);
        if (isDuplicate) continue;

        const categoryId = await this.classifier.classifyAndGetCategoryId(item.title, item.content);
        
        const enhancement = await this.aiProcessor.enhanceContent(item.title, item.content);
        
        const policyData = {
          ...item,
          category_id: categoryId,
          summary: enhancement.summary || item.summary,
          keywords: enhancement.keywords || item.keywords,
          ai_enhanced: true,
          target_age_min: item.target_age?.min || null,
          target_age_max: item.target_age?.max || null
        };

        await this.db.insertPolicy(policyData);
        processedCount++;
      } catch (error) {
        console.error(`Failed to process youth policy: ${item.title}`, error.message);
      }
    }

    return processedCount;
  }

  async generateVisualsForPolicy(policyId, types = ['thumbnail', 'keypoints', 'infographic']) {
    this.isVisualGenerationRunning = true;
    
    try {
      console.log(`Starting visual generation for policy ${policyId}:`, types);
      
      const policyData = await this.db.getPolicyById(policyId);
      if (!policyData) {
        throw new Error(`Policy ${policyId} not found`);
      }

      const visualUrls = {};

      // Generate thumbnail
      if (types.includes('thumbnail')) {
        try {
          const thumbnailBuffer = await this.thumbnailGenerator.generateForPolicy(policyData);
          const fileName = `thumbnails/policy_${policyId}_thumbnail_${Date.now()}.png`;
          const thumbnailUrl = await this.db.uploadToSupabaseStorage(thumbnailBuffer, fileName);
          visualUrls.thumbnail_url = thumbnailUrl;
          console.log(`Thumbnail generated for policy ${policyId}`);
        } catch (error) {
          console.error(`Thumbnail generation failed for policy ${policyId}:`, error);
        }
      }

      // Generate key point cards
      if (types.includes('keypoints')) {
        try {
          const keyPoints = await this.keyPointGenerator.extractKeyPoints(policyData.content, policyData);
          const cardBuffers = await this.keyPointGenerator.generateCards(keyPoints, policyData);
          
          const cardUrls = [];
          for (let i = 0; i < cardBuffers.length; i++) {
            const fileName = `keypoints/policy_${policyId}_card_${i}_${Date.now()}.png`;
            const cardUrl = await this.db.uploadToSupabaseStorage(cardBuffers[i], fileName);
            cardUrls.push(cardUrl);
          }
          
          visualUrls.keypoints_urls = cardUrls;
          console.log(`${cardUrls.length} key point cards generated for policy ${policyId}`);
        } catch (error) {
          console.error(`Key points generation failed for policy ${policyId}:`, error);
        }
      }

      // Generate infographic
      if (types.includes('infographic')) {
        try {
          const keyPoints = await this.keyPointGenerator.extractKeyPoints(policyData.content, policyData);
          const infographicBuffer = await this.infographicGenerator.generateForPolicy(policyData, keyPoints);
          const fileName = `infographics/policy_${policyId}_infographic_${Date.now()}.png`;
          const infographicUrl = await this.db.uploadToSupabaseStorage(infographicBuffer, fileName);
          visualUrls.infographic_url = infographicUrl;
          console.log(`Infographic generated for policy ${policyId}`);
        } catch (error) {
          console.error(`Infographic generation failed for policy ${policyId}:`, error);
        }
      }

      // Update policy with visual URLs
      if (Object.keys(visualUrls).length > 0) {
        await this.db.updatePolicyVisuals(policyId, visualUrls);
        console.log(`Visual URLs updated for policy ${policyId}:`, visualUrls);
      }

      return visualUrls;
    } catch (error) {
      console.error(`Visual generation process failed for policy ${policyId}:`, error);
      throw error;
    } finally {
      this.isVisualGenerationRunning = false;
    }
  }

  async batchGenerateVisuals() {
    if (this.isVisualGenerationRunning) {
      console.log('Visual generation already running, skipping batch process...');
      return;
    }

    try {
      console.log('Starting batch visual generation...');
      
      const policies = await this.db.getPoliciesNeedingVisuals(5);
      console.log(`Found ${policies.length} policies needing visuals`);

      for (const policy of policies) {
        try {
          await this.generateVisualsForPolicy(policy.id);
          // Small delay between generations to prevent overload
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
          console.error(`Batch visual generation failed for policy ${policy.id}:`, error);
        }
      }

      console.log('Batch visual generation completed');
    } catch (error) {
      console.error('Batch visual generation process failed:', error);
    }
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`MY7 Policy Backend Server running on port ${this.port}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Health check: http://localhost:${this.port}/api/health`);
      
      setTimeout(() => {
        console.log('Running initial connection tests...');
        this.app.emit('test-connections');
      }, 1000);
    });

    this.app.on('test-connections', async () => {
      try {
        const results = await Promise.allSettled([
          this.policyCollector.testConnection(),
          this.welfareCollector.testConnection(),
          this.youthCollector.testConnection(),
          this.aiProcessor.testConnection()
        ]);

        console.log('Connection test results:');
        console.log(`- Policy News API: ${results[0].status === 'fulfilled' ? '✓' : '✗'}`);
        console.log(`- Welfare Services API: ${results[1].status === 'fulfilled' ? '✓' : '✗'}`);
        console.log(`- Youth Center API: ${results[2].status === 'fulfilled' ? '✓' : '✗'}`);
        console.log(`- DeepSeek AI API: ${results[3].status === 'fulfilled' ? '✓' : '✗'}`);
      } catch (error) {
        console.error('Connection tests failed:', error.message);
      }
    });

    process.on('SIGINT', () => {
      console.log('Shutting down server...');
      process.exit(0);
    });

    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });
  }
}

const server = new MY7PolicyServer();
server.start();

module.exports = MY7PolicyServer;