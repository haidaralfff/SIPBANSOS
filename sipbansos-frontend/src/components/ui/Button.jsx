const VARIANTS = {
  primary: "bg-primary-orange text-white hover:bg-primary-orange/90",
  ghost: "bg-transparent text-text-primary hover:bg-background/70",
  outline: "border border-border bg-white text-text-primary hover:bg-background/60"
};

const Button = ({ children, variant = "primary", className = "", ...props }) => {
  const tone = VARIANTS[variant] || VARIANTS.primary;
  return (
    <button
      type="button"
      className={`rounded-button px-4 py-2 text-sm font-semibold transition ${tone} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
