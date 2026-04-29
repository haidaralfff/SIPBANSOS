import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PageContainer from "../../components/layout/PageContainer";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { useAuth } from "../../context/AuthContext";
import { ROLE_OPTIONS } from "../../utils/roleGuard";

const LoginPage = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/dashboard";

  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "admin",
    name: ""
  });
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const result = login(form);
    if (!result.success) {
      setError(result.message || "Login gagal.");
      return;
    }
    setError("");
    navigate(from, { replace: true });
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, from, navigate]);

  return (
    <PageContainer>
      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <Card className="flex flex-col justify-between p-6">
          <div>
            <Badge variant="warning">SIPBANSOS</Badge>
            <h1 className="mt-4 text-3xl font-bold text-text-primary">
              Sistem Informasi Penentu Bantuan Sosial
            </h1>
            <p className="mt-3 text-sm text-text-secondary">
              Masuk untuk mengelola data warga, menjalankan SAW, dan menyiapkan laporan resmi.
            </p>
          </div>
          <div className="mt-6 space-y-3 text-sm text-text-secondary">
            <div className="rounded-card bg-background/70 p-3">
              <p className="font-semibold text-text-primary">Akses berbasis role</p>
              <p className="text-xs">Admin, Kepala Desa, Petugas Survei, Operator RW/RT.</p>
            </div>
            <div className="rounded-card bg-background/70 p-3">
              <p className="font-semibold text-text-primary">Audit trail otomatis</p>
              <p className="text-xs">Setiap perubahan terekam untuk inspeksi.</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold text-text-primary">Masuk SIPBANSOS</h2>
          <p className="mt-2 text-sm text-text-secondary">Gunakan akun resmi desa.</p>
          {error ? (
            <div className="mt-4 rounded-card bg-accent-red/10 px-3 py-2 text-xs text-accent-red">
              {error}
            </div>
          ) : null}
          <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="text-xs font-semibold text-text-secondary">Nama (opsional)</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Nama lengkap"
                className="mt-2 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text-primary"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-text-secondary">Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="nama@desa.id"
                className="mt-2 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text-primary"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-text-secondary">Password</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Masukkan password"
                className="mt-2 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text-primary"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-text-secondary">Role</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="mt-2 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text-primary"
              >
                {ROLE_OPTIONS.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
            <Button className="w-full">Masuk</Button>
          </form>
        </Card>
      </div>
    </PageContainer>
  );
};

export default LoginPage;
