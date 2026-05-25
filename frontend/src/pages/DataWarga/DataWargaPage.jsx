import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "../../components/layout/AppShell";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Drawer from "../../components/ui/Drawer";
import { useApi } from "../../hooks/useApi";
import { formatNumber, formatRupiah } from "../../utils/formatter";

const PAGE_SIZE = 10;
const STATUS_OPTIONS = ["Semua", "Aktif", "Nonaktif"];
const VERIFICATION_OPTIONS = ["Semua", "Terverifikasi", "Menunggu", "Perlu Revisi"];

const statusVariant = (status) => (status === "Aktif" ? "success" : "danger");

const verificationVariant = (status) => {
  if (status === "Terverifikasi") return "success";
  if (status === "Menunggu") return "warning";
  return "danger";
};

const compactId = (value) => {
  if (!value) return "";
  return value.length <= 12 ? value : `${value.slice(0, 6)}...${value.slice(-4)}`;
};

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);
};

const buildCriteria = (item) => [
  { label: "Jumlah Anggota Keluarga", value: `${item.c1_value} orang` },
  { label: "Jumlah Tanggungan", value: `${item.c2_value} orang` },
  { label: "Pendidikan Kep. Keluarga", value: `Skor ${item.c3_value}` },
  { label: "Pekerjaan Kep. Keluarga", value: `Skor ${item.c4_value}` },
  { label: "Status Rumah", value: `Skor ${item.c5_value}` },
  { label: "Luas Rumah (m²)", value: `${item.c6_value} m²` },
  { label: "Daya Listrik", value: `${item.c7_value} VA` },
  { label: "Jumlah Kendaraan", value: `${item.c8_value} unit` },
  { label: "Tabungan", value: formatRupiah(item.c9_value) },
  { label: "Penghasilan per Bulan", value: formatRupiah(item.c10_value) },
  { label: "Pengeluaran per Bulan", value: formatRupiah(item.c11_value) },
  { label: "Kondisi Dinding", value: `Skor ${item.c12_value}` },
  { label: "Akses Air", value: `Skor ${item.c13_value}` }
];

const resolveVerification = (item) => {
  if (item.foto_ktp_url && item.foto_kk_url) return "Terverifikasi";
  if (item.foto_ktp_url || item.foto_kk_url) return "Perlu Revisi";
  return "Menunggu";
};

const parseRtRwFilter = (value) => {
  if (!value || value === "Semua") return { rt: "", rw: "" };
  const [rt, rw] = value.split("/");
  return { rt: rt?.trim() || "", rw: rw?.trim() || "" };
};

const createEmptyForm = () => ({
  nama_lengkap: "",
  nik: "",
  no_kk: "",
  tanggal_lahir: "",
  jenis_kelamin: "L",
  alamat: "",
  rt: "",
  rw: "",
  no_hp: "",
  foto_ktp_url: "",
  foto_kk_url: "",
  c1_value: "",
  c2_value: "",
  c3_value: "",
  c4_value: "",
  c5_value: "",
  c6_value: "",
  c7_value: "",
  c8_value: "",
  c9_value: "",
  c10_value: "",
  c11_value: "",
  c12_value: "",
  c13_value: ""
});

const toFieldValue = (value) => (value === null || value === undefined ? "" : String(value));

const buildFormDataFromWarga = (item) => ({
  nama_lengkap: item.name || "",
  nik: item.nik || "",
  no_kk: item.noKk || "",
  tanggal_lahir: item.tanggalLahir || "",
  jenis_kelamin: item.jenisKelaminRaw || "L",
  alamat: item.address || "",
  rt: item.rt || "",
  rw: item.rw || "",
  no_hp: item.no_hp || "",
  foto_ktp_url: item.foto_ktp_url || "",
  foto_kk_url: item.foto_kk_url || "",
  c1_value: toFieldValue(item.c1_value),
  c2_value: toFieldValue(item.c2_value),
  c3_value: toFieldValue(item.c3_value),
  c4_value: toFieldValue(item.c4_value),
  c5_value: toFieldValue(item.c5_value),
  c6_value: toFieldValue(item.c6_value),
  c7_value: toFieldValue(item.c7_value),
  c8_value: toFieldValue(item.c8_value),
  c9_value: toFieldValue(item.c9_value),
  c10_value: toFieldValue(item.c10_value),
  c11_value: toFieldValue(item.c11_value),
  c12_value: toFieldValue(item.c12_value),
  c13_value: toFieldValue(item.c13_value)
});

