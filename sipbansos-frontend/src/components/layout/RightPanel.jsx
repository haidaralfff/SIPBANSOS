import Badge from "../ui/Badge";
import Card from "../ui/Card";

const AUDIT_LOGS = [
  {
    title: "Update data warga",
    detail: "NIK 3275030102XXXX",
    time: "10 menit lalu",
    badge: "warning"
  },
  {
    title: "Import data warga",
    detail: "Berhasil 120 baris",
    time: "45 menit lalu",
    badge: "success"
  },
  {
    title: "Verifikasi RW 03",
    detail: "12 data diverifikasi",
    time: "2 jam lalu",
    badge: "info"
  },
  {
    title: "SAW selesai",
    detail: "Hasil ranking siap",
    time: "Hari ini",
    badge: "success"
  }
];

const SCHEDULE = [
  { title: "Rapat koordinasi RW/RT", time: "10.00 - 11.00" },
  { title: "Validasi data lapangan", time: "13.00 - 15.00" },
  { title: "Review hasil SAW", time: "16.30" }
];

const APPROVALS = [
  { name: "RW 01", status: "Menunggu" },
  { name: "RW 02", status: "Disetujui" },
  { name: "RW 03", status: "Revisi" }
];

const RightPanel = () => {
  return (
    <aside className="hidden space-y-4 xl:block">
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold">Log Audit</h3>
          <button type="button" className="text-xs font-semibold text-primary-orange">
            Lihat semua
          </button>
        </div>
        <div className="mt-4 space-y-3">
          {AUDIT_LOGS.map((log) => (
            <div key={log.title} className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-text-primary">{log.title}</p>
                <p className="text-xs text-text-secondary">{log.detail}</p>
              </div>
              <div className="text-right">
                <Badge variant={log.badge}>{log.time}</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold">Jadwal Hari Ini</h3>
          <span className="text-xs text-text-secondary">30 Apr 2026</span>
        </div>
        <div className="mt-4 space-y-3">
          {SCHEDULE.map((item) => (
            <div key={item.title} className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-text-primary">{item.title}</p>
                <p className="text-xs text-text-secondary">{item.time}</p>
              </div>
              <span className="h-2 w-2 rounded-full bg-secondary-blue" />
            </div>
          ))}
        </div>
      </Card>
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold">Persetujuan RW/RT</h3>
          <span className="text-xs text-text-secondary">3 wilayah</span>
        </div>
        <div className="mt-4 space-y-3">
          {APPROVALS.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <p className="text-sm font-semibold text-text-primary">{item.name}</p>
              <Badge
                variant={
                  item.status === "Disetujui"
                    ? "success"
                    : item.status === "Revisi"
                      ? "danger"
                      : "warning"
                }
              >
                {item.status}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </aside>
  );
};

export default RightPanel;
