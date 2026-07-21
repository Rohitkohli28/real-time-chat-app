import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send cookies with requests
});

const isAuthRoute = (url = '') => (
  url.includes('/auth/login') ||
  url.includes('/auth/register') ||
  url.includes('/auth/google') ||
  url.includes('/auth/verify-email') ||
  url.includes('/auth/forgot-password') ||
  url.includes('/auth/reset-password') ||
  url.includes('/auth/refresh')
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken && !config.headers['X-Refresh-Token']) {
      config.headers['X-Refresh-Token'] = refreshToken;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest || isAuthRoute(originalRequest.url)) {
      return Promise.reject(error);
    }
    
    // Check if error is 401 and we haven't already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({resolve, reject})
        }).then(token => {
          if (token) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const storedRefreshToken = localStorage.getItem('refreshToken');
        const { data } = await axios.post(
            `${api.defaults.baseURL}/auth/refresh`,
            { refreshToken: storedRefreshToken },
            { withCredentials: true }
        );
        if (data?.accessToken) {
          localStorage.setItem('accessToken', data.accessToken);
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        }
        isRefreshing = false;
        processQueue(null, data?.accessToken);
        return api(originalRequest);
      } catch (err) {
        isRefreshing = false;
        processQueue(err, null);
        window.dispatchEvent(new CustomEvent('auth:session-expired'));
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
