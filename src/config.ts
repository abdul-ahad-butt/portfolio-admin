// API base URL — dynamically configured
export const API_BASE_URL = import.meta.env.PROD 
  ? 'https://my-portfolio.abdulahadbutt420.workers.dev'
  : 'http://localhost:3001';

// Admin API Key — must match backend .env ADMIN_API_KEY
// In a real deployment, load this from an env variable or secure config
export const ADMIN_API_KEY = 'portfolio-admin-secret-2026'
