import AppShell from "../../components/layout/AppShell";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";

const ROLES = [
  { label: "Admin Desa", value: 3, variant: "success" },
  { label: "Kepala Desa", value: 1, variant: "info" },
  { label: "Petugas Survei", value: 8, variant: "warning" },
  { label: "Operator RW/RT", value: 14, variant: "info" }
];

const USERS = [
  {
    name: "Rina Kartika",
    email: "rina@desa.id",
    role: "Admin Desa",
    status: "Aktif",
    last: "Hari ini"
  },
  {
    name: "Hendra Wijaya",
    email: "hendra@desa.id",
    role: "Kepala Desa",
    status: "Aktif",
    last: "Kemarin"
  },
  {
    name: "Suci Lestari",
    email: "suci@desa.id",
    role: "Petugas Survei",
    status: "Nonaktif",
    last: "3 hari lalu"
  },
  {
    name: "Bagus Rahman",
    email: "bagus@desa.id",
    role: "Operator RW/RT",
    status: "Aktif",
    last: "Hari ini"
  }
];

const PenggunaPage = () => {
  return (
    <AppShell title="Pengguna" subtitle="Manajemen akun dan role untuk seluruh petugas." showRightPanel={false}>
      <div className="grid gap-4 lg:grid-cols-5">
        {ROLES.map((role) => (
          <Card key={role.label} className="p-4">
            <p className="text-sm text-text-secondary">{role.label}</p>
            <div className="mt-3 flex items-center justify-between">
              <p className="text-2xl font-bold text-text-primary">{role.value}</p>
              <Badge variant={role.variant}>Akun</Badge>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-sm font-bold">Daftar Pengguna</h3>
            <p className="text-xs text-text-secondary">Total 26 akun aktif.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline">Import Akun</Button>
            <Button>Tambah Pengguna</Button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-text-secondary">
              <tr>
                <th className="py-2 font-semibold">Nama</th>
                <th className="py-2 font-semibold">Email</th>
                <th className="py-2 font-semibold">Role</th>
                <th className="py-2 font-semibold">Status</th>
                <th className="py-2 font-semibold">Login Terakhir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {USERS.map((user) => (
                <tr key={user.email}>
                  <td className="py-3 font-semibold text-text-primary">{user.name}</td>
                  <td className="py-3 text-text-secondary">{user.email}</td>
                  <td className="py-3 text-text-secondary">{user.role}</td>
                  <td className="py-3">
                    <Badge variant={user.status === "Aktif" ? "success" : "danger"}>{user.status}</Badge>
                  </td>
                  <td className="py-3 text-text-secondary">{user.last}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
};

export default PenggunaPage;
