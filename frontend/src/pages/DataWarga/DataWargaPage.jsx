import { useMemo, useState } from "react";
import AppShell from "../../components/layout/AppShell";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Drawer from "../../components/ui/Drawer";
import { formatRupiah } from "../../utils/formatter";

const STATS = [
  {
    label: "Warga Aktif",
    value: "1.128",
    helper: "+24 minggu ini",
    variant: "success",
    note: "Data aktif siap dihitung."
  },
  {
    label: "Menunggu Verifikasi",
    value: "68",
    helper: "RW 01-07",
    variant: "info",
    note: "Dokumen perlu validasi."
  },
  {
    label: "Dokumen Kurang",
    value: "19",
    helper: "Perlu tindak lanjut",
    variant: "warning",
    note: "KTP/KK belum lengkap."
  }
];

const WARGA = [
  {
    id: 1,
    name: "Siti Aminah",
    nik: "3275030102000016",
    noKk: "3275030102000099",
    rtRw: "02/04",
    address: "Kp. Mekar Jaya Blok A No. 12",
    gender: "Perempuan",
    birthDate: "12 Feb 1984",
    phone: "0812-8899-1122",
    penghasilan: 500000,
    tanggungan: 5,
    pekerjaan: "Tidak Bekerja",
    pendidikan: "SD",
    kesehatan: "Sakit Kronis",
    status: "Penerima",
    verification: "Terverifikasi",
    updated: "2 jam lalu",
    documents: {
      ktp: "Lengkap",
      kk: "Lengkap"
    },
    criteria: [
      { label: "Penghasilan per Bulan", value: "Rp 500.000 (Skor 5)" },
      { label: "Jumlah Tanggungan", value: "5 orang" },
      { label: "Kondisi Tempat Tinggal", value: "Sewa Kamar (Skor 4)" },
      { label: "Status Kepemilikan Rumah", value: "Tidak Punya (Skor 5)" },
      { label: "Akses Air Bersih", value: "Tidak Ada (Skor 5)" },
      { label: "Pengeluaran Listrik", value: "Rp 150.000" },
      { label: "Pengeluaran Pangan", value: "Rp 30.000 / hari" },
      { label: "Biaya Pendidikan", value: "Rp 200.000" },
      { label: "Biaya Kesehatan", value: "Rp 50.000" },
      { label: "Cicilan / Hutang", value: "Rp 300.000" },
      { label: "Tingkat Pendidikan KK", value: "SD (Skor 4)" },
      { label: "Status Pekerjaan KK", value: "Tidak Bekerja (Skor 5)" },
      { label: "Kondisi Kesehatan", value: "Sakit Kronis (Skor 5)" }
    ]
  },
  {
    id: 2,
    name: "Budi Santoso",
    nik: "3275030102000024",
    noKk: "3275030102000088",
    rtRw: "01/03",
    address: "Kp. Mekar Jaya Blok C No. 7",
    gender: "Laki-laki",
    birthDate: "02 Mei 1979",
    phone: "0813-2244-8899",
    penghasilan: 900000,
    tanggungan: 3,
    pekerjaan: "Buruh Harian",
    pendidikan: "SMP",
    kesehatan: "Rentan",
    status: "Cadangan",
    verification: "Menunggu",
    updated: "Hari ini",
    documents: {
      ktp: "Lengkap",
      kk: "Kurang"
    },
    criteria: [
      { label: "Penghasilan per Bulan", value: "Rp 900.000 (Skor 4)" },
      { label: "Jumlah Tanggungan", value: "3 orang" },
      { label: "Kondisi Tempat Tinggal", value: "Kontrak (Skor 3)" },
      { label: "Status Kepemilikan Rumah", value: "Menumpang (Skor 4)" },
      { label: "Akses Air Bersih", value: "Terbatas (Skor 3)" },
      { label: "Pengeluaran Listrik", value: "Rp 220.000" },
      { label: "Pengeluaran Pangan", value: "Rp 45.000 / hari" },
      { label: "Biaya Pendidikan", value: "Rp 150.000" },
      { label: "Biaya Kesehatan", value: "Rp 120.000" },
      { label: "Cicilan / Hutang", value: "Rp 150.000" },
      { label: "Tingkat Pendidikan KK", value: "SMP (Skor 3)" },
      { label: "Status Pekerjaan KK", value: "Buruh Harian (Skor 3)" },
      { label: "Kondisi Kesehatan", value: "Rentan (Skor 4)" }
    ]
  },
  {
    id: 3,
    name: "Rina Kartika",
    nik: "3275030102000032",
    noKk: "3275030102000077",
    rtRw: "05/07",
    address: "Kp. Mekar Jaya Blok D No. 18",
    gender: "Perempuan",
    birthDate: "20 Agu 1990",
    phone: "0821-1188-4422",
    penghasilan: 1600000,
    tanggungan: 2,
    pekerjaan: "Wiraswasta",
    pendidikan: "SMA",
    kesehatan: "Sehat",
    status: "Tidak Lolos",
    verification: "Terverifikasi",
    updated: "Kemarin",
    documents: {
      ktp: "Lengkap",
      kk: "Lengkap"
    },
    criteria: [
      { label: "Penghasilan per Bulan", value: "Rp 1.600.000 (Skor 2)" },
      { label: "Jumlah Tanggungan", value: "2 orang" },
      { label: "Kondisi Tempat Tinggal", value: "Milik Pribadi (Skor 2)" },
      { label: "Status Kepemilikan Rumah", value: "Milik Sendiri (Skor 2)" },
      { label: "Akses Air Bersih", value: "Ada (Skor 2)" },
      { label: "Pengeluaran Listrik", value: "Rp 300.000" },
      { label: "Pengeluaran Pangan", value: "Rp 70.000 / hari" },
      { label: "Biaya Pendidikan", value: "Rp 250.000" },
      { label: "Biaya Kesehatan", value: "Rp 80.000" },
      { label: "Cicilan / Hutang", value: "Rp 100.000" },
      { label: "Tingkat Pendidikan KK", value: "SMA (Skor 2)" },
      { label: "Status Pekerjaan KK", value: "Wiraswasta (Skor 2)" },
      { label: "Kondisi Kesehatan", value: "Sehat (Skor 2)" }
    ]
  },
  {
    id: 4,
    name: "Tono Prasetyo",
    nik: "3275030102000040",
    noKk: "3275030102000066",
    rtRw: "03/02",
    address: "Kp. Mekar Jaya Blok B No. 2",
    gender: "Laki-laki",
    birthDate: "05 Mar 1987",
    phone: "0817-6600-1112",
    penghasilan: 700000,
    tanggungan: 4,
    pekerjaan: "Pekerja Tidak Tetap",
    pendidikan: "SD",
    kesehatan: "Rentan",
    status: "Penerima",
    verification: "Perlu Revisi",
    updated: "3 hari lalu",
    documents: {
      ktp: "Kurang",
      kk: "Lengkap"
    },
    criteria: [
      { label: "Penghasilan per Bulan", value: "Rp 700.000 (Skor 4)" },
      { label: "Jumlah Tanggungan", value: "4 orang" },
      { label: "Kondisi Tempat Tinggal", value: "Menumpang (Skor 4)" },
      { label: "Status Kepemilikan Rumah", value: "Menumpang (Skor 4)" },
      { label: "Akses Air Bersih", value: "Terbatas (Skor 3)" },
      { label: "Pengeluaran Listrik", value: "Rp 180.000" },
      { label: "Pengeluaran Pangan", value: "Rp 35.000 / hari" },
      { label: "Biaya Pendidikan", value: "Rp 120.000" },
      { label: "Biaya Kesehatan", value: "Rp 60.000" },
      { label: "Cicilan / Hutang", value: "Rp 180.000" },
      { label: "Tingkat Pendidikan KK", value: "SD (Skor 4)" },
      { label: "Status Pekerjaan KK", value: "Pekerja Tidak Tetap (Skor 4)" },
      { label: "Kondisi Kesehatan", value: "Rentan (Skor 4)" }
    ]
  }
];

