import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PageContainer from "../../components/layout/PageContainer";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { useAuth } from "../../context/AuthContext";

const LoginPage = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/dashboard";

  const [form, setForm] = useState({
    identifier: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    const result = await login(form);
    setIsSubmitting(false);
    if (!result.success) {
      setError(result.message || "Login gagal.");
      return;
    }
    navigate(from, { replace: true });
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, from, navigate]);

  return (
    <PageContainer>
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Card className="w-full max-w-md p-6">
          <Badge variant="warning">SIPBANSOS</Badge>
          <h1 className="mt-4 text-2xl font-bold text-text-primary">Masuk SIPBANSOS</h1>
          <p className="mt-2 text-sm text-text-secondary">
            Gunakan email atau username resmi untuk mengakses sistem.
          </p>
          {error ? (
            <div className="mt-4 rounded-card bg-accent-red/10 px-3 py-2 text-xs text-accent-red">
              {error}
            </div>
          ) : null}
          <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="text-xs font-semibold text-text-secondary">Email atau Username</label>
              <input
                name="identifier"
                type="text"
                value={form.identifier}
                onChange={handleChange}
                placeholder="nama@desa.id atau username"
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
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Memproses..." : "Masuk"}
            </Button>
          </form>
        </Card>
      </div>
    </PageContainer>
  );
};

export default LoginPage;
