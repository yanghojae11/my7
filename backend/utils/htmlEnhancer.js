const cheerio = require('cheerio');

class HtmlEnhancer {
  constructor() {
    this.animationClassMap = {
      'main-heading': { animation: 'slideInFromTop', delay: 0 },
      'sub-heading': { animation: 'slideInFromLeft', delay: 200 },
      'point-heading': { animation: 'scaleIn', delay: 400 },
      'content-text': { animation: 'fadeInUp', delay: 600 },
      'policy-list': { animation: 'fadeInUp', delay: 800 },
      'highlight': { animation: 'pulse', delay: 1000 },
      'important': { animation: 'bounce', delay: 1200 },
      'step': { animation: 'slideInFromRight', delay: 300 },
      'requirement': { animation: 'zoomIn', delay: 500 },
      'benefit': { animation: 'fadeInLeft', delay: 700 }
    };
  }

  enhanceDeepSeekHTML(htmlContent) {
    if (!htmlContent) return htmlContent;

    try {
      const $ = cheerio.load(htmlContent);
      
      this.addAnimationAttributes($);
      this.enhanceStructuralElements($);
      this.addInteractiveElements($);
      this.optimizeForMobile($);
      
      return $.html();
    } catch (error) {
      console.error('HTML enhancement failed:', error);
      return htmlContent;
    }
  }

  addAnimationAttributes($) {
    Object.entries(this.animationClassMap).forEach(([className, config]) => {
      $(`.${className}`).each((index, element) => {
        const $el = $(element);
        $el.attr('data-animate', config.animation);
        $el.attr('data-delay', config.delay + (index * 100));
        $el.addClass('animate-on-scroll');
      });
    });

    $('h1, h2, h3, h4, h5, h6').each((index, element) => {
      const $el = $(element);
      if (!$el.attr('data-animate')) {
        $el.attr('data-animate', 'slideInFromTop');
        $el.attr('data-delay', index * 200);
        $el.addClass('animate-on-scroll');
      }
    });

    $('p').each((index, element) => {
      const $el = $(element);
      if (!$el.attr('data-animate')) {
        $el.attr('data-animate', 'fadeInUp');
        $el.attr('data-delay', (index + 2) * 150);
        $el.addClass('animate-on-scroll');
      }
    });

    $('ul li, ol li').each((index, element) => {
      const $el = $(element);
      $el.attr('data-animate', 'slideInFromLeft');
      $el.attr('data-delay', index * 100);
      $el.addClass('animate-on-scroll');
    });

    $('.policy-list li').each((index, element) => {
      const $el = $(element);
      $el.attr('data-animate', 'fadeInUp');
      $el.attr('data-delay', index * 100);
      $el.addClass('animate-on-scroll policy-item');
    });
  }

  enhanceStructuralElements($) {
    $('div, section').each((index, element) => {
      const $el = $(element);
      const text = $el.text().toLowerCase();
      
      if (text.includes('대상') || text.includes('자격')) {
        $el.addClass('target-section');
        $el.attr('data-section-type', 'target');
      } else if (text.includes('지원') || text.includes('혜택')) {
        $el.addClass('benefit-section');
        $el.attr('data-section-type', 'benefit');
      } else if (text.includes('신청') || text.includes('방법')) {
        $el.addClass('application-section');
        $el.attr('data-section-type', 'application');
      } else if (text.includes('기간') || text.includes('일정')) {
        $el.addClass('schedule-section');
        $el.attr('data-section-type', 'schedule');
      }
    });

    $('strong, b').each((index, element) => {
      const $el = $(element);
      $el.addClass('enhanced-emphasis');
      $el.attr('data-animate', 'pulse');
      $el.attr('data-delay', 500 + (index * 100));
    });

    $('em, i').each((index, element) => {
      const $el = $(element);
      $el.addClass('enhanced-italic');
      $el.attr('data-animate', 'fadeIn');
      $el.attr('data-delay', 300 + (index * 50));
    });
  }

