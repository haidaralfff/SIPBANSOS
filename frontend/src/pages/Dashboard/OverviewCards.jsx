import { useEffect, useState } from "react";
import StatCard from "../../components/charts/StatCard";
import Skeleton from "../../components/ui/Skeleton";
import { useApi } from "../../hooks/useApi";

const PeopleIcon = (
  <svg className="h-5 w-5 text-primary-orange" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M16 17c0-2.2-2.7-4-6-4s-6 1.8-6 4" />
    <circle cx="10" cy="7" r="3" />
    <path d="M21 17c0-1.5-1.7-2.8-4-3.4" />
    <path d="M17 3a3 3 0 0 1 0 6" />
  </svg>
);

const ProcessIcon = (
  <svg className="h-5 w-5 text-secondary-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v6l4 2" />
  </svg>
);

const ScoreIcon = (
  <svg className="h-5 w-5 text-secondary-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M6 16l4-4 3 3 5-5" />
    <path d="M20 7v6h-6" />
  </svg>
);

const CARDS = [
  {
    label: "Warga Terdata",
    value: "1.280",
    delta: "+3.2%",
    tone: "orange",
    icon: PeopleIcon
  },
  {
    label: "Dalam Proses",
    value: "318",
    delta: "120 validasi",
    tone: "blue",
    icon: ProcessIcon
  },
  {
    label: "Skor Rata-rata",
    value: "0.812",
    delta: "Stabil",
    tone: "green",
    icon: ScoreIcon
  }
];

const OverviewCards = ({ periodId }) => {
  const { getSummary, getWarga } = useApi();
  const [cardsData, setCardsData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!periodId) return;
    const fetchData = async () => {
      setIsLoading(true);
      const [summaryRes, wargaRes] = await Promise.all([
        getSummary(periodId),
        getWarga({ limit: 1 })
      ]);

      const totalWarga = wargaRes.success && wargaRes.data ? wargaRes.data.length : 0; // Sebenarnya butuh total keseluruhan, sementara limit 1 tapi cek length
      // Idealnya getWarga mereturn total items, misal dari res.total

      let dalamProses = 0;
      let skorRata = "0.000";

      if (summaryRes.success && summaryRes.data) {
        dalamProses = summaryRes.data.total || 0;
      }

      setCardsData([
        {
          label: "Warga Terdata",
          value: totalWarga > 0 ? "..." : "0", // Bisa juga ngambil dari count keseluruhan bila API support
          delta: "Dari Database",
          tone: "orange",
          icon: PeopleIcon
        },
        {
          label: "Diproses di Periode",
          value: dalamProses.toString(),
          delta: "Total",
          tone: "blue",
          icon: ProcessIcon
        },
        {
          label: "Skor Rata-rata",
          value: skorRata,
          delta: "-",
          tone: "green",
          icon: ScoreIcon
        }
      ]);
      setIsLoading(false);
    };
    fetchData();
  }, [periodId, getSummary, getWarga]);

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {isLoading ? (
        [...Array(3)].map((_, index) => (
          <div key={`skeleton-${index}`} className="rounded-card bg-background/70 p-4 border border-border">
            <div className="flex items-start justify-between">
              <div>
                <Skeleton className="h-4 w-24 mb-3" />
                <Skeleton className="h-8 w-20" />
              </div>
              <Skeleton className="h-10 w-10 rounded-xl" />
            </div>
            <Skeleton className="h-4 w-16 mt-4" />
          </div>
        ))
      ) : (
        (cardsData.length > 0 ? cardsData : CARDS).map((card, index) => (
          <StatCard
            key={card.label}
            {...card}
            style={{ animationDelay: `${index * 120}ms` }}
            className="animate-fade-up"
          />
        ))
      )}
    </div>
  );
};

export default OverviewCards;
