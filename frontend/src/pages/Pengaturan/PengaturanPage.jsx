import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import AppShell from "../../components/layout/AppShell";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Drawer from "../../components/ui/Drawer";
import { useApi } from "../../hooks/useApi";

const PengaturanPage = () => {
  const {
    getSettings,
    updateSettings,
    getPeriods,
    createPeriod,
    updatePeriod,
    deletePeriod,
    getKriteriaVersions,
    uploadFile
  } = useApi();

  // Settings states
  const [namaDesa, setNamaDesa] = useState("");
  const [kecamatan, setKecamatan] = useState("");
  const [kabupaten, setKabupaten] = useState("");
  const [provinsi, setProvinsi] = useState("");
  const [logoDesa, setLogoDesa] = useState("");
  const [nomorSKFormat, setNomorSKFormat] = useState("");
  const [ttdDigital, setTtdDigital] = useState("");

  // Periods & versions
  const [periods, setPeriods] = useState([]);
  const [bobotVersions, setBobotVersions] = useState([]);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingSK, setIsSavingSK] = useState(false);

  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState("create"); // "create" | "edit"
  const [selectedPeriodId, setSelectedPeriodId] = useState(null);
  const [drawerForm, setDrawerForm] = useState({
    nama_periode: "",
    tanggal_mulai: "",
    tanggal_selesai: "",
    kuota: 100,
    bobot_id: "",
    status: "draft"
  });

  const fetchSettingsAndPeriods = async () => {
    setIsLoading(true);
    try {
      const [settingsRes, periodsRes, versionsRes] = await Promise.all([
        getSettings(),
        getPeriods(),
        getKriteriaVersions()
      ]);

      if (settingsRes.success) {
        setNamaDesa(settingsRes.data.nama_desa || "");
        setKecamatan(settingsRes.data.kecamatan || "");
        setKabupaten(settingsRes.data.kabupaten || "");
        setProvinsi(settingsRes.data.provinsi || "");
        setLogoDesa(settingsRes.data.logo_desa || "");
        setNomorSKFormat(settingsRes.data.nomor_sk_format || "");
        setTtdDigital(settingsRes.data.ttd_digital || "");
      }
      if (periodsRes.success) {
        setPeriods(periodsRes.data);
      }
      if (versionsRes.success) {
        setBobotVersions(versionsRes.data);
      }
    } catch (error) {
      toast.error("Gagal memuat data pengaturan.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettingsAndPeriods();
  }, []);

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    const res = await updateSettings({
      nama_desa: namaDesa,
      kecamatan,
      kabupaten,
      provinsi
    });
    if (res.success) {
      toast.success("Profil desa berhasil disimpan");
    } else {
      toast.error(res.message);
    }
    setIsSavingProfile(false);
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const uploadRes = await uploadFile(file);
    if (uploadRes.success) {
      const saveRes = await updateSettings({ logo_desa: uploadRes.url });
      if (saveRes.success) {
        setLogoDesa(uploadRes.url);
        toast.success("Logo desa berhasil diperbarui");
      } else {
        toast.error(saveRes.message);
      }
    } else {
      toast.error(uploadRes.message);
    }
  };

  const handleTtdUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const uploadRes = await uploadFile(file);
    if (uploadRes.success) {
      const saveRes = await updateSettings({ ttd_digital: uploadRes.url });
      if (saveRes.success) {
        setTtdDigital(uploadRes.url);
        toast.success("Tanda tangan digital berhasil diperbarui");
      } else {
        toast.error(saveRes.message);
      }
    } else {
      toast.error(uploadRes.message);
    }
  };

  const handleTtdDelete = async () => {
    const saveRes = await updateSettings({ ttd_digital: "" });
    if (saveRes.success) {
      setTtdDigital("");
      toast.success("Tanda tangan digital berhasil dihapus");
    } else {
      toast.error(saveRes.message);
    }
  };

  const handleSaveSKFormat = async () => {
    setIsSavingSK(true);
    const res = await updateSettings({ nomor_sk_format: nomorSKFormat });
    if (res.success) {
      toast.success("Format Nomor SK berhasil disimpan");
    } else {
      toast.error(res.message);
    }
    setIsSavingSK(false);
  };

  const handleResetSKFormat = () => {
    setNomorSKFormat("[NOMOR]/[KODE-DESA]/[BULAN-ROMAWI]/[TAHUN]");
  };

  const handleTestSKFormat = () => {
    const format = nomorSKFormat || "[NOMOR]/[KODE-DESA]/[BULAN-ROMAWI]/[TAHUN]";
    const romanMonths = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
    const currentMonthRoman = romanMonths[new Date().getMonth()];
    const currentYear = new Date().getFullYear();

    const result = format
      .replace("[NOMOR]", "001")
      .replace("[KODE-DESA]", "DS-MEKARJAYA")
      .replace("[BULAN-ROMAWI]", currentMonthRoman)
      .replace("[TAHUN]", String(currentYear));

    toast(`Hasil Uji: ${result}`, {
      icon: "📝",
      duration: 4000
    });
  };

  const openCreateDrawer = () => {
    setDrawerMode("create");
    setSelectedPeriodId(null);
    setDrawerForm({
      nama_periode: "",
      tanggal_mulai: new Date().toISOString().split("T")[0],
      tanggal_selesai: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      kuota: 100,
      bobot_id: bobotVersions.length > 0 ? bobotVersions[0].id : "",
      status: "draft"
    });
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (period) => {
    setDrawerMode("edit");
    setSelectedPeriodId(period.id);
    setDrawerForm({
      nama_periode: period.nama_periode,
      tanggal_mulai: period.tanggal_mulai ? new Date(period.tanggal_mulai).toISOString().split("T")[0] : "",
      tanggal_selesai: period.tanggal_selesai ? new Date(period.tanggal_selesai).toISOString().split("T")[0] : "",
      kuota: period.kuota,
      bobot_id: period.bobot_id || (bobotVersions.length > 0 ? bobotVersions[0].id : ""),
      status: period.status
    });
    setIsDrawerOpen(true);
  };

  const handleSavePeriod = async (e) => {
    e.preventDefault();
    if (drawerMode === "create") {
      const res = await createPeriod(drawerForm);
      if (res.success) {
        toast.success("Periode berhasil dibuat");
        setIsDrawerOpen(false);
        const newPeriodsRes = await getPeriods();
        if (newPeriodsRes.success) setPeriods(newPeriodsRes.data);
      } else {
        toast.error(res.message);
      }
    } else {
      const res = await updatePeriod(selectedPeriodId, drawerForm);
      if (res.success) {
        toast.success("Periode berhasil diubah");
        setIsDrawerOpen(false);
        const newPeriodsRes = await getPeriods();
        if (newPeriodsRes.success) setPeriods(newPeriodsRes.data);
      } else {
        toast.error(res.message);
      }
    }
  };

  const handleDeletePeriod = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus periode ini? Tindakan ini akan menghapus semua data terkait secara permanen.")) return;
    const res = await deletePeriod(id);
    if (res.success) {
      toast.success("Periode berhasil dihapus");
      const newPeriodsRes = await getPeriods();
      if (newPeriodsRes.success) setPeriods(newPeriodsRes.data);
    } else {
      toast.error(res.message);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  };

  if (isLoading) {
    return (
      <AppShell title="Pengaturan" subtitle="Profil desa, nomor surat, dan konfigurasi periode." showRightPanel={false}>
        <div className="flex h-64 items-center justify-center">
          <p className="text-sm text-text-secondary">Memuat data pengaturan...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Pengaturan" subtitle="Profil desa, nomor surat, dan konfigurasi periode." showRightPanel={false}>
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card className="p-4">
          <h3 className="text-sm font-bold">Profil Desa</h3>
          <p className="text-xs text-text-secondary">Digunakan untuk kop surat dan laporan.</p>
          
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <input
              className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text-primary"
              placeholder="Nama desa"
              value={namaDesa}
              onChange={(e) => setNamaDesa(e.target.value)}
            />
            <input
              className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text-primary"
              placeholder="Kecamatan"
              value={kecamatan}
              onChange={(e) => setKecamatan(e.target.value)}
            />
            <input
              className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text-primary"
              placeholder="Kabupaten/Kota"
              value={kabupaten}
              onChange={(e) => setKabupaten(e.target.value)}
            />
            <input
              className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text-primary"
              placeholder="Provinsi"
              value={provinsi}
              onChange={(e) => setProvinsi(e.target.value)}
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button onClick={handleSaveProfile} disabled={isSavingProfile}>
              {isSavingProfile ? "Menyimpan..." : "Simpan Profil"}
            </Button>
            
            <label className="cursor-pointer inline-flex items-center justify-center rounded-xl border border-border bg-white px-3 py-2 text-xs font-semibold text-text-primary hover:bg-background transition-colors h-[38px]">
              Unggah Logo
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            </label>

            {logoDesa && (
              <div className="flex items-center gap-2 rounded-xl border border-border bg-background/50 px-2 py-1">
                <img
                  src={logoDesa}
                  alt="Logo preview"
                  className="h-6 w-6 object-contain"
                />
                <span className="text-[10px] text-text-secondary truncate max-w-[120px]">
                  Logo Desa Aktif
                </span>
              </div>
            )}
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold">Nomor SK</h3>
              <Badge variant="info">Format aktif</Badge>
            </div>
            <input
              className="mt-4 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text-primary"
              value={nomorSKFormat}
              onChange={(e) => setNomorSKFormat(e.target.value)}
              placeholder="[NOMOR]/[KODE-DESA]/[BULAN-ROMAWI]/[TAHUN]"
            />
            <div className="mt-4 flex flex-wrap gap-2">
              <Button onClick={handleSaveSKFormat} disabled={isSavingSK}>
                {isSavingSK ? "Menyimpan..." : "Simpan Format"}
              </Button>
              <Button variant="outline" onClick={handleTestSKFormat}>
                Uji Format
              </Button>
              <Button
                variant="outline"
                className="text-text-secondary border-transparent hover:bg-background hover:text-text-primary"
                onClick={handleResetSKFormat}
              >
                Reset
              </Button>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="text-sm font-bold">Tanda Tangan Digital</h3>
            
            {ttdDigital ? (
              <div className="mt-3">
                <img
                  src={ttdDigital}
                  alt="Tanda Tangan Digital"
                  className="h-16 object-contain border border-border bg-white rounded-lg p-1"
                />
              </div>
            ) : (
              <p className="text-xs text-text-secondary mt-1">
                Belum ada tanda tangan digital yang diunggah.
              </p>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              <label className="cursor-pointer inline-flex items-center justify-center rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primary/95 transition-colors">
                Upload TTD
                <input type="file" accept="image/*" className="hidden" onChange={handleTtdUpload} />
              </label>
              
              {ttdDigital && (
                <Button variant="outline" onClick={handleTtdDelete}>
                  Hapus TTD
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold">Periode Bansos</h3>
            <p className="text-xs text-text-secondary">Kelola periode dan kuota penerima.</p>
          </div>
          <Button onClick={openCreateDrawer}>Tambah Periode</Button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {periods.length === 0 ? (
            <p className="text-xs text-text-secondary py-4 col-span-3 text-center">
              Belum ada periode bansos yang dibuat.
            </p>
          ) : (
            periods.map((p) => (
              <div
                key={p.id}
                className="group relative rounded-card bg-background/70 p-3 hover:bg-background transition-all border border-transparent hover:border-border/70"
              >
                <div className="absolute right-2 top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditDrawer(p)}
                    className="p-1 hover:text-text-primary text-text-secondary transition-colors"
                    title="Ubah"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeletePeriod(p.id)}
                    className="p-1 hover:text-danger text-text-secondary transition-colors"
                    title="Hapus"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                <p className="text-xs text-text-secondary font-semibold">{p.nama_periode}</p>
                <p className="mt-1 text-sm font-bold text-text-primary">Kuota {p.kuota}</p>
                
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[10px] text-text-secondary">
                    {formatDate(p.tanggal_mulai)} - {formatDate(p.tanggal_selesai)}
                  </span>
                  <Badge variant={p.status === "aktif" ? "success" : p.status === "selesai" ? "info" : "warning"}>
                    {p.status}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Slide-over Drawer for Create / Edit Period */}
      <Drawer
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={drawerMode === "create" ? "Tambah Periode Bansos" : "Ubah Periode Bansos"}
        subtitle={drawerMode === "create" ? "Buat periode baru dan tentukan kuota penerima." : "Perbarui detail periode bansos."}
      >
        <form onSubmit={handleSavePeriod} className="flex flex-col gap-4 pb-12">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-text-secondary">Nama Periode</label>
            <input
              type="text"
              required
              className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary"
              placeholder="Contoh: BLT Q3 2026"
              value={drawerForm.nama_periode}
              onChange={(e) => setDrawerForm(prev => ({ ...prev, nama_periode: e.target.value }))}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-text-secondary">Tanggal Mulai</label>
              <input
                type="date"
                required
                className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary"
                value={drawerForm.tanggal_mulai}
                onChange={(e) => setDrawerForm(prev => ({ ...prev, tanggal_mulai: e.target.value }))}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-text-secondary">Tanggal Selesai</label>
              <input
                type="date"
                required
                className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary"
                value={drawerForm.tanggal_selesai}
                onChange={(e) => setDrawerForm(prev => ({ ...prev, tanggal_selesai: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-text-secondary">Kuota Penerima</label>
              <input
                type="number"
                required
                min="1"
                className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary"
                value={drawerForm.kuota}
                onChange={(e) => setDrawerForm(prev => ({ ...prev, kuota: parseInt(e.target.value) || 0 }))}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-text-secondary">Versi Bobot</label>
              <select
                required
                className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary"
                value={drawerForm.bobot_id}
                onChange={(e) => setDrawerForm(prev => ({ ...prev, bobot_id: e.target.value }))}
              >
                <option value="" disabled>Pilih versi bobot</option>
                {bobotVersions.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.versi} {b.keterangan ? `- ${b.keterangan}` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-text-secondary">Status</label>
            <select
              required
              className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary"
              value={drawerForm.status}
              onChange={(e) => setDrawerForm(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="draft">DRAFT</option>
              <option value="aktif">AKTIF</option>
              <option value="selesai">SELESAI</option>
            </select>
            {drawerForm.status === "aktif" && (
              <p className="text-[10px] text-warning-dark mt-1">
                *Mengaktifkan periode ini akan menonaktifkan periode aktif lainnya secara otomatis.
              </p>
            )}
          </div>

          <div className="mt-4 flex gap-2">
            <Button type="submit" className="flex-1">
              Simpan Periode
            </Button>
            <Button variant="outline" type="button" onClick={() => setIsDrawerOpen(false)}>
              Batal
            </Button>
          </div>
        </form>
      </Drawer>
    </AppShell>
  );
};

export default PengaturanPage;
