// Analytics Event Tracking Utility (Google Analytics + PostHog)

// Helper function to check if gtag is available
const isGtagAvailable = () => {
  return typeof window !== 'undefined' && typeof window.gtag === 'function';
};

// Helper function to check if PostHog is available
const isPostHogAvailable = () => {
  return typeof window !== 'undefined' && typeof window.posthog !== 'undefined' && window.posthog;
};

// Track custom events (sends to both GA and PostHog)
export const trackEvent = (eventName, parameters = {}) => {
  // Send to Google Analytics
  if (isGtagAvailable()) {
    window.gtag('event', eventName, parameters);
    console.log('GA Event:', eventName, parameters); // Debug logging
  }

  // Send to PostHog
  if (isPostHogAvailable()) {
    try {
      window.posthog.capture(eventName, parameters);
      console.log('PostHog Event:', eventName, parameters); // Debug logging
    } catch (error) {
      console.error('PostHog error:', error);
    }
  }
};

// Track button clicks
export const trackButtonClick = (buttonName, location = 'unknown') => {
  trackEvent('button_click', {
    button_name: buttonName,
    location: location,
    timestamp: new Date().toISOString()
  });
};

// Track demo interactions
export const trackDemoAction = (action, details = {}) => {
  trackEvent('demo_interaction', {
    action: action,
    ...details,
    timestamp: new Date().toISOString()
  });
};

// Track waitlist signups
export const trackWaitlistSignup = (email, source = 'unknown') => {
  // Only track that a signup occurred, not the actual email
  trackEvent('waitlist_signup', {
    source: source,
    timestamp: new Date().toISOString()
  });
};

// Track page views
export const trackPageView = (pageName) => {
  // Google Analytics
  if (isGtagAvailable()) {
    window.gtag('config', 'G-57EJ7EW6NP', {
      page_path: pageName,
      page_title: pageName
    });
  }

  // PostHog
  if (isPostHogAvailable()) {
    try {
      window.posthog.capture('$pageview', {
        page_path: pageName,
        page_title: pageName
      });
    } catch (error) {
      console.error('PostHog pageview error:', error);
    }
  }
};

// Track chat session metrics (privacy-conscious)
export const trackChatMetrics = (metrics) => {
  // Only track aggregated metrics, not actual content
  trackEvent('chat_metrics', {
    message_count: metrics.messageCount || 0,
    session_duration: metrics.duration || 0,
    topics_discussed: metrics.topicCount || 0,
    // Don't track actual message content
    timestamp: new Date().toISOString()
  });
};

// Track navigation clicks
export const trackNavigation = (destination) => {
  trackEvent('navigation', {
    destination: destination,
    timestamp: new Date().toISOString()
  });
};

// Track scroll depth
export const trackScrollDepth = (depth) => {
  trackEvent('scroll_depth', {
    depth: depth,
    timestamp: new Date().toISOString()
  });
};