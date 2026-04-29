const Card = ({ children, className = "", style }) => {
  return (
    <div
      className={`rounded-card border border-border/60 bg-surface shadow-card ${className}`}
      style={style}
    >
      {children}
    </div>
  );
};

export default Card;
