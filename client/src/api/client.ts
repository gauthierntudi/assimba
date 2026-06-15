import axios, { isAxiosError } from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (isAxiosError(error) && !error.response) {
      const message =
        'API inaccessible. Vérifiez que le serveur tourne (npm run dev à la racine du projet).';
      return Promise.reject(new Error(message, { cause: error }));
    }

    if (isAxiosError(error) && error.response?.status === 502) {
      return Promise.reject(
        new Error(
          'API indisponible (502). Le serveur backend sur le port 4000 ne répond pas.',
          { cause: error },
        ),
      );
    }

    return Promise.reject(error);
  },
);

export async function checkHealth() {
  const { data } = await api.get('/health');
  return data;
}
