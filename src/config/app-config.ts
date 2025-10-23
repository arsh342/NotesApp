// This file is used to configure the application
// In production, values will be embedded during build time

declare global {
  interface Window {
    APP_CONFIG?: {
      FIREBASE_API_KEY?: string;
      FIREBASE_AUTH_DOMAIN?: string;
      FIREBASE_DATABASE_URL?: string;
      FIREBASE_PROJECT_ID?: string;
      FIREBASE_STORAGE_BUCKET?: string;
      FIREBASE_MESSAGING_SENDER_ID?: string;
      FIREBASE_APP_ID?: string;
      FIREBASE_MEASUREMENT_ID?: string;
    };
  }
}

// Try to get config from environment variables first, then from window object
export const getConfig = () => {
  return {
    FIREBASE_API_KEY:
      import.meta.env.VITE_FIREBASE_API_KEY ||
      window.APP_CONFIG?.FIREBASE_API_KEY,
    FIREBASE_AUTH_DOMAIN:
      import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
      window.APP_CONFIG?.FIREBASE_AUTH_DOMAIN,
    FIREBASE_DATABASE_URL:
      import.meta.env.VITE_FIREBASE_DATABASE_URL ||
      window.APP_CONFIG?.FIREBASE_DATABASE_URL,
    FIREBASE_PROJECT_ID:
      import.meta.env.VITE_FIREBASE_PROJECT_ID ||
      window.APP_CONFIG?.FIREBASE_PROJECT_ID,
    FIREBASE_STORAGE_BUCKET:
      import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
      window.APP_CONFIG?.FIREBASE_STORAGE_BUCKET,
    FIREBASE_MESSAGING_SENDER_ID:
      import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
      window.APP_CONFIG?.FIREBASE_MESSAGING_SENDER_ID,
    FIREBASE_APP_ID:
      import.meta.env.VITE_FIREBASE_APP_ID ||
      window.APP_CONFIG?.FIREBASE_APP_ID,
    FIREBASE_MEASUREMENT_ID:
      import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ||
      window.APP_CONFIG?.FIREBASE_MEASUREMENT_ID,
  };
};

export default getConfig;