const buildWargaPayload = (formData) => {
  const requiredTextFields = ["nama_lengkap", "nik", "no_kk", "tanggal_lahir", "jenis_kelamin", "alamat"];
  for (const field of requiredTextFields) {
    if (!String(formData[field] || "").trim()) {
      throw new Error("Lengkapi semua data wajib sebelum menyimpan.");
    }
  }

  const payload = {
    nama_lengkap: String(formData.nama_lengkap || "").trim(),
    nik: String(formData.nik || "").trim(),
    no_kk: String(formData.no_kk || "").trim(),
    tanggal_lahir: String(formData.tanggal_lahir || "").trim(),
    jenis_kelamin: String(formData.jenis_kelamin || "L").trim(),
    alamat: String(formData.alamat || "").trim(),
    rt: String(formData.rt || "").trim(),
    rw: String(formData.rw || "").trim(),
    no_hp: String(formData.no_hp || "").trim(),
    foto_ktp_url: String(formData.foto_ktp_url || "").trim(),
    foto_kk_url: String(formData.foto_kk_url || "").trim()
  };

  const numericFields = [
    "c1_value",
    "c2_value",
    "c3_value",
    "c4_value",
    "c5_value",
    "c6_value",
    "c7_value",
    "c8_value",
    "c9_value",
    "c10_value",
    "c11_value",
    "c12_value",
    "c13_value"
  ];

  for (const field of numericFields) {
    const value = Number(formData[field]);
    if (Number.isNaN(value)) {
      throw new Error(`Nilai ${field.replace("_", " ")} harus diisi dengan angka.`);
    }
    payload[field] = value;
  }

  return payload;
};

const mapWargaResponse = (item) => {
  const rt = item.rt ?? "";
  const rw = item.rw ?? "";
  const rtRw = rt && rw ? `${rt}/${rw}` : rt || rw || "-";
  const documents = {
    ktp: item.foto_ktp_url ? "Lengkap" : "Kurang",
    kk: item.foto_kk_url ? "Lengkap" : "Kurang"
  };
  const verification = resolveVerification(item);

  return {
    id: item.id,
    name: item.nama_lengkap,
    nik: item.nik,
    noKk: item.no_kk,
    tanggalLahir: item.tanggal_lahir,
    jenisKelaminRaw: item.jenis_kelamin,
    rtRw,
    rt,
    rw,
    address: item.alamat,
    gender: item.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan",
    birthDate: formatDate(item.tanggal_lahir),
    phone: item.no_hp || "-",
    no_hp: item.no_hp || "",
    foto_ktp_url: item.foto_ktp_url || "",
    foto_kk_url: item.foto_kk_url || "",
    c1_value: item.c1_value,
    c2_value: item.c2_value,
    c3_value: item.c3_value,
    c4_value: item.c4_value,
    c5_value: item.c5_value,
    c6_value: item.c6_value,
    c7_value: item.c7_value,
    c8_value: item.c8_value,
    c9_value: item.c9_value,
    c10_value: item.c10_value,
    c11_value: item.c11_value,
    c12_value: item.c12_value,
    c13_value: item.c13_value,
    penghasilan: item.c10_value,
    tanggungan: item.c2_value,
    status: item.is_active ? "Aktif" : "Nonaktif",
    verification,
    updated: formatDate(item.updated_at),
    documents,
    criteria: buildCriteria(item),
    source: item
  };
};

