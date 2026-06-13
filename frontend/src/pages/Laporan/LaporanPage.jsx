import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import AppShell from "../../components/layout/AppShell";
import { useApi } from "../../hooks/useApi";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Drawer from "../../components/ui/Drawer";
import Skeleton from "../../components/ui/Skeleton";

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
  const { getPeriods, getRanking, getRekap, getAuditLogs, exportReport, getSettings } = useApi();
  
  const [periods, setPeriods] = useState([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState("");
  const [settings, setSettings] = useState(null);
  
  // Preview Drawer states
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewType, setPreviewType] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");
  const [previewData, setPreviewData] = useState([]);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  // Print states
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printType, setPrintType] = useState("");
  const [printData, setPrintData] = useState([]);
  const [documentNumber, setDocumentNumber] = useState("");
  const [documentDate, setDocumentDate] = useState("");
  const [signeeName, setSigneeName] = useState("");

  useEffect(() => {
    const fetchPeriodsAndSettings = async () => {
      const periodsRes = await getPeriods();
      if (periodsRes.success && periodsRes.data.length > 0) {
        setPeriods(periodsRes.data);
        setSelectedPeriodId(periodsRes.data[0].id);
      }
      const settingsRes = await getSettings();
      if (settingsRes.success) {
        setSettings(settingsRes.data);
      }
    };
    fetchPeriodsAndSettings();
  }, [getPeriods, getSettings]);

  const generateSKNumber = (format, number, villageName) => {
    const currentFormat = format || "[NOMOR]/[KODE-DESA]/[BULAN-ROMAWI]/[TAHUN]";
    const romanMonths = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
    const currentMonthRoman = romanMonths[new Date().getMonth()];
    const currentYear = new Date().getFullYear();
    const kodeDesa = "DS-" + (villageName || "DESA").toUpperCase().replace(/\s+/g, "-");
    return currentFormat
      .replace("[NOMOR]", number || "001")
      .replace("[KODE-DESA]", kodeDesa)
      .replace("[BULAN-ROMAWI]", currentMonthRoman)
      .replace("[TAHUN]", String(currentYear));
  };

  const formatDateIndonesian = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  };

  const getFullUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    const base = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
    return `${base.replace(/\/$/, "")}${path}`;
  };

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

  const handleCetakStart = async (type) => {
    setPrintType(type);
    setDocumentDate(new Date().toISOString().split("T")[0]);
    setSigneeName(settings?.nama_kades || `Kepala Desa ${settings?.nama_desa || "Mekar Jaya"}`);
    
    if (type === "sk") {
      const format = settings?.nomor_sk_format || "[NOMOR]/[KODE-DESA]/[BULAN-ROMAWI]/[TAHUN]";
      setDocumentNumber(generateSKNumber(format, "001", settings?.nama_desa));
    } else {
      setDocumentNumber("");
    }

    toast.loading("Memuat data cetak...", { id: "load-print" });
    
    let res;
    if (type === "sk") {
      res = await getRanking(selectedPeriodId);
      if (res.success) {
        const filtered = res.data.filter(item => item.status === "Penerima");
        setPrintData(filtered);
      }
    } else if (type === "ranking") {
      res = await getRanking(selectedPeriodId);
      if (res.success) {
        setPrintData(res.data);
      }
    } else if (type === "rekap") {
      res = await getRekap(selectedPeriodId);
      if (res.success) {
        setPrintData(res.data);
      }
    } else if (type === "audit") {
      res = await getAuditLogs();
      if (res.success) {
        setPrintData(res.data);
      }
    }

    if (res && res.success) {
      toast.success("Data cetak siap!", { id: "load-print" });
      setIsPrintModalOpen(true);
    } else {
      toast.error(res?.message || "Gagal memuat data cetak.", { id: "load-print" });
    }
  };

  const handleCetakFromPreview = () => {
    setPrintType(previewType);
    setPrintData(previewData);
    setDocumentDate(new Date().toISOString().split("T")[0]);
    setSigneeName(settings?.nama_kades || `Kepala Desa ${settings?.nama_desa || "Mekar Jaya"}`);
    
    if (previewType === "sk") {
      const format = settings?.nomor_sk_format || "[NOMOR]/[KODE-DESA]/[BULAN-ROMAWI]/[TAHUN]";
      setDocumentNumber(generateSKNumber(format, "001", settings?.nama_desa));
    } else {
      setDocumentNumber("");
    }
    
    setIsPrintModalOpen(true);
  };

  const handleExecutePrint = () => {
    setIsPrintModalOpen(false);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const selectedPeriod = periods.find(p => p.id === selectedPeriodId);
  const selectedPeriodName = selectedPeriod ? selectedPeriod.nama_periode : "";

  return (
    <>
      {/* CSS untuk Media Cetak */}
      <style>{`
        .print-only {
          display: none;
        }
        @media print {
          /* Sembunyikan elemen layar default */
          aside, header, nav, footer, button, .screen-only, select, .no-print, [role="dialog"] {
            display: none !important;
          }
          
          /* Hilangkan grid/sidebar AppShell layout */
          .grid, main {
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: transparent !important;
          }

          body {
            background: white !important;
            color: black !important;
            font-family: "Bookman Old Style", "Georgia", "Times New Roman", serif;
            margin: 0;
            padding: 0;
          }
          
          .print-only {
            display: block !important;
          }

          @page {
            size: A4;
            margin: 20mm;
          }

          tr {
            page-break-inside: avoid;
          }

          table {
            width: 100% !important;
            border-collapse: collapse !important;
          }

          th, td {
            border: 1px solid black !important;
            padding: 6px 8px !important;
            text-align: left !important;
            font-size: 11pt !important;
          }

          th {
            background-color: #f2f2f2 !important;
            font-weight: bold !important;
          }
        }
      `}</style>

      {/* RENDER DOKUMEN KHUSUS CETAK */}
      <div className="print-only text-black bg-white min-h-screen p-2" id="printable-area">
        {/* Kop Surat */}
        <div className="flex items-center border-b-4 border-double border-black pb-4 mb-6 relative" style={{ minHeight: "100px" }}>
          {settings?.logo_desa && (
            <img 
              src={getFullUrl(settings.logo_desa)} 
              alt="Logo Desa" 
              className="w-20 h-20 absolute left-0 top-0 object-contain"
            />
          )}
          <div className="text-center w-full px-20">
            <h1 className="text-sm font-bold uppercase tracking-wide leading-tight">
              Pemerintah Kabupaten {settings?.kabupaten || "Bogor"}
            </h1>
            <h2 className="text-sm font-bold uppercase tracking-wide leading-tight">
              Kecamatan {settings?.kecamatan || "Cibinong"}
            </h2>
            <h3 className="text-base font-bold uppercase tracking-wider leading-normal">
              Kantor Kepala Desa {settings?.nama_desa || "Mekar Jaya"}
            </h3>
            <p className="text-[10px] italic mt-1 leading-snug">
              Alamat: Kantor Desa {settings?.nama_desa || "Mekar Jaya"}, Kecamatan {settings?.kecamatan || "Cibinong"}, Kabupaten {settings?.kabupaten || "Bogor"}, Provinsi {settings?.provinsi || "Jawa Barat"}
            </p>
          </div>
        </div>

        {/* Judul Dokumen */}
        <div className="text-center mb-6 space-y-1">
          <h4 className="text-sm font-bold uppercase underline tracking-wide">
            {printType === "sk" ? "SURAT KEPUTUSAN KEPALA DESA" : 
             printType === "ranking" ? "LAPORAN PERINGKAT KELAYAKAN BANSOS (SAW)" : 
             printType === "rekap" ? "LAPORAN REKAPITULASI PENERIMA BANSOS PER RT/RW" : 
             "LAPORAN LOG AUDIT AKTIVITAS SISTEM"}
          </h4>
          {printType === "sk" ? (
            <>
              <p className="text-xs font-semibold">Nomor: {documentNumber}</p>
              <p className="text-xs font-bold uppercase mt-2">TENTANG</p>
              <p className="text-xs font-bold uppercase">PENETAPAN PENERIMA BANTUAN LANGSUNG TUNAI (BLT) DANA DESA</p>
              <p className="text-xs font-bold uppercase">PERIODE {selectedPeriodName?.toUpperCase()}</p>
            </>
          ) : (
            <p className="text-xs font-semibold">Periode: {selectedPeriodName}</p>
          )}
        </div>

        {/* Teks Pembuka khusus SK */}
        {printType === "sk" && (
          <div className="text-xs space-y-2 mb-6 leading-relaxed">
            <div className="flex">
              <span className="font-bold w-20 flex-shrink-0">Menimbang</span>
              <span className="w-4 text-center">:</span>
              <div className="flex-1 space-y-1">
                <p>a. Bahwa untuk membantu meringankan beban ekonomi warga masyarakat yang kurang mampu, perlu disalurkan Bantuan Langsung Tunai (BLT) Dana Desa;</p>
                <p>b. Bahwa warga yang namanya tercantum dalam lampiran keputusan ini telah diverifikasi dan dinilai layak menerima bantuan menggunakan metode Simple Additive Weighting (SAW).</p>
              </div>
            </div>
            <div className="flex">
              <span className="font-bold w-20 flex-shrink-0">Mengingat</span>
              <span className="w-4 text-center">:</span>
              <div className="flex-1 space-y-1">
                <p>1. Undang-Undang Nomor 6 Tahun 2014 tentang Desa;</p>
                <p>2. Peraturan Menteri Desa, Pembangunan Daerah Tertinggal, dan Transmigrasi tentang Prioritas Penggunaan Dana Desa.</p>
              </div>
            </div>
            <div className="text-center font-bold py-2">MEMUTUSKAN:</div>
            <div className="flex">
              <span className="font-bold w-20 flex-shrink-0">Menetapkan</span>
              <span className="w-4 text-center">:</span>
              <div className="flex-1">
                <p>Daftar nama Keluarga Penerima Manfaat (KPM) Bantuan Langsung Tunai (BLT) Dana Desa periode {selectedPeriodName} sebagaimana terlampir.</p>
              </div>
            </div>
          </div>
        )}

        {/* Tabel Data Cetak */}
        <div className="mt-4">
          {printData.length === 0 ? (
            <p className="text-xs text-center py-4 border border-dashed border-gray-400">Tidak ada data untuk dicetak.</p>
          ) : (
            <table>
              <thead>
                {printType === "sk" && (
                  <tr>
                    <th style={{ width: "8%" }}>No</th>
                    <th style={{ width: "35%" }}>Nama Lengkap</th>
                    <th style={{ width: "25%" }}>NIK</th>
                    <th style={{ width: "12%" }}>RT</th>
                    <th style={{ width: "12%" }}>RW</th>
                    <th style={{ width: "8%" }}>Skor Vi</th>
                  </tr>
                )}
                {printType === "ranking" && (
                  <tr>
                    <th style={{ width: "8%" }}>Rank</th>
                    <th style={{ width: "35%" }}>Nama Lengkap</th>
                    <th style={{ width: "25%" }}>NIK</th>
                    <th style={{ width: "10%" }}>RT</th>
                    <th style={{ width: "10%" }}>RW</th>
                    <th style={{ width: "12%" }}>Status</th>
                  </tr>
                )}
                {printType === "rekap" && (
                  <tr>
                    <th>RT</th>
                    <th>RW</th>
                    <th style={{ textAlign: "right" }}>Jumlah Penerima</th>
                    <th style={{ textAlign: "right" }}>Jumlah Cadangan</th>
                    <th style={{ textAlign: "right" }}>Tidak Lolos</th>
                    <th style={{ textAlign: "right" }}>Total Alternatif</th>
                  </tr>
                )}
                {printType === "audit" && (
                  <tr>
                    <th>Tanggal</th>
                    <th>Pengguna</th>
                    <th>Aksi</th>
                    <th>Tabel</th>
                    <th>IP Address</th>
                  </tr>
                )}
              </thead>
              <tbody>
                {printType === "sk" && printData.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>{item.nama_lengkap || item.nama}</td>
                    <td>{item.nik || item.id}</td>
                    <td>{item.rt}</td>
                    <td>{item.rw}</td>
                    <td>{Number(item.nilai_vi || item.vi).toFixed(4)}</td>
                  </tr>
                ))}
                {printType === "ranking" && printData.map((item) => (
                  <tr key={item.id}>
                    <td>{item.ranking}</td>
                    <td>{item.nama_lengkap || item.nama}</td>
                    <td>{item.nik || item.id}</td>
                    <td>{item.rt}</td>
                    <td>{item.rw}</td>
                    <td>{item.status}</td>
                  </tr>
                ))}
                {printType === "rekap" && printData.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.rt}</td>
                    <td>{item.rw}</td>
                    <td style={{ textAlign: "right" }}>{item.penerima}</td>
                    <td style={{ textAlign: "right" }}>{item.cadangan}</td>
                    <td style={{ textAlign: "right" }}>{item.tidak_lolos}</td>
                    <td style={{ textAlign: "right" }}>{item.total}</td>
                  </tr>
                ))}
                {printType === "audit" && printData.map((item, idx) => (
                  <tr key={idx}>
                    <td>{new Date(item.created_at).toLocaleString("id-ID")}</td>
                    <td>{item.username}</td>
                    <td>{item.aksi}</td>
                    <td>{item.tabel}</td>
                    <td>{item.ip_address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Bagian Tanda Tangan */}
        <div className="mt-12 flex justify-end">
          <div className="text-center w-72 text-xs space-y-1">
            <p>{settings?.nama_desa || "Mekar Jaya"}, {formatDateIndonesian(documentDate)}</p>
            <p className="font-semibold uppercase">Kepala Desa {settings?.nama_desa || "Mekar Jaya"}</p>
            
            {settings?.ttd_digital ? (
              <div className="py-2 flex justify-center">
                <img 
                  src={getFullUrl(settings.ttd_digital)} 
                  alt="Tanda Tangan Digital" 
                  className="h-14 object-contain border border-transparent bg-transparent"
                />
              </div>
            ) : (
              <div className="h-14"></div>
            )}
            
            <p className="font-bold underline uppercase">{signeeName}</p>
          </div>
        </div>
      </div>

      {/* RENDER LAYAR BIASA (SCREEN-ONLY) */}
      <div className="screen-only space-y-6">
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
                Ekspor Semua Laporan (CSV)
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
                <div className="mt-2 flex flex-col gap-2 w-full">
                  <div className="flex gap-2 w-full">
                    <Button 
                      className="flex-1 text-xs px-2" 
                      variant="outline" 
                      onClick={() => handlePreview(report.type)}
                      disabled={report.type !== "audit" && !selectedPeriodId}
                    >
                      Preview
                    </Button>
                    <Button 
                      className="flex-1 text-xs px-2" 
                      variant="outline"
                      onClick={() => handleDownload(report.type)}
                      disabled={report.type !== "audit" && !selectedPeriodId}
                    >
                      Unduh CSV
                    </Button>
                  </div>
                  <Button 
                    className="w-full text-xs" 
                    onClick={() => handleCetakStart(report.type)}
                    disabled={report.type !== "audit" && !selectedPeriodId}
                  >
                    Cetak PDF
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
              <div className="overflow-x-auto pb-12">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border text-text-secondary">
                      <th className="py-2"><Skeleton className="h-4 w-12" /></th>
                      <th className="py-2"><Skeleton className="h-4 w-32" /></th>
                      <th className="py-2"><Skeleton className="h-4 w-24" /></th>
                      <th className="py-2"><Skeleton className="h-4 w-20" /></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {[...Array(5)].map((_, i) => (
                      <tr key={`skeleton-${i}`}>
                        <td className="py-2.5"><Skeleton className="h-4 w-8" /></td>
                        <td className="py-2.5"><Skeleton className="h-4 w-32" /></td>
                        <td className="py-2.5"><Skeleton className="h-4 w-24" /></td>
                        <td className="py-2.5"><Skeleton className="h-4 w-16" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                {previewData.length > 0 && (
                  <div className="mb-4 flex justify-end">
                    <Button onClick={handleCetakFromPreview} className="text-xs">
                      Cetak Laporan ini (PDF)
                    </Button>
                  </div>
                )}

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
      </div>

      {/* MODAL CONFIGURASI CETAK */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button 
            type="button" 
            className="fixed inset-0 bg-black/45 transition-opacity" 
            onClick={() => setIsPrintModalOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl bg-surface p-6 shadow-2xl z-10 space-y-4 border border-border">
            <div>
              <h3 className="text-sm font-bold text-text-primary">Konfigurasi Cetak Laporan</h3>
              <p className="text-xs text-text-secondary mt-1">Sesuaikan informasi berikut sebelum mencetak dokumen resmi.</p>
            </div>
            
            <div className="space-y-3">
              {printType === "sk" && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-text-secondary">Nomor SK / Surat</label>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary"
                    value={documentNumber}
                    onChange={(e) => setDocumentNumber(e.target.value)}
                    placeholder="Contoh: 141/001/DS-MEKARJAYA/VI/2026"
                  />
                </div>
              )}
              
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-text-secondary">Tanggal Surat / Dokumen</label>
                <input
                  type="date"
                  className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary"
                  value={documentDate}
                  onChange={(e) => setDocumentDate(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-text-secondary">Nama Penandatangan (Kepala Desa)</label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary"
                  value={signeeName}
                  onChange={(e) => setSigneeName(e.target.value)}
                  placeholder="Contoh: Budi Santoso, S.Sos"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button className="flex-1 text-xs" onClick={handleExecutePrint}>
                Cetak Dokumen
              </Button>
              <Button variant="outline" className="flex-1 text-xs" onClick={() => setIsPrintModalOpen(false)}>
                Batal
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LaporanPage;
