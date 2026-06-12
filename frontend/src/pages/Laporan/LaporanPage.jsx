import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import AppShell from "../../components/layout/AppShell";
import { useApi } from "../../hooks/useApi";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Drawer from "../../components/ui/Drawer";

const REPORTS = [
  {
    type: "sk",
    title: "SK Penerima BLT",
    desc: "Dokumen resmi untuk daftar penerima sesuai kuota.",
    status: "Siap",
    variant: "success"
  },
  {
    type: "ranking",
    title: "Ranking SAW",
    desc: "Ranking, normalisasi, dan bobot kriteria.",
    status: "Siap",
    variant: "success"
  },
  {
    type: "rekap",
    title: "Rekap RT/RW",
    desc: "Distribusi penerima berdasarkan wilayah.",
    status: "Siap",
    variant: "success"
  },
  {
    type: "audit",
    title: "Log Audit",
    desc: "Riwayat aktivitas sistem untuk inspeksi.",
    status: "Ekspor",
    variant: "info"
  }
];

const LaporanPage = () => {
  const { getPeriods, getRanking, getRekap, getAuditLogs, exportReport } = useApi();
  
  const [periods, setPeriods] = useState([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState("");
  
  // Preview Drawer states
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewType, setPreviewType] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");
  const [previewData, setPreviewData] = useState([]);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  useEffect(() => {
    const fetchPeriods = async () => {
      const res = await getPeriods();
      if (res.success && res.data.length > 0) {
        setPeriods(res.data);
        setSelectedPeriodId(res.data[0].id);
      }
    };
    fetchPeriods();
  }, [getPeriods]);

  const handlePreview = async (type) => {
    setPreviewType(type);
    setIsPreviewOpen(true);
    setIsLoadingPreview(true);
    setPreviewData([]);

    let res;
    if (type === "sk") {
      setPreviewTitle("Pratinjau SK Penerima BLT");
      res = await getRanking(selectedPeriodId);
      if (res.success) {
        // Filter only Penerima status
        const filtered = res.data.filter(item => item.status === "Penerima");
        setPreviewData(filtered);
      }
    } else if (type === "ranking") {
      setPreviewTitle("Pratinjau Ranking SAW");
      res = await getRanking(selectedPeriodId);
      if (res.success) {
        setPreviewData(res.data);
      }
    } else if (type === "rekap") {
      setPreviewTitle("Pratinjau Rekap Penerima per RT/RW");
      res = await getRekap(selectedPeriodId);
      if (res.success) {
        setPreviewData(res.data);
      }
    } else if (type === "audit") {
      setPreviewTitle("Pratinjau Log Audit Aktivitas");
      res = await getAuditLogs();
      if (res.success) {
        setPreviewData(res.data);
      }
    }

    if (res && !res.success) {
      toast.error(res.message || "Gagal memuat pratinjau laporan.");
    }
    setIsLoadingPreview(false);
  };

  const handleDownload = async (type) => {
    if (type !== "audit" && !selectedPeriodId) {
      toast.error("Silakan pilih periode terlebih dahulu.");
      return;
    }

    toast.loading("Mengunduh laporan...", { id: "download-report" });
    const res = await exportReport(selectedPeriodId, type);
    if (res.success) {
      toast.success("Laporan berhasil diunduh!", { id: "download-report" });
    } else {
      toast.error(res.message || "Gagal mengunduh laporan.", { id: "download-report" });
    }
  };

  const handleExportAll = async () => {
    if (!selectedPeriodId) {
      toast.error("Silakan pilih periode terlebih dahulu.");
      return;
    }

    toast.loading("Mengunduh seluruh laporan...", { id: "download-all" });
    // Sequentially download sk, ranking, rekap
    const res1 = await exportReport(selectedPeriodId, "sk");
    const res2 = await exportReport(selectedPeriodId, "ranking");
    const res3 = await exportReport(selectedPeriodId, "rekap");

    if (res1.success && res2.success && res3.success) {
      toast.success("Semua laporan berhasil diunduh!", { id: "download-all" });
    } else {
      toast.error("Beberapa unduhan laporan gagal.", { id: "download-all" });
    }
  };

  return (
    <AppShell title="Laporan" subtitle="Preview dan ekspor dokumen resmi SIPBANSOS." showRightPanel={false}>
      {/* Period Selector Card */}
      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="w-full sm:max-w-xs">
            <p className="text-xs text-text-secondary">Periode Laporan</p>
            <select 
              className="mt-2 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text-primary outline-none focus:border-primary-orange"
              value={selectedPeriodId}
              onChange={(e) => setSelectedPeriodId(e.target.value)}
              disabled={periods.length === 0}
            >
              {periods.map((p) => (
                <option key={p.id} value={p.id}>{p.nama_periode}</option>
              ))}
            </select>
          </div>
          <Button onClick={handleExportAll} disabled={periods.length === 0}>
            Ekspor Semua Laporan
          </Button>
        </div>
      </Card>

      {/* Grid Cards of Report Documents */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {REPORTS.map((report) => (
          <Card key={report.title} className="p-4 flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-sm font-bold text-text-primary">{report.title}</h3>
                <Badge variant={report.variant}>{report.status}</Badge>
              </div>
              <p className="mt-2 text-xs text-text-secondary">{report.desc}</p>
            </div>
            <div className="mt-2 flex gap-2 w-full">
              <Button 
                className="flex-1" 
                variant="outline" 
                onClick={() => handlePreview(report.type)}
                disabled={report.type !== "audit" && !selectedPeriodId}
              >
                Preview
              </Button>
              <Button 
                className="flex-1" 
                onClick={() => handleDownload(report.type)}
                disabled={report.type !== "audit" && !selectedPeriodId}
              >
                Unduh
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Preview Slide-Over Drawer */}
      <Drawer
        open={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title={previewTitle}
        subtitle="Pratinjau data aktual yang tersimpan di dalam database."
      >
        {isLoadingPreview ? (
          <div className="py-12 text-center text-sm text-text-secondary">
            Memuat pratinjau data...
          </div>
        ) : previewData.length === 0 ? (
          <div className="py-12 text-center text-sm text-text-secondary bg-background/50 rounded-xl p-6">
            <p className="font-semibold text-text-primary">Tidak Ada Data</p>
            <p className="mt-1 text-xs">
              Belum ada hasil perhitungan untuk periode ini. Silakan jalankan perhitungan terlebih dahulu di menu **Simulasi SAW**.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto pb-12">
            {/* Table based on type */}
            {previewType === "sk" && (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-text-secondary">
                    <th className="py-2 font-semibold">Rank</th>
                    <th className="py-2 font-semibold">Nama</th>
                    <th className="py-2 font-semibold">NIK</th>
                    <th className="py-2 font-semibold text-right">Skor Vi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {previewData.map((item) => (
                    <tr key={item.id}>
                      <td className="py-2.5 font-bold text-text-primary">{item.ranking}</td>
                      <td className="py-2.5 font-semibold text-text-primary">{item.nama_lengkap || item.nama}</td>
                      <td className="py-2.5 text-text-secondary">{item.nik || item.id}</td>
                      <td className="py-2.5 text-right font-semibold text-text-primary">
                        {Number(item.nilai_vi || item.vi).toFixed(4)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {previewType === "ranking" && (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-text-secondary">
                    <th className="py-2 font-semibold">Rank</th>
                    <th className="py-2 font-semibold">Nama</th>
                    <th className="py-2 font-semibold">NIK</th>
                    <th className="py-2 font-semibold">Status</th>
                    <th className="py-2 font-semibold text-right">Skor Vi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {previewData.map((item) => (
                    <tr key={item.id}>
                      <td className="py-2.5 font-bold text-text-primary">{item.ranking}</td>
                      <td className="py-2.5 font-semibold text-text-primary">{item.nama_lengkap || item.nama}</td>
                      <td className="py-2.5 text-text-secondary">{item.nik || item.id}</td>
                      <td className="py-2.5">
                        <Badge variant={item.status === "Penerima" ? "success" : item.status === "Cadangan" ? "info" : "danger"}>
                          {item.status}
                        </Badge>
                      </td>
                      <td className="py-2.5 text-right font-semibold text-text-primary">
                        {Number(item.nilai_vi || item.vi).toFixed(4)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {previewType === "rekap" && (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-text-secondary">
                    <th className="py-2 font-semibold">RT</th>
                    <th className="py-2 font-semibold">RW</th>
                    <th className="py-2 font-semibold text-right">Penerima</th>
                    <th className="py-2 font-semibold text-right">Cadangan</th>
                    <th className="py-2 font-semibold text-right">Tidak Lolos</th>
                    <th className="py-2 font-semibold text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {previewData.map((item, idx) => (
                    <tr key={`${item.rt}-${item.rw}-${idx}`}>
                      <td className="py-2.5 font-semibold text-text-primary">{item.rt}</td>
                      <td className="py-2.5 font-semibold text-text-primary">{item.rw}</td>
                      <td className="py-2.5 text-right text-accent-green font-semibold">{item.penerima}</td>
                      <td className="py-2.5 text-right text-accent-blue font-semibold">{item.cadangan}</td>
                      <td className="py-2.5 text-right text-text-secondary">{item.tidak_lolos}</td>
                      <td className="py-2.5 text-right font-bold text-text-primary">{item.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {previewType === "audit" && (
              <table className="w-full text-left text-[11px]">
                <thead>
                  <tr className="border-b border-border text-text-secondary">
                    <th className="py-2 font-semibold">Tanggal</th>
                    <th className="py-2 font-semibold">User</th>
                    <th className="py-2 font-semibold">Aksi</th>
                    <th className="py-2 font-semibold">Tabel</th>
                    <th className="py-2 font-semibold">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {previewData.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2 text-text-secondary">
                        {new Date(item.created_at).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" })}
                      </td>
                      <td className="py-2 font-semibold text-text-primary">{item.username}</td>
                      <td className="py-2">
                        <Badge variant={item.aksi === "create" ? "success" : item.aksi === "update" ? "info" : "danger"}>
                          {item.aksi}
                        </Badge>
                      </td>
                      <td className="py-2 text-text-secondary">{item.tabel}</td>
                      <td className="py-2 text-text-secondary">{item.ip_address}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </Drawer>
    </AppShell>
  );
};

export default LaporanPage;