const RT_RW_OPTIONS = ["Semua", "01/03", "02/04", "03/02", "05/07"];
const STATUS_OPTIONS = ["Semua", "Penerima", "Cadangan", "Tidak Lolos"];
const VERIFICATION_OPTIONS = ["Semua", "Terverifikasi", "Menunggu", "Perlu Revisi"];

const statusVariant = (status) => {
  if (status === "Penerima") return "penerima";
  if (status === "Cadangan") return "cadangan";
  return "tidak-lolos";
};

const verificationVariant = (status) => {
  if (status === "Terverifikasi") return "success";
  if (status === "Menunggu") return "warning";
  return "danger";
};

const compactId = (value) => {
  if (!value) return "";
  return value.length <= 12 ? value : `${value.slice(0, 6)}...${value.slice(-4)}`;
};

const DataWargaPage = () => {
  const [query, setQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Semua");
  const [selectedRtRw, setSelectedRtRw] = useState("Semua");
  const [selectedVerification, setSelectedVerification] = useState("Semua");
  const [selectedWarga, setSelectedWarga] = useState(null);

  const filteredWarga = useMemo(() => {
    const loweredQuery = query.trim().toLowerCase();
    return WARGA.filter((item) => {
      const matchesQuery =
        !loweredQuery ||
        item.name.toLowerCase().includes(loweredQuery) ||
        item.nik.includes(loweredQuery) ||
        item.noKk.includes(loweredQuery);
      const matchesStatus = selectedStatus === "Semua" || item.status === selectedStatus;
      const matchesRtRw = selectedRtRw === "Semua" || item.rtRw === selectedRtRw;
      const matchesVerification =
        selectedVerification === "Semua" || item.verification === selectedVerification;
      return matchesQuery && matchesStatus && matchesRtRw && matchesVerification;
    });
  }, [query, selectedStatus, selectedRtRw, selectedVerification]);

  const closeDrawer = () => setSelectedWarga(null);

  return (
    <AppShell
      title="Data Warga"
      subtitle="Kelola data warga berdasarkan 13 kriteria dan status penyaluran."
      showRightPanel={false}
    >
      <div className="grid gap-4 lg:grid-cols-3">
        {STATS.map((item) => (
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
                {RT_RW_OPTIONS.map((option) => (
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
              {filteredWarga.map((item) => (
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
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between text-xs text-text-secondary">
          <span>Menampilkan {filteredWarga.length} dari 1.128 data</span>
          <div className="flex items-center gap-2">
            <Button variant="ghost">Sebelumnya</Button>
            <Button variant="ghost">Berikutnya</Button>
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
