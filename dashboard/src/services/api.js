import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_KEY = import.meta.env.VITE_ADMIN_API_KEY;

// Cria instância do axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY,
  },
});

// Interceptor para erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('API Error:', error.response.data);

      // Mostra mensagem de erro para o usuário
      const message = error.response.data.message || 'Erro ao comunicar com o servidor';

      // Você pode integrar com uma biblioteca de notificações aqui
      alert(message);
    } else if (error.request) {
      console.error('Network Error:', error.request);
      alert('Erro de rede. Verifique sua conexão.');
    } else {
      console.error('Error:', error.message);
      alert('Erro inesperado.');
    }

    return Promise.reject(error);
  }
);

// Players
export const playersApi = {
  list: () => api.get('/players'),
  create: (data) => api.post('/players', data),
  update: (id, data) => api.put(`/players/${id}`, data),
  delete: (id) => api.delete(`/players/${id}`),
  getByDiscordId: (discordId) => api.get(`/players/discord/${discordId}`),
};

// Submissions
export const submissionsApi = {
  list: (params) => api.get('/submissions', { params }),
  getStatus: () => api.get('/submissions/status'),
  verify: (id) => api.put(`/submissions/${id}/verify`),
  download: (id) => {
    // Download com blob
    return api.get(`/submissions/${id}/download`, {
      responseType: 'blob',
    });
  },
  downloadBatch: (category) => api.get(`/submissions/batch/${category}`),
};

// Requests
export const requestsApi = {
  list: (params) => api.get('/requests', { params }),
};

export default api;
