import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import AppShell from "../../components/layout/AppShell";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Drawer from "../../components/ui/Drawer";
import Skeleton from "../../components/ui/Skeleton";
import { useApi } from "../../hooks/useApi";
import { useAuth } from "../../context/AuthContext";

const ROLE_LABELS = {
  admin: "Admin Desa",
  kepala_desa: "Kepala Desa",
  petugas: "Petugas Survei",
  operator_rw: "Operator RW/RT"
};

const PenggunaPage = () => {
  const { getUsers, createUser, updateUser, deleteUser } = useApi();
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Drawer states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState("create"); // "create" | "edit"
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [form, setForm] = useState({
    username: "",
    email: "",
    full_name: "",
    role: "petugas",
    password: "",
    is_active: true
  });

  // Delete modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    const res = await getUsers();
    if (res.success) {
      setUsers(res.data);
    } else {
      toast.error(res.message || "Gagal memuat data pengguna.");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const getRoleCount = (role) => {
    return users.filter((u) => u.role === role).length;
  };

  const rolesSummary = [
    { label: "Admin Desa", value: getRoleCount("admin"), variant: "success" },
    { label: "Kepala Desa", value: getRoleCount("kepala_desa"), variant: "info" },
    { label: "Petugas Survei", value: getRoleCount("petugas"), variant: "warning" },
    { label: "Operator RW/RT", value: getRoleCount("operator_rw"), variant: "info" }
  ];

  const handleOpenCreate = () => {
    setDrawerMode("create");
    setSelectedUserId(null);
    setForm({
      username: "",
      email: "",
      full_name: "",
      role: "petugas",
      password: "",
      is_active: true
    });
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (u) => {
    setDrawerMode("edit");
    setSelectedUserId(u.id);
    setForm({
      username: u.username,
      email: u.email,
      full_name: u.full_name,
      role: u.role,
      password: "",
      is_active: u.is_active
    });
    setIsDrawerOpen(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    
    if (drawerMode === "create" && !form.password) {
      toast.error("Password wajib diisi untuk pengguna baru.");
      return;
    }
    if (form.password && form.password.length < 6) {
      toast.error("Password minimal 6 karakter.");
      return;
    }

    const payload = { ...form };
    if (drawerMode === "edit" && !form.password) {
      delete payload.password;
    }

    const toastId = toast.loading(drawerMode === "create" ? "Menambah pengguna..." : "Memperbarui pengguna...");
    
    let res;
    if (drawerMode === "create") {
      res = await createUser(payload);
    } else {
      res = await updateUser(selectedUserId, payload);
    }

    if (res.success) {
      toast.success(drawerMode === "create" ? "Pengguna berhasil ditambahkan" : "Pengguna berhasil diperbarui", { id: toastId });
      setIsDrawerOpen(false);
      fetchUsers();
    } else {
      toast.error(res.message || "Gagal menyimpan data pengguna", { id: toastId });
    }
  };

  const triggerDeleteUser = (u) => {
    setUserToDelete(u);
    setIsDeleteModalOpen(true);
  };

  const executeDeleteUser = async () => {
    if (!userToDelete) return;
    setIsDeleteModalOpen(false);

    const toastId = toast.loading("Menghapus pengguna...");
    const res = await deleteUser(userToDelete.id);
    if (res.success) {
      toast.success("Pengguna berhasil dihapus", { id: toastId });
      fetchUsers();
    } else {
      toast.error(res.message || "Gagal menghapus pengguna", { id: toastId });
    }
    setUserToDelete(null);
  };

  return (
    <>
      <AppShell title="Pengguna" subtitle="Manajemen akun dan role untuk seluruh petugas." showRightPanel={false}>
        {/* Roles Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {rolesSummary.map((role) => (
            <Card key={role.label} className="p-4">
              <p className="text-sm text-text-secondary">{role.label}</p>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-2xl font-bold text-text-primary">
                  {isLoading ? <Skeleton className="h-8 w-12" /> : role.value}
                </p>
                <Badge variant={role.variant}>Akun</Badge>
              </div>
            </Card>
          ))}
        </div>

        {/* User List Table Card */}
        <Card className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-bold">Daftar Pengguna</h3>
              <p className="text-xs text-text-secondary">
                Total {users.length} akun terdaftar di sistem.
              </p>
            </div>
            <Button onClick={handleOpenCreate}>Tambah Pengguna</Button>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-text-secondary">
                <tr className="border-b border-border">
                  <th className="py-2 font-semibold">Nama</th>
                  <th className="py-2 font-semibold">Username</th>
                  <th className="py-2 font-semibold">Email</th>
                  <th className="py-2 font-semibold">Role</th>
                  <th className="py-2 font-semibold">Status</th>
                  <th className="py-2 font-semibold">Login Terakhir</th>
                  <th className="py-2 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {isLoading && users.length === 0 ? (
                  [...Array(4)].map((_, i) => (
                    <tr key={`skeleton-${i}`} className="hover:bg-transparent">
                      <td className="py-3"><Skeleton className="h-5 w-32" /></td>
                      <td className="py-3"><Skeleton className="h-5 w-24" /></td>
                      <td className="py-3"><Skeleton className="h-5 w-40" /></td>
                      <td className="py-3"><Skeleton className="h-5 w-24" /></td>
                      <td className="py-3"><Skeleton className="h-6 w-16 rounded-full" /></td>
                      <td className="py-3"><Skeleton className="h-5 w-24" /></td>
                      <td className="py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Skeleton className="h-7 w-7 rounded" />
                          <Skeleton className="h-7 w-7 rounded" />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-sm text-text-secondary">
                      Belum ada pengguna terdaftar.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className={u.id === currentUser?.id ? "bg-primary-orange/5" : ""}>
                      <td className="py-3 font-semibold text-text-primary">
                        {u.full_name} {u.id === currentUser?.id && <span className="text-[10px] text-primary-orange font-bold">(Anda)</span>}
                      </td>
                      <td className="py-3 text-text-secondary">{u.username}</td>
                      <td className="py-3 text-text-secondary">{u.email}</td>
                      <td className="py-3 text-text-secondary">{ROLE_LABELS[u.role] || u.role}</td>
                      <td className="py-3">
                        <Badge variant={u.is_active ? "success" : "danger"}>
                          {u.is_active ? "Aktif" : "Nonaktif"}
                        </Badge>
                      </td>
                      <td className="py-3 text-text-secondary">
                        {u.last_login 
                          ? new Date(u.last_login).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" })
                          : "-"}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(u)}
                            className="p-1.5 hover:text-text-primary text-text-secondary transition-colors"
                            title="Ubah"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => triggerDeleteUser(u)}
                            disabled={u.id === currentUser?.id}
                            className={`p-1.5 transition-colors ${u.id === currentUser?.id ? "text-text-secondary/40 cursor-not-allowed" : "hover:text-danger text-text-secondary"}`}
                            title={u.id === currentUser?.id ? "Tidak dapat menghapus akun Anda sendiri" : "Hapus"}
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </AppShell>

      {/* DRAWER FORM TAMBAH / EDIT PENGGUNA */}
      <Drawer
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={drawerMode === "create" ? "Tambah Pengguna Baru" : "Ubah Pengguna"}
        subtitle={drawerMode === "create" ? "Masukkan detail akun untuk petugas baru." : "Perbarui informasi akun pengguna."}
      >
        <form onSubmit={handleSaveUser} className="flex flex-col gap-4 pb-12">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-text-secondary">Nama Lengkap</label>
            <input
              type="text"
              required
              className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary-orange"
              value={form.full_name}
              onChange={(e) => setForm(prev => ({ ...prev, full_name: e.target.value }))}
              placeholder="Contoh: Ahmad Subagja"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-text-secondary">Username</label>
            <input
              type="text"
              required
              className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary-orange"
              value={form.username}
              onChange={(e) => setForm(prev => ({ ...prev, username: e.target.value }))}
              placeholder="Contoh: ahmad_subagja"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-text-secondary">Email</label>
            <input
              type="email"
              required
              className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary-orange"
              value={form.email}
              onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Contoh: ahmad@desa.id"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-text-secondary">Role / Peran</label>
              <select
                required
                className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary-orange"
                value={form.role}
                onChange={(e) => setForm(prev => ({ ...prev, role: e.target.value }))}
              >
                <option value="admin">Admin Desa</option>
                <option value="kepala_desa">Kepala Desa</option>
                <option value="petugas">Petugas Survei</option>
                <option value="operator_rw">Operator RW/RT</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-text-secondary">Status</label>
              <select
                required
                className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary-orange"
                value={form.is_active ? "aktif" : "nonaktif"}
                onChange={(e) => setForm(prev => ({ ...prev, is_active: e.target.value === "aktif" }))}
              >
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Nonaktif</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-text-secondary">
              Password {drawerMode === "edit" && <span className="text-[10px] text-text-secondary/70 font-normal">(Kosongkan jika tidak ingin diubah)</span>}
            </label>
            <input
              type="password"
              required={drawerMode === "create"}
              className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary-orange"
              value={form.password}
              onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))}
              placeholder="Minimal 6 karakter"
            />
          </div>

          <div className="mt-4 flex gap-2">
            <Button type="submit" className="flex-1">
              Simpan Pengguna
            </Button>
            <Button variant="outline" type="button" onClick={() => setIsDrawerOpen(false)}>
              Batal
            </Button>
          </div>
        </form>
      </Drawer>

      {/* MODAL KONFIRMASI HAPUS PENGGUNA */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button 
            type="button" 
            className="fixed inset-0 bg-black/45 transition-opacity" 
            onClick={() => setIsDeleteModalOpen(false)}
          />
          <div className="relative w-full max-w-sm rounded-2xl bg-surface p-6 shadow-2xl z-10 space-y-4 border border-border">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-accent-red/10 text-accent-red">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-text-primary">Hapus Pengguna</h3>
                <p className="text-xs text-text-secondary mt-1">
                  Apakah Anda yakin ingin menghapus akun <strong>{userToDelete?.full_name}</strong>? Tindakan ini bersifat permanen dan tidak dapat dibatalkan.
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="danger" className="flex-1 text-xs" onClick={executeDeleteUser}>
                Hapus
              </Button>
              <Button variant="outline" className="flex-1 text-xs" onClick={() => setIsDeleteModalOpen(false)}>
                Batal
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PenggunaPage;
