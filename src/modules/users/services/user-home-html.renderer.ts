import { UiScreenDto } from '../types/user-home.types';

/**
 * Server-Side HTML Renderer for the Server-Driven UI (SDUI) Homepage.
 *
 * Provides a responsive hybrid experience:
 * - Desktop Web (>= 768px): Sleek, expansive desktop portal with rich grid layouts.
 * - Mobile Web (< 768px): Authentically mirrors a native mobile app (like Swiggy / Blinkit / Uber),
 *   featuring a native status bar, location dropdown, sticky pill search bar, horizontal snap carousels,
 *   circular quick actions, segmented control pills, ticket-style coupon cards, and a fixed bottom tab bar
 *   with safe-area padding and active touch press feedback.
 * - Includes an interactive "Device View" switch on desktop so reviewers can test the mobile app UI live!
 */
export function renderUserHomeHtml(screen: UiScreenDto): string {
  const { title, theme, appBar, sections, bottomNavigation } = screen;

  // Extract sections by type
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
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="Rent certified heavy and light construction machinery online with doorstep delivery, certified operators, and zero hidden charges across India.">
  <meta name="theme-color" content="${escapeHtml(theme.primaryColor)}">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="default">
  
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
      --surface: #FFFFFF;
      --text: ${theme.textColor};
      --text-muted: #64748B;
      --border: #E2E8F0;
      --border-subtle: #F1F5F9;
      --radius-sm: 8px;
      --radius-md: 12px;
      --radius-lg: 16px;
      --radius-xl: 22px;
      --radius-full: 9999px;
      --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.05);
      --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.07);
      --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.08);
      --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
      --font-display: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
      --font-sans: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-tap-highlight-color: transparent;
    }

    body {
      font-family: var(--font-sans);
      background-color: var(--bg);
      color: var(--text);
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
      overflow-x: hidden;
      padding-bottom: calc(75px + env(safe-area-inset-bottom, 0px));
    }

    /* Device Simulator Shell for desktop preview */
    .viewport-container {
      width: 100%;
      min-height: 100vh;
      margin: 0 auto;
      transition: max-width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    body.simulator-mobile .viewport-container {
      max-width: 414px;
      margin: 24px auto;
      border-radius: 40px;
      box-shadow: 0 0 0 12px #1E293B, 0 25px 50px -12px rgba(0, 0, 0, 0.35);
      background: #FFFFFF;
      overflow: hidden;
      position: relative;
    }
    body.simulator-mobile .bottom-nav {
      max-width: 414px;
      left: 50%;
      transform: translateX(-50%);
      border-radius: 0 0 28px 28px;
    }

    /* Desktop View Switcher Tool Bar (visible on desktop only) */
    .dev-control-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #0F172A;
      color: #94A3B8;
      font-size: 0.75rem;
      padding: 8px 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    .dev-control-bar strong {
      color: #FFFFFF;
    }
    .dev-controls-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .view-toggle-btn {
      background: rgba(255, 255, 255, 0.1);
      color: #E2E8F0;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: var(--radius-full);
      padding: 4px 12px;
      font-size: 0.72rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
    }
    .view-toggle-btn:hover {
      background: var(--primary);
      color: white;
      border-color: var(--primary);
    }

    /* App Header / Navigation */
    header.app-header {
      position: sticky;
      top: 0;
      z-index: 50;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--border);
      box-shadow: var(--shadow-sm);
    }

    /* Desktop Header Layout */
    .header-desktop-row {
      max-width: 1200px;
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
      gap: 10px;
      text-decoration: none;
    }
    .brand-logo-icon {
      width: 38px;
      height: 38px;
      background: linear-gradient(135deg, var(--primary) 0%, #1E40AF 100%);
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-family: var(--font-display);
      font-weight: 800;
      font-size: 1.25rem;
      box-shadow: 0 4px 10px rgba(37, 99, 235, 0.28);
    }
    .brand-info h1 {
      font-family: var(--font-display);
      font-size: 1.2rem;
      font-weight: 800;
      color: var(--secondary);
      line-height: 1.1;
      letter-spacing: -0.5px;
    }
    .brand-info p {
      font-size: 0.7rem;
      color: var(--text-muted);
      font-weight: 500;
    }
    .desktop-search-wrapper {
      flex: 1;
      max-width: 480px;
      position: relative;
    }
    .desktop-search-input {
      width: 100%;
      background: var(--bg);
      border: 1.5px solid var(--border);
      border-radius: var(--radius-full);
      padding: 10px 18px 10px 42px;
      font-size: 0.88rem;
      outline: none;
      transition: all 0.2s;
    }
    .desktop-search-input:focus {
      border-color: var(--primary);
      background: white;
      box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.12);
    }
    .search-icon-svg {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted);
      width: 18px;
      height: 18px;
    }
    .btn-header-cta {
      background: var(--primary);
      color: white;
      border: none;
      border-radius: var(--radius-full);
      padding: 8px 18px;
      font-size: 0.85rem;
      font-weight: 700;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      box-shadow: 0 2px 8px rgba(37, 99, 235, 0.25);
      transition: all 0.2s;
    }
    .btn-header-cta:hover {
      background: var(--primary-dark);
      transform: translateY(-1px);
    }

    /* ========================================================================
       📱 Mobile Native App Header Shell
       ======================================================================== */
    .mobile-app-shell-header {
      display: none;
      padding: 12px 16px 14px;
      flex-direction: column;
      gap: 12px;
    }
    .mobile-top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .mobile-location-box {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
    }
    .mobile-pin-circle {
      width: 34px;
      height: 34px;
      background: var(--primary-light);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--primary);
      font-size: 1.1rem;
    }
    .mobile-location-texts {
      display: flex;
      flex-direction: column;
    }
    .mobile-location-label {
      font-size: 0.68rem;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .mobile-location-city {
      font-family: var(--font-display);
      font-size: 0.96rem;
      font-weight: 800;
      color: var(--secondary);
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .mobile-header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .mobile-icon-btn {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--bg);
      border: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      cursor: pointer;
      position: relative;
      text-decoration: none;
      color: var(--text);
    }
    .mobile-notif-dot {
      position: absolute;
      top: 6px;
      right: 6px;
      width: 8px;
      height: 8px;
      background: #EF4444;
      border-radius: 50%;
      border: 2px solid white;
    }

    /* Mobile Sticky Pill Search Bar (Native App Style) */
    .mobile-search-pill {
      display: flex;
      align-items: center;
      background: #FFFFFF;
      border: 1.5px solid #CBD5E1;
      border-radius: var(--radius-full);
      padding: 10px 16px;
      gap: 10px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
      cursor: pointer;
    }
    .mobile-search-pill:active {
      transform: scale(0.98);
      background: var(--bg);
    }
    .mobile-search-placeholder {
      flex: 1;
      font-size: 0.85rem;
      color: var(--text-muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .mobile-search-mic-icon {
      color: var(--primary);
      font-size: 0.95rem;
    }

    /* Main Page Content Container */
    main.page-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 32px;
    }

    /* Section Headers */
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 14px;
    }
    .section-title {
      font-family: var(--font-display);
      font-size: 1.35rem;
      font-weight: 800;
      color: var(--secondary);
      letter-spacing: -0.3px;
    }
    .section-subtitle {
      font-size: 0.82rem;
      color: var(--text-muted);
      margin-top: 2px;
    }
    .section-link {
      color: var(--primary);
      text-decoration: none;
      font-size: 0.82rem;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    /* ========================================================================
       1. Hero Banner Carousel (Native Touch Snap & Full Aspect Ratio)
       ======================================================================== */
    .hero-slider-wrap {
      display: flex;
      gap: 16px;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      scrollbar-width: none;
      -webkit-overflow-scrolling: touch;
      padding-bottom: 4px;
    }
    .hero-slider-wrap::-webkit-scrollbar {
      display: none;
    }
    .hero-banner-card {
      flex: 0 0 100%;
      scroll-snap-align: center;
      position: relative;
      border-radius: var(--radius-xl);
      overflow: hidden;
      min-height: 220px;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      padding: 24px;
      color: white;
      background-size: cover;
      background-position: center;
      box-shadow: var(--shadow-md);
      transition: transform 0.2s ease;
    }
    @media (min-width: 768px) {
      .hero-banner-card {
        flex: 0 0 calc(50% - 8px);
        min-height: 250px;
      }
    }
    .hero-banner-card:active {
      transform: scale(0.99);
    }
    .hero-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(15, 23, 42, 0.15) 0%, rgba(15, 23, 42, 0.9) 100%);
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
      font-size: 0.68rem;
      font-weight: 800;
      padding: 3px 9px;
      border-radius: var(--radius-full);
      margin-bottom: 6px;
      letter-spacing: 0.4px;
    }
    .hero-title {
      font-family: var(--font-display);
      font-size: 1.25rem;
      font-weight: 800;
      line-height: 1.2;
      margin-bottom: 4px;
    }
    .hero-subtitle {
      font-size: 0.8rem;
      opacity: 0.9;
      margin-bottom: 12px;
      max-width: 90%;
    }
    .hero-cta-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #FFFFFF;
      color: #0F172A;
      font-weight: 700;
      font-size: 0.8rem;
      padding: 7px 16px;
      border-radius: var(--radius-full);
      text-decoration: none;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }

    /* Carousel Pagination Dots (App Style) */
    .carousel-dots-row {
      display: flex;
      justify-content: center;
      gap: 6px;
      margin-top: 10px;
    }
    .carousel-dot {
      width: 7px;
      height: 7px;
      border-radius: var(--radius-full);
      background: #CBD5E1;
      transition: all 0.25s;
    }
    .carousel-dot.active {
      width: 22px;
      background: var(--primary);
    }

    /* ========================================================================
       2. Quick Action App Icons (Circle App Grid)
       ======================================================================== */
    .quick-actions-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
    }
    .quick-action-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      text-decoration: none;
      color: var(--text);
      position: relative;
    }
    .quick-action-item:active .quick-action-circle {
      transform: scale(0.92);
    }
    .quick-action-circle {
      width: 54px;
      height: 54px;
      border-radius: 50%;
      background: white;
      border: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.35rem;
      box-shadow: var(--shadow-sm);
      margin-bottom: 6px;
      transition: all 0.15s ease;
    }
    .quick-action-label {
      font-size: 0.72rem;
      font-weight: 700;
      color: var(--secondary);
      line-height: 1.2;
    }
    .quick-action-badge {
      position: absolute;
      top: -2px;
      right: 12px;
      background: #EF4444;
      color: white;
      font-size: 0.6rem;
      font-weight: 800;
      padding: 2px 5px;
      border-radius: var(--radius-full);
      border: 1.5px solid white;
    }

    /* ========================================================================
       3. Trending Search Chips
       ======================================================================== */
    .chips-horizontal-scroll {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      scrollbar-width: none;
      -webkit-overflow-scrolling: touch;
      padding-bottom: 2px;
    }
    .chips-horizontal-scroll::-webkit-scrollbar {
      display: none;
    }
    .app-search-chip {
      background: white;
      border: 1px solid var(--border);
      color: var(--text);
      font-size: 0.78rem;
      font-weight: 600;
      padding: 6px 14px;
      border-radius: var(--radius-full);
      text-decoration: none;
      white-space: nowrap;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s;
    }
    .app-search-chip:active {
      transform: scale(0.95);
      background: var(--primary-light);
      border-color: var(--primary);
    }

    /* ========================================================================
       4. Categories (App-like Squircle Grid)
       ======================================================================== */
    .categories-app-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
    }
    @media (min-width: 768px) {
      .categories-app-grid {
        grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
        gap: 16px;
      }
    }
    .category-app-card {
      background: white;
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 12px 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      text-decoration: none;
      color: var(--text);
      box-shadow: var(--shadow-sm);
      transition: all 0.15s;
    }
    .category-app-card:active {
      transform: scale(0.95);
      border-color: var(--primary);
    }
    .category-squircle-img {
      width: 52px;
      height: 52px;
      border-radius: var(--radius-md);
      object-fit: cover;
      margin-bottom: 8px;
      background: #F1F5F9;
    }
    .category-app-title {
      font-size: 0.76rem;
      font-weight: 700;
      line-height: 1.2;
      color: var(--secondary);
      margin-bottom: 2px;
    }
    .category-app-count {
      font-size: 0.66rem;
      color: var(--text-muted);
      font-weight: 500;
    }

    /* ========================================================================
       5. Segmented Control Tabs (iOS/Android Native App Style)
       ======================================================================== */
    .segmented-control-bar {
      display: flex;
      background: #E2E8F0;
      padding: 4px;
      border-radius: var(--radius-full);
      gap: 4px;
      margin-bottom: 14px;
    }
    .segment-tab-pill {
      flex: 1;
      background: transparent;
      border: none;
      border-radius: var(--radius-full);
      padding: 8px 12px;
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--text-muted);
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .segment-tab-pill.active {
      background: white;
      color: var(--secondary);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    }
    .segment-app-card {
      display: none;
      background: white;
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      padding: 18px;
      box-shadow: var(--shadow-sm);
    }
    .segment-app-card.active {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .segment-badge-app {
      display: inline-block;
      align-self: flex-start;
      background: #FEF3C7;
      color: #92400E;
      font-size: 0.68rem;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: var(--radius-sm);
    }
    .segment-features-ul {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .segment-features-ul li {
      font-size: 0.82rem;
      display: flex;
      align-items: center;
      gap: 8px;
      color: #334155;
    }
    .segment-features-ul li::before {
      content: "✓";
      color: #10B981;
      font-weight: 800;
    }

    /* ========================================================================
       6. Featured Machines (Horizontal Snap Carousel on Mobile)
       ======================================================================== */
    .featured-machines-snap-row {
      display: flex;
      gap: 14px;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      scrollbar-width: none;
      -webkit-overflow-scrolling: touch;
      padding-bottom: 6px;
    }
    .featured-machines-snap-row::-webkit-scrollbar {
      display: none;
    }
    @media (min-width: 768px) {
      .featured-machines-snap-row {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        overflow-x: visible;
      }
    }
    .machine-app-card {
      flex: 0 0 250px;
      scroll-snap-align: start;
      background: white;
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: var(--shadow-sm);
      transition: transform 0.15s;
    }
    .machine-app-card:active {
      transform: scale(0.97);
    }
    .machine-app-img-wrap {
      position: relative;
      height: 140px;
      background: #F1F5F9;
    }
    .machine-app-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .machine-pill-badge {
      position: absolute;
      top: 8px;
      left: 8px;
      background: rgba(15, 23, 42, 0.82);
      backdrop-filter: blur(4px);
      color: white;
      font-size: 0.65rem;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: var(--radius-full);
    }
    .machine-rating-bubble {
      position: absolute;
      bottom: 8px;
      right: 8px;
      background: white;
      color: #0F172A;
      font-size: 0.7rem;
      font-weight: 800;
      padding: 2px 7px;
      border-radius: var(--radius-full);
      box-shadow: var(--shadow-sm);
    }
    .machine-app-content {
      padding: 12px;
      display: flex;
      flex-direction: column;
      flex: 1;
    }
    .machine-app-cat {
      font-size: 0.68rem;
      color: var(--primary);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      margin-bottom: 2px;
    }
    .machine-app-name {
      font-family: var(--font-display);
      font-size: 0.98rem;
      font-weight: 800;
      color: var(--secondary);
      line-height: 1.2;
      margin-bottom: 6px;
    }
    .machine-app-footer {
      margin-top: auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid var(--border-subtle);
      padding-top: 10px;
    }
    .machine-price-big {
      font-family: var(--font-display);
      font-size: 1.1rem;
      font-weight: 800;
      color: var(--secondary);
    }
    .btn-app-rent {
      background: var(--primary);
      color: white;
      text-decoration: none;
      font-size: 0.78rem;
      font-weight: 700;
      padding: 6px 14px;
      border-radius: var(--radius-full);
      box-shadow: 0 2px 6px rgba(37, 99, 235, 0.25);
    }

    /* ========================================================================
       7. Promotions (Ticket Notch Card Style)
       ======================================================================== */
    .promos-snap-row {
      display: flex;
      gap: 12px;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      scrollbar-width: none;
      -webkit-overflow-scrolling: touch;
      padding-bottom: 4px;
    }
    .promos-snap-row::-webkit-scrollbar {
      display: none;
    }
    .ticket-promo-card {
      flex: 0 0 260px;
      scroll-snap-align: start;
      background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%);
      border: 1.5px dashed #93C5FD;
      border-radius: var(--radius-lg);
      padding: 14px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 10px;
      position: relative;
    }
    .ticket-promo-card:active {
      transform: scale(0.98);
    }
    .ticket-code-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: white;
      border-radius: var(--radius-sm);
      padding: 6px 10px;
    }
    .ticket-coupon {
      font-family: monospace;
      font-weight: 800;
      font-size: 0.9rem;
      color: #1D4ED8;
      letter-spacing: 0.8px;
    }
    .ticket-copy-btn {
      background: transparent;
      border: none;
      color: var(--primary);
      font-weight: 700;
      font-size: 0.75rem;
      cursor: pointer;
    }

    /* ========================================================================
       8. Trust Markers (Compact App Row)
       ======================================================================== */
    .trust-app-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }
    @media (min-width: 768px) {
      .trust-app-grid {
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
      }
    }
    .trust-app-box {
      background: white;
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .trust-app-icon {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #DCFCE7;
      color: #15803D;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.9rem;
      font-weight: 800;
    }
    .trust-app-title {
      font-family: var(--font-display);
      font-size: 0.85rem;
      font-weight: 800;
      color: var(--secondary);
    }
    .trust-app-desc {
      font-size: 0.72rem;
      color: var(--text-muted);
      line-height: 1.3;
    }

    /* ========================================================================
       9. Testimonials (Swipe Cards)
       ======================================================================== */
    .testimonials-snap-row {
      display: flex;
      gap: 14px;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      scrollbar-width: none;
      -webkit-overflow-scrolling: touch;
      padding-bottom: 4px;
    }
    .testimonials-snap-row::-webkit-scrollbar {
      display: none;
    }
    .testimonial-app-card {
      flex: 0 0 280px;
      scroll-snap-align: start;
      background: white;
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 16px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 12px;
      box-shadow: var(--shadow-sm);
    }

    /* ========================================================================
       10. Partner CTA Card
       ======================================================================== */
    .partner-app-card {
      background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
      border-radius: var(--radius-xl);
      padding: 24px 20px;
      color: white;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    /* ========================================================================
       📱 Fixed Native Bottom Navigation Bar
       ======================================================================== */
    nav.bottom-nav {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: rgba(255, 255, 255, 0.94);
      backdrop-filter: blur(20px);
      border-top: 1px solid var(--border);
      display: flex;
      justify-content: space-around;
      align-items: center;
      padding: 8px 0 calc(8px + env(safe-area-inset-bottom, 0px));
      z-index: 60;
      box-shadow: 0 -4px 15px rgba(0, 0, 0, 0.05);
    }
    .nav-tab-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-decoration: none;
      color: #94A3B8;
      font-size: 0.68rem;
      font-weight: 700;
      gap: 3px;
      transition: all 0.15s ease;
      position: relative;
    }
    .nav-tab-item.active {
      color: var(--primary);
    }
    .nav-tab-icon {
      font-size: 1.25rem;
      line-height: 1;
    }
    .nav-tab-dot {
      width: 4px;
      height: 4px;
      background: var(--primary);
      border-radius: 50%;
      margin-top: 1px;
    }

    /* Interactive Native App Toast Alert */
    .app-toast {
      position: fixed;
      bottom: calc(75px + env(safe-area-inset-bottom, 12px));
      left: 50%;
      transform: translateX(-50%) translateY(100px);
      background: rgba(15, 23, 42, 0.94);
      color: white;
      padding: 10px 20px;
      border-radius: var(--radius-full);
      font-size: 0.8rem;
      font-weight: 700;
      z-index: 100;
      box-shadow: var(--shadow-xl);
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      align-items: center;
      gap: 8px;
      pointer-events: none;
    }
    .app-toast.visible {
      transform: translateX(-50%) translateY(0);
    }

    /* ========================================================================
       📱 Mobile View Breakpoint (< 768px): FULL NATIVE APP STYLING
       ======================================================================== */
    @media (max-width: 767px) {
      body {
        background: #F1F5F9;
      }
      .dev-control-bar {
        display: none; /* Hide dev bar on actual phones */
      }
      .header-desktop-row {
        display: none !important;
      }
      .mobile-app-shell-header {
        display: flex !important;
      }
      main.page-content {
        padding: 14px 14px 24px;
        gap: 22px;
      }
      .hero-slider-wrap {
        margin: 0 -14px;
        padding: 0 14px 6px;
      }
      .hero-banner-card {
        flex: 0 0 calc(100vw - 28px);
        min-height: 195px;
        padding: 16px;
        border-radius: var(--radius-lg);
      }
      .hero-title {
        font-size: 1.15rem;
      }
      .chips-horizontal-scroll {
        margin: 0 -14px;
        padding: 0 14px 4px;
      }
      .featured-machines-snap-row {
        margin: 0 -14px;
        padding: 0 14px 8px;
      }
      .promos-snap-row {
        margin: 0 -14px;
        padding: 0 14px 6px;
      }
      .testimonials-snap-row {
        margin: 0 -14px;
        padding: 0 14px 6px;
      }
    }
  </style>
</head>
<body>

  <!-- Dev Control Bar (Visible on Desktop for Live Switch) -->
  <div class="dev-control-bar">
    <div>
      <strong>Server-Driven UI (SDUI)</strong>: Backend drives layout &amp; design tokens for App &amp; Web
    </div>
    <div class="dev-controls-right">
      <span>Screen: <code>${escapeHtml(screen.screenId)} v${escapeHtml(screen.version)}</code></span>
      <button class="view-toggle-btn" onclick="toggleDeviceSimulator()" id="toggle-device-btn">
        <span>📱 Test Mobile App View</span>
      </button>
      <a href="/api/user/home?format=sdui" class="view-toggle-btn" style="text-decoration: none;">
        <span>⚡ SDUI JSON</span>
      </a>
    </div>
  </div>

  <div class="viewport-container" id="app-viewport">

    <!-- Header Component -->
    <header class="app-header">
      
      <!-- 🖥️ Desktop Header (>= 768px) -->
      <div class="header-desktop-row">
        <div style="display: flex; align-items: center; gap: 16px;">
          <a href="/api/user/home/preview" class="brand-group">
            <div class="brand-logo-icon">E</div>
            <div class="brand-info">
              <h1>${escapeHtml(appBar.brandTitle)}</h1>
              <p>${escapeHtml(appBar.brandTagline)}</p>
            </div>
          </a>

          <div style="display: flex; align-items: center; gap: 6px; background: #F1F5F9; border: 1px solid var(--border); padding: 6px 14px; border-radius: var(--radius-full); font-size: 0.8rem; cursor: pointer;" onclick="showToast('📍 Delivering to ' + '${escapeHtml(appBar.locationSelector.currentCity)}')">
            <span style="color: #10B981;">●</span>
            <strong>${escapeHtml(appBar.locationSelector.currentCity)}</strong>
            <span style="font-size: 0.7rem; color: var(--text-muted);">▾</span>
          </div>
        </div>

        <div class="desktop-search-wrapper">
          <svg class="search-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            class="desktop-search-input"
            placeholder="${escapeHtml(appBar.searchBar.placeholder)}"
            id="desktop-search-input"
          >
        </div>

        <div style="display: flex; align-items: center; gap: 10px;">
          <a href="#" class="btn-header-cta" onclick="showToast('Signed in as Guest'); return false;">
            <span>${escapeHtml(appBar.userAction.title)}</span>
          </a>
        </div>
      </div>

      <!-- 📱 Mobile Native App Header Shell (< 768px or simulator mode) -->
      <div class="mobile-app-shell-header">
        <div class="mobile-top-bar">
          <div class="mobile-location-box" onclick="showToast('📍 Change Delivery Location')">
            <div class="mobile-pin-circle">📍</div>
            <div class="mobile-location-texts">
              <span class="mobile-location-label">${escapeHtml(appBar.locationSelector.label)}</span>
              <span class="mobile-location-city">
                ${escapeHtml(appBar.locationSelector.currentCity)}
                <span style="font-size: 0.7rem;">▾</span>
              </span>
            </div>
          </div>

          <div class="mobile-header-actions">
            <a href="#" class="mobile-icon-btn" onclick="showToast('🔔 No new notifications'); return false;">
              <span>🔔</span>
              <span class="mobile-notif-dot"></span>
            </a>
            <a href="#" class="mobile-icon-btn" style="background: var(--primary); color: white; border: none;" onclick="showToast('👤 Account Profile'); return false;">
              <span>👤</span>
            </a>
          </div>
        </div>

        <!-- Sticky Mobile Search Pill (Native Blinkit/Swiggy style) -->
        <div class="mobile-search-pill" onclick="document.getElementById('mobile-search-prompt').focus()">
          <span style="font-size: 1rem;">🔍</span>
          <span class="mobile-search-placeholder" id="mobile-search-prompt">Search JCB, excavators, mixers...</span>
          <span class="mobile-search-mic-icon">🎙️</span>
        </div>
      </div>
    </header>

    <!-- Page Content -->
    <main class="page-content">

      <!-- 1. Hero Banners Carousel -->
      ${
        heroSection && heroSection.data && (heroSection.data as any).banners
          ? `
        <section id="section-hero">
          <div class="hero-slider-wrap" id="hero-slider">
            ${(heroSection.data as any).banners
              .map(
                (b: any) => `
              <div class="hero-banner-card" style="background-image: url('${escapeHtml(b.imageUrl)}'); background-color: ${b.backgroundColor || '#1E3A8A'};">
                <div class="hero-overlay"></div>
                <div class="hero-content">
                  <span class="hero-tag">${escapeHtml(b.tag)}</span>
                  <h2 class="hero-title">${escapeHtml(b.title)}</h2>
                  <p class="hero-subtitle">${escapeHtml(b.subtitle)}</p>
                  <a href="${escapeHtml(b.cta.action.target)}" class="hero-cta-btn" onclick="showToast('Navigating to ' + '${escapeHtml(b.cta.text)}');">
                    ${escapeHtml(b.cta.text)} →
                  </a>
                </div>
              </div>
            `,
              )
              .join('')}
          </div>
          <div class="carousel-dots-row">
            <span class="carousel-dot active"></span>
            <span class="carousel-dot"></span>
            <span class="carousel-dot"></span>
            <span class="carousel-dot"></span>
          </div>
        </section>
      `
          : ''
      }

      <!-- 2. Quick Action Circular Grid (Native App Style) -->
      ${
        quickActionsSection && quickActionsSection.data && (quickActionsSection.data as any).actions
          ? `
        <section id="section-quick-actions">
          <div class="quick-actions-grid">
            ${(quickActionsSection.data as any).actions
              .map(
                (qa: any, idx: number) => {
                  const icons = ['🚜', '👷', '🛠️', '🏢'];
                  return `
                <a href="${escapeHtml(qa.action.target)}" class="quick-action-item" onclick="showToast('Selected: ' + '${escapeHtml(qa.label)}'); return false;">
                  ${qa.badge ? `<span class="quick-action-badge">${escapeHtml(qa.badge)}</span>` : ''}
                  <div class="quick-action-circle">${icons[idx % icons.length]}</div>
                  <span class="quick-action-label">${escapeHtml(qa.label)}</span>
                </a>
              `;
                },
              )
              .join('')}
          </div>
        </section>
      `
          : ''
      }

      <!-- 3. Trending Search Chips (Horizontal Pill Scroll) -->
      ${
        searchChipsSection && searchChipsSection.data && (searchChipsSection.data as any).chips
          ? `
        <section id="section-search-chips">
          <div class="chips-horizontal-scroll">
            ${(searchChipsSection.data as any).chips
              .map(
                (chip: any) => `
              <a href="${escapeHtml(chip.action.target)}" class="app-search-chip" onclick="showToast('Filtering: ' + '${escapeHtml(chip.text)}'); return false;">
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

      <!-- 4. Category Grid (Squircle App Icons) -->
      ${
        categoriesSection && categoriesSection.data && (categoriesSection.data as any).categories
          ? `
        <section id="section-categories">
          <div class="section-header">
            <div>
              <h2 class="section-title">${escapeHtml(categoriesSection.header?.title || 'Categories')}</h2>
              <p class="section-subtitle">${escapeHtml(categoriesSection.header?.subtitle || 'Verified machinery fleets')}</p>
            </div>
            <a href="/categories" class="section-link">${escapeHtml(categoriesSection.header?.action?.text || 'See All')} →</a>
          </div>
          <div class="categories-app-grid">
            ${(categoriesSection.data as any).categories
              .map(
                (cat: any) => `
              <a href="${escapeHtml(cat.action.target)}" class="category-app-card" onclick="showToast('Category: ' + '${escapeHtml(cat.name)}'); return false;">
                <img src="${escapeHtml(cat.imageUrl || cat.iconUrl || 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=150&q=80')}" alt="${escapeHtml(cat.name)}" class="category-squircle-img">
                <span class="category-app-title">${escapeHtml(cat.name)}</span>
                <span class="category-app-count">${escapeHtml(String(cat.machinesCount || 0))} machines</span>
              </a>
            `,
              )
              .join('')}
          </div>
        </section>
      `
          : ''
      }

      <!-- 5. Segmented Control Tabs (iOS/Android Native Style) -->
      ${
        segmentsSection && segmentsSection.data && (segmentsSection.data as any).segments
          ? `
        <section id="section-segments">
          <div class="section-header">
            <div>
              <h2 class="section-title">${escapeHtml(segmentsSection.header?.title || 'Project Scale')}</h2>
              <p class="section-subtitle">${escapeHtml(segmentsSection.header?.subtitle || 'Select equipment scale')}</p>
            </div>
          </div>
          
          <div class="segmented-control-bar">
            ${(segmentsSection.data as any).segments
              .map(
                (seg: any, idx: number) => `
              <button class="segment-tab-pill ${idx === 0 ? 'active' : ''}" onclick="switchSegmentTab('${escapeHtml(seg.segment)}')">
                ${escapeHtml(seg.segment === 'LIGHT' ? 'Home & DIY' : seg.segment === 'HEAVY' ? 'Commercial' : 'Support')}
              </button>
            `,
              )
              .join('')}
          </div>

          ${(segmentsSection.data as any).segments
            .map(
              (seg: any, idx: number) => `
            <div class="segment-app-card ${idx === 0 ? 'active' : ''}" id="segment-panel-${escapeHtml(seg.segment)}">
              <span class="segment-badge-app">${escapeHtml(seg.badge)}</span>
              <h3 style="font-family: var(--font-display); font-size: 1.15rem; font-weight: 800; color: var(--secondary);">${escapeHtml(seg.title)}</h3>
              <p style="font-size: 0.82rem; color: var(--text-muted);">${escapeHtml(seg.description)}</p>
              
              <ul class="segment-features-ul">
                ${(seg.keyFeatures || []).map((f: string) => `<li>${escapeHtml(f)}</li>`).join('')}
              </ul>

              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px; padding-top: 10px; border-top: 1px solid var(--border);">
                <div>
                  <div style="font-size: 0.68rem; color: var(--text-muted); font-weight: 700;">STARTING RATE</div>
                  <div style="font-family: var(--font-display); font-size: 1.1rem; font-weight: 800; color: var(--secondary);">
                    ${seg.startingDailyRateInr ? `₹${escapeHtml(String(seg.startingDailyRateInr))}/day` : 'On Request'}
                  </div>
                </div>
                <a href="${escapeHtml(seg.action.target)}" class="btn-app-rent">
                  Explore Fleet →
                </a>
              </div>
            </div>
          `,
            )
            .join('')}
        </section>
      `
          : ''
      }

      <!-- 6. Featured Equipment (Horizontal Snap Carousel on Mobile) -->
      ${
        featuredSection && featuredSection.data && (featuredSection.data as any).machines
          ? `
        <section id="section-featured">
          <div class="section-header">
            <div>
              <h2 class="section-title">${escapeHtml(featuredSection.header?.title || 'Featured Equipment')}</h2>
              <p class="section-subtitle">${escapeHtml(featuredSection.header?.subtitle || 'Pre-inspected machines ready to mobilize')}</p>
            </div>
            <a href="/machines" class="section-link">${escapeHtml(featuredSection.header?.action?.text || 'All')} →</a>
          </div>
          
          <div class="featured-machines-snap-row">
            ${(featuredSection.data as any).machines
              .map(
                (m: any) => `
              <div class="machine-app-card">
                <div class="machine-app-img-wrap">
                  <img src="${escapeHtml(m.imageUrl || 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=400&q=80')}" alt="${escapeHtml(m.name)}" class="machine-app-img">
                  <span class="machine-pill-badge">${escapeHtml(m.tag)}</span>
                  <span class="machine-rating-bubble">⭐ ${escapeHtml(String(m.rating))}</span>
                </div>
                <div class="machine-app-content">
                  <span class="machine-app-cat">${escapeHtml(m.categoryName)}</span>
                  <h3 class="machine-app-name">${escapeHtml(m.name)}</h3>
                  <div class="machine-app-footer">
                    <div>
                      <span class="machine-price-big">₹${escapeHtml(String(m.startingDailyRateInr || m.startingHourlyRateInr || 0))}</span>
                      <span style="font-size: 0.68rem; color: var(--text-muted); font-weight: 600;">${m.startingDailyRateInr ? '/day' : '/hr'}</span>
                    </div>
                    <a href="${escapeHtml(m.action.target)}" class="btn-app-rent" onclick="showToast('⚡ Booked ' + '${escapeHtml(m.name)}'); return false;">
                      + Rent
                    </a>
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

      <!-- 7. Active Promotions (Ticket Notch Card Style) -->
      ${
        promoSection && promoSection.data && (promoSection.data as any).promotions
          ? `
        <section id="section-promos">
          <div class="section-header">
            <div>
              <h2 class="section-title">${escapeHtml(promoSection.header?.title || 'Rental Coupons')}</h2>
              <p class="section-subtitle">${escapeHtml(promoSection.header?.subtitle || 'Instant discounts applied at checkout')}</p>
            </div>
          </div>
          <div class="promos-snap-row">
            ${(promoSection.data as any).promotions
              .map(
                (p: any) => `
              <div class="ticket-promo-card">
                <div>
                  <span style="background: var(--primary); color: white; font-size: 0.62rem; font-weight: 800; padding: 2px 7px; border-radius: var(--radius-full); display: inline-block; margin-bottom: 4px;">
                    ${escapeHtml(p.badge || 'PROMO')}
                  </span>
                  <h4 style="font-family: var(--font-display); font-size: 0.98rem; font-weight: 800; color: #1E3A8A; line-height: 1.2;">${escapeHtml(p.title)}</h4>
                  <p style="font-size: 0.74rem; color: #2563EB; margin-top: 2px;">${escapeHtml(p.description)}</p>
                </div>
                <div class="ticket-code-row">
                  <span class="ticket-coupon">${escapeHtml(p.code)}</span>
                  <button class="ticket-copy-btn" onclick="copyCouponCode('${escapeHtml(p.code)}')">
                    TAP TO COPY
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

      <!-- 8. Platform Trust Indicators -->
      ${
        trustSection && trustSection.data && (trustSection.data as any).markers
          ? `
        <section id="section-trust">
          <div class="section-header">
            <div>
              <h2 class="section-title">${escapeHtml(trustSection.header?.title || 'Why EquipShare?')}</h2>
              <p class="section-subtitle">${escapeHtml(trustSection.header?.subtitle || 'Zero hassle equipment rentals')}</p>
            </div>
          </div>
          <div class="trust-app-grid">
            ${(trustSection.data as any).markers
              .map(
                (t: any) => `
              <div class="trust-app-box">
                <div class="trust-app-icon">✓</div>
                <h4 class="trust-app-title">${escapeHtml(t.title)}</h4>
                <p class="trust-app-desc">${escapeHtml(t.description)}</p>
              </div>
            `,
              )
              .join('')}
          </div>
        </section>
      `
          : ''
      }

      <!-- 9. Testimonials (Swipe Cards) -->
      ${
        testimonialsSection && testimonialsSection.data && (testimonialsSection.data as any).testimonials
          ? `
        <section id="section-testimonials">
          <div class="section-header">
            <div>
              <h2 class="section-title">${escapeHtml(testimonialsSection.header?.title || 'Contractor Reviews')}</h2>
              <p class="section-subtitle">${escapeHtml(testimonialsSection.header?.subtitle || 'Verified feedback from site engineers')}</p>
            </div>
          </div>
          <div class="testimonials-snap-row">
            ${(testimonialsSection.data as any).testimonials
              .map(
                (tm: any) => `
              <div class="testimonial-app-card">
                <p style="font-size: 0.8rem; color: #334155; font-style: italic; line-height: 1.4;">“${escapeHtml(tm.content)}”</p>
                <div style="display: flex; align-items: center; gap: 10px;">
                  <img src="${escapeHtml(tm.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80')}" alt="${escapeHtml(tm.authorName)}" style="width: 38px; height: 38px; border-radius: 50%; object-fit: cover;">
                  <div>
                    <h4 style="font-family: var(--font-display); font-size: 0.85rem; font-weight: 800; color: var(--secondary);">${escapeHtml(tm.authorName)}</h4>
                    <p style="font-size: 0.7rem; color: var(--text-muted);">${escapeHtml(tm.roleOrCompany)}</p>
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

      <!-- 10. Partner Onboarding Card -->
      ${
        ctaSection && ctaSection.data
          ? `
        <section id="section-partner">
          <div class="partner-app-card">
            <div>
              <span style="background: rgba(245, 158, 11, 0.2); color: #FCD34D; font-size: 0.68rem; font-weight: 800; padding: 2px 8px; border-radius: var(--radius-full); display: inline-block; margin-bottom: 6px;">
                ${escapeHtml((ctaSection.data as any).badge || 'EARN REVENUE')}
              </span>
              <h3 style="font-family: var(--font-display); font-size: 1.25rem; font-weight: 800;">${escapeHtml((ctaSection.data as any).title)}</h3>
              <p style="color: #94A3B8; font-size: 0.82rem; margin-top: 4px;">${escapeHtml((ctaSection.data as any).subtitle)}</p>
            </div>
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
              <a href="${escapeHtml((ctaSection.data as any).primaryAction.target)}" class="btn-header-cta" style="background: var(--accent); color: #78350F; font-size: 0.8rem; padding: 8px 16px;">
                ${escapeHtml((ctaSection.data as any).primaryAction.label)} →
              </a>
              <a href="tel:${escapeHtml((ctaSection.data as any).secondaryAction.target)}" class="btn-header-cta" style="background: rgba(255, 255, 255, 0.1); color: white; border: 1px solid rgba(255, 255, 255, 0.2); font-size: 0.8rem; padding: 8px 16px;">
                Call Partner Desk
              </a>
            </div>
          </div>
        </section>
      `
          : ''
      }

    </main>

    <!-- 📱 Fixed Mobile Native App Bottom Navigation Bar -->
    <nav class="bottom-nav">
      ${bottomNavigation
        .map(
          (nav) => {
            const icons: Record<string, string> = {
              home: '🏠',
              grid: '📂',
              clock: '⏱️',
              'help-circle': '💬',
            };
            const iconChar = icons[nav.icon] || '📌';
            return `
        <a href="${escapeHtml(nav.action.target)}" class="nav-tab-item ${nav.isActive ? 'active' : ''}" onclick="setActiveNav(this, '${escapeHtml(nav.label)}'); return false;">
          <span class="nav-tab-icon">${iconChar}</span>
          <span>${escapeHtml(nav.label)}</span>
          ${nav.isActive ? '<span class="nav-tab-dot"></span>' : ''}
        </a>
      `;
          },
        )
        .join('')}
    </nav>

  </div>

  <!-- Native App Toast Notification (pops up on actions) -->
  <div class="app-toast" id="app-toast-element">
    <span id="toast-icon">✓</span>
    <span id="toast-message">Action successful</span>
  </div>

  <script>
    // Tab switching for segment control
    function switchSegmentTab(segment) {
      document.querySelectorAll('.segment-tab-pill').forEach(btn => btn.classList.remove('active'));
      document.querySelectorAll('.segment-app-card').forEach(panel => panel.classList.remove('active'));

      event.target.classList.add('active');
      const targetPanel = document.getElementById('segment-panel-' + segment);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }
    }

    // Native App Bottom Nav Active State
    function setActiveNav(element, label) {
      document.querySelectorAll('.nav-tab-item').forEach(el => {
        el.classList.remove('active');
        const dot = el.querySelector('.nav-tab-dot');
        if (dot) dot.remove();
      });
      element.classList.add('active');
      const dot = document.createElement('span');
      dot.className = 'nav-tab-dot';
      element.appendChild(dot);
      showToast('Navigating to ' + label);
    }

    // Copy coupon code with toast feedback
    function copyCouponCode(code) {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(code);
      }
      showToast('Coupon ' + code + ' copied to clipboard!');
    }

    // Native App Toast Display
    let toastTimeout = null;
    function showToast(message, icon) {
      const toast = document.getElementById('app-toast-element');
      const msgSpan = document.getElementById('toast-message');
      const iconSpan = document.getElementById('toast-icon');
      if (!toast) return;

      msgSpan.innerText = message;
      iconSpan.innerText = icon || '✓';
      toast.classList.add('visible');

      clearTimeout(toastTimeout);
      toastTimeout = setTimeout(() => {
        toast.classList.remove('visible');
      }, 2500);
    }

    // Toggle Mobile App Simulator frame on desktop
    function toggleDeviceSimulator() {
      const isMobile = document.body.classList.toggle('simulator-mobile');
      const btn = document.getElementById('toggle-device-btn');
      if (btn) {
        btn.innerHTML = isMobile ? '<span>💻 Switch to Desktop View</span>' : '<span>📱 Test Mobile App View</span>';
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