  addInteractiveElements($) {
    $('p').each((index, element) => {
      const $el = $(element);
      const text = $el.text();
      
      if (text.includes('문의') || text.includes('연락') || text.includes('전화')) {
        $el.addClass('contact-info');
        $el.attr('data-interactive', 'contact');
      }
      
      if (text.includes('신청') && (text.includes('방법') || text.includes('링크') || text.includes('사이트'))) {
        $el.addClass('application-link');
        $el.attr('data-interactive', 'application');
      }
      
      if (text.includes('기한') || text.includes('마감') || text.includes('까지')) {
        $el.addClass('deadline-info');
        $el.attr('data-interactive', 'deadline');
      }
    });

    $('ul, ol').each((index, element) => {
      const $el = $(element);
      const text = $el.text().toLowerCase();
      
      if (text.includes('단계') || text.includes('절차') || text.includes('과정')) {
        $el.addClass('process-steps');
        $el.attr('data-list-type', 'process');
      } else if (text.includes('조건') || text.includes('요건') || text.includes('자격')) {
        $el.addClass('requirements-list');
        $el.attr('data-list-type', 'requirements');
      } else if (text.includes('혜택') || text.includes('지원') || text.includes('내용')) {
        $el.addClass('benefits-list');
        $el.attr('data-list-type', 'benefits');
      }
    });
  }

  optimizeForMobile($) {
    $('table').each((index, element) => {
      const $el = $(element);
      $el.addClass('responsive-table');
      $el.wrap('<div class="table-container"></div>');
    });

    $('img').each((index, element) => {
      const $el = $(element);
      $el.addClass('responsive-image');
      $el.attr('loading', 'lazy');
    });

    $('pre, code').each((index, element) => {
      const $el = $(element);
      $el.addClass('responsive-code');
    });
  }

