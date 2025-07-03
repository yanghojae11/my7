const { createCanvas, loadImage, registerFont } = require('canvas');
const path = require('path');

class ThumbnailGenerator {
  constructor() {
    this.width = 800;
    this.height = 600;
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

  async generateForPolicy(policyData) {
    const canvas = createCanvas(this.width, this.height);
    const ctx = canvas.getContext('2d');

    try {
      const categorySlug = this.getCategorySlug(policyData);
      const colors = this.categoryColors[categorySlug];
      
      this.drawBackground(ctx, colors);
      this.drawHeader(ctx, colors);
      this.drawTitle(ctx, policyData.title, colors);
      this.drawCategory(ctx, this.getCategoryName(categorySlug), colors);
      this.drawSummary(ctx, policyData.summary || policyData.content, colors);
      this.drawMetadata(ctx, policyData, colors);
      this.drawBranding(ctx, colors);

      return canvas.toBuffer('image/png');
    } catch (error) {
      console.error('Thumbnail generation failed:', error);
      return this.generateFallbackThumbnail(policyData.title);
    }
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

  getCategoryName(slug) {
    const categoryNames = {
      'startup-support': '창업 지원',
      'housing-policy': '주택 정책',
      'employment-support': '취업 지원',
      'education-policy': '교육 정책',
      'welfare-benefits': '복지 혜택',
      'government-subsidies': '정부 지원금',
      'policy-news': '정책 뉴스'
    };
    return categoryNames[slug] || '정책 정보';
  }

  drawBackground(ctx, colors) {
    const gradient = ctx.createLinearGradient(0, 0, this.width, this.height);
    gradient.addColorStop(0, colors.secondary);
    gradient.addColorStop(1, '#FFFFFF');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, this.width, this.height);
  }

  drawHeader(ctx, colors) {
    ctx.fillStyle = colors.primary;
    ctx.fillRect(0, 0, this.width, 80);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('MY7 정책지원', 30, 50);
  }

  drawTitle(ctx, title, colors) {
    ctx.fillStyle = colors.accent;
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'left';
    
    const maxWidth = this.width - 60;
    const lines = this.wrapText(ctx, title, maxWidth, 42);
    
    let y = 150;
    lines.slice(0, 3).forEach((line, index) => {
      ctx.fillText(line, 30, y + (index * 45));
    });

    if (lines.length > 3) {
      const lastLine = lines[2];
      const ellipsis = '...';
      const textWidth = ctx.measureText(lastLine + ellipsis).width;
      if (textWidth > maxWidth) {
        const shortenedLine = this.shortenText(ctx, lastLine, maxWidth, ellipsis);
        ctx.fillText(shortenedLine, 30, y + 90);
      }
    }
  }

  drawCategory(ctx, categoryName, colors) {
    const badgeX = 30;
    const badgeY = 320;
    const badgeWidth = ctx.measureText(categoryName).width + 40;
    const badgeHeight = 40;

    ctx.fillStyle = colors.primary;
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 20);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(categoryName, badgeX + 20, badgeY + 25);
  }

  drawSummary(ctx, content, colors) {
    if (!content) return;

    const cleanContent = this.cleanHtml(content);
    const summary = this.truncateText(cleanContent, 200);

    ctx.fillStyle = colors.accent;
    ctx.font = '20px sans-serif';
    ctx.textAlign = 'left';

    const maxWidth = this.width - 60;
    const lines = this.wrapText(ctx, summary, maxWidth, 24);
    
    let y = 400;
    lines.slice(0, 4).forEach((line, index) => {
      ctx.fillText(line, 30, y + (index * 28));
    });
  }

  drawMetadata(ctx, policyData, colors) {
    const publishedDate = policyData.published_at ? 
      new Date(policyData.published_at).toLocaleDateString('ko-KR') : 
      new Date().toLocaleDateString('ko-KR');

    const agency = policyData.government_agencies?.name || '정부 기관';

    ctx.fillStyle = colors.primary;
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'left';
    
    ctx.fillText(`📅 발행일: ${publishedDate}`, 30, 540);
    ctx.fillText(`🏛️ 기관: ${agency}`, 30, 565);
  }

  drawBranding(ctx, colors) {
    ctx.fillStyle = colors.primary;
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('정책지원정보', this.width - 30, this.height - 20);
  }

  wrapText(ctx, text, maxWidth, lineHeight) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];

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
    lines.push(currentLine);

    return lines;
  }

  shortenText(ctx, text, maxWidth, suffix) {
    let shortenedText = text;
    while (ctx.measureText(shortenedText + suffix).width > maxWidth && shortenedText.length > 0) {
      shortenedText = shortenedText.slice(0, -1);
    }
    return shortenedText + suffix;
  }

  truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }

  cleanHtml(html) {
    if (!html) return '';
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
  }

  generateFallbackThumbnail(title) {
    const canvas = createCanvas(this.width, this.height);
    const ctx = canvas.getContext('2d');

    const colors = this.categoryColors['policy-news'];
    
    ctx.fillStyle = colors.secondary;
    ctx.fillRect(0, 0, this.width, this.height);
    
    ctx.fillStyle = colors.primary;
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(title || '정책 정보', this.width / 2, this.height / 2);

    return canvas.toBuffer('image/png');
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

module.exports = ThumbnailGenerator;