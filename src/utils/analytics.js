// Analytics Event Tracking Utility (Google Analytics + PostHog)
import posthog from 'posthog-js';

// Initialize PostHog
if (typeof window !== 'undefined') {
  posthog.init('phc_abdQpEqH7rzv22P0hZc3Ztwa3rvJ2luxP8d2P3RrNcs', {
    api_host: 'https://us.i.posthog.com',
    person_profiles: 'identified_only',
    autocapture: true, // Automatically capture clicks, submits, and more
    capture_pageview: true, // Automatically capture page views
    capture_pageleave: true // Capture when users leave the page
  });
}

// Helper function to check if gtag is available
const isGtagAvailable = () => {
  return typeof window !== 'undefined' && typeof window.gtag === 'function';
};

// Track custom events (sends to both GA and PostHog)
export const trackEvent = (eventName, parameters = {}) => {
  // Send to Google Analytics
  if (isGtagAvailable()) {
    window.gtag('event', eventName, parameters);
    console.log('GA Event:', eventName, parameters); // Debug logging
  }

  // Send to PostHog
  if (typeof window !== 'undefined') {
    posthog.capture(eventName, parameters);
    console.log('PostHog Event:', eventName, parameters); // Debug logging
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

  // PostHog (automatically captured with capture_pageview: true, but can manually track too)
  if (typeof window !== 'undefined') {
    posthog.capture('$pageview', { page_path: pageName, page_title: pageName });
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

// Export PostHog instance for direct usage if needed
export { posthog };