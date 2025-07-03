const { createCanvas } = require('canvas');
const cheerio = require('cheerio');

class KeyPointGenerator {
  constructor() {
    this.cardWidth = 400;
    this.cardHeight = 300;
    this.iconMap = {
      '대상': '👥',
      '지원내용': '💰',
      '신청방법': '📝',
      '기간': '📅',
      '조건': '✅',
      '혜택': '🎁',
      '절차': '🔄',
      '문의': '📞',
      '요건': '📋',
      '자격': '🏆'
    };
    this.categoryColors = {
      'startup-support': { primary: '#4F46E5', secondary: '#E0E7FF', accent: '#312E81' },
      'housing-policy': { primary: '#059669', secondary: '#D1FAE5', accent: '#064E3B' },
      'employment-support': { primary: '#DC2626', secondary: '#FEE2E2', accent: '#7F1D1D' },
      'education-policy': { primary: '#7C3AED', secondary: '#EDE9FE', accent: '#4C1D95' },
      'welfare-benefits': { primary: '#EA580C', secondary: '#FED7AA', accent: '#9A3412' },
      'government-subsidies': { primary: '#0891B2', secondary: '#CDFAFF', accent: '#164E63' },
      'policy-news': { primary: '#6B7280', secondary: '#F3F4F6', accent: '#374151' }
    };
  }

  async extractKeyPoints(htmlContent, policyData) {
    if (!htmlContent) {
      return this.generateFallbackKeyPoints(policyData);
    }

    try {
      const $ = cheerio.load(htmlContent);
      const keyPoints = [];

      $('h1, h2, h3, h4, h5, h6').each((index, element) => {
        const $el = $(element);
        const title = $el.text().trim();
        const content = $el.next('p, ul, ol, div').text().trim();
        
        if (title && content && title.length < 50) {
          keyPoints.push({
            title: title,
            content: this.truncateText(content, 150),
            icon: this.getIconForTitle(title),
            type: this.classifyKeyPointType(title)
          });
        }
      });

      $('ul li, ol li').each((index, element) => {
        const $el = $(element);
        const text = $el.text().trim();
        
        if (text && text.length > 10 && text.length < 200) {
          const title = this.extractTitleFromText(text);
          keyPoints.push({
            title: title,
            content: text,
            icon: this.getIconForTitle(title),
            type: 'list-item'
          });
        }
      });

      $('.point-heading, .sub-heading').each((index, element) => {
        const $el = $(element);
        const title = $el.text().trim();
        const content = $el.next().text().trim();
        
        if (title && content) {
          keyPoints.push({
            title: title,
            content: this.truncateText(content, 150),
            icon: this.getIconForTitle(title),
            type: 'structured'
          });
        }
      });

      return keyPoints.slice(0, 8);
    } catch (error) {
      console.error('Key point extraction failed:', error);
      return this.generateFallbackKeyPoints(policyData);
    }
  }

  generateFallbackKeyPoints(policyData) {
    const keyPoints = [];

    if (policyData.title) {
      keyPoints.push({
        title: '정책명',
        content: policyData.title,
        icon: '📋',
        type: 'basic'
      });
    }

    if (policyData.summary) {
      keyPoints.push({
        title: '정책 개요',
        content: this.truncateText(policyData.summary, 150),
        icon: '📄',
        type: 'basic'
      });
    }

    if (policyData.support_content) {
      keyPoints.push({
        title: '지원 내용',
        content: this.truncateText(policyData.support_content, 150),
        icon: '💰',
        type: 'basic'
      });
    }

    if (policyData.application_method) {
      keyPoints.push({
        title: '신청 방법',
        content: this.truncateText(policyData.application_method, 150),
        icon: '📝',
        type: 'basic'
      });
    }

    if (policyData.target_age || policyData.service_target) {
      keyPoints.push({
        title: '대상자',
        content: policyData.service_target || `${policyData.target_age_min || ''}세 ~ ${policyData.target_age_max || ''}세`,
        icon: '👥',
        type: 'basic'
      });
    }

    if (policyData.contact_info) {
      keyPoints.push({
        title: '문의처',
        content: this.truncateText(policyData.contact_info, 150),
        icon: '📞',
        type: 'basic'
      });
    }

    return keyPoints.slice(0, 6);
  }

  getIconForTitle(title) {
    for (const [keyword, icon] of Object.entries(this.iconMap)) {
      if (title.includes(keyword)) {
        return icon;
      }
    }
    return '📌';
  }

