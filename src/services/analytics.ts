// Simple analytics service to track user events

type EventType = 'search' | 'click' | 'favorite' | 'view_product' | 'signin' | 'error' | 'load_more' | 'auto_load_more' | 'reset_search' | 'toggle_quality_preference';

interface AnalyticsEvent {
  type: EventType;
  data?: Record<string, any>;
  timestamp?: number;
}

// Queue of events to be sent in batch
let eventQueue: AnalyticsEvent[] = [];
let isSendingEvents = false;

/**
 * Track a user event
 */
export const trackEvent = (type: EventType, data?: Record<string, any>): void => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Analytics] ${type}:`, data);
  }

  // Add event to queue
  eventQueue.push({
    type,
    data,
    timestamp: Date.now()
  });

  // Auto-send events if queue gets long
  if (eventQueue.length >= 10) {
    sendEvents();
  }
};

/**
 * Send batched events to analytics endpoint
 */
export const sendEvents = async (): Promise<void> => {
  // Prevent concurrent sends
  if (isSendingEvents || eventQueue.length === 0) return;
  
  try {
    isSendingEvents = true;
    const eventsToSend = [...eventQueue];
    eventQueue = [];
    
    // In a real implementation, this would send to your analytics service
    // For now we'll just log to console in production and do nothing in development
    if (process.env.NODE_ENV === 'production') {
      console.log(`Sending ${eventsToSend.length} events to analytics service`);
      
      // Example of sending to a real endpoint:
      // const response = await fetch('/api/analytics', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ events: eventsToSend })
      // });
    }
  } catch (error) {
    console.error('Failed to send analytics events:', error);
    // Return events to queue for retry
    eventQueue = [...eventQueue, ...eventQueue];
  } finally {
    isSendingEvents = false;
  }
};

/**
 * Track page view event
 */
export const trackPageView = (path: string, title?: string): void => {
  trackEvent('view_product', { path, title });
};

/**
 * Track search query
 */
export const trackSearch = (query: string, resultCount?: number): void => {
  trackEvent('search', { query, resultCount });
};

/**
 * Track error event
 */
export const trackError = (message: string, code?: string, context?: Record<string, any>): void => {
  trackEvent('error', { message, code, context });
};

/**
 * Setup automatic tracking for page unload to send remaining events
 */
export const initAnalytics = (): void => {
  if (typeof window === 'undefined') return;
  
  // Send remaining events when user leaves page
  window.addEventListener('beforeunload', () => {
    if (eventQueue.length > 0) {
      sendEvents();
    }
  });
  
  // Track initial page view
  trackPageView(window.location.pathname);
};
