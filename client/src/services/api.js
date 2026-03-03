import axios from 'axios';

const instance = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
});

function setToken(token) {
  if (token) {
    instance.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete instance.defaults.headers.common.Authorization;
  }
}

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (
      error.response &&
      error.response.status === 401 &&
      !original._retry
    ) {
      original._retry = true;
      const stored = localStorage.getItem('tvet_auth');
      if (stored) {
        const { refreshToken } = JSON.parse(stored);
        if (refreshToken) {
          try {
            const res = await instance.post('/auth/refresh', {
              refreshToken,
            });
            const newAccessToken = res.data.accessToken;
            const parsed = JSON.parse(stored);
            const payload = {
              ...parsed,
              accessToken: newAccessToken,
            };
            localStorage.setItem('tvet_auth', JSON.stringify(payload));
            setToken(newAccessToken);
            original.headers.Authorization = `Bearer ${newAccessToken}`;
            return instance(original);
          } catch (e) {
            localStorage.removeItem('tvet_auth');
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

const api = {
  get: instance.get,
  post: instance.post,
  put: instance.put,
  delete: instance.delete,
  setToken,
};

export default api;

