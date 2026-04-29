import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { canAccess } from "../../utils/roleGuard";
import ProgressBar from "../ui/ProgressBar";

const OverviewIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="3" width="8" height="8" rx="2" />
    <rect x="13" y="3" width="8" height="5" rx="2" />
    <rect x="13" y="10" width="8" height="11" rx="2" />
    <rect x="3" y="13" width="8" height="8" rx="2" />
  </svg>
);

const UsersIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M16 17c0-2.2-2.7-4-6-4s-6 1.8-6 4" />
    <circle cx="10" cy="7" r="3" />
    <path d="M21 17c0-1.5-1.7-2.8-4-3.4" />
    <path d="M17 3a3 3 0 0 1 0 6" />
  </svg>
);

const SwapIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M4 7h12l-3-3" />
    <path d="M20 17H8l3 3" />
  </svg>
);

const ScaleIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 3v18" />
    <path d="M5 7h14" />
    <path d="M7 7l-3 6h6l-3-6" />
    <path d="M17 7l-3 6h6l-3-6" />
  </svg>
);

const CalculatorIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="4" y="3" width="16" height="18" rx="3" />
    <path d="M8 7h8" />
    <path d="M8 12h3" />
    <path d="M13 12h3" />
    <path d="M8 16h3" />
    <path d="M13 16h3" />
  </svg>
);

const FileIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M6 3h8l4 4v14H6z" />
    <path d="M14 3v5h5" />
    <path d="M9 13h6" />
    <path d="M9 17h6" />
  </svg>
);

const UserIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
  </svg>
);

const SettingsIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V22a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H2a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5V2a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1H22a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
  </svg>
);

const NAV_ITEMS = [
  {
    label: "Overview",
    icon: OverviewIcon,
    path: "/dashboard",
    roles: ["admin", "kepala_desa", "petugas", "operator_rw"]
  },
  {
    label: "Data Warga",
    icon: UsersIcon,
    path: "/warga",
    roles: ["admin", "kepala_desa", "petugas", "operator_rw"]
  },
  { label: "Import / Ekspor", icon: SwapIcon, path: "/import-export", roles: ["admin", "petugas"] },
  { label: "Kriteria & Bobot", icon: ScaleIcon, path: "/kriteria", roles: ["admin"] },
  { label: "Simulasi SAW", icon: CalculatorIcon, path: "/simulasi", roles: ["admin", "kepala_desa"] },
  { label: "Laporan", icon: FileIcon, path: "/laporan", roles: ["admin", "kepala_desa"] },
  { label: "Pengguna", icon: UserIcon, path: "/pengguna", roles: ["admin"] },
  { label: "Pengaturan", icon: SettingsIcon, path: "/settings", roles: ["admin"] }
];

const NavItem = ({ item }) => {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.path}
      end={item.path === "/dashboard"}
      className={({ isActive }) =>
        `flex items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-semibold transition ${
          isActive
            ? "bg-primary-orange/20 text-primary-orange"
            : "text-text-secondary hover:bg-background/70 hover:text-text-primary"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-lg ${
              isActive ? "bg-primary-orange/20" : "bg-background/70"
            }`}
          >
            <Icon className="h-4 w-4" />
          </span>
          <span>{item.label}</span>
        </>
      )}
    </NavLink>
  );
};

const Sidebar = () => {
  const { user } = useAuth();
  const role = user?.role;
  const visibleItems = NAV_ITEMS.filter((item) => canAccess(role, item.roles));

  return (
    <aside className="rounded-card border border-border/60 bg-surface p-4 shadow-sidebar lg:p-5">
      <div className="flex items-center gap-3">
        <img src="/logo-sipbansos.svg" alt="SIPBANSOS" className="h-10 w-10" />
        <div>
          <p className="text-sm font-bold">SIPBANSOS</p>
          <p className="text-xs text-text-secondary">Sistem BLT Desa</p>
        </div>
      </div>
      <div className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Menu</p>
        <nav className="mt-3 flex flex-row gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible">
          {visibleItems.map((item) => (
            <NavItem key={item.label} item={item} />
          ))}
        </nav>
      </div>
      <div className="mt-6 hidden lg:block">
        <div className="rounded-card bg-background/70 p-4">
          <p className="text-sm font-semibold text-text-primary">Kuota BLT Q2 2026</p>
          <p className="mt-1 text-xs text-text-secondary">Terpenuhi 120 dari 150 KK</p>
          <ProgressBar value={80} className="mt-3" />
          <div className="mt-3 flex items-center justify-between text-xs text-text-secondary">
            <span>80% terpenuhi</span>
            <span>30 sisa</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
