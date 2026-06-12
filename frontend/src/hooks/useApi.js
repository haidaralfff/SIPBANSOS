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

  const getWargaById = useCallback(
    async (id) => {
      const response = await request(`/api/v1/warga/${id}`, {
        method: "GET"
      });
      const payload = await parseJson(response);

      if (!response.ok) {
        return { success: false, message: payload?.error || "Gagal memuat detail warga." };
      }

      return { success: true, data: payload?.data };
    },
    [request]
  );

  const getWargaHistory = useCallback(
    async (id) => {
      const response = await request(`/api/v1/warga/${id}/history`, {
        method: "GET"
      });
      const payload = await parseJson(response);

      if (!response.ok) {
        return { success: false, message: payload?.error || "Gagal memuat riwayat warga." };
      }

      return { success: true, data: payload?.data || [] };
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

  const validateImport = useCallback(
    async (file) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await request("/api/v1/import/validate", {
        method: "POST",
        body: formData,
        headers: { "Accept": "application/json" }
      });

      const payload = await parseJson(response);
      if (!response.ok) {
        return { success: false, message: payload?.error || "Gagal memvalidasi file." };
      }
      return { success: true, summary: payload?.summary, preview: payload?.preview };
    },
    [request]
  );

  const confirmImport = useCallback(
    async (data) => {
      const response = await request("/api/v1/import/confirm", {
        method: "POST",
        body: JSON.stringify({ data })
      });

      const payload = await parseJson(response);
      if (!response.ok) {
        return { success: false, message: payload?.error || "Gagal mengimpor data." };
      }
      return { success: true, message: payload?.message, imported: payload?.imported };
    },
    [request]
  );

  const exportData = useCallback(
    async (format = "csv", periodId = "") => {
      let url = `/api/v1/export/data?format=${format}`;
      if (periodId) {
        url += `&periode_id=${encodeURIComponent(periodId)}`;
      }

      const response = await request(url, {
        method: "GET"
      });

      if (!response.ok) {
        const payload = await parseJson(response);
        return {
          success: false,
          message: payload?.error || "Gagal mengunduh data ekspor."
        };
      }

      const blob = await response.blob();
      const fileName =
        extractFilename(response.headers.get("Content-Disposition")) || `ekspor_warga.${format}`;
      triggerDownload(blob, fileName);
      return { success: true };
    },
    [request]
  );

  const runSAW = useCallback(
    async ({ kuota = 1, periodeId, bobotId } = {}) => {
      const response = await request("/api/v1/saw/run", {
        method: "POST",
        body: JSON.stringify({
          kuota,
          periode_id: periodeId,
          bobot_id: bobotId
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

  const getKriteria = useCallback(async () => {
    const response = await request("/api/v1/kriteria", {
      method: "GET"
    });
    const payload = await parseJson(response);

    if (!response.ok) {
      return { success: false, message: payload?.error || "Gagal memuat data kriteria." };
    }
    return { 
      success: true, 
      data: payload?.criteria || [],
      version: payload?.version,
      totalWeight: payload?.total_weight 
    };
  }, [request]);

  const getKriteriaById = useCallback(async (id) => {
    const response = await request(`/api/v1/kriteria/${id}`, {
      method: "GET"
    });
    const payload = await parseJson(response);

    if (!response.ok) {
      return { success: false, message: payload?.error || "Gagal memuat data kriteria." };
    }
    return { 
      success: true, 
      data: payload?.criteria || [],
      version: payload?.version,
      totalWeight: payload?.total_weight 
    };
  }, [request]);

  const createKriteria = useCallback(async (data) => {
    const response = await request("/api/v1/kriteria", {
      method: "POST",
      body: JSON.stringify(data)
    });
    const payload = await parseJson(response);

    if (!response.ok) {
      return { success: false, message: payload?.error || "Gagal membuat kriteria baru." };
    }
    return { success: true, data: payload?.criteria, version: payload?.version };
  }, [request]);

  const updateKriteria = useCallback(async (id, data) => {
    const response = await request(`/api/v1/kriteria/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    });
    const payload = await parseJson(response);

    if (!response.ok) {
      return { success: false, message: payload?.error || "Gagal mengubah kriteria." };
    }
    return { success: true, data: payload?.data };
  }, [request]);

  const createWarga = useCallback(async (data) => {
    const response = await request("/api/v1/warga", {
      method: "POST",
      body: JSON.stringify(data)
    });
    const payload = await parseJson(response);

    if (!response.ok) {
      return { success: false, message: payload?.error || "Gagal menambah warga." };
    }
    return { success: true, data: payload?.data };
  }, [request]);

  const updateWarga = useCallback(async (id, data) => {
    const response = await request(`/api/v1/warga/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    });
    const payload = await parseJson(response);

    if (!response.ok) {
      return { success: false, message: payload?.error || "Gagal mengubah warga." };
    }
    return { success: true, data: payload?.data };
  }, [request]);

  const uploadFile = useCallback(
    async (file) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await request("/api/v1/upload", {
        method: "POST",
        body: formData,
        headers: {
          "Accept": "application/json"
        }
      });

      const payload = await parseJson(response);
      if (!response.ok) {
        return { success: false, message: payload?.error || "Gagal mengunggah file." };
      }
      return { success: true, url: payload?.url };
    },
    [request]
  );

  const deleteWarga = useCallback(async (id) => {
    const response = await request(`/api/v1/warga/${id}`, {
      method: "DELETE"
    });
    const payload = await parseJson(response);

    if (!response.ok) {
      return { success: false, message: payload?.error || "Gagal menghapus warga." };
    }
    return { success: true };
  }, [request]);

  const getPeriods = useCallback(async () => {
    const response = await request("/api/v1/reports/periods", {
      method: "GET"
    });
    const payload = await parseJson(response);

    if (!response.ok) {
      return { success: false, message: payload?.error || "Gagal memuat periode." };
    }
    return { success: true, data: payload?.data || [] };
  }, [request]);

  const getKriteriaVersions = useCallback(async () => {
    const response = await request("/api/v1/kriteria/versions", {
      method: "GET"
    });
    const payload = await parseJson(response);

    if (!response.ok) {
      return { success: false, message: payload?.error || "Gagal memuat versi bobot." };
    }
    return { success: true, data: payload?.data || [] };
  }, [request]);

  const getRanking = useCallback(async (periodId) => {
    const url = periodId ? `/api/v1/reports/ranking?periode_id=${encodeURIComponent(periodId)}` : "/api/v1/reports/ranking";
    const response = await request(url, {
      method: "GET"
    });
    const payload = await parseJson(response);

    if (!response.ok) {
      return { success: false, message: payload?.error || "Gagal memuat ranking." };
    }
    return { success: true, data: payload?.data || [] };
  }, [request]);

  const getSummary = useCallback(async (periodId) => {
    const url = periodId ? `/api/v1/reports/summary?periode_id=${encodeURIComponent(periodId)}` : "/api/v1/reports/summary";
    const response = await request(url, {
      method: "GET"
    });
    const payload = await parseJson(response);

    if (!response.ok) {
      return { success: false, message: payload?.error || "Gagal memuat summary." };
    }
    return { success: true, data: payload?.data };
  }, [request]);

  return {
    request,
    getWarga,
    getWargaById,
    getWargaHistory,
    createWarga,
    updateWarga,
    uploadFile,
    deleteWarga,
    downloadImportTemplate,
    runSAW,
    getKriteria,
    getKriteriaById,
    createKriteria,
    updateKriteria,
    getPeriods,
    getKriteriaVersions,
    getRanking,
    getSummary,
    validateImport,
    confirmImport,
    exportData
  };
};
