import { useCallback } from "react";
import { useAuth } from "../context/AuthContext";

const getApiBaseUrl = () => (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

const resolveApiUrl = (baseUrl, path) => {
  if (!baseUrl) return path;
  return `${baseUrl}${path}`;
};

const parseJson = async (response) => {
  try {
    return await response.json();
  } catch (error) {
    return {};
  }
};

const extractFilename = (headerValue) => {
  if (!headerValue) return "";
  const match = headerValue.match(/filename="?([^";]+)"?/i);
  return match ? match[1] : "";
};

const triggerDownload = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const useApi = () => {
  const { user, refreshSession, logout } = useAuth();
  const baseUrl = getApiBaseUrl();

  const request = useCallback(
    async (path, options = {}, canRetry = true) => {
      const url = resolveApiUrl(baseUrl, path);
      const headers = new Headers(options.headers || {});

      if (user?.accessToken) {
        headers.set("Authorization", `Bearer ${user.accessToken}`);
      }
      if (!headers.has("Content-Type") && options.body && typeof options.body === "string") {
        headers.set("Content-Type", "application/json");
      }

      const response = await fetch(url, {
        ...options,
        headers
      });

      if (response.status === 401 && canRetry && user?.refreshToken) {
        const refreshed = await refreshSession();
        if (refreshed) {
          return request(path, options, false);
        }
        logout();
      }

      return response;
    },
    [baseUrl, user?.accessToken, user?.refreshToken, refreshSession, logout]
  );

  const getWarga = useCallback(
    async ({ page = 1, limit = 10, q = "", rt = "", rw = "" } = {}) => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));
      if (q) params.set("q", q);
      if (rt) params.set("rt", rt);
      if (rw) params.set("rw", rw);

      const response = await request(`/api/v1/warga?${params.toString()}`, {
        method: "GET"
      });
      const payload = await parseJson(response);

      if (!response.ok) {
        return {
          success: false,
          message: payload?.error || "Gagal memuat data warga."
        };
      }

      return {
        success: true,
        data: payload?.data || [],
        page: payload?.page || page,
        limit: payload?.limit || limit
      };
    },
    [request]
  );

  const downloadImportTemplate = useCallback(
    async (format = "xlsx") => {
      const response = await request(`/api/v1/import/template?format=${format}`, {
        method: "GET"
      });

      if (!response.ok) {
        const payload = await parseJson(response);
        return {
          success: false,
          message: payload?.error || "Gagal mengunduh template."
        };
      }

      const blob = await response.blob();
      const fileName =
        extractFilename(response.headers.get("Content-Disposition")) || `template_warga.${format}`;
      triggerDownload(blob, fileName);
      return { success: true };
    },
    [request]
  );

  const runSAW = useCallback(
    async ({ kuota = 1 } = {}) => {
      const response = await request("/api/v1/saw/run", {
        method: "POST",
        body: JSON.stringify({
          kuota
        })
      });

      const payload = await parseJson(response);
      if (!response.ok) {
        return {
          success: false,
          message: payload?.error || "Gagal menjalankan perhitungan SAW."
        };
      }

      return {
        success: true,
        data: payload?.hasil || []
      };
    },
    [request]
  );

  return {
    request,
    getWarga,
    downloadImportTemplate,
    runSAW
  };
};
