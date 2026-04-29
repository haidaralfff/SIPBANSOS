import Card from "../ui/Card";

const TONES = {
  orange: {
    chip: "bg-primary-orange/15 text-primary-orange",
    glow: "bg-primary-orange/20"
  },
  green: {
    chip: "bg-secondary-green/15 text-secondary-green",
    glow: "bg-secondary-green/20"
  },
  blue: {
    chip: "bg-secondary-blue/15 text-secondary-blue",
    glow: "bg-secondary-blue/20"
  }
};

const StatCard = ({ label, value, delta, tone = "orange", icon, style }) => {
  const palette = TONES[tone] || TONES.orange;

  return (
    <Card className="relative overflow-hidden p-4" style={style}>
      <div className={`absolute -right-8 -top-8 h-20 w-20 rounded-full blur-2xl ${palette.glow}`} />
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-background/70">
          {icon}
        </div>
        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${palette.chip}`}>{delta}</span>
      </div>
      <div className="mt-4">
        <p className="text-sm text-text-secondary">{label}</p>
        <p className="text-2xl font-bold text-text-primary">{value}</p>
      </div>
    </Card>
  );
};

export default StatCard;
