import { useEffect, useMemo, useState } from "react";
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
  { label: "Penghasilan per Bulan", value: formatRupiah(item.penghasilan) },
  { label: "Jumlah Tanggungan", value: `${item.jumlah_tanggungan} orang` },
  { label: "Kondisi Tempat Tinggal", value: `Skor ${item.kondisi_tempat}` },
  { label: "Status Kepemilikan Rumah", value: `Skor ${item.status_kepemilikan}` },
  { label: "Akses Air Bersih", value: `Skor ${item.akses_air}` },
  { label: "Pengeluaran Listrik", value: formatRupiah(item.pengeluaran_listrik) },
  { label: "Pengeluaran Pangan", value: formatRupiah(item.pengeluaran_pangan) },
  { label: "Biaya Pendidikan", value: formatRupiah(item.biaya_pendidikan) },
  { label: "Biaya Kesehatan", value: formatRupiah(item.biaya_kesehatan) },
  { label: "Cicilan / Hutang", value: formatRupiah(item.cicilan_hutang) },
  { label: "Tingkat Pendidikan KK", value: `Skor ${item.tingkat_pendidikan}` },
  { label: "Status Pekerjaan KK", value: `Skor ${item.status_pekerjaan}` },
  { label: "Kondisi Kesehatan", value: `Skor ${item.kondisi_kesehatan}` }
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
    rtRw,
    address: item.alamat,
    gender: item.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan",
    birthDate: formatDate(item.tanggal_lahir),
    phone: item.no_hp || "-",
    penghasilan: item.penghasilan,
    tanggungan: item.jumlah_tanggungan,
    status: item.is_active ? "Aktif" : "Nonaktif",
    verification,
    updated: formatDate(item.updated_at),
    documents,
    criteria: buildCriteria(item)
  };
};

const DataWargaPage = () => {
  const { getWarga } = useApi();
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

  const closeDrawer = () => setSelectedWarga(null);

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
              <Button variant="outline">Import</Button>
              <Button variant="outline">Ekspor</Button>
              <Button>Tambah Warga</Button>
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
              <Button>Ubah Data</Button>
              <Button variant="outline">Catat Verifikasi</Button>
              <Button variant="outline">Lihat Riwayat</Button>
            </div>
          </div>
        ) : null}
      </Drawer>
    </AppShell>
  );
};

export default DataWargaPage;
