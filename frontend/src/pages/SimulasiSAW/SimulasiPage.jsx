import AppShell from "../../components/layout/AppShell";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";

const TOP_RANKING = [
  { name: "Siti Aminah", nik: "3275030102XXXX", score: 0.892, status: "Penerima" },
  { name: "Budi Santoso", nik: "3275030103XXXX", score: 0.876, status: "Penerima" },
  { name: "Rina Kartika", nik: "3275030104XXXX", score: 0.861, status: "Cadangan" },
  { name: "Tono Prasetyo", nik: "3275030105XXXX", score: 0.842, status: "Cadangan" }
];

const STATUS_VARIANT = {
  Penerima: "penerima",
  Cadangan: "cadangan",
  "Tidak Lolos": "tidak-lolos"
};

const METRICS = [
  { label: "Total Alternatif", value: "1.280" },
  { label: "Kuota Penerima", value: "150" },
  { label: "Waktu Proses", value: "1.4 detik" }
];

const SimulasiPage = () => {
  return (
    <AppShell title="Simulasi SAW" subtitle="Jalankan perhitungan SAW dan analisis hasil ranking." showRightPanel={false}>
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
              <p className="text-xs text-text-secondary">Versi Bobot</p>
              <select className="mt-2 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text-primary">
                <option>v2.0 - Apr 2026</option>
                <option>v1.9 - Jan 2026</option>
              </select>
            </div>
            <div>
              <p className="text-xs text-text-secondary">Kuota Penerima</p>
              <input
                className="mt-2 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text-primary"
                defaultValue="150"
              />
            </div>
          </div>
          <Button>Jalankan Perhitungan</Button>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        {METRICS.map((item) => (
          <Card key={item.label} className="p-4">
            <p className="text-sm text-text-secondary">{item.label}</p>
            <p className="mt-2 text-2xl font-bold text-text-primary">{item.value}</p>
          </Card>
        ))}
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold">Hasil Ranking</h3>
            <p className="text-xs text-text-secondary">Preview 4 teratas setelah normalisasi.</p>
          </div>
          <Button variant="outline">Lihat Semua</Button>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-text-secondary">
              <tr>
                <th className="py-2 font-semibold">Warga</th>
                <th className="py-2 font-semibold">NIK</th>
                <th className="py-2 font-semibold">Skor Vi</th>
                <th className="py-2 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {TOP_RANKING.map((item) => (
                <tr key={item.nik}>
                  <td className="py-3 font-semibold text-text-primary">{item.name}</td>
                  <td className="py-3 text-text-secondary">{item.nik}</td>
                  <td className="py-3 font-semibold text-text-primary">{item.score.toFixed(3)}</td>
                  <td className="py-3">
                    <Badge variant={STATUS_VARIANT[item.status] || "info"}>{item.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
};

export default SimulasiPage;
