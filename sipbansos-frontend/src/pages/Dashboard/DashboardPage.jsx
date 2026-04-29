import AppShell from "../../components/layout/AppShell";
import Charts from "./Charts";
import MiniLeaderboard from "./MiniLeaderboard";
import OverviewCards from "./OverviewCards";

const DashboardPage = () => {
  return (
    <AppShell
      title="Admin Desa"
      subtitle="Ringkasan penyaluran BLT untuk periode BLT Q2 2026."
    >
      <OverviewCards />
      <Charts />
      <MiniLeaderboard />
    </AppShell>
  );
};

export default DashboardPage;
