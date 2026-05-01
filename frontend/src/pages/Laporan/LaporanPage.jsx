import AppShell from "../../components/layout/AppShell";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";

const REPORTS = [
  {
    title: "SK Penerima BLT",
    desc: "Dokumen resmi untuk daftar penerima sesuai kuota.",
    status: "Siap",
    variant: "success"
  },
  {
    title: "Ranking SAW",
    desc: "Ranking, normalisasi, dan bobot kriteria.",
    status: "Perlu Review",
    variant: "warning"
  },
  {
    title: "Rekap RT/RW",
    desc: "Distribusi penerima berdasarkan wilayah.",
    status: "Siap",
    variant: "success"
  },
  {
    title: "Log Audit",
    desc: "Riwayat aktivitas sistem untuk inspeksi.",
    status: "Ekspor",
    variant: "info"
  }
];

const LaporanPage = () => {
  return (
    <AppShell title="Laporan" subtitle="Preview dan ekspor dokumen resmi SIPBANSOS." showRightPanel={false}>
      <Card className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-xs text-text-secondary">Periode</p>
              <select className="mt-2 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text-primary">
                <option>BLT Q2 2026</option>
                <option>BLT Q1 2026</option>
              </select>
            </div>
            <div>
              <p className="text-xs text-text-secondary">Status Warga</p>
              <select className="mt-2 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text-primary">
                <option>Semua</option>
                <option>Penerima</option>
                <option>Cadangan</option>
              </select>
            </div>
            <div>
              <p className="text-xs text-text-secondary">Format Ekspor</p>
              <select className="mt-2 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text-primary">
                <option>PDF</option>
                <option>Excel</option>
              </select>
            </div>
          </div>
          <Button>Ekspor Semua</Button>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        {REPORTS.map((report) => (
          <Card key={report.title} className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold">{report.title}</h3>
                <p className="mt-1 text-xs text-text-secondary">{report.desc}</p>
              </div>
              <Badge variant={report.variant}>{report.status}</Badge>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button>Preview</Button>
              <Button variant="outline">Unduh</Button>
            </div>
          </Card>
        ))}
      </div>
    </AppShell>
  );
};

export default LaporanPage;
