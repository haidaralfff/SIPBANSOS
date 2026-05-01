import AppShell from "../../components/layout/AppShell";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";

const PengaturanPage = () => {
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
              defaultValue="Desa Mekar Jaya"
            />
            <input
              className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text-primary"
              placeholder="Kecamatan"
              defaultValue="Cibinong"
            />
            <input
              className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text-primary"
              placeholder="Kabupaten/Kota"
              defaultValue="Bogor"
            />
            <input
              className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text-primary"
              placeholder="Provinsi"
              defaultValue="Jawa Barat"
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button>Simpan Profil</Button>
            <Button variant="outline">Unggah Logo</Button>
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
              defaultValue="[NOMOR]/[KODE-DESA]/[BULAN-ROMAWI]/[TAHUN]"
            />
            <div className="mt-4 flex flex-wrap gap-2">
              <Button>Uji Format</Button>
              <Button variant="outline">Reset Nomor</Button>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="text-sm font-bold">Tanda Tangan Digital</h3>
            <p className="text-xs text-text-secondary">Terakhir diunggah 02 Apr 2026.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button>Upload TTD</Button>
              <Button variant="outline">Hapus TTD</Button>
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
          <Button>Tambah Periode</Button>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-card bg-background/70 p-3">
            <p className="text-xs text-text-secondary">BLT Q2 2026</p>
            <p className="mt-2 text-sm font-semibold">Kuota 150</p>
            <Badge variant="success" className="mt-3">Aktif</Badge>
          </div>
          <div className="rounded-card bg-background/70 p-3">
            <p className="text-xs text-text-secondary">BLT Q1 2026</p>
            <p className="mt-2 text-sm font-semibold">Kuota 140</p>
            <Badge variant="info" className="mt-3">Selesai</Badge>
          </div>
          <div className="rounded-card bg-background/70 p-3">
            <p className="text-xs text-text-secondary">BLT Q3 2026</p>
            <p className="mt-2 text-sm font-semibold">Kuota 160</p>
            <Badge variant="warning" className="mt-3">Draft</Badge>
          </div>
        </div>
      </Card>
    </AppShell>
  );
};

export default PengaturanPage;
