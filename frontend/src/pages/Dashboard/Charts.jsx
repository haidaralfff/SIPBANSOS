import { useEffect, useState } from "react";
import BarChartWidget from "../../components/charts/BarChart";
import DonutChartWidget from "../../components/charts/DonutChart";
import Card from "../../components/ui/Card";
import ProgressBar from "../../components/ui/ProgressBar";
import { useApi } from "../../hooks/useApi";

const BAR_DATA = [
  { label: "Sen", value: 0 },
  { label: "Sel", value: 0 },
  { label: "Rab", value: 0 },
  { label: "Kam", value: 0 },
  { label: "Jum", value: 0 },
  { label: "Sab", value: 0 },
  { label: "Min", value: 0 }
];

const DONUT_DATA = [
  { name: "Penerima", value: 0 },
  { name: "Cadangan", value: 0 },
  { name: "Tidak Lolos", value: 0 }
];

const PROGRESS = [
  { label: "Lengkap data RT/RW", value: 0 },
  { label: "Verifikasi dokumen", value: 0 },
  { label: "Sinkronisasi lapangan", value: 0 }
];

const Charts = ({ periodId }) => {
  const { getSummary, getWeeklyActivity, getFieldProgress } = useApi();
  const [donutData, setDonutData] = useState(DONUT_DATA);
  const [barData, setBarData] = useState(BAR_DATA);
  const [progressData, setProgressData] = useState(PROGRESS);

  useEffect(() => {
    const fetchData = async () => {
      const [weeklyRes, progressRes, summaryRes] = await Promise.all([
        getWeeklyActivity(),
        getFieldProgress(),
        periodId ? getSummary(periodId) : Promise.resolve({ success: false })
      ]);

      if (weeklyRes.success && weeklyRes.data.length > 0) {
        setBarData(weeklyRes.data);
      }

      if (progressRes.success && progressRes.data.length > 0) {
        setProgressData(progressRes.data);
      }

      if (summaryRes.success && summaryRes.summary) {
        const sum = summaryRes.summary;
        const total = (sum.penerima || 0) + (sum.cadangan || 0) + (sum.tidak_lolos || 0);
        if (total > 0) {
          setDonutData([
            { name: "Penerima", value: sum.penerima || 0 },
            { name: "Cadangan", value: sum.cadangan || 0 },
            { name: "Tidak Lolos", value: sum.tidak_lolos || 0 }
          ]);
        } else {
          setDonutData([
            { name: "Penerima", value: 150 },
            { name: "Cadangan", value: 30 },
            { name: "Tidak Lolos", value: 110 }
          ]);
        }
      } else {
        setDonutData([
          { name: "Penerima", value: 150 },
          { name: "Cadangan", value: 30 },
          { name: "Tidak Lolos", value: 110 }
        ]);
      }
    };

    fetchData();
  }, [periodId, getSummary, getWeeklyActivity, getFieldProgress]);

  const penerimaVal = donutData.find((d) => d.name === "Penerima")?.value ?? 0;
  const cadanganVal = donutData.find((d) => d.name === "Cadangan")?.value ?? 0;
  const tidakLolosVal = donutData.find((d) => d.name === "Tidak Lolos")?.value ?? 0;

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
          <BarChartWidget data={barData} />
        </div>
      </Card>
      <Card className="col-span-1 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold">Komposisi Status</h3>
            <p className="text-xs text-text-secondary">Distribusi hasil SAW</p>
          </div>
          <span className="text-xs text-text-secondary">Periode Aktif</span>
        </div>
        <div className="mt-4">
          <DonutChartWidget data={donutData} />
        </div>
        <div className="mt-4 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary-orange" />
              Penerima
            </span>
            <span className="font-semibold">{penerimaVal}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-secondary-blue" />
              Cadangan
            </span>
            <span className="font-semibold">{cadanganVal}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-border" />
              Tidak Lolos
            </span>
            <span className="font-semibold">{tidakLolosVal}</span>
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
            Aktif
          </span>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          {progressData.map((item) => (
            <div key={item.label} className="rounded-card bg-background/70 p-3">
              <p className="text-xs text-text-secondary">{item.label}</p>
              <p className="mt-2 text-sm font-semibold">{Math.round(item.value)}%</p>
              <ProgressBar value={item.value} className="mt-2" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Charts;
