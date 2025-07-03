const { createCanvas } = require('canvas');

class InfographicGenerator {
  constructor() {
    this.width = 1200;
    this.height = 1600;
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

  async generateForPolicy(policyData, keyPoints = []) {
    const canvas = createCanvas(this.width, this.height);
    const ctx = canvas.getContext('2d');

    try {
      const categorySlug = this.getCategorySlug(policyData);
      const colors = this.categoryColors[categorySlug];
      
      this.drawBackground(ctx, colors);
      this.drawHeader(ctx, policyData, colors);
      this.drawMainContent(ctx, policyData, colors);
      this.drawKeyPointsSection(ctx, keyPoints, colors);
      this.drawMetadataSection(ctx, policyData, colors);
      this.drawFooter(ctx, colors);

      return canvas.toBuffer('image/png');
    } catch (error) {
      console.error('Infographic generation failed:', error);
      return this.generateFallbackInfographic(policyData);
    }
  }

  drawBackground(ctx, colors) {
    const gradient = ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, '#FFFFFF');
    gradient.addColorStop(0.3, colors.secondary);
    gradient.addColorStop(0.7, '#FFFFFF');
    gradient.addColorStop(1, colors.secondary);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.width, this.height);

    this.drawPatternOverlay(ctx, colors);
  }

  drawPatternOverlay(ctx, colors) {
    ctx.strokeStyle = colors.primary + '10';
    ctx.lineWidth = 1;
    
    for (let i = 0; i < 20; i++) {
      const x = (i * 60) + 30;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.height);
      ctx.stroke();
    }
  }

  drawHeader(ctx, policyData, colors) {
    const headerHeight = 200;
    
    ctx.fillStyle = colors.primary;
    ctx.fillRect(0, 0, this.width, headerHeight);

    const overlayGradient = ctx.createLinearGradient(0, 0, this.width, 0);
    overlayGradient.addColorStop(0, colors.primary);
    overlayGradient.addColorStop(1, colors.accent);
    ctx.fillStyle = overlayGradient;
    ctx.fillRect(0, 0, this.width, headerHeight);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('MY7 정책지원 정보', 50, 50);

    const categoryName = this.getCategoryName(this.getCategorySlug(policyData));
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(categoryName, 50, 80);

    ctx.font = 'bold 48px sans-serif';
    const maxTitleWidth = this.width - 100;
    const titleLines = this.wrapText(ctx, policyData.title, maxTitleWidth);
    
    let titleY = 130;
    titleLines.slice(0, 2).forEach((line, index) => {
      ctx.fillText(line, 50, titleY + (index * 55));
    });
  }

  drawMainContent(ctx, policyData, colors) {
    const startY = 250;
    let currentY = startY;

    this.drawSectionTitle(ctx, '📋 정책 개요', colors, currentY);
    currentY += 60;

    const summary = policyData.summary || this.cleanHtml(policyData.content).substring(0, 300) + '...';
    currentY = this.drawTextBlock(ctx, summary, colors, currentY, this.width - 100);
    currentY += 40;

    if (policyData.support_content || policyData.service_purpose) {
      this.drawSectionTitle(ctx, '💰 지원 내용', colors, currentY);
      currentY += 60;
      
      const supportContent = policyData.support_content || policyData.service_purpose;
      currentY = this.drawTextBlock(ctx, supportContent, colors, currentY, this.width - 100);
      currentY += 40;
    }

    if (policyData.service_target || policyData.target_age_min) {
      this.drawSectionTitle(ctx, '👥 지원 대상', colors, currentY);
      currentY += 60;
      
      let targetText = policyData.service_target || '';
      if (policyData.target_age_min && policyData.target_age_max) {
        targetText += ` (${policyData.target_age_min}세 ~ ${policyData.target_age_max}세)`;
      }
      currentY = this.drawTextBlock(ctx, targetText, colors, currentY, this.width - 100);
      currentY += 40;
    }

    return currentY;
  }

  drawKeyPointsSection(ctx, keyPoints, colors) {
    const startY = 900;
    let currentY = startY;

    if (keyPoints.length === 0) return currentY;

    this.drawSectionTitle(ctx, '🔑 주요 포인트', colors, currentY);
    currentY += 80;

    const cols = 2;
    const cardWidth = (this.width - 150) / cols;
    const cardHeight = 120;
    const margin = 25;

    keyPoints.slice(0, 6).forEach((keyPoint, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      
      const x = 50 + (col * (cardWidth + margin));
      const y = currentY + (row * (cardHeight + margin));
      
      this.drawKeyPointCard(ctx, keyPoint, colors, x, y, cardWidth, cardHeight);
    });

    return currentY + (Math.ceil(keyPoints.length / cols) * (cardHeight + margin));
  }

  drawKeyPointCard(ctx, keyPoint, colors, x, y, width, height) {
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.fillRect(x, y, width, height);
    ctx.shadowColor = 'transparent';

    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);

    ctx.fillStyle = colors.primary;
    ctx.font = '24px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(keyPoint.icon || '📌', x + 15, y + 35);

    ctx.fillStyle = colors.accent;
    ctx.font = 'bold 16px sans-serif';
    const titleText = this.truncateTextToWidth(ctx, keyPoint.title, width - 80);
    ctx.fillText(titleText, x + 50, y + 35);

    ctx.fillStyle = colors.accent;
    ctx.font = '14px sans-serif';
    const contentLines = this.wrapText(ctx, keyPoint.content, width - 30);
    contentLines.slice(0, 3).forEach((line, index) => {
      ctx.fillText(line, x + 15, y + 60 + (index * 18));
    });
  }

  drawMetadataSection(ctx, policyData, colors) {
    const startY = this.height - 250;
    
    this.drawSectionTitle(ctx, '📊 상세 정보', colors, startY);
    
    const metadata = [
      { label: '📅 발행일', value: policyData.published_at ? new Date(policyData.published_at).toLocaleDateString('ko-KR') : '미정' },
      { label: '🏛️ 담당기관', value: policyData.government_agencies?.name || policyData.department || '정부 기관' },
      { label: '📞 문의처', value: policyData.contact_info || '홈페이지 참조' },
      { label: '🔗 소스', value: policyData.source_type === 'policy_briefing' ? '정책브리핑' : 
                                      policyData.source_type === 'welfare_service' ? '복지서비스' : 
                                      policyData.source_type === 'youth_center' ? '온통청년' : '정부 API' }
    ];

    metadata.forEach((item, index) => {
      const y = startY + 60 + (index * 30);
      
      ctx.fillStyle = colors.primary;
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(item.label, 50, y);
      
      ctx.fillStyle = colors.accent;
      ctx.font = '16px sans-serif';
      ctx.fillText(item.value, 200, y);
    });
  }

  drawFooter(ctx, colors) {
    const footerHeight = 60;
    const footerY = this.height - footerHeight;
    
    ctx.fillStyle = colors.primary;
    ctx.fillRect(0, footerY, this.width, footerHeight);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('MY7 정책지원 플랫폼', this.width / 2, footerY + 25);
    
    ctx.font = '14px sans-serif';
    ctx.fillText('정부 정책 및 복지 서비스 통합 정보', this.width / 2, footerY + 45);
  }

  drawSectionTitle(ctx, title, colors, y) {
    ctx.fillStyle = colors.primary;
    ctx.fillRect(30, y - 5, this.width - 60, 40);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(title, 50, y + 20);
  }

  drawTextBlock(ctx, text, colors, startY, maxWidth) {
    ctx.fillStyle = colors.accent;
    ctx.font = '18px sans-serif';
    ctx.textAlign = 'left';

    const lines = this.wrapText(ctx, text, maxWidth);
    lines.forEach((line, index) => {
      ctx.fillText(line, 50, startY + (index * 25));
    });

    return startY + (lines.length * 25);
  }

  wrapText(ctx, text, maxWidth) {
    if (!text) return [''];
    
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

  truncateTextToWidth(ctx, text, maxWidth) {
    if (!text) return '';
    let truncatedText = text;
    while (ctx.measureText(truncatedText).width > maxWidth && truncatedText.length > 0) {
      truncatedText = truncatedText.slice(0, -1);
    }
    return truncatedText + (truncatedText.length < text.length ? '...' : '');
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

  generateFallbackInfographic(policyData) {
    const canvas = createCanvas(this.width, this.height);
    const ctx = canvas.getContext('2d');

    const colors = this.categoryColors['policy-news'];
    
    ctx.fillStyle = colors.secondary;
    ctx.fillRect(0, 0, this.width, this.height);
    
    ctx.fillStyle = colors.primary;
    ctx.font = 'bold 48px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(policyData.title || '정책 정보', this.width / 2, this.height / 2);

    return canvas.toBuffer('image/png');
  }
}

module.exports = InfographicGenerator;