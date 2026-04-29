const ProgressBar = ({ value = 0, className = "" }) => {
  return (
    <div className={`h-2 w-full rounded-full bg-border/60 ${className}`}>
      <div
        className="h-full rounded-full bg-primary-orange"
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
      />
    </div>
  );
};

export default ProgressBar;
