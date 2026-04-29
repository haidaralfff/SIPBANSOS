import { useRef, useState } from "react";
import AppShell from "../../components/layout/AppShell";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import ProgressBar from "../../components/ui/ProgressBar";

const IMPORT_LOG = [
  { file: "import_warga_april.xlsx", status: "Berhasil", time: "Hari ini" },
  { file: "warga_rw03.csv", status: "Sebagian", time: "Kemarin" },
  { file: "data_lama_q1.xlsx", status: "Gagal", time: "20 Apr 2026" }
];

const PREVIEW_ROWS = [
  { row: 2, nik: "3275030102000016", name: "Siti Aminah", status: "Valid", detail: "-" },
  { row: 3, nik: "3275030102000024", name: "Budi Santoso", status: "Duplikat", detail: "NIK sudah terdaftar" },
  { row: 4, nik: "3275030102000032", name: "Rina Kartika", status: "Valid", detail: "-" },
  { row: 5, nik: "3275030102000040", name: "Tono Prasetyo", status: "Error", detail: "Format penghasilan tidak valid" },
  { row: 6, nik: "3275030102000058", name: "Sari Lestari", status: "Valid", detail: "-" }
];

const SUMMARY = {
  total: 320,
  valid: 284,
  duplicate: 12,
  error: 24
};

