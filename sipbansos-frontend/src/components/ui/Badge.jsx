const VARIANTS = {
  penerima: "bg-primary-orange/20 text-primary-orange",
  cadangan: "bg-secondary-blue/15 text-secondary-blue",
  "tidak-lolos": "bg-border/60 text-text-secondary",
  success: "bg-secondary-green/15 text-secondary-green",
  info: "bg-secondary-blue/15 text-secondary-blue",
  warning: "bg-primary-orange/15 text-primary-orange",
  danger: "bg-accent-red/15 text-accent-red"
};

const Badge = ({ children, variant = "info", className = "" }) => {
  const base = "inline-flex items-center rounded-badge px-2.5 py-1 text-xs font-semibold";
  const tone = VARIANTS[variant] || VARIANTS.info;

  return <span className={`${base} ${tone} ${className}`}>{children}</span>;
};

export default Badge;
