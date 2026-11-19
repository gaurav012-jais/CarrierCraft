import axios from 'axios';

export const API_BASE = '/api';

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

// Auto-attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cc_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('cc_token');
      localStorage.removeItem('cc_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    const message = error.response?.data?.error?.message || error.message || 'API request failed';
    return Promise.reject(new Error(message));
  }
);

// Modular API Endpoints
export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  getMe: () => api.get('/auth/me'),
};

export const marketsApi = {
  getMarkets: () => api.get('/markets'),
  getMarketDetails: (countryCode, operatorCode) => api.get(`/markets/${countryCode}/${operatorCode}`),
  createMarket: (data) => api.post('/markets', data),
  updateMarket: (countryCode, operatorCode, data) => api.put(`/markets/${countryCode}/${operatorCode}`, data),
  createMarketCampaign: (countryCode, operatorCode, data) => api.post(`/markets/${countryCode}/${operatorCode}/campaigns`, data),
  addCountry: (data) => api.post('/markets/countries', data),
  addOperator: (data) => api.post('/markets/operators', data),
  toggleOperator: (id, isActive) => api.put(`/markets/operators/${id}/toggle`, { isActive }),
  updateHeaders: (id, detectionHeaders) => api.put(`/markets/operators/${id}/headers`, { detectionHeaders }),
};

export const campaignsApi = {
  list: (params) => api.get('/campaigns', { params }),
  get: (id) => api.get(`/campaigns/${id}`),
  create: (data) => api.post('/campaigns', data),
  update: (id, data) => api.put(`/campaigns/${id}`, data),
  saveApiConfig: (id, config) => api.put(`/campaigns/${id}/api-config`, config),
  // Campaign Pages (GrapesJS)
  getPages: (id) => api.get(`/campaigns/${id}/pages`),
  getPage: (id, pageType) => api.get(`/campaigns/${id}/pages/${pageType}`),
  savePage: (id, pageType, data) => api.put(`/campaigns/${id}/pages/${pageType}`, data),
  // Vendors & Tracking Assignment
  getVendors: (id) => api.get(`/campaigns/${id}/vendors`),
  assignVendor: (id, data) => api.post(`/campaigns/${id}/vendors`, data),
  removeVendor: (id, trackingId) => api.delete(`/campaigns/${id}/vendors/${trackingId}`),
};

export const templatesApi = {
  list: () => api.get('/templates'),
  get: (id) => api.get(`/templates/${id}`),
  save: (id, data) => api.put(`/templates/${id}`, data),
};

export const partnersApi = {
  listVendors: () => api.get('/partners/vendors'),
  createVendor: (data) => api.post('/partners/vendors', data),
  addAffiliate: (data) => api.post('/partners/affiliates', data),
};

export const analyticsApi = {
  getDashboard: () => api.get('/analytics/dashboard'),
  listVisits: (params) => api.get('/analytics/visits', { params }),
  getWaterfall: (visitId) => api.get(`/analytics/visits/${visitId}/waterfall`),
};

export const postbacksApi = {
  list: (limit = 50) => api.get('/postbacks', { params: { limit } }),
  retry: (id) => api.post(`/postbacks/${id}/retry`),
};

export const flowApi = {
  detect: (params, customHeaders = {}) => api.get('/flow/detect-msisdn', { params, headers: customHeaders }),
  getPage: (campid, pageType, msisdn) => api.get('/flow/page', { params: { campid, pageType, msisdn } }),
  transition: (visitId, action, phone) => api.post('/flow/transition', { visitId, action, phone }),
};

export const otpApi = {
  send: (visitId, phone) => api.post('/otp/send', { visitId, phone }),
  verify: (visitId, otp) => api.post('/otp/verify', { visitId, otp }),
};
