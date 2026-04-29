import BarChartWidget from "../../components/charts/BarChart";
import DonutChartWidget from "../../components/charts/DonutChart";
import Card from "../../components/ui/Card";
import ProgressBar from "../../components/ui/ProgressBar";

const BAR_DATA = [
  { label: "Sen", value: 24 },
  { label: "Sel", value: 32 },
  { label: "Rab", value: 28 },
  { label: "Kam", value: 38 },
  { label: "Jum", value: 41 },
  { label: "Sab", value: 20 },
  { label: "Min", value: 18 }
];

const DONUT_DATA = [
  { name: "Penerima", value: 150 },
  { name: "Cadangan", value: 30 },
  { name: "Tidak Lolos", value: 110 }
];

const PROGRESS = [
  { label: "Validasi data RT/RW", value: 76 },
  { label: "Verifikasi dokumen", value: 62 },
  { label: "Sinkronisasi lapangan", value: 48 }
];

const Charts = () => {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="col-span-1 p-4 lg:col-span-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold">Aktivitas Mingguan</h3>
            <p className="text-xs text-text-secondary">Jumlah input dan verifikasi harian</p>
          </div>
          <span className="rounded-full bg-primary-orange/15 px-3 py-1 text-xs font-semibold text-primary-orange">
            Minggu ini
          </span>
        </div>
        <div className="mt-4">
          <BarChartWidget data={BAR_DATA} />
        </div>
      </Card>
      <Card className="col-span-1 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold">Komposisi Status</h3>
            <p className="text-xs text-text-secondary">Distribusi hasil SAW</p>
          </div>
          <span className="text-xs text-text-secondary">Q2 2026</span>
        </div>
        <div className="mt-4">
          <DonutChartWidget data={DONUT_DATA} />
        </div>
        <div className="mt-4 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary-orange" />
              Penerima
            </span>
            <span className="font-semibold">150</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-secondary-blue" />
              Cadangan
            </span>
            <span className="font-semibold">30</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-border" />
              Tidak Lolos
            </span>
            <span className="font-semibold">110</span>
          </div>
        </div>
      </Card>
      <Card className="col-span-1 p-4 lg:col-span-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold">Progres Lapangan</h3>
            <p className="text-xs text-text-secondary">Kendali proses pendataan berjalan</p>
          </div>
          <span className="rounded-full bg-secondary-green/15 px-3 py-1 text-xs font-semibold text-secondary-green">
            Stabil
          </span>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          {PROGRESS.map((item) => (
            <div key={item.label} className="rounded-card bg-background/70 p-3">
              <p className="text-xs text-text-secondary">{item.label}</p>
              <p className="mt-2 text-sm font-semibold">{item.value}%</p>
              <ProgressBar value={item.value} className="mt-2" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Charts;