  classifyKeyPointType(title) {
    const lowerTitle = title.toLowerCase();
    
    if (lowerTitle.includes('대상') || lowerTitle.includes('자격')) return 'target';
    if (lowerTitle.includes('지원') || lowerTitle.includes('혜택')) return 'benefit';
    if (lowerTitle.includes('신청') || lowerTitle.includes('방법')) return 'application';
    if (lowerTitle.includes('기간') || lowerTitle.includes('일정')) return 'schedule';
    if (lowerTitle.includes('조건') || lowerTitle.includes('요건')) return 'requirement';
    
    return 'general';
  }

  extractTitleFromText(text) {
    const colonIndex = text.indexOf(':');
    if (colonIndex > 0 && colonIndex < 30) {
      return text.substring(0, colonIndex).trim();
    }
    
    const words = text.split(' ');
    if (words.length > 3) {
      return words.slice(0, 3).join(' ') + '...';
    }
    
    return this.truncateText(words.join(' '), 20);
  }

  async generateCards(keyPoints, policyData) {
    const categorySlug = this.getCategorySlug(policyData);
    const colors = this.categoryColors[categorySlug];
    const cards = [];

    for (let i = 0; i < keyPoints.length; i++) {
      const keyPoint = keyPoints[i];
      const cardBuffer = await this.generateSingleCard(keyPoint, colors, i + 1, keyPoints.length);
      cards.push(cardBuffer);
    }

    return cards;
  }

  async generateSingleCard(keyPoint, colors, cardNumber, totalCards) {
    const canvas = createCanvas(this.cardWidth, this.cardHeight);
    const ctx = canvas.getContext('2d');

    this.drawCardBackground(ctx, colors);
    this.drawCardHeader(ctx, colors, cardNumber, totalCards);
    this.drawIcon(ctx, keyPoint.icon, colors);
    this.drawTitle(ctx, keyPoint.title, colors);
    this.drawContent(ctx, keyPoint.content, colors);
    this.drawCardFooter(ctx, colors);

    return canvas.toBuffer('image/png');
  }

  drawCardBackground(ctx, colors) {
    const gradient = ctx.createLinearGradient(0, 0, 0, this.cardHeight);
    gradient.addColorStop(0, '#FFFFFF');
    gradient.addColorStop(1, colors.secondary);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.cardWidth, this.cardHeight);

    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, this.cardWidth, this.cardHeight);

    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.strokeRect(0, 0, this.cardWidth, this.cardHeight);
    ctx.shadowColor = 'transparent';
  }

  drawCardHeader(ctx, colors, cardNumber, totalCards) {
    ctx.fillStyle = colors.primary;
    ctx.fillRect(0, 0, this.cardWidth, 50);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`${cardNumber}/${totalCards}`, this.cardWidth - 20, 30);
  }

  drawIcon(ctx, icon, colors) {
    ctx.font = '48px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(icon, this.cardWidth / 2, 110);
  }

  drawTitle(ctx, title, colors) {
    ctx.fillStyle = colors.accent;
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    
    const maxWidth = this.cardWidth - 40;
    const truncatedTitle = this.truncateTextToWidth(ctx, title, maxWidth);
    ctx.fillText(truncatedTitle, this.cardWidth / 2, 150);
  }

  drawContent(ctx, content, colors) {
    ctx.fillStyle = colors.accent;
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'left';

    const maxWidth = this.cardWidth - 40;
    const lines = this.wrapText(ctx, content, maxWidth);
    
    let y = 180;
    lines.slice(0, 4).forEach((line, index) => {
      ctx.fillText(line, 20, y + (index * 22));
    });
  }

  drawCardFooter(ctx, colors) {
    ctx.fillStyle = colors.primary;
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('MY7 정책지원', this.cardWidth / 2, this.cardHeight - 15);
  }

  wrapText(ctx, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0] || '';

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + ' ' + word).width;
      
      if (width < maxWidth) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }

  truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }

  truncateTextToWidth(ctx, text, maxWidth) {
    let truncatedText = text;
    while (ctx.measureText(truncatedText).width > maxWidth && truncatedText.length > 0) {
      truncatedText = truncatedText.slice(0, -1);
    }
    return truncatedText + (truncatedText.length < text.length ? '...' : '');
  }

  getCategorySlug(policyData) {
    if (policyData.policy_categories?.slug) {
      return policyData.policy_categories.slug;
    }
    if (policyData.category_id) {
      return this.mapCategoryIdToSlug(policyData.category_id);
    }
    return 'policy-news';
  }

  mapCategoryIdToSlug(categoryId) {
    const mapping = {
      1: 'startup-support',
      2: 'housing-policy',
      3: 'employment-support',
      4: 'education-policy',
      5: 'welfare-benefits',
      6: 'government-subsidies',
      7: 'policy-news'
    };
    return mapping[categoryId] || 'policy-news';
  }
}

module.exports = KeyPointGenerator;