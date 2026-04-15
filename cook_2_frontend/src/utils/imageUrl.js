const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const API_BASE = API_URL.replace(/\/api\/?$/, '');

// Helper function to convert backend image paths into full URLs.
// If the path is relative, it prefixes it with the API base URL.
// If the image URL is already absolute, it returns it unchanged.
export const toImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_BASE}${url.startsWith('/') ? url : `/${url}`}`;
};
