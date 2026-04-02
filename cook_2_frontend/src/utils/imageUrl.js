const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const API_BASE = API_URL.replace(/\/api\/?$/, '');

export const toImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_BASE}${url.startsWith('/') ? url : `/${url}`}`;
};
