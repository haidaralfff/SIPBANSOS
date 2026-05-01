const BellIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5" />
    <path d="M9 17a3 3 0 0 0 6 0" />
  </svg>
);

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 11) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 19) return "Selamat sore";
  return "Selamat malam";
};

const Header = ({
  title = "Admin Desa",
  subtitle = "Ringkasan penyaluran BLT untuk periode BLT Q2 2026.",
  eyebrow,
  periodLabel = "Periode: BLT Q2 2026",
  showPeriod = true,
  userName = "Admin Desa",
  userEmail = "admin@desa.id",
  userRole = "Admin Desa",
  userInitials,
  showLogout = true,
  onLogout
}) => {
  const resolvedEyebrow = eyebrow ?? `${getGreeting()},`;
  const initials = userInitials || userName.split(" ").slice(0, 2).map((part) => part[0]).join("");
  return (
    <div className="flex flex-col gap-4 rounded-card border border-border/60 bg-surface/80 p-4 shadow-card backdrop-blur lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-sm text-text-secondary">{resolvedEyebrow}</p>
        <h1 className="text-2xl font-bold text-text-primary">{title}</h1>
        <p className="text-sm text-text-secondary">{subtitle}</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {showPeriod ? (
          <button
            type="button"
            className="rounded-button border border-border bg-white px-4 py-2 text-sm font-semibold text-text-primary shadow-sm"
          >
            {periodLabel}
          </button>
        ) : null}
        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-full bg-background text-text-secondary transition hover:text-text-primary"
          aria-label="Notifikasi"
        >
          <BellIcon className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent-red" />
        </button>
        <div className="relative group">
          <div className="flex items-center gap-3 rounded-full bg-background px-3 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-orange text-sm font-bold text-white">
              {initials}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold">{userName}</p>
              <p className="text-xs text-text-secondary" title={userEmail}>
                {userRole}
              </p>
            </div>
          </div>
          {showLogout && onLogout ? (
            <div className="absolute right-0 top-full pt-2">
              <button
                type="button"
                className="w-max rounded-button border border-border bg-white px-4 py-2 text-sm font-semibold text-text-primary shadow-sm opacity-0 pointer-events-none translate-y-1 transition group-hover:opacity-100 group-hover:pointer-events-auto group-hover:translate-y-0"
                onClick={onLogout}
              >
                Keluar
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Header;
