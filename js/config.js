// Centralized API config
export const API_BASE = (window.__ENV__ && window.__ENV__.API_BASE) || 'http://localhost:8000';

export const PATHS = {
  HOME: '/fe/pages/home/index.html',
  ABOUT: '/fe/pages/about/index.html',
  FAQ: '/fe/pages/about/faq.html',
  PRODUCTS: '/fe/pages/products/products.html',
  NEWS: '/fe/pages/news/news.html',
  CONTACT: '/fe/pages/home/contact.html',
  CART: '/fe/pages/products/cart.html',
  LOGIN: '/fe/pages/home/login.html',
  PROFILE: '/fe/pages/profile/profile.html',
};

export const SITE_DEFAULTS = {
  NAME: "Shoe Store"
};
