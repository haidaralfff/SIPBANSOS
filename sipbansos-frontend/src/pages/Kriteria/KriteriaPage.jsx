import AppShell from "../../components/layout/AppShell";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import ProgressBar from "../../components/ui/ProgressBar";

const CRITERIA = [
  { code: "C1", name: "Penghasilan per Bulan", type: "Benefit", weight: 15 },
  { code: "C2", name: "Jumlah Tanggungan", type: "Benefit", weight: 10 },
  { code: "C6", name: "Pengeluaran Listrik", type: "Cost", weight: 7 },
  { code: "C7", name: "Pengeluaran Pangan", type: "Cost", weight: 8 },
  { code: "C11", name: "Tingkat Pendidikan KK", type: "Benefit", weight: 7 },
  { code: "C12", name: "Status Pekerjaan KK", type: "Benefit", weight: 8 }
];

const typeVariant = (type) => (type === "Benefit" ? "success" : "danger");

const KriteriaPage = () => {
  const totalWeight = CRITERIA.reduce((sum, item) => sum + item.weight, 0);

  return (
    <AppShell title="Kriteria & Bobot" subtitle="Atur bobot 13 kriteria dan versi per periode.">
      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold">Daftar Kriteria Aktif</h3>
              <p className="text-xs text-text-secondary">Versi bobot v2.0 - Apr 2026</p>
            </div>
            <Button variant="outline">Tambah Kriteria</Button>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-text-secondary">
                <tr>
                  <th className="py-2 font-semibold">Kode</th>
                  <th className="py-2 font-semibold">Nama</th>
                  <th className="py-2 font-semibold">Tipe</th>
                  <th className="py-2 font-semibold">Bobot (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {CRITERIA.map((item) => (
                  <tr key={item.code}>
                    <td className="py-3 font-semibold text-text-primary">{item.code}</td>
                    <td className="py-3 text-text-secondary">{item.name}</td>
                    <td className="py-3">
                      <Badge variant={typeVariant(item.type)}>{item.type}</Badge>
                    </td>
                    <td className="py-3 font-semibold text-text-primary">{item.weight}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between text-xs text-text-secondary">
            <span>Menampilkan 6 dari 13 kriteria</span>
            <Button variant="ghost">Lihat semua</Button>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="text-sm font-bold">Total Bobot</h3>
            <p className="text-xs text-text-secondary">Harus sama dengan 100%</p>
            <div className="mt-4 flex items-center justify-between">
              <p className="text-3xl font-bold text-text-primary">{totalWeight}%</p>
              <Badge variant={totalWeight === 100 ? "success" : "warning"}>
                {totalWeight === 100 ? "Valid" : "Perlu penyesuaian"}
              </Badge>
            </div>
            <ProgressBar value={totalWeight} className="mt-3" />
          </Card>

          <Card className="p-4">
            <h3 className="text-sm font-bold">Aksi Cepat</h3>
            <p className="text-xs text-text-secondary">Simulasi dampak sebelum menyimpan.</p>
            <div className="mt-4 flex flex-col gap-2">
              <Button>Simulasi Dampak</Button>
              <Button variant="outline">Simpan Perubahan</Button>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
};

export default KriteriaPage;
