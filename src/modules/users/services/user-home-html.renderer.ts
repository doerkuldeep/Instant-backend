import { UiScreenDto } from '../types/user-home.types';

/**
 * Server-Side HTML Renderer for the Server-Driven UI (SDUI) Homepage.
 * Renders the exact UI Screen Contract served by the backend into a stunning, responsive,
 * production-grade web application view using modern Vanilla CSS.
 */
export function renderUserHomeHtml(screen: UiScreenDto): string {
  const { title, theme, appBar, sections, bottomNavigation, user } = screen;

  // Find components by type
  const heroSection = sections.find((s) => s.type === 'HERO_CAROUSEL');
  const quickActionsSection = sections.find((s) => s.type === 'QUICK_ACTIONS');
  const searchChipsSection = sections.find((s) => s.type === 'SEARCH_SUGGESTIONS_TICKER');
  const categoriesSection = sections.find((s) => s.type === 'CATEGORY_GRID');
  const segmentsSection = sections.find((s) => s.type === 'SEGMENT_SHOWCASE');
  const featuredSection = sections.find((s) => s.type === 'FEATURED_MACHINES_HORIZONTAL');
  const promoSection = sections.find((s) => s.type === 'PROMOTION_BANNER_STRIP');
  const trustSection = sections.find((s) => s.type === 'TRUST_MARKERS_GRID');
  const testimonialsSection = sections.find((s) => s.type === 'TESTIMONIALS_CAROUSEL');
  const ctaSection = sections.find((s) => s.type === 'CALL_TO_ACTION_BANNER');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="Rent certified heavy and light construction machinery online with doorstep delivery, certified operators, and zero hidden charges across India.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: ${theme.primaryColor};
      --primary-dark: #1D4ED8;
      --primary-light: #EFF6FF;
      --secondary: ${theme.secondaryColor};
      --accent: ${theme.accentColor};
      --accent-hover: #D97706;
      --bg: #F8FAFC;
      --surface: ${theme.surfaceColor};
      --text: ${theme.textColor};
      --text-muted: #64748B;
      --border: #E2E8F0;
      --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
      --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
      --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
      --radius-sm: 8px;
      --radius-md: 12px;
      --radius-lg: 18px;
      --radius-xl: 24px;
      --font-display: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
      --font-sans: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: var(--font-sans);
      background-color: var(--bg);
      color: var(--text);
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
      overflow-x: hidden;
      padding-bottom: 70px;
    }

    /* Top Notice Bar / Server-Driven Indicator */
    .sdui-badge-bar {
      background: linear-gradient(90deg, #1E293B 0%, #0F172A 100%);
      color: #94A3B8;
      font-size: 0.75rem;
      padding: 6px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .sdui-badge-bar .badge {
      background: rgba(37, 99, 235, 0.2);
      color: #60A5FA;
      padding: 2px 8px;
      border-radius: 999px;
      font-weight: 600;
      letter-spacing: 0.5px;
      border: 1px solid rgba(96, 165, 250, 0.3);
    }

    /* Header & Navigation */
    header.app-header {
      position: sticky;
      top: 0;
      z-index: 50;
      background: rgba(255, 255, 255, 0.94);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border);
      box-shadow: var(--shadow-sm);
    }
    .header-container {
      max-width: 1240px;
      margin: 0 auto;
      padding: 12px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
    }
    .brand-group {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
    }
    .brand-logo-icon {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, var(--primary) 0%, #1D4ED8 100%);
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-family: var(--font-display);
      font-weight: 800;
      font-size: 1.3rem;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
    }
    .brand-info h1 {
      font-family: var(--font-display);
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--secondary);
      line-height: 1.1;
      letter-spacing: -0.5px;
    }
    .brand-info p {
      font-size: 0.72rem;
      color: var(--text-muted);
      font-weight: 500;
    }

    .location-pill {
      display: flex;
      align-items: center;
      gap: 6px;
      background: var(--surface);
      border: 1px solid var(--border);
      padding: 6px 12px;
      border-radius: 999px;
      font-size: 0.8rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .location-pill:hover {
      border-color: var(--primary);
      background: var(--primary-light);
    }
    .location-dot {
      width: 8px;
      height: 8px;
      background: #10B981;
      border-radius: 50%;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
    }

    .search-wrapper {
      flex: 1;
      max-width: 520px;
      position: relative;
    }
    .search-input {
      width: 100%;
      background: var(--surface);
      border: 1.5px solid var(--border);
      border-radius: 999px;
      padding: 10px 18px 10px 42px;
      font-size: 0.875rem;
      font-family: var(--font-sans);
      color: var(--text);
      outline: none;
      transition: all 0.2s ease;
    }
    .search-input:focus {
      border-color: var(--primary);
      background: white;
      box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.12);
    }
    .search-icon {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted);
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .btn-user-action {
      background: var(--primary);
      color: white;
      border: none;
      border-radius: 999px;
      padding: 8px 18px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 6px;
      box-shadow: 0 2px 8px rgba(37, 99, 235, 0.25);
    }
    .btn-user-action:hover {
      background: var(--primary-dark);
      transform: translateY(-1px);
    }

    /* Main Container */
    main.page-content {
      max-width: 1240px;
      margin: 0 auto;
      padding: 24px 20px;
      display: flex;
      flex-direction: column;
      gap: 36px;
    }

    /* Typography & Headers */
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 16px;
    }
    .section-title {
      font-family: var(--font-display);
      font-size: 1.45rem;
      font-weight: 800;
      color: var(--secondary);
      letter-spacing: -0.4px;
    }
    .section-subtitle {
      font-size: 0.875rem;
      color: var(--text-muted);
      margin-top: 2px;
    }
    .section-link {
      color: var(--primary);
      text-decoration: none;
      font-size: 0.85rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 4px;
      transition: gap 0.2s;
    }
    .section-link:hover {
      gap: 8px;
      color: var(--primary-dark);
    }

    /* Hero Carousel */
    .hero-slider {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 16px;
    }
    .hero-banner-card {
      position: relative;
      border-radius: var(--radius-xl);
      overflow: hidden;
      min-height: 230px;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      padding: 24px;
      color: white;
      background-size: cover;
      background-position: center;
      box-shadow: var(--shadow-md);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    .hero-banner-card:hover {
      transform: translateY(-3px);
      box-shadow: var(--shadow-xl);
    }
    .hero-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(15,23,42,0.1) 0%, rgba(15,23,42,0.88) 100%);
      z-index: 1;
    }
    .hero-content {
      position: relative;
      z-index: 2;
    }
    .hero-tag {
      display: inline-block;
      background: var(--accent);
      color: #78350F;
      font-size: 0.7rem;
      font-weight: 800;
      padding: 3px 10px;
      border-radius: 999px;
      margin-bottom: 8px;
      letter-spacing: 0.5px;
    }
    .hero-title {
      font-family: var(--font-display);
      font-size: 1.35rem;
      font-weight: 800;
      line-height: 1.25;
      margin-bottom: 6px;
    }
    .hero-subtitle {
      font-size: 0.85rem;
      opacity: 0.9;
      margin-bottom: 14px;
      max-width: 90%;
    }
    .hero-cta-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: white;
      color: #0F172A;
      font-weight: 700;
      font-size: 0.82rem;
      padding: 8px 16px;
      border-radius: 999px;
      text-decoration: none;
      transition: all 0.2s;
    }
    .hero-cta-btn:hover {
      background: #F1F5F9;
      transform: translateX(3px);
    }

    /* Quick Actions */
    .quick-actions-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
    }
    .quick-action-card {
      background: white;
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 14px 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      text-decoration: none;
      color: var(--text);
      transition: all 0.2s ease;
      position: relative;
    }
    .quick-action-card:hover {
      border-color: var(--primary);
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }
    .quick-action-icon {
      width: 44px;
      height: 44px;
      background: var(--primary-light);
      color: var(--primary);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      margin-bottom: 8px;
    }
    .quick-action-label {
      font-size: 0.82rem;
      font-weight: 700;
    }
    .quick-action-badge {
      position: absolute;
      top: 8px;
      right: 8px;
      background: #EF4444;
      color: white;
      font-size: 0.62rem;
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 999px;
    }

    /* Search Pills / Chips */
    .search-chips-wrap {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
    }
    .search-chip {
      background: white;
      border: 1px solid var(--border);
      color: var(--text);
      font-size: 0.8rem;
      font-weight: 600;
      padding: 6px 14px;
      border-radius: 999px;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s;
    }
    .search-chip:hover {
      border-color: var(--primary);
      color: var(--primary);
      background: var(--primary-light);
    }

    /* Category Grid */
    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
      gap: 14px;
    }
    .category-card {
      background: white;
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 16px 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      text-decoration: none;
      color: var(--text);
      transition: all 0.2s ease;
    }
    .category-card:hover {
      border-color: var(--primary);
      box-shadow: var(--shadow-md);
      transform: translateY(-2px);
    }
    .category-thumb {
      width: 58px;
      height: 58px;
      border-radius: var(--radius-md);
      object-fit: cover;
      margin-bottom: 10px;
      background: #F1F5F9;
    }
    .category-name {
      font-size: 0.82rem;
      font-weight: 700;
      line-height: 1.25;
      margin-bottom: 4px;
    }
    .category-count {
      font-size: 0.7rem;
      color: var(--text-muted);
      font-weight: 500;
    }

    /* Segment Showcase (Tabs) */
    .segments-container {
      background: white;
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      padding: 24px;
      box-shadow: var(--shadow-sm);
    }
    .segment-tab-buttons {
      display: flex;
      gap: 8px;
      margin-bottom: 20px;
      border-bottom: 1px solid var(--border);
      padding-bottom: 12px;
      overflow-x: auto;
    }
    .segment-tab-btn {
      background: var(--surface);
      border: 1px solid var(--border);
      padding: 8px 18px;
      border-radius: 999px;
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
    }
    .segment-tab-btn.active {
      background: var(--secondary);
      color: white;
      border-color: var(--secondary);
    }
    .segment-panel {
      display: none;
    }
    .segment-panel.active {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      align-items: center;
    }
    .segment-info h3 {
      font-family: var(--font-display);
      font-size: 1.4rem;
      font-weight: 800;
      margin-bottom: 6px;
      color: var(--secondary);
    }
    .segment-badge {
      display: inline-block;
      background: #FEF3C7;
      color: #92400E;
      font-size: 0.7rem;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 6px;
      margin-bottom: 10px;
    }
    .segment-desc {
      font-size: 0.9rem;
      color: var(--text-muted);
      margin-bottom: 14px;
    }
    .features-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 20px;
    }
    .features-list li {
      font-size: 0.84rem;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .features-list li::before {
      content: "✓";
      color: #10B981;
      font-weight: 800;
    }
    .segment-rate-pill {
      background: var(--primary-light);
      color: var(--primary-dark);
      padding: 10px 16px;
      border-radius: var(--radius-md);
      font-size: 0.88rem;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    /* Featured Machines Carousel / Cards */
    .featured-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 18px;
    }
    .machine-card {
      background: white;
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: all 0.25s ease;
      box-shadow: var(--shadow-sm);
    }
    .machine-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-md);
      border-color: #CBD5E1;
    }
    .machine-thumb-wrapper {
      position: relative;
      height: 160px;
      background: #F1F5F9;
    }
    .machine-thumb {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .machine-badge-tag {
      position: absolute;
      top: 10px;
      left: 10px;
      background: rgba(15, 23, 42, 0.8);
      backdrop-filter: blur(4px);
      color: white;
      font-size: 0.68rem;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 999px;
    }
    .machine-rating-pill {
      position: absolute;
      bottom: 10px;
      right: 10px;
      background: white;
      color: #0F172A;
      font-size: 0.72rem;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 999px;
      display: flex;
      align-items: center;
      gap: 4px;
      box-shadow: var(--shadow-sm);
    }
    .machine-body {
      padding: 16px;
      display: flex;
      flex-direction: column;
      flex: 1;
    }
    .machine-category-tag {
      font-size: 0.72rem;
      color: var(--primary);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      margin-bottom: 4px;
    }
    .machine-name {
      font-family: var(--font-display);
      font-size: 1.05rem;
      font-weight: 800;
      line-height: 1.25;
      color: var(--secondary);
      margin-bottom: 8px;
    }
    .machine-specs-row {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      margin-bottom: 14px;
    }
    .spec-tag {
      background: var(--surface);
      color: var(--text-muted);
      font-size: 0.7rem;
      font-weight: 600;
      padding: 2px 7px;
      border-radius: 4px;
    }
    .machine-footer {
      margin-top: auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid var(--border);
      padding-top: 12px;
    }
    .machine-price-val {
      font-family: var(--font-display);
      font-size: 1.15rem;
      font-weight: 800;
      color: var(--secondary);
    }
    .machine-price-unit {
      font-size: 0.72rem;
      color: var(--text-muted);
      font-weight: 500;
    }
    .btn-rent-machine {
      background: var(--primary);
      color: white;
      text-decoration: none;
      font-size: 0.8rem;
      font-weight: 700;
      padding: 6px 14px;
      border-radius: 999px;
      transition: background 0.15s;
    }
    .btn-rent-machine:hover {
      background: var(--primary-dark);
    }

    /* Promotions */
    .promos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 14px;
    }
    .promo-card {
      background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%);
      border: 1.5px dashed #93C5FD;
      border-radius: var(--radius-lg);
      padding: 16px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 12px;
    }
    .promo-badge-tag {
      display: inline-block;
      background: var(--primary);
      color: white;
      font-size: 0.65rem;
      font-weight: 800;
      padding: 2px 8px;
      border-radius: 999px;
      align-self: flex-start;
    }
    .promo-title {
      font-family: var(--font-display);
      font-size: 1.05rem;
      font-weight: 800;
      color: #1E3A8A;
      margin-top: 4px;
    }
    .promo-desc {
      font-size: 0.8rem;
      color: #3B82F6;
      margin-top: 2px;
    }
    .promo-code-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: white;
      border-radius: var(--radius-sm);
      padding: 6px 10px;
    }
    .coupon-code {
      font-family: monospace;
      font-weight: 800;
      font-size: 0.95rem;
      color: #1E40AF;
      letter-spacing: 1px;
    }
    .btn-copy-code {
      background: transparent;
      border: none;
      color: var(--primary);
      font-weight: 700;
      font-size: 0.75rem;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 4px;
      transition: background 0.15s;
    }
    .btn-copy-code:hover {
      background: #EFF6FF;
    }

    /* Trust Markers */
    .trust-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }
    .trust-card {
      background: white;
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 18px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .trust-icon-box {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-md);
      background: #DCFCE7;
      color: #15803D;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      font-weight: 800;
    }
    .trust-card-title {
      font-family: var(--font-display);
      font-size: 0.95rem;
      font-weight: 800;
      color: var(--secondary);
    }
    .trust-card-desc {
      font-size: 0.8rem;
      color: var(--text-muted);
      line-height: 1.4;
    }

    /* Testimonials */
    .testimonials-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 16px;
    }
    .testimonial-card {
      background: white;
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      padding: 20px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-shadow: var(--shadow-sm);
    }
    .testimonial-quote {
      font-size: 0.85rem;
      color: #334155;
      font-style: italic;
      margin-bottom: 16px;
      line-height: 1.5;
    }
    .testimonial-author-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .author-avatar {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      object-fit: cover;
    }
    .author-name {
      font-family: var(--font-display);
      font-size: 0.9rem;
      font-weight: 800;
      color: var(--secondary);
    }
    .author-role {
      font-size: 0.72rem;
      color: var(--text-muted);
    }

    /* Partner Call-to-Action Banner */
    .partner-banner {
      background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
      border-radius: var(--radius-xl);
      padding: 36px 32px;
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 24px;
      flex-wrap: wrap;
    }
    .partner-banner-info h2 {
      font-family: var(--font-display);
      font-size: 1.6rem;
      font-weight: 800;
      margin-bottom: 6px;
    }
    .partner-banner-info p {
      color: #94A3B8;
      font-size: 0.9rem;
      max-width: 580px;
    }
    .partner-cta-actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }
    .btn-partner-primary {
      background: var(--accent);
      color: #78350F;
      font-weight: 800;
      font-size: 0.88rem;
      padding: 10px 22px;
      border-radius: 999px;
      text-decoration: none;
      transition: all 0.2s;
    }
    .btn-partner-primary:hover {
      background: #FBBF24;
      transform: translateY(-2px);
    }
    .btn-partner-secondary {
      background: rgba(255, 255, 255, 0.1);
      color: white;
      font-weight: 700;
      font-size: 0.88rem;
      padding: 10px 20px;
      border-radius: 999px;
      text-decoration: none;
      border: 1px solid rgba(255,255,255,0.2);
      transition: background 0.2s;
    }
    .btn-partner-secondary:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    /* Bottom Mobile Navigation */
    nav.bottom-nav {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: white;
      border-top: 1px solid var(--border);
      display: flex;
      justify-content: space-around;
      padding: 8px 0;
      z-index: 60;
      box-shadow: 0 -4px 10px rgba(0, 0, 0, 0.05);
    }
    .nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-decoration: none;
      color: var(--text-muted);
      font-size: 0.7rem;
      font-weight: 600;
      gap: 3px;
    }
    .nav-item.active {
      color: var(--primary);
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .header-container {
        flex-direction: column;
        align-items: stretch;
      }
      .quick-actions-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      .segment-panel.active {
        grid-template-columns: 1fr;
      }
      .partner-banner {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  </style>
</head>
<body>

  <!-- Server-Driven UI Header Strip -->
  <div class="sdui-badge-bar">
    <div><strong>Server-Driven UI (SDUI)</strong>: Layout, components, & tokens powered 100% by backend</div>
    <span class="badge">API Contract: ${escapeHtml(screen.screenId)} v${escapeHtml(screen.version)}</span>
  </div>

  <!-- Header -->
  <header class="app-header">
    <div class="header-container">
      <div style="display: flex; align-items: center; gap: 16px;">
        <a href="/api/user/home/preview" class="brand-group">
          <div class="brand-logo-icon">E</div>
          <div class="brand-info">
            <h1>${escapeHtml(appBar.brandTitle)}</h1>
            <p>${escapeHtml(appBar.brandTagline)}</p>
          </div>
        </a>

        <div class="location-pill" title="Current location set by backend">
          <span class="location-dot"></span>
          <span>${escapeHtml(appBar.locationSelector.currentCity)}</span>
        </div>
      </div>

      <div class="search-wrapper">
        <span class="search-icon">🔍</span>
        <input
          type="text"
          class="search-input"
          placeholder="${escapeHtml(appBar.searchBar.placeholder)}"
          id="global-search-input"
        >
      </div>

      <div class="header-actions">
        <a href="/api/user/home?format=sdui" class="btn-user-action" style="background: #0F172A;">
          <span>⚡ View JSON Schema</span>
        </a>
        <a href="#" class="btn-user-action">
          <span>${escapeHtml(appBar.userAction.title)}</span>
        </a>
      </div>
    </div>
  </header>

  <!-- Page Content -->
  <main class="page-content">

    <!-- 1. Hero Banners -->
    ${
      heroSection && heroSection.data && (heroSection.data as any).banners
        ? `
      <section id="hero-banners">
        <div class="hero-slider">
          ${(heroSection.data as any).banners
            .map(
              (b: any) => `
            <div class="hero-banner-card" style="background-image: url('${escapeHtml(b.imageUrl)}'); background-color: ${b.backgroundColor || '#1E3A8A'};">
              <div class="hero-overlay"></div>
              <div class="hero-content">
                <span class="hero-tag">${escapeHtml(b.tag)}</span>
                <h2 class="hero-title">${escapeHtml(b.title)}</h2>
                <p class="hero-subtitle">${escapeHtml(b.subtitle)}</p>
                <a href="${escapeHtml(b.cta.action.target)}" class="hero-cta-btn">
                  ${escapeHtml(b.cta.text)} →
                </a>
              </div>
            </div>
          `,
            )
            .join('')}
        </div>
      </section>
    `
        : ''
    }

    <!-- 2. Quick Actions -->
    ${
      quickActionsSection && quickActionsSection.data && (quickActionsSection.data as any).actions
        ? `
      <section id="quick-actions">
        <div class="quick-actions-grid">
          ${(quickActionsSection.data as any).actions
            .map(
              (qa: any) => `
            <a href="${escapeHtml(qa.action.target)}" class="quick-action-card">
              ${qa.badge ? `<span class="quick-action-badge">${escapeHtml(qa.badge)}</span>` : ''}
              <div class="quick-action-icon">⚙️</div>
              <span class="quick-action-label">${escapeHtml(qa.label)}</span>
            </a>
          `,
            )
            .join('')}
        </div>
      </section>
    `
        : ''
    }

    <!-- 3. Trending Search Chips -->
    ${
      searchChipsSection && searchChipsSection.data && (searchChipsSection.data as any).chips
        ? `
      <section id="trending-searches">
        <div class="section-header">
          <div>
            <h2 class="section-title">${escapeHtml(searchChipsSection.header?.title || 'Trending Searches')}</h2>
            <p class="section-subtitle">${escapeHtml(searchChipsSection.header?.subtitle || '')}</p>
          </div>
        </div>
        <div class="search-chips-wrap">
          ${(searchChipsSection.data as any).chips
            .map(
              (chip: any) => `
            <a href="${escapeHtml(chip.action.target)}" class="search-chip">
              <span>🔥</span>
              <span>${escapeHtml(chip.text)}</span>
            </a>
          `,
            )
            .join('')}
        </div>
      </section>
    `
        : ''
    }

    <!-- 4. Categories -->
    ${
      categoriesSection && categoriesSection.data && (categoriesSection.data as any).categories
        ? `
      <section id="categories">
        <div class="section-header">
          <div>
            <h2 class="section-title">${escapeHtml(categoriesSection.header?.title || 'Machinery Categories')}</h2>
            <p class="section-subtitle">${escapeHtml(categoriesSection.header?.subtitle || '')}</p>
          </div>
          <a href="/categories" class="section-link">${escapeHtml(categoriesSection.header?.action?.text || 'View All')} →</a>
        </div>
        <div class="categories-grid">
          ${(categoriesSection.data as any).categories
            .map(
              (cat: any) => `
            <a href="${escapeHtml(cat.action.target)}" class="category-card">
              <img src="${escapeHtml(cat.imageUrl || cat.iconUrl || 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=150&q=80')}" alt="${escapeHtml(cat.name)}" class="category-thumb">
              <span class="category-name">${escapeHtml(cat.name)}</span>
              <span class="category-count">${escapeHtml(String(cat.machinesCount || 0))} machines</span>
            </a>
          `,
            )
            .join('')}
        </div>
      </section>
    `
        : ''
    }

    <!-- 5. Specialized Segment Tabs -->
    ${
      segmentsSection && segmentsSection.data && (segmentsSection.data as any).segments
        ? `
      <section id="segments">
        <div class="section-header">
          <div>
            <h2 class="section-title">${escapeHtml(segmentsSection.header?.title || 'Project Segments')}</h2>
            <p class="section-subtitle">${escapeHtml(segmentsSection.header?.subtitle || '')}</p>
          </div>
        </div>
        <div class="segments-container">
          <div class="segment-tab-buttons" id="segment-tabs">
            ${(segmentsSection.data as any).segments
              .map(
                (seg: any, idx: number) => `
              <button class="segment-tab-btn ${idx === 0 ? 'active' : ''}" onclick="switchSegmentTab('${escapeHtml(seg.segment)}')">
                ${escapeHtml(seg.title)}
              </button>
            `,
              )
              .join('')}
          </div>
          ${(segmentsSection.data as any).segments
            .map(
              (seg: any, idx: number) => `
            <div class="segment-panel ${idx === 0 ? 'active' : ''}" id="segment-panel-${escapeHtml(seg.segment)}">
              <div class="segment-info">
                <span class="segment-badge">${escapeHtml(seg.badge)}</span>
                <h3>${escapeHtml(seg.title)}</h3>
                <p class="segment-desc">${escapeHtml(seg.description)}</p>
                <ul class="features-list">
                  ${(seg.keyFeatures || []).map((f: string) => `<li>${escapeHtml(f)}</li>`).join('')}
                </ul>
                <div style="display: flex; gap: 12px; align-items: center;">
                  ${
                    seg.startingDailyRateInr
                      ? `<div class="segment-rate-pill">Starting from ₹${escapeHtml(String(seg.startingDailyRateInr))}/day</div>`
                      : ''
                  }
                  <a href="${escapeHtml(seg.action.target)}" class="btn-user-action">
                    Browse Segment →
                  </a>
                </div>
              </div>
              <div style="background: #F8FAFC; border-radius: var(--radius-lg); padding: 16px; border: 1px solid var(--border);">
                <div style="font-size: 0.82rem; font-weight: 700; color: var(--text-muted); margin-bottom: 8px;">POPULAR IN THIS SEGMENT</div>
                ${(seg.popularMachines || [])
                  .map(
                    (pm: any) => `
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #E2E8F0;">
                    <span style="font-size: 0.85rem; font-weight: 700;">${escapeHtml(pm.name)}</span>
                    <span style="font-size: 0.82rem; color: var(--primary); font-weight: 800;">₹${escapeHtml(String(pm.dailyInr || ''))}/day</span>
                  </div>
                `,
                  )
                  .join('')}
              </div>
            </div>
          `,
            )
            .join('')}
        </div>
      </section>
    `
        : ''
    }

    <!-- 6. Featured Equipment -->
    ${
      featuredSection && featuredSection.data && (featuredSection.data as any).machines
        ? `
      <section id="featured-equipment">
        <div class="section-header">
          <div>
            <h2 class="section-title">${escapeHtml(featuredSection.header?.title || 'Featured Equipment')}</h2>
            <p class="section-subtitle">${escapeHtml(featuredSection.header?.subtitle || '')}</p>
          </div>
          <a href="/machines" class="section-link">${escapeHtml(featuredSection.header?.action?.text || 'Explore All')} →</a>
        </div>
        <div class="featured-grid">
          ${(featuredSection.data as any).machines
            .map(
              (m: any) => `
            <div class="machine-card">
              <div class="machine-thumb-wrapper">
                <img src="${escapeHtml(m.imageUrl || 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=400&q=80')}" alt="${escapeHtml(m.name)}" class="machine-thumb">
                <span class="machine-badge-tag">${escapeHtml(m.tag)}</span>
                <span class="machine-rating-pill">⭐ ${escapeHtml(String(m.rating))} (${escapeHtml(String(m.reviewsCount))})</span>
              </div>
              <div class="machine-body">
                <span class="machine-category-tag">${escapeHtml(m.categoryName)}</span>
                <h3 class="machine-name">${escapeHtml(m.name)}</h3>
                <div class="machine-specs-row">
                  ${(m.popularBrands || []).map((b: string) => `<span class="spec-tag">${escapeHtml(b)}</span>`).join('')}
                  <span class="spec-tag">${escapeHtml(m.minBooking || '1 day')}</span>
                </div>
                <div class="machine-footer">
                  <div>
                    <span class="machine-price-val">₹${escapeHtml(String(m.startingDailyRateInr || m.startingHourlyRateInr || 0))}</span>
                    <span class="machine-price-unit">${m.startingDailyRateInr ? '/day' : '/hr'}</span>
                  </div>
                  <a href="${escapeHtml(m.action.target)}" class="btn-rent-machine">Rent Now</a>
                </div>
              </div>
            </div>
          `,
            )
            .join('')}
        </div>
      </section>
    `
        : ''
    }

    <!-- 7. Active Promotions -->
    ${
      promoSection && promoSection.data && (promoSection.data as any).promotions
        ? `
      <section id="promotions">
        <div class="section-header">
          <div>
            <h2 class="section-title">${escapeHtml(promoSection.header?.title || 'Active Rental Offers')}</h2>
            <p class="section-subtitle">${escapeHtml(promoSection.header?.subtitle || '')}</p>
          </div>
        </div>
        <div class="promos-grid">
          ${(promoSection.data as any).promotions
            .map(
              (p: any) => `
            <div class="promo-card">
              <div>
                ${p.badge ? `<span class="promo-badge-tag">${escapeHtml(p.badge)}</span>` : ''}
                <h3 class="promo-title">${escapeHtml(p.title)}</h3>
                <p class="promo-desc">${escapeHtml(p.description)}</p>
              </div>
              <div class="promo-code-bar">
                <span class="coupon-code">${escapeHtml(p.code)}</span>
                <button class="btn-copy-code" onclick="navigator.clipboard.writeText('${escapeHtml(p.code)}'); this.innerText='COPIED!'">
                  ${escapeHtml(p.copyAction.label)}
                </button>
              </div>
            </div>
          `,
            )
            .join('')}
        </div>
      </section>
    `
        : ''
    }

    <!-- 8. Trust Markers -->
    ${
      trustSection && trustSection.data && (trustSection.data as any).markers
        ? `
      <section id="trust-markers">
        <div class="section-header">
          <div>
            <h2 class="section-title">${escapeHtml(trustSection.header?.title || 'Why Rent with Us?')}</h2>
            <p class="section-subtitle">${escapeHtml(trustSection.header?.subtitle || '')}</p>
          </div>
        </div>
        <div class="trust-grid">
          ${(trustSection.data as any).markers
            .map(
              (t: any) => `
            <div class="trust-card">
              <div class="trust-icon-box">✓</div>
              <h4 class="trust-card-title">${escapeHtml(t.title)}</h4>
              <p class="trust-card-desc">${escapeHtml(t.description)}</p>
            </div>
          `,
            )
            .join('')}
        </div>
      </section>
    `
        : ''
    }

    <!-- 9. Testimonials -->
    ${
      testimonialsSection && testimonialsSection.data && (testimonialsSection.data as any).testimonials
        ? `
      <section id="testimonials">
        <div class="section-header">
          <div>
            <h2 class="section-title">${escapeHtml(testimonialsSection.header?.title || 'Contractor Reviews')}</h2>
            <p class="section-subtitle">${escapeHtml(testimonialsSection.header?.subtitle || '')}</p>
          </div>
        </div>
        <div class="testimonials-grid">
          ${(testimonialsSection.data as any).testimonials
            .map(
              (tm: any) => `
            <div class="testimonial-card">
              <p class="testimonial-quote">“${escapeHtml(tm.content)}”</p>
              <div class="testimonial-author-row">
                <img src="${escapeHtml(tm.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80')}" alt="${escapeHtml(tm.authorName)}" class="author-avatar">
                <div>
                  <h4 class="author-name">${escapeHtml(tm.authorName)}</h4>
                  <p class="author-role">${escapeHtml(tm.roleOrCompany)} • ${escapeHtml(tm.city)}</p>
                </div>
              </div>
            </div>
          `,
            )
            .join('')}
        </div>
      </section>
    `
        : ''
    }

    <!-- 10. Partner CTA Banner -->
    ${
      ctaSection && ctaSection.data
        ? `
      <section id="partner-cta">
        <div class="partner-banner">
          <div class="partner-banner-info">
            <span style="background: rgba(245, 158, 11, 0.2); color: #FCD34D; font-size: 0.72rem; font-weight: 800; padding: 3px 10px; border-radius: 999px; margin-bottom: 10px; display: inline-block;">
              ${escapeHtml((ctaSection.data as any).badge || 'PARTNER WITH US')}
            </span>
            <h2>${escapeHtml((ctaSection.data as any).title)}</h2>
            <p>${escapeHtml((ctaSection.data as any).subtitle)}</p>
          </div>
          <div class="partner-cta-actions">
            <a href="${escapeHtml((ctaSection.data as any).primaryAction.target)}" class="btn-partner-primary">
              ${escapeHtml((ctaSection.data as any).primaryAction.label)} →
            </a>
            <a href="tel:${escapeHtml((ctaSection.data as any).secondaryAction.target)}" class="btn-partner-secondary">
              ${escapeHtml((ctaSection.data as any).secondaryAction.label)}
            </a>
          </div>
        </div>
      </section>
    `
        : ''
    }

  </main>

  <!-- Mobile Bottom Navigation -->
  <nav class="bottom-nav">
    ${bottomNavigation
      .map(
        (nav) => `
      <a href="${escapeHtml(nav.action.target)}" class="nav-item ${nav.isActive ? 'active' : ''}">
        <span style="font-size: 1.1rem;">📌</span>
        <span>${escapeHtml(nav.label)}</span>
      </a>
    `,
      )
      .join('')}
  </nav>

  <script>
    function switchSegmentTab(segment) {
      document.querySelectorAll('.segment-tab-btn').forEach(btn => btn.classList.remove('active'));
      document.querySelectorAll('.segment-panel').forEach(panel => panel.classList.remove('active'));

      event.target.classList.add('active');
      const targetPanel = document.getElementById('segment-panel-' + segment);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }
    }
  </script>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
