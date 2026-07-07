import axios, { type InternalAxiosRequestConfig } from "axios";

export const API_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export function apiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_URL}/api${normalized}`;
}

export function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function setAuthHeader(config: InternalAxiosRequestConfig, token: string) {
  if (!config.headers) return;

  if (typeof config.headers.set === "function") {
    config.headers.set("Authorization", `Bearer ${token}`);
  } else {
    config.headers.Authorization = `Bearer ${token}`;
  }
}

let logoutHandler: (() => void) | null = null;
let initialized = false;

export function setLogoutHandler(handler: () => void) {
  logoutHandler = handler;
}

export function setupAxiosInterceptors() {
  if (initialized) return;
  initialized = true;

  axios.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      setAuthHeader(config, token);
    }
    return config;
  });

  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      const url = originalRequest?.url as string | undefined;
      const isAuthPublicEndpoint =
        !!url &&
        (url.includes("/auth/login") ||
          url.includes("/auth/forgot-password") ||
          url.includes("/auth/reset-password"));

      // Sur les routes publiques d'auth, on laisse le composant afficher l'erreur
      // (ex: mauvais identifiants) sans déclencher de redirection globale.
      if (isAuthPublicEndpoint) {
        return Promise.reject(error);
      }

      if (originalRequest?.url?.includes("/auth/refresh")) {
        logoutHandler?.();
        return Promise.reject(error);
      }

      if (
        error.response?.status === 401 &&
        originalRequest &&
        !originalRequest._retry
      ) {
        originalRequest._retry = true;

        try {
          const refreshToken = localStorage.getItem("refreshToken");
          if (!refreshToken) {
            logoutHandler?.();
            return Promise.reject(error);
          }

          const res = await axios.post(apiUrl("/auth/refresh"), {
            refreshToken,
          });
          const newAccessToken = res.data.accessToken as string;
          const newRefreshToken = res.data.refreshToken as string;

          localStorage.setItem("accessToken", newAccessToken);
          localStorage.setItem("refreshToken", newRefreshToken);

          setAuthHeader(originalRequest, newAccessToken);
          return axios(originalRequest);
        } catch (refreshError) {
          logoutHandler?.();
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    },
  );
}
