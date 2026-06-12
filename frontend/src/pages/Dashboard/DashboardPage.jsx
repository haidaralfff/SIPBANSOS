import { useEffect, useState } from "react";
import AppShell from "../../components/layout/AppShell";
import { useApi } from "../../hooks/useApi";
import Charts from "./Charts";
import MiniLeaderboard from "./MiniLeaderboard";
import OverviewCards from "./OverviewCards";

const DashboardPage = () => {
  const { getPeriods } = useApi();
  const [periods, setPeriods] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState(null);

  useEffect(() => {
    const fetchPeriods = async () => {
      const res = await getPeriods();
      if (res.success && res.data.length > 0) {
        setPeriods(res.data);
        const active = res.data.find(p => p.status === "aktif");
        setSelectedPeriod(active || res.data[0]);
      }
    };
    fetchPeriods();
  }, [getPeriods]);

  return (
    <AppShell
      title="Admin Desa"
      subtitle={selectedPeriod ? `Ringkasan penyaluran BLT untuk periode ${selectedPeriod.nama_periode}.` : "Ringkasan penyaluran BLT."}
    >
      <OverviewCards periodId={selectedPeriod?.id} />
      <Charts />
      <MiniLeaderboard periodId={selectedPeriod?.id} />
    </AppShell>
  );
};

export default DashboardPage;