const DataWargaPage = () => {
  const { getWarga, createWarga, updateWarga, getWargaHistory } = useApi();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Semua");
  const [selectedRtRw, setSelectedRtRw] = useState("Semua");
  const [selectedVerification, setSelectedVerification] = useState("Semua");
  const [selectedWarga, setSelectedWarga] = useState(null);
  const [warga, setWarga] = useState([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const rtRwOptions = useMemo(() => {
    const unique = new Set(
      warga
        .map((item) => item.rtRw)
        .filter((value) => value && value !== "-")
    );
    return ["Semua", ...Array.from(unique).sort()];
  }, [warga]);

  useEffect(() => {
    if (!rtRwOptions.includes(selectedRtRw)) {
      setSelectedRtRw("Semua");
    }
  }, [rtRwOptions, selectedRtRw]);

  useEffect(() => {
    setPage(1);
  }, [query, selectedRtRw]);

  useEffect(() => {
    let isActive = true;
    const fetchData = async () => {
      setIsLoading(true);
      setError("");
      const { rt, rw } = parseRtRwFilter(selectedRtRw);
      const result = await getWarga({
        page,
        limit: PAGE_SIZE,
        q: query.trim(),
        rt,
        rw
      });

      if (!isActive) return;

      if (!result.success) {
        setError(result.message || "Gagal memuat data warga.");
        setWarga([]);
        setIsLoading(false);
        return;
      }

      setWarga(result.data.map(mapWargaResponse));
      setIsLoading(false);
    };

    fetchData();
    return () => {
      isActive = false;
    };
  }, [getWarga, page, query, selectedRtRw]);

  const filteredWarga = useMemo(() => {
    return warga.filter((item) => {
      const matchesStatus = selectedStatus === "Semua" || item.status === selectedStatus;
      const matchesVerification =
        selectedVerification === "Semua" || item.verification === selectedVerification;
      return matchesStatus && matchesVerification;
    });
  }, [warga, selectedStatus, selectedVerification]);

  const stats = useMemo(() => {
    const activeCount = warga.filter((item) => item.status === "Aktif").length;
    const pendingCount = warga.filter((item) => item.verification === "Menunggu").length;
    const missingDocs = warga.filter(
      (item) => item.documents.ktp !== "Lengkap" || item.documents.kk !== "Lengkap"
    ).length;

    return [
      {
        label: "Warga Aktif",
        value: formatNumber(activeCount),
        helper: "Daftar saat ini",
        variant: "success",
        note: "Data aktif siap dihitung."
      },
      {
        label: "Menunggu Verifikasi",
        value: formatNumber(pendingCount),
        helper: "Perlu tindak lanjut",
        variant: "info",
        note: "Dokumen belum lengkap."
      },
      {
        label: "Dokumen Kurang",
        value: formatNumber(missingDocs),
        helper: "Butuh revisi",
        variant: "warning",
        note: "KTP atau KK belum sesuai."
      }
    ];
  }, [warga]);

  const hasNextPage = warga.length === PAGE_SIZE;

  const closeDrawer = () => {
    setSelectedWarga(null);
    setShowForm(false);
    setShowVerify(false);
    setShowHistory(false);
  };

  const openCreateForm = () => {
    setIsEditing(false);
    setFormError("");
    setFormData(createEmptyForm());
    setShowForm(true);
  };

  const openEditForm = () => {
    if (!selectedWarga) return;
    setIsEditing(true);
    setFormError("");
    setFormData(buildFormDataFromWarga(selectedWarga));
    setShowForm(true);
  };

  const openVerifyForm = () => {
    if (!selectedWarga) return;
    setVerifyKtp(Boolean(selectedWarga.foto_ktp_url));
    setVerifyKk(Boolean(selectedWarga.foto_kk_url));
    setVerifyError("");
    setShowVerify(true);
  };

  const closeForm = () => setShowForm(false);
  const closeVerify = () => {
    setShowVerify(false);
    setVerifyError("");
  };
  const closeHistory = () => setShowHistory(false);

  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(createEmptyForm());
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const [showVerify, setShowVerify] = useState(false);
  const [verifyKtp, setVerifyKtp] = useState(false);
  const [verifyKk, setVerifyKk] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState("");

  const [showHistory, setShowHistory] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [historyRecords, setHistoryRecords] = useState([]);

  useEffect(() => {
    if (!showHistory || !selectedWarga) return;

    let isActive = true;
    const fetchHistory = async () => {
      setHistoryLoading(true);
      setHistoryError("");
      const result = await getWargaHistory(selectedWarga.id);

      if (!isActive) return;

      if (!result.success) {
        setHistoryError(result.message || "Gagal memuat riwayat.");
        setHistoryRecords([]);
        setHistoryLoading(false);
        return;
      }

      setHistoryRecords(result.data || []);
      setHistoryLoading(false);
    };

    fetchHistory();
    return () => {
      isActive = false;
    };
  }, [getWargaHistory, selectedWarga, showHistory]);

  const refreshWargaList = async () => {
    setIsLoading(true);
    const { rt, rw } = parseRtRwFilter(selectedRtRw);
    const result = await getWarga({ page, limit: PAGE_SIZE, q: query.trim(), rt, rw });
    if (!result.success) {
      setError(result.message || "Gagal memuat data warga.");
      setWarga([]);
      setIsLoading(false);
      return;
    }
    setWarga(result.data.map(mapWargaResponse));
    setIsLoading(false);
  };

  const handleSubmitForm = async () => {
    setFormError("");
    setFormLoading(true);
    try {
      const payload = buildWargaPayload(formData);

      if (isEditing && selectedWarga) {
        await updateWarga(selectedWarga.id, payload);
      } else {
        await createWarga(payload);
      }

      setShowForm(false);
      await refreshWargaList();
    } catch (err) {
      setFormError(err.message || "Gagal menyimpan data.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleSubmitVerify = async () => {
    if (!selectedWarga) return;
    setVerifyLoading(true);
    setVerifyError("");
    try {
      const payload = buildWargaPayload(buildFormDataFromWarga(selectedWarga));
      payload.foto_ktp_url = verifyKtp ? (selectedWarga.foto_ktp_url || "manual://verified") : "";
      payload.foto_kk_url = verifyKk ? (selectedWarga.foto_kk_url || "manual://verified") : "";
      await updateWarga(selectedWarga.id, payload);
      setShowVerify(false);
      await refreshWargaList();
    } catch (err) {
      setVerifyError(err.message || "Gagal menyimpan verifikasi.");
    } finally {
      setVerifyLoading(false);
    }
  };

  return (
    <AppShell
      title="Data Warga"
      subtitle="Kelola data warga berdasarkan 13 kriteria dan status penyaluran."
      showRightPanel={false}
    >
      <div className="grid gap-4 lg:grid-cols-3">
        {stats.map((item) => (
          <Card key={item.label} className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-text-secondary">{item.label}</p>
                <p className="text-2xl font-bold text-text-primary">{item.value}</p>
              </div>
              <Badge variant={item.variant}>{item.helper}</Badge>
            </div>
            <p className="mt-4 text-xs text-text-secondary">{item.note}</p>
          </Card>
        ))}
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1 min-w-0">
              <input
                className="w-full rounded-button border border-border bg-white px-4 py-2 text-sm text-text-primary outline-none focus:border-primary-orange"
                placeholder="Cari nama, NIK, atau nomor KK"
                aria-label="Cari data warga"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => navigate("/import-export?tab=import")}
              >
                Import
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/import-export?tab=export")}
              >
                Ekspor
              </Button>
              <Button onClick={openCreateForm}>Tambah Warga</Button>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-text-secondary">RT/RW</label>
              <select
                className="rounded-button border border-border bg-white px-4 py-2 text-sm text-text-primary"
                value={selectedRtRw}
                onChange={(event) => setSelectedRtRw(event.target.value)}
              >
                {rtRwOptions.map((option) => (
                  <option key={option} value={option}>
                    {option === "Semua" ? "Semua RT/RW" : `RT/RW ${option}`}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-text-secondary">Status</label>
              <select
                className="rounded-button border border-border bg-white px-4 py-2 text-sm text-text-primary"
                value={selectedStatus}
                onChange={(event) => setSelectedStatus(event.target.value)}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option === "Semua" ? "Semua Status" : option}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-text-secondary">Verifikasi</label>
              <select
                className="rounded-button border border-border bg-white px-4 py-2 text-sm text-text-primary"
                value={selectedVerification}
                onChange={(event) => setSelectedVerification(event.target.value)}
              >
                {VERIFICATION_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option === "Semua" ? "Semua Verifikasi" : option}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {error ? (
          <div className="mt-4 rounded-card bg-accent-red/10 px-3 py-2 text-xs text-accent-red">
            {error}
          </div>
        ) : null}

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-text-secondary">
              <tr>
                <th className="py-2 font-semibold">Nama Warga</th>
                <th className="py-2 font-semibold w-[140px]">NIK</th>
                <th className="py-2 font-semibold w-[140px]">No. KK</th>
                <th className="py-2 font-semibold">RT/RW</th>
                <th className="py-2 font-semibold">Penghasilan</th>
                <th className="py-2 font-semibold">Tanggungan</th>
                <th className="py-2 font-semibold">Status</th>
                <th className="py-2 font-semibold">Verifikasi</th>
                <th className="py-2 font-semibold">Terakhir Update</th>
                <th className="py-2 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="py-6 text-center text-sm text-text-secondary">
                    Memuat data warga...
                  </td>
                </tr>
              ) : filteredWarga.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-6 text-center text-sm text-text-secondary">
                    Belum ada data warga yang cocok.
                  </td>
                </tr>
              ) : (
                filteredWarga.map((item) => (
                  <tr key={item.nik} className="hover:bg-background/60">
                    <td className="py-3 font-semibold text-text-primary">{item.name}</td>
                    <td className="py-3 text-text-secondary font-mono tabular-nums" title={item.nik}>
                      {compactId(item.nik)}
                    </td>
                    <td className="py-3 text-text-secondary font-mono tabular-nums" title={item.noKk}>
                      {compactId(item.noKk)}
                    </td>
                    <td className="py-3 text-text-secondary">{item.rtRw}</td>
                    <td className="py-3 text-text-secondary">{formatRupiah(item.penghasilan)}</td>
                    <td className="py-3 text-text-secondary">{item.tanggungan} orang</td>
                    <td className="py-3">
                      <Badge variant={statusVariant(item.status)}>{item.status}</Badge>
                    </td>
                    <td className="py-3">
                      <Badge variant={verificationVariant(item.verification)}>{item.verification}</Badge>
                    </td>
                    <td className="py-3 text-text-secondary">{item.updated}</td>
                    <td className="py-3">
                      <Button variant="outline" onClick={() => setSelectedWarga(item)}>
                        Detail
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between text-xs text-text-secondary">
          <span>
            Menampilkan {filteredWarga.length} dari {formatNumber(warga.length)} data pada halaman ini
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
            >
              Sebelumnya
            </Button>
            <Button
              variant="ghost"
              onClick={() => setPage((prev) => prev + 1)}
              disabled={!hasNextPage}
            >
              Berikutnya
            </Button>
          </div>
        </div>
      </Card>

      <Drawer
        open={Boolean(selectedWarga)}
        onClose={closeDrawer}
        title="Detail Warga"
        subtitle={selectedWarga ? `${selectedWarga.name} • ${selectedWarga.nik}` : ""}
      >
        {selectedWarga ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={statusVariant(selectedWarga.status)}>{selectedWarga.status}</Badge>
              <Badge variant={verificationVariant(selectedWarga.verification)}>
                {selectedWarga.verification}
              </Badge>
              <span className="text-xs text-text-secondary">Update {selectedWarga.updated}</span>
            </div>

            <div>
              <h3 className="text-sm font-bold">Identitas</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="rounded-card bg-background/70 p-3">
                  <p className="text-xs text-text-secondary">NIK</p>
                  <p className="mt-1 text-sm font-semibold text-text-primary font-mono tabular-nums">
                    {selectedWarga.nik}
                  </p>
                </div>
                <div className="rounded-card bg-background/70 p-3">
                  <p className="text-xs text-text-secondary">No. KK</p>
                  <p className="mt-1 text-sm font-semibold text-text-primary font-mono tabular-nums">
                    {selectedWarga.noKk}
                  </p>
                </div>
                <div className="rounded-card bg-background/70 p-3">
                  <p className="text-xs text-text-secondary">Alamat</p>
                  <p className="mt-1 text-sm font-semibold text-text-primary">{selectedWarga.address}</p>
                </div>
                <div className="rounded-card bg-background/70 p-3">
                  <p className="text-xs text-text-secondary">RT/RW</p>
                  <p className="mt-1 text-sm font-semibold text-text-primary">{selectedWarga.rtRw}</p>
                </div>
                <div className="rounded-card bg-background/70 p-3">
                  <p className="text-xs text-text-secondary">Jenis Kelamin</p>
                  <p className="mt-1 text-sm font-semibold text-text-primary">{selectedWarga.gender}</p>
                </div>
                <div className="rounded-card bg-background/70 p-3">
                  <p className="text-xs text-text-secondary">Tanggal Lahir</p>
                  <p className="mt-1 text-sm font-semibold text-text-primary">{selectedWarga.birthDate}</p>
                </div>
                <div className="rounded-card bg-background/70 p-3">
                  <p className="text-xs text-text-secondary">No. HP</p>
                  <p className="mt-1 text-sm font-semibold text-text-primary">{selectedWarga.phone}</p>
                </div>
                <div className="rounded-card bg-background/70 p-3">
                  <p className="text-xs text-text-secondary">Penghasilan</p>
                  <p className="mt-1 text-sm font-semibold text-text-primary">
                    {formatRupiah(selectedWarga.penghasilan)}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold">Kriteria SAW</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {selectedWarga.criteria.map((item) => (
                  <div key={item.label} className="rounded-card bg-background/70 p-3">
                    <p className="text-xs text-text-secondary">{item.label}</p>
                    <p className="mt-1 text-sm font-semibold text-text-primary">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold">Dokumen</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="rounded-card bg-background/70 p-3">
                  <p className="text-xs text-text-secondary">KTP</p>
                  <Badge variant={selectedWarga.documents.ktp === "Lengkap" ? "success" : "warning"}>
                    {selectedWarga.documents.ktp}
                  </Badge>
                </div>
                <div className="rounded-card bg-background/70 p-3">
                  <p className="text-xs text-text-secondary">KK</p>
                  <Badge variant={selectedWarga.documents.kk === "Lengkap" ? "success" : "warning"}>
                    {selectedWarga.documents.kk}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={openEditForm}>Ubah Data</Button>
              <Button variant="outline" onClick={openVerifyForm}>Catat Verifikasi</Button>
              <Button variant="outline" onClick={() => setShowHistory(true)}>Lihat Riwayat</Button>
            </div>
          </div>
        ) : null}
      </Drawer>
      <Drawer
        open={showForm}
        onClose={closeForm}
        title={isEditing ? "Ubah Warga" : "Tambah Warga"}
      >
        <div className="space-y-4">
          {formError ? <div className="rounded-card bg-accent-red/10 px-3 py-2 text-xs text-accent-red">{formError}</div> : null}
          <div className="grid gap-3 sm:grid-cols-2">
            <input className="rounded-button border border-border px-3 py-2 sm:col-span-2" placeholder="Nama Lengkap" value={formData.nama_lengkap} onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })} />
            <input className="rounded-button border border-border px-3 py-2" placeholder="NIK" value={formData.nik} onChange={(e) => setFormData({ ...formData, nik: e.target.value })} />
            <input className="rounded-button border border-border px-3 py-2" placeholder="No. KK" value={formData.no_kk} onChange={(e) => setFormData({ ...formData, no_kk: e.target.value })} />
            <input className="rounded-button border border-border px-3 py-2 sm:col-span-2" type="date" placeholder="Tanggal Lahir" value={formData.tanggal_lahir} onChange={(e) => setFormData({ ...formData, tanggal_lahir: e.target.value })} />
            <select className="rounded-button border border-border px-3 py-2" value={formData.jenis_kelamin} onChange={(e) => setFormData({ ...formData, jenis_kelamin: e.target.value })}>
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
            <input className="rounded-button border border-border px-3 py-2" placeholder="No. HP" value={formData.no_hp} onChange={(e) => setFormData({ ...formData, no_hp: e.target.value })} />
            <input className="rounded-button border border-border px-3 py-2 sm:col-span-2" placeholder="Alamat" value={formData.alamat} onChange={(e) => setFormData({ ...formData, alamat: e.target.value })} />
            <input className="rounded-button border border-border px-3 py-2" placeholder="RT" value={formData.rt} onChange={(e) => setFormData({ ...formData, rt: e.target.value })} />
            <input className="rounded-button border border-border px-3 py-2" placeholder="RW" value={formData.rw} onChange={(e) => setFormData({ ...formData, rw: e.target.value })} />
            <input className="rounded-button border border-border px-3 py-2 sm:col-span-2" placeholder="URL Foto KTP" value={formData.foto_ktp_url} onChange={(e) => setFormData({ ...formData, foto_ktp_url: e.target.value })} />
            <input className="rounded-button border border-border px-3 py-2 sm:col-span-2" placeholder="URL Foto KK" value={formData.foto_kk_url} onChange={(e) => setFormData({ ...formData, foto_kk_url: e.target.value })} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[["c1_value", "C1 - Jumlah Anggota Keluarga"], ["c2_value", "C2 - Jumlah Tanggungan"], ["c3_value", "C3 - Pendidikan"], ["c4_value", "C4 - Pekerjaan"], ["c5_value", "C5 - Status Rumah"], ["c6_value", "C6 - Luas Rumah"], ["c7_value", "C7 - Daya Listrik"], ["c8_value", "C8 - Kendaraan"], ["c9_value", "C9 - Tabungan"], ["c10_value", "C10 - Penghasilan"], ["c11_value", "C11 - Pengeluaran"], ["c12_value", "C12 - Kondisi Dinding"], ["c13_value", "C13 - Akses Air"]].map(([field, label]) => (
              <input
                key={field}
                className="rounded-button border border-border px-3 py-2"
                type="number"
                step="any"
                placeholder={label}
                value={formData[field]}
                onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSubmitForm} disabled={formLoading}>{formLoading ? (isEditing ? "Menyimpan..." : "Membuat...") : (isEditing ? "Simpan" : "Buat")}</Button>
            <Button variant="outline" onClick={closeForm}>Batal</Button>
          </div>
        </div>
      </Drawer>

      <Drawer
        open={showVerify}
        onClose={closeVerify}
        title="Catat Verifikasi"
      >
        {selectedWarga ? (
          <div className="space-y-4">
            {verifyError ? <div className="rounded-card bg-accent-red/10 px-3 py-2 text-xs text-accent-red">{verifyError}</div> : null}
            <p className="text-sm text-text-secondary">Tandai dokumen yang sudah lengkap untuk {selectedWarga.name}.</p>
            <label className="flex items-center gap-2"><input type="checkbox" checked={verifyKtp} onChange={(e) => setVerifyKtp(e.target.checked)} /> KTP lengkap</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={verifyKk} onChange={(e) => setVerifyKk(e.target.checked)} /> KK lengkap</label>
            <div className="flex gap-2">
              <Button onClick={handleSubmitVerify} disabled={verifyLoading}>{verifyLoading ? "Menyimpan..." : "Simpan"}</Button>
              <Button variant="outline" onClick={closeVerify}>Batal</Button>
            </div>
          </div>
        ) : null}
      </Drawer>

      <Drawer
        open={showHistory}
        onClose={closeHistory}
        title="Riwayat Perubahan"
      >
        <div className="space-y-4">
          {historyError ? <div className="rounded-card bg-accent-red/10 px-3 py-2 text-xs text-accent-red">{historyError}</div> : null}
          {historyLoading ? (
            <p className="text-sm text-text-secondary">Memuat riwayat...</p>
          ) : historyRecords.length === 0 ? (
            <p className="text-sm text-text-secondary">Belum ada riwayat untuk warga ini.</p>
          ) : (
            <div className="space-y-3">
              {historyRecords.map((record) => {
                const latest = record.data_baru || {};
                const previous = record.data_lama || {};
                const actor = record.actor_name || record.user_id || "Sistem";
                const summary = latest.nama_lengkap || previous.nama_lengkap || selectedWarga?.name || "Warga";

                return (
                  <div key={record.id} className="rounded-card border border-border bg-white p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-text-primary">{record.aksi}</p>
                        <p className="text-xs text-text-secondary">{actor} • {formatDate(record.created_at)}</p>
                      </div>
                      <Badge variant={record.aksi === "create" ? "success" : "info"}>{record.tabel}</Badge>
                    </div>
                    <div className="mt-3 grid gap-2 text-xs text-text-secondary">
                      <p><span className="font-semibold">Nama:</span> {summary}</p>
                      <p><span className="font-semibold">NIK:</span> {latest.nik || previous.nik || "-"}</p>
                      <p><span className="font-semibold">RT/RW:</span> {(latest.rt && latest.rw) ? `${latest.rt}/${latest.rw}` : (previous.rt && previous.rw ? `${previous.rt}/${previous.rw}` : "-")}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={closeHistory}>Tutup</Button>
          </div>
        </div>
      </Drawer>
    </AppShell>
  );
};

export default DataWargaPage;
