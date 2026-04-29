import Header from "./Header";
import PageContainer from "./PageContainer";
import RightPanel from "./RightPanel";
import Sidebar from "./Sidebar";
import { useAuth } from "../../context/AuthContext";
import { ROLE_LABELS } from "../../utils/roleGuard";

const AppShell = ({ title, subtitle, children, showRightPanel = true }) => {
  const { user, logout } = useAuth();
  const userName = user?.name || "Admin Desa";
  const userEmail = user?.email || "admin@desa.id";
  const userRole = user?.role ? ROLE_LABELS[user.role] || user.role : "Admin Desa";
  const userInitials = userName
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <PageContainer>
      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)_300px]">
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
          />
          {children}
        </main>
        {showRightPanel ? <RightPanel /> : null}
      </div>
    </PageContainer>
  );
};

export default AppShell;
