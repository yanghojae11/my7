# MY7 Policy Backend - Visual Generation Extension

## 🎨 Visual Extension Overview

This extension adds comprehensive visual generation capabilities to the existing MY7 Policy Backend without requiring any frontend modifications. The system automatically generates thumbnails, key point cards, and infographics for policy content.

## 🚀 Zero-Disruption Integration

### ✅ Backwards Compatibility
- All existing API endpoints remain unchanged
- Current frontend continues to work exactly as before
- New visual fields appear automatically in API responses
- No breaking changes to existing functionality

### ✅ Progressive Enhancement
- Visual URLs are added to existing policy objects
- Frontend can optionally use new visual content
- Animation CSS and JS available but not required
- Graceful fallbacks if visuals aren't available

## 🔧 New Features Added

### 1. **Visual Generation APIs**

#### Thumbnail Generation
```http
GET /api/visuals/thumbnail/:policyId
```
- Returns PNG image (800x600)
- Category-specific color schemes
- Auto-generated from policy content
- 24-hour browser cache

#### Key Point Cards
```http
GET /api/visuals/keypoints/:policyId
GET /api/visuals/keypoints/:policyId?card=0
```
- Extracts key points from DeepSeek HTML
- Generates individual cards (400x300)
- Returns array of URLs or specific card
- Icons and structured layout

#### Infographics
```http
GET /api/visuals/infographic/:policyId
```
- Full infographic (1200x1600)
- Comprehensive policy overview
- Professional design with metadata
- Suitable for sharing and printing

### 2. **HTML Enhancement**

#### Content Animation
```http
POST /api/content/enhance
Content-Type: application/json

{
  "htmlContent": "<h1>Policy Title</h1><p>Content...</p>"
}
```

Returns enhanced HTML with:
- Animation attributes (`data-animate`, `data-delay`)
- Semantic classes for styling
- Interactive element detection
- Mobile-optimized structure

#### Animation Resources
```http
GET /api/styles/animations.css   # CSS animations
GET /api/scripts/animations.js  # JavaScript observer
```

### 3. **Automated Generation**

#### Background Processing
- Automatic visual generation for new policies
- Cron job runs every 2 hours
- Batch processing of policies without visuals
- Error handling and retry logic

#### On-Demand Generation
```http
POST /api/visuals/generate/:policyId
Content-Type: application/json

{
  "types": ["thumbnail", "keypoints", "infographic"]
}
```

## 📊 Database Extensions

### New Fields Added to `policies` Table
```sql
-- Visual URLs
thumbnail_url TEXT              -- Main thumbnail image
keypoints_urls TEXT[]          -- Array of key point card URLs  
infographic_url TEXT           -- Full infographic URL

-- Generation tracking
visuals_generated_at TIMESTAMP -- When visuals were created
visual_generation_status VARCHAR(20) DEFAULT 'pending'
```

### Storage Integration
- Supabase Storage bucket: `policy-visuals`
- Automatic file upload and URL generation
- Public access for frontend consumption
- Organized by type: `thumbnails/`, `keypoints/`, `infographics/`

## 🎯 Enhanced API Responses

### Before (Existing)
```json
{
  "id": 123,
  "title": "청년 창업 지원 정책",
  "content": "<h2 class='main-heading'>정책 개요</h2>...",
  "summary": "청년 창업을 지원하는 정책입니다.",
  "published_at": "2024-01-01T00:00:00Z"
}
```

### After (Enhanced - Zero Frontend Changes Required)
```json
{
  "id": 123,
  "title": "청년 창업 지원 정책", 
  "content": "<h2 class='main-heading'>정책 개요</h2>...",
  "summary": "청년 창업을 지원하는 정책입니다.",
  "published_at": "2024-01-01T00:00:00Z",
  "thumbnail_url": "https://supabase.../thumbnail_123.png",
  "keypoints_urls": [
    "https://supabase.../card_123_0.png",
    "https://supabase.../card_123_1.png"
  ],
  "infographic_url": "https://supabase.../infographic_123.png",
  "visuals_generated_at": "2024-01-01T01:00:00Z",
  "visual_generation_status": "completed"
}
```

## 🛠 Installation & Setup

### 1. Install New Dependencies
```bash
cd backend
npm install canvas@^2.11.2 cheerio@^1.0.0 sharp@^0.32.0
```

### 2. Database Migration
Run the SQL migration in Supabase:
```bash
# Execute: backend/database/add_visual_fields.sql
```

### 3. Environment Variables
Add to your `.env`:
```env
# Visual generation settings (optional)
VISUAL_GENERATION_ENABLED=true
VISUAL_CACHE_TTL=86400
SUPABASE_STORAGE_BUCKET=policy-visuals
```

### 4. Restart Server
```bash
npm run dev  # or npm start
```

## 📈 Usage Examples

### Frontend Integration (Optional)

#### Display Thumbnail
```javascript
// Frontend can immediately use without changes
const policy = await fetch('/api/policies/latest/1').then(r => r.json());

if (policy[0].thumbnail_url) {
  // Show thumbnail if available
  document.getElementById('thumbnail').src = policy[0].thumbnail_url;
} else {
  // Use existing fallback logic
  document.getElementById('thumbnail').src = '/default-thumbnail.png';
}
```

#### Enhanced Content with Animations
```javascript
// Optionally enhance content with animations
const response = await fetch('/api/content/enhance', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ htmlContent: policy.content })
});

const { enhancedHtml, animationCssUrl } = await response.json();

// Load animation CSS
const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = animationCssUrl;
document.head.appendChild(link);

// Use enhanced HTML
document.getElementById('content').innerHTML = enhancedHtml;
```