const ImportEksporPage = () => {
  const [activeTab, setActiveTab] = useState("import");
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleFiles = (files) => {
    if (!files || files.length === 0) return;
    setSelectedFile(files[0]);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);
    handleFiles(event.dataTransfer.files);
  };

  const handleBrowse = () => {
    fileInputRef.current?.click();
  };

  const statusVariant = (status) => {
    if (status === "Valid") return "success";
    if (status === "Duplikat") return "warning";
    return "danger";
  };

  return (
    <AppShell
      title="Import / Ekspor"
      subtitle="Upload data massal, validasi otomatis, dan ekspor laporan resmi."
    >
      <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        <Card className="p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-sm font-bold">Import Data Warga</h3>
              <p className="text-xs text-text-secondary">Gunakan template resmi untuk validasi maksimal.</p>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-background/70 p-1">
              <button
                type="button"
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  activeTab === "import" ? "bg-white text-text-primary" : "text-text-secondary"
                }`}
                onClick={() => setActiveTab("import")}
              >
                Import
              </button>
              <button
                type="button"
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  activeTab === "export" ? "bg-white text-text-primary" : "text-text-secondary"
                }`}
                onClick={() => setActiveTab("export")}
              >
                Ekspor
              </button>
            </div>
          </div>

          {activeTab === "import" ? (
            <>
              <div
                className={`mt-4 rounded-card border-2 border-dashed p-6 text-center transition ${
                  dragActive ? "border-primary-orange bg-primary-orange/5" : "border-border/70 bg-background/60"
                }`}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx"
                  className="hidden"
                  onChange={(event) => handleFiles(event.target.files)}
                />
                <p className="text-sm font-semibold text-text-primary">Tarik file Excel/CSV ke sini</p>
                <p className="mt-2 text-xs text-text-secondary">Ukuran maks 5MB, format .xlsx atau .csv</p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <Button onClick={handleBrowse}>Upload File</Button>
                  <Button variant="outline">Unduh Template</Button>
                </div>
                {selectedFile ? (
                  <p className="mt-3 text-xs text-text-secondary">File dipilih: {selectedFile.name}</p>
                ) : null}
              </div>

              <div className="mt-4 rounded-card bg-background/70 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-text-primary">Validasi Berjalan</p>
                  <Badge variant="info">82% selesai</Badge>
                </div>
                <ProgressBar value={82} className="mt-3" />
                <div className="mt-3 grid gap-2 text-xs text-text-secondary lg:grid-cols-4">
                  <span>{SUMMARY.total} baris diproses</span>
                  <span>{SUMMARY.valid} valid</span>
                  <span>{SUMMARY.duplicate} duplikat</span>
                  <span>{SUMMARY.error} error format</span>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold">Preview Validasi</h4>
                  <Button variant="outline">Unduh Laporan Error</Button>
                </div>
                <div className="mt-3 overflow-x-auto rounded-card border border-border/60">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-background/70 text-xs text-text-secondary">
                      <tr>
                        <th className="px-3 py-2 font-semibold">Baris</th>
                        <th className="px-3 py-2 font-semibold">NIK</th>
                        <th className="px-3 py-2 font-semibold">Nama</th>
                        <th className="px-3 py-2 font-semibold">Status</th>
                        <th className="px-3 py-2 font-semibold">Catatan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {PREVIEW_ROWS.map((row) => (
                        <tr key={`${row.row}-${row.nik}`}>
                          <td className="px-3 py-3 text-text-secondary">{row.row}</td>
                          <td className="px-3 py-3 text-text-secondary">{row.nik}</td>
                          <td className="px-3 py-3 text-text-secondary">{row.name}</td>
                          <td className="px-3 py-3">
                            <Badge variant={statusVariant(row.status)}>{row.status}</Badge>
                          </td>
                          <td className="px-3 py-3 text-text-secondary">{row.detail}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button>Konfirmasi Import</Button>
                  <Button variant="outline">Batalkan</Button>
                </div>
              </div>
            </>
          ) : (
            <div className="mt-4 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-text-secondary">Periode</p>
                  <select className="mt-2 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text-primary">
                    <option>BLT Q2 2026</option>
                    <option>BLT Q1 2026</option>
                  </select>
                </div>
                <div>
                  <p className="text-xs text-text-secondary">Format</p>
                  <select className="mt-2 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text-primary">
                    <option>PDF</option>
                    <option>Excel</option>
                    <option>CSV</option>
                  </select>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex items-center gap-2 rounded-card border border-border/60 bg-background/70 p-3 text-xs text-text-secondary">
                  <input type="checkbox" defaultChecked />
                  Sertakan ranking SAW dan normalisasi
                </label>
                <label className="flex items-center gap-2 rounded-card border border-border/60 bg-background/70 p-3 text-xs text-text-secondary">
                  <input type="checkbox" />
                  Sertakan hanya penerima sesuai kuota
                </label>
              </div>
              <Button>Ekspor Sekarang</Button>
            </div>
          )}
        </Card>

        <div className="space-y-4">
          <Card className="p-4">
            {activeTab === "import" ? (
              <>
                <h3 className="text-sm font-bold">Template & Panduan</h3>
                <p className="text-xs text-text-secondary">Pastikan format sesuai sebelum upload.</p>
                <div className="mt-4 flex flex-col gap-2">
                  <Button variant="outline">Unduh Template Excel</Button>
                  <Button variant="outline">Unduh Template CSV</Button>
                  <Button variant="outline">Lihat Panduan Import</Button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-sm font-bold">Ekspor Cepat</h3>
                <p className="text-xs text-text-secondary">Pilih format sesuai kebutuhan laporan.</p>
                <div className="mt-4 flex flex-col gap-2">
                  <Button>Ekspor Ranking SAW</Button>
                  <Button variant="outline">Ekspor Data Warga</Button>
                  <Button variant="outline">Ekspor Log Audit</Button>
                </div>
              </>
            )}
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold">Riwayat Import</h3>
              <button type="button" className="text-xs font-semibold text-primary-orange">
                Lihat semua
              </button>
            </div>
            <div className="mt-4 space-y-3">
              {IMPORT_LOG.map((item) => (
                <div key={item.file} className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{item.file}</p>
                    <p className="text-xs text-text-secondary">{item.time}</p>
                  </div>
                  <Badge
                    variant={
                      item.status === "Berhasil"
                        ? "success"
                        : item.status === "Sebagian"
                          ? "warning"
                          : "danger"
                    }
                  >
                    {item.status}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
};

export default ImportEksporPage;
