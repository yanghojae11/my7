const { createClient } = require('@supabase/supabase-js');

class CategoryClassifier {
  constructor(supabaseUrl, supabaseKey) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.categoryCache = new Map();
    this.categoryMappings = {
      'startup-support': ['창업', '스타트업', '벤처', '사업자', '기업가', '사업', '투자', '펀딩', '인큐베이터'],
      'housing-policy': ['주택', '주거', '임대', '부동산', '아파트', '전세', '월세', '분양', '공공주택', '임대주택'],
      'employment-support': ['취업', '일자리', '구직', '채용', '고용', '직업', '근로', '직장', '구인', '면접'],
      'education-policy': ['교육', '학교', '대학', '학생', '학습', '수업', '장학', '연수', '강의', '학원'],
      'welfare-benefits': ['복지', '혜택', '수당', '급여', '돌봄', '의료', '건강', '보건', '사회복지', '노인'],
      'government-subsidies': ['지원금', '보조금', '장려금', '지원사업', '지원책', '정부지원', '국가지원', '보조', '지원']
    };
  }

  async initializeCategories() {
    try {
      const { data: categories, error } = await this.supabase
        .from('policy_categories')
        .select('id, slug, name');

      if (error) throw error;

      this.categoryCache.clear();
      categories.forEach(category => {
        this.categoryCache.set(category.slug, {
          id: category.id,
          name: category.name
        });
      });

      console.log(`Loaded ${categories.length} categories into cache`);
    } catch (error) {
      console.error('Failed to initialize categories:', error);
      throw error;
    }
  }

  classifyByTitle(title) {
    if (!title) return 'policy-news';

    const normalizedTitle = title.toLowerCase();
    
    for (const [categorySlug, keywords] of Object.entries(this.categoryMappings)) {
      if (keywords.some(keyword => normalizedTitle.includes(keyword))) {
        return categorySlug;
      }
    }
    
    return 'policy-news'; // default category
  }

  classifyByContent(title, content = '') {
    const combinedText = `${title} ${content}`.toLowerCase();
    
    const scores = {};
    for (const [categorySlug, keywords] of Object.entries(this.categoryMappings)) {
      scores[categorySlug] = keywords.reduce((score, keyword) => {
        const titleMatches = (title.toLowerCase().match(new RegExp(keyword, 'g')) || []).length * 3;
        const contentMatches = (content.toLowerCase().match(new RegExp(keyword, 'g')) || []).length;
        return score + titleMatches + contentMatches;
      }, 0);
    }

    const bestCategory = Object.entries(scores).reduce((best, [category, score]) => 
      score > best.score ? { category, score } : best, 
      { category: 'policy-news', score: 0 }
    );

    return bestCategory.category;
  }

  async getCategoryById(categorySlug) {
    if (!this.categoryCache.has(categorySlug)) {
      await this.initializeCategories();
    }
    
    return this.categoryCache.get(categorySlug) || this.categoryCache.get('policy-news');
  }

  async getCategoryIdBySlug(slug) {
    const category = await this.getCategoryById(slug);
    return category ? category.id : null;
  }

  getAllCategorySlugs() {
    return Object.keys(this.categoryMappings).concat(['policy-news']);
  }

  async classifyAndGetCategoryId(title, content = '') {
    const categorySlug = this.classifyByContent(title, content);
    return await this.getCategoryIdBySlug(categorySlug);
  }

  getCategoryKeywords(categorySlug) {
    return this.categoryMappings[categorySlug] || [];
  }
}

module.exports = CategoryClassifier;