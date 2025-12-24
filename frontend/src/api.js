import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

// Helper to set/remove Authorization header
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Interceptor to handle 401 and refresh token
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser?.refreshToken) {
        try {
          const res = await api.post('/refresh', {
            refreshToken: storedUser.refreshToken
          });

          // update access token in localStorage
          storedUser.accessToken = res.data.accessToken;
          localStorage.setItem('user', JSON.stringify(storedUser));

          // update axios default header
          setAuthToken(res.data.accessToken);

          // retry original request
          originalRequest.headers['Authorization'] = `Bearer ${res.data.accessToken}`;
          return api(originalRequest);
        } catch (err) {
          // refresh token invalid/expired
          localStorage.removeItem('user');
          window.location.href = '/login';
          return Promise.reject(err);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;