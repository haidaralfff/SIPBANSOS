import StatCard from "../../components/charts/StatCard";

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

const OverviewCards = () => {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {CARDS.map((card, index) => (
        <StatCard
          key={card.label}
          {...card}
          style={{ animationDelay: `${index * 120}ms` }}
          className="animate-fade-up"
        />
      ))}
    </div>
  );
};

export default OverviewCards;
