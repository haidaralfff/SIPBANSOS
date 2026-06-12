import { useEffect, useState } from "react";
import Header from "./Header";
import PageContainer from "./PageContainer";
import RightPanel from "./RightPanel";
import Sidebar from "./Sidebar";
import { Helmet } from "react-helmet-async";
import { useAuth } from "../../context/AuthContext";
import { useApi } from "../../hooks/useApi";
import { ROLE_LABELS } from "../../utils/roleGuard";

const AppShell = ({ title, subtitle, children, showRightPanel = true }) => {
  const { user, logout } = useAuth();
  const { getPeriods } = useApi();
  const [activePeriod, setActivePeriod] = useState(null);

  useEffect(() => {
    const fetchActivePeriod = async () => {
      const res = await getPeriods();
      if (res.success && res.data) {
        const active = res.data.find(p => p.status === "aktif");
        if (active) {
          setActivePeriod(active);
        }
      }
    };
    fetchActivePeriod();
  }, [getPeriods]);

  const userName = user?.name || "Admin Desa";
  const userEmail = user?.email || "admin@desa.id";
  const userRole = user?.role ? ROLE_LABELS[user.role] || user.role : "Admin Desa";
  const userInitials = userName
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const gridClassName = showRightPanel
    ? "grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)_300px]"
    : "grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]";

  const pageTitle = title ? `${title} | SIPBANSOS` : "SIPBANSOS";
  const periodLabel = activePeriod ? `Periode: ${activePeriod.nama_periode}` : "Tidak Ada Periode Aktif";

  return (
    <PageContainer>
      <Helmet>
        <title>{pageTitle}</title>
      </Helmet>
      <div className={gridClassName}>
        <Sidebar />
        <main className="min-w-0 space-y-6">
          <Header
            title={title}
            subtitle={subtitle}
            userName={userName}
            userEmail={userEmail}
            userRole={userRole}
            userInitials={userInitials}
            onLogout={logout}
            showLogout={Boolean(user)}
            periodLabel={periodLabel}
          />
          {children}
        </main>
        {showRightPanel ? <RightPanel /> : null}
      </div>
    </PageContainer>
  );
};

export default AppShell;
