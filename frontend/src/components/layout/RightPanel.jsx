import { useEffect, useState } from "react";
import Badge from "../ui/Badge";
import Card from "../ui/Card";
import Button from "../ui/Button";
import ProgressBar from "../ui/ProgressBar";
import { useApi } from "../../hooks/useApi";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const RightPanel = () => {
  const { getAuditLogs, getSchedules, createSchedule, updateSchedule, deleteSchedule, getPeriods, getFieldProgress } = useApi();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [schedules, setSchedules] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [activePeriod, setActivePeriod] = useState(null);
  const [progressData, setProgressData] = useState([]);
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(true);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);

  // Modal State for Schedule Creation & Editing
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState(null);
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];
  const formattedToday = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });

  const fetchSchedules = async () => {
    setIsLoadingSchedules(true);
    const res = await getSchedules(); // Fetch all schedules, not just today
    if (res.success) {
      setSchedules(res.data);
    }
    setIsLoadingSchedules(false);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short"
    });
  };

  const fetchAuditLogs = async () => {
    if (user?.role === "admin" || user?.role === "kepala_desa") {
      setIsLoadingLogs(true);
      const res = await getAuditLogs({ limit: 4 });
      if (res.success) {
        setAuditLogs(res.data);
      }
      setIsLoadingLogs(false);
    }
  };

  const fetchActivePeriod = async () => {
    const res = await getPeriods();
    if (res.success && res.data) {
      const active = res.data.find(p => p.status === "aktif");
      setActivePeriod(active || res.data[0] || null);
    }
  };

  const fetchFieldProgress = async () => {
    setIsLoadingProgress(true);
    const res = await getFieldProgress();
    if (res.success) {
      setProgressData(res.data);
    }
    setIsLoadingProgress(false);
  };

  useEffect(() => {
    fetchSchedules();
    fetchAuditLogs();
    fetchActivePeriod();
    fetchFieldProgress();
  }, [user]);

  const handleAddClick = () => {
    setEditingScheduleId(null);
    setTitle("");
    setStartTime("");
    setEndTime("");
    setDate(new Date().toISOString().split("T")[0]);
    setIsModalOpen(true);
  };

  const handleEdit = (schedule) => {
    setEditingScheduleId(schedule.id);
    setTitle(schedule.title);
    setStartTime(schedule.start_time);
    setEndTime(schedule.end_time);
    setDate(schedule.date.split("T")[0]);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus jadwal ini?")) {
      const res = await deleteSchedule(id);
      if (res.success) {
        toast.success("Jadwal berhasil dihapus!");
        fetchSchedules();
      } else {
        toast.error(res.message || "Gagal menghapus jadwal.");
      }
    }
  };

  const handleSubmitSchedule = async (e) => {
    e.preventDefault();
    if (!title.trim() || !startTime || !endTime || !date) {
      toast.error("Semua kolom wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    let res;
    if (editingScheduleId) {
      res = await updateSchedule(editingScheduleId, {
        title: title.trim(),
        start_time: startTime,
        end_time: endTime,
        date
      });
    } else {
      res = await createSchedule({
        title: title.trim(),
        start_time: startTime,
        end_time: endTime,
        date
      });
    }
    setIsSubmitting(false);

    if (res.success) {
      toast.success(editingScheduleId ? "Jadwal berhasil diperbarui!" : "Jadwal baru berhasil dibuat!");
      setIsModalOpen(false);
      setTitle("");
      setStartTime("");
      setEndTime("");
      setEditingScheduleId(null);
      fetchSchedules();
    } else {
      toast.error(res.message || "Gagal menyimpan jadwal.");
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    return timeStr.slice(0, 5); // Take "HH:MM"
  };

  const formatLogTime = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  };

  const formatLogAction = (action) => {
    switch (action) {
      case "create":
        return "Tambah";
      case "update":
        return "Ubah";
      case "delete":
        return "Hapus";
      default:
        return action;
    }
  };

  const formatLogTable = (table) => {
    switch (table) {
      case "warga":
        return "data warga";
      case "settings":
        return "pengaturan";
      case "periode_bansos":
        return "periode";
      case "kriteria":
        return "kriteria";
      case "schedules":
        return "jadwal";
      default:
        return table;
    }
  };

  const showAuditLogs = user?.role === "admin" || user?.role === "kepala_desa";

  return (
    <aside className="hidden space-y-4 xl:block">
      {/* CARD LOG AUDIT */}
      {showAuditLogs && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold">Log Audit</h3>
            <button
              type="button"
              onClick={() => navigate("/laporan?preview=audit")}
              className="text-xs font-semibold text-primary-orange hover:underline focus:outline-none"
            >
              Lihat semua
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {isLoadingLogs ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="space-y-1">
                  <div className="h-4 w-3/4 rounded bg-gray-200 animate-pulse" />
                  <div className="h-3 w-1/2 rounded bg-gray-100 animate-pulse" />
                </div>
              ))
            ) : auditLogs.length === 0 ? (
              <p className="text-xs text-text-secondary text-center py-2">Belum ada aktivitas.</p>
            ) : (
              auditLogs.map((log, idx) => (
                <div key={log.id || idx} className="flex items-start justify-between gap-3 text-xs">
                  <div>
                    <p className="font-semibold text-text-primary">
                      {formatLogAction(log.aksi)} {formatLogTable(log.tabel)}
                    </p>
                    <p className="text-text-secondary text-[10px]">
                      Oleh {log.username}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant={log.aksi === "create" ? "success" : log.aksi === "update" ? "info" : "danger"}>
                      {formatLogTime(log.created_at)}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* CARD JADWAL */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-text-primary">Jadwal Kegiatan</h3>
            {user?.role === "admin" && (
              <button
                type="button"
                onClick={handleAddClick}
                className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-orange text-white text-xs font-bold hover:bg-primary-orange/80 focus:outline-none pb-0.5 leading-none"
              >
                +
              </button>
            )}
          </div>
        </div>
        <div className="mt-4 space-y-3">
          {isLoadingSchedules ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="space-y-1">
                <div className="h-4 w-2/3 rounded bg-gray-200 animate-pulse" />
                <div className="h-3 w-1/3 rounded bg-gray-100 animate-pulse" />
              </div>
            ))
          ) : schedules.length === 0 ? (
            <p className="text-xs text-text-secondary text-center py-4 bg-background/50 rounded-xl border border-dashed border-border">
              Tidak ada jadwal terdaftar.
            </p>
          ) : (
            schedules.map((item) => (
              <div key={item.id} className="flex items-start justify-between border-b border-border/10 pb-2 last:border-0 last:pb-0 gap-2">
                <div className="flex-1 min-w-0 pr-1">
                  <p className="text-sm font-semibold text-text-primary truncate">{item.title}</p>
                  <p className="text-[11px] text-text-secondary flex gap-2 items-center">
                    <span className="font-medium text-primary-orange">{formatDate(item.date)}</span>
                    <span className="h-1 w-1 rounded-full bg-border/60" />
                    <span>{formatTime(item.start_time)} - {formatTime(item.end_time)}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {user?.role === "admin" && (
                    <div className="flex gap-1.5 mt-0.5">
                      <button
                        type="button"
                        onClick={() => handleEdit(item)}
                        className="text-[10px] font-semibold text-secondary-blue hover:underline focus:outline-none"
                      >
                        Ubah
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="text-[10px] font-semibold text-accent-red hover:underline focus:outline-none"
                      >
                        Hapus
                      </button>
                    </div>
                  )}
                  <span className="h-2 w-2 rounded-full bg-secondary-blue animate-pulse flex-shrink-0" />
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* CARD PROGRES LAPANGAN */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-text-primary">Progres Lapangan</h3>
            <p className="text-xs text-text-secondary">Kendali proses pendataan berjalan</p>
          </div>
          <span className="rounded-full bg-secondary-green/15 px-3 py-1 text-xs font-semibold text-secondary-green">
            Aktif
          </span>
        </div>
        <div className="mt-4 space-y-3">
          {isLoadingProgress ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-1/3 rounded bg-gray-250 animate-pulse" />
                <div className="h-2 w-full rounded bg-gray-200 animate-pulse" />
              </div>
            ))
          ) : progressData.length === 0 ? (
            <p className="text-xs text-text-secondary text-center py-2">Belum ada progres data.</p>
          ) : (
            progressData.map((item) => (
              <div key={item.label} className="rounded-card bg-background/50 p-2.5 border border-border/30">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-text-secondary font-medium">{item.label}</span>
                  <span className="font-semibold text-text-primary">{Math.round(item.value)}%</span>
                </div>
                <ProgressBar value={item.value} className="mt-2" />
              </div>
            ))
          )}
        </div>
      </Card>

      {/* CARD PERIODE AKTIF */}
      {activePeriod && (
        <Card className="p-4 bg-gradient-to-br from-primary-orange/5 to-primary-orange/15 border border-primary-orange/20 animate-fade-up">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-text-primary">Periode Penyaluran</h3>
            <Badge variant="success">Aktif</Badge>
          </div>
          <div className="mt-3 space-y-2 text-xs">
            <div className="flex justify-between gap-2">
              <span className="text-text-secondary">Nama Periode:</span>
              <span className="font-semibold text-text-primary text-right">{activePeriod.nama_periode}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-text-secondary">Kuota BLT:</span>
              <span className="font-bold text-primary-orange text-right">{activePeriod.kuota} KPM</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-text-secondary">Tanggal:</span>
              <span className="font-semibold text-text-primary text-right">
                {new Date(activePeriod.tanggal_mulai).toLocaleDateString("id-ID", { day: "numeric", month: "short" })} - {new Date(activePeriod.tanggal_selesai).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* MODAL TAMBAH JADWAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="fixed inset-0 bg-black/45 transition-opacity"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative w-full max-w-sm rounded-2xl bg-surface p-5 shadow-2xl z-10 border border-border space-y-4">
            <div>
              <h3 className="text-sm font-bold text-text-primary">
                {editingScheduleId ? "Ubah Jadwal" : "Tambah Jadwal Baru"}
              </h3>
              <p className="text-xs text-text-secondary mt-1">
                {editingScheduleId ? "Perbarui informasi kegiatan penyaluran." : "Jadwal ini akan muncul di sidebar dashboard."}
              </p>
            </div>

            <form onSubmit={handleSubmitSchedule} className="space-y-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-text-secondary">Nama Kegiatan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Rapat Koordinasi"
                  className="w-full rounded-xl border border-border bg-white px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-primary-orange"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-text-secondary">Waktu Mulai</label>
                  <input
                    type="time"
                    required
                    className="w-full rounded-xl border border-border bg-white px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-primary-orange"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-text-secondary">Waktu Selesai</label>
                  <input
                    type="time"
                    required
                    className="w-full rounded-xl border border-border bg-white px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-primary-orange"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-text-secondary">Tanggal</label>
                <input
                  type="date"
                  required
                  className="w-full rounded-xl border border-border bg-white px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-primary-orange"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" className="flex-1 text-xs" disabled={isSubmitting}>
                  {isSubmitting ? "Menyimpan..." : (editingScheduleId ? "Perbarui Jadwal" : "Simpan Jadwal")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 text-xs"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingScheduleId(null);
                  }}
                >
                  Batal
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
};

export default RightPanel;