  generateAnimationCSS() {
    return `
/* Animation Styles for Enhanced DeepSeek HTML */

.animate-on-scroll {
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.animate-on-scroll.animated {
  opacity: 1;
  transform: translateY(0);
}

/* Animation Types */
[data-animate="slideInFromTop"] {
  transform: translateY(-30px);
}

[data-animate="slideInFromTop"].animated {
  transform: translateY(0);
}

[data-animate="slideInFromLeft"] {
  transform: translateX(-30px);
}

[data-animate="slideInFromLeft"].animated {
  transform: translateX(0);
}

[data-animate="slideInFromRight"] {
  transform: translateX(30px);
}

[data-animate="slideInFromRight"].animated {
  transform: translateX(0);
}

[data-animate="fadeInUp"] {
  opacity: 0;
  transform: translateY(20px);
}

[data-animate="fadeInUp"].animated {
  opacity: 1;
  transform: translateY(0);
}

[data-animate="fadeInLeft"] {
  opacity: 0;
  transform: translateX(-20px);
}

[data-animate="fadeInLeft"].animated {
  opacity: 1;
  transform: translateX(0);
}

[data-animate="scaleIn"] {
  opacity: 0;
  transform: scale(0.8);
}

[data-animate="scaleIn"].animated {
  opacity: 1;
  transform: scale(1);
}

[data-animate="zoomIn"] {
  opacity: 0;
  transform: scale(0.5);
}

[data-animate="zoomIn"].animated {
  opacity: 1;
  transform: scale(1);
}

[data-animate="pulse"] {
  animation: pulseEffect 2s infinite;
}

@keyframes pulseEffect {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

[data-animate="bounce"] {
  animation: bounceEffect 1s ease-out;
}

@keyframes bounceEffect {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
}

[data-animate="fadeIn"] {
  opacity: 0;
}

[data-animate="fadeIn"].animated {
  opacity: 1;
}

/* Section Styling */
.target-section {
  border-left: 4px solid #4F46E5;
  padding-left: 20px;
  background: linear-gradient(90deg, #E0E7FF 0%, transparent 100%);
}

.benefit-section {
  border-left: 4px solid #059669;
  padding-left: 20px;
  background: linear-gradient(90deg, #D1FAE5 0%, transparent 100%);
}

.application-section {
  border-left: 4px solid #DC2626;
  padding-left: 20px;
  background: linear-gradient(90deg, #FEE2E2 0%, transparent 100%);
}

.schedule-section {
  border-left: 4px solid #7C3AED;
  padding-left: 20px;
  background: linear-gradient(90deg, #EDE9FE 0%, transparent 100%);
}

/* Enhanced Elements */
.enhanced-emphasis {
  background: linear-gradient(120deg, #f093fb 0%, #f5576c 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: bold;
}

.enhanced-italic {
  position: relative;
  font-style: italic;
  color: #6B7280;
}

/* Interactive Elements */
.contact-info {
  background: #F3F4F6;
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid #0891B2;
  position: relative;
}

.contact-info::before {
  content: "📞";
  position: absolute;
  left: -15px;
  top: 15px;
  background: white;
  padding: 5px;
  border-radius: 50%;
}

.application-link {
  background: #F0FDF4;
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid #059669;
  position: relative;
}

.application-link::before {
  content: "📝";
  position: absolute;
  left: -15px;
  top: 15px;
  background: white;
  padding: 5px;
  border-radius: 50%;
}

.deadline-info {
  background: #FEF2F2;
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid #DC2626;
  position: relative;
}

.deadline-info::before {
  content: "⏰";
  position: absolute;
  left: -15px;
  top: 15px;
  background: white;
  padding: 5px;
  border-radius: 50%;
}

/* List Styling */
.process-steps li {
  position: relative;
  padding-left: 40px;
  margin-bottom: 15px;
}

.process-steps li::before {
  content: counter(step-counter);
  counter-increment: step-counter;
  position: absolute;
  left: 0;
  top: 0;
  background: #4F46E5;
  color: white;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.process-steps {
  counter-reset: step-counter;
}

.requirements-list li::before {
  content: "✅";
  margin-right: 10px;
}

.benefits-list li::before {
  content: "💰";
  margin-right: 10px;
}

.policy-item {
  transition: all 0.3s ease;
  padding: 10px;
  border-radius: 5px;
}

.policy-item:hover {
  background: #F9FAFB;
  transform: translateX(5px);
}

/* Responsive Design */
.responsive-table {
  width: 100%;
  overflow-x: auto;
}

.table-container {
  overflow-x: auto;
  margin: 20px 0;
}

.responsive-image {
  max-width: 100%;
  height: auto;
}

.responsive-code {
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* Mobile Optimization */
@media (max-width: 768px) {
  .animate-on-scroll {
    transform: translateY(10px);
  }
  
  [data-animate="slideInFromLeft"],
  [data-animate="slideInFromRight"] {
    transform: translateY(10px);
  }
  
  .target-section,
  .benefit-section,
  .application-section,
  .schedule-section {
    padding-left: 15px;
    margin: 10px 0;
  }
  
  .contact-info,
  .application-link,
  .deadline-info {
    padding: 10px;
  }
}

/* JavaScript Animation Trigger */
.js-animation-observer {
  position: relative;
}
`;
  }

  generateAnimationJS() {
    return `
// Animation Observer for Enhanced DeepSeek HTML
class AnimationObserver {
  constructor() {
    this.observer = null;
    this.init();
  }

  init() {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        this.handleIntersection.bind(this),
        {
          threshold: 0.1,
          rootMargin: '50px 0px'
        }
      );
      this.observeElements();
    } else {
      // Fallback for older browsers
      this.animateAllElements();
    }
  }

  observeElements() {
    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach(element => {
      this.observer.observe(element);
    });
  }

  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target;
        const delay = element.getAttribute('data-delay') || 0;
        
        setTimeout(() => {
          element.classList.add('animated');
        }, parseInt(delay));
        
        this.observer.unobserve(element);
      }
    });
  }

  animateAllElements() {
    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach((element, index) => {
      const delay = element.getAttribute('data-delay') || (index * 100);
      setTimeout(() => {
        element.classList.add('animated');
      }, parseInt(delay));
    });
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new AnimationObserver();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AnimationObserver;
}
`;
  }
}

module.exports = HtmlEnhancer;