#### Key Point Cards Display
```javascript
// Display key point cards if available
if (policy.keypoints_urls && policy.keypoints_urls.length > 0) {
  const cardsContainer = document.getElementById('keypoint-cards');
  policy.keypoints_urls.forEach((url, index) => {
    const img = document.createElement('img');
    img.src = url;
    img.alt = `Key Point ${index + 1}`;
    img.className = 'keypoint-card';
    cardsContainer.appendChild(img);
  });
}
```

## 🎨 Visual Generation Features

### Thumbnail Generator
- **Category-specific colors**: Each policy category has unique color scheme
- **Auto-layout**: Title, summary, metadata automatically positioned
- **Korean typography**: Optimized for Korean text rendering
- **Responsive design**: Works across different screen sizes

### Key Point Generator
- **Smart extraction**: Parses DeepSeek HTML to find key information
- **Icon mapping**: Automatic icons based on content type
- **Card design**: Professional card layout with numbering
- **Batch generation**: Processes multiple cards efficiently

### Infographic Generator
- **Comprehensive layout**: Full policy overview with sections
- **Visual hierarchy**: Clear information organization
- **Print-ready**: High-resolution suitable for documents
- **Metadata integration**: Agency info, dates, contact details

### HTML Enhancer
- **Animation attributes**: Adds data attributes for animations
- **Semantic classes**: Enhances structure with meaningful classes
- **Interactive detection**: Identifies contact info, deadlines, applications
- **Mobile optimization**: Responsive enhancements
- **Accessibility**: Screen reader and high contrast support

## 🔄 Automated Workflows

### Data Collection Integration
```javascript
// Enhanced data collection process
async function collectPolicyData() {
  // 1. Collect from government APIs (existing)
  const policyData = await collectFromAPIs();
  
  // 2. Process with DeepSeek (existing)  
  const enhancedData = await processWithAI(policyData);
  
  // 3. Save to database (existing)
  const savedPolicy = await saveToDatabase(enhancedData);
  
  // 4. Generate visuals (NEW - automatic)
  generateVisualsForPolicy(savedPolicy.id).catch(console.error);
}
```

### Cron Job Schedule
- **Data Collection**: Every 24 hours (existing)
- **Visual Generation**: Every 2 hours (new)
- **Cleanup**: Weekly removal of old temp files
- **Health Checks**: Continuous monitoring

## 📊 Monitoring & Analytics

### Visual Generation Status
```http
GET /api/status
```

Returns enhanced status including:
```json
{
  "totalPolicies": 1234,
  "totalWelfareServices": 567,
  "visualGenerationStats": {
    "policiesWithThumbnails": 1100,
    "policiesWithKeypoints": 950,
    "policiesWithInfographics": 800,
    "pendingVisualGeneration": 134
  },
  "isVisualGenerationRunning": false,
  "lastVisualGenerationTime": "2024-01-01T12:00:00Z"
}
```

### Error Tracking
- Visual generation errors logged separately
- Retry logic for failed generations
- Fallback to basic visuals if advanced generation fails
- Performance metrics and generation times

## 🚀 Performance Optimizations

### Caching Strategy
- **Browser Cache**: 24-hour cache headers for generated images
- **CDN Ready**: URLs compatible with CDN distribution
- **Lazy Generation**: On-demand generation for older content
- **Batch Processing**: Efficient bulk generation

### Resource Management
- **Memory Management**: Canvas cleanup after generation
- **File Cleanup**: Automatic removal of temporary files
- **Rate Limiting**: Prevents system overload
- **Queue System**: Manages concurrent generation requests

## 🔒 Security & Permissions

### Access Control
- Public read access to generated visuals
- Service role required for generation
- Input sanitization for HTML enhancement
- File type validation for uploads

### Data Protection
- No sensitive data in visual content
- Automatic cleanup of temporary files
- Secure file naming prevents conflicts
- HTTPS-only URLs for production

## 🐛 Troubleshooting

### Common Issues

#### Canvas Installation (Linux)
```bash
# If Canvas fails to install
sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
npm install canvas
```

#### Storage Permissions
```sql
-- If storage bucket access fails
SELECT * FROM storage.buckets WHERE id = 'policy-visuals';
-- Verify RLS policies are set correctly
```

#### Visual Generation Failures
```javascript
// Check logs for specific errors
// Fallback to basic generation if advanced fails
// Verify DeepSeek content is properly formatted
```

### Debug Endpoints
```http
GET /api/test/visual-generation/:policyId  # Test specific policy
GET /api/debug/canvas-support              # Check Canvas support
GET /api/debug/storage-permissions         # Verify storage access
```

## 📈 Future Enhancements

### Planned Features
- **Video Generation**: Short animated policy explainers
- **Interactive Charts**: Data visualization for statistics
- **Social Media Variants**: Platform-specific image sizes
- **Multi-language Support**: Generate visuals in multiple languages
- **Custom Branding**: Agency-specific visual templates

### API Extensions
- **Bulk Generation**: Process multiple policies simultaneously
- **Custom Templates**: User-defined visual layouts
- **Analytics Integration**: Track visual engagement
- **Export Formats**: PDF, SVG, and other formats

---

## 📞 Support

For technical support or questions about the visual generation extension:

1. Check the logs: `tail -f logs/visual-generation.log`
2. Test connections: `GET /api/test/connections`
3. Verify database: Check Supabase dashboard for new fields
4. Review documentation: This README and inline code comments

The visual generation system is designed to enhance your existing MY7 policy platform without disrupting current operations. All new features are additive and backwards-compatible.