import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const NAV_LINKS = [
  { to: "/", label: "Search games", end: true },
  { to: "/collection", label: "My Collection" },
  { to: "/lists", label: "My Lists" },
  { to: "/admin", label: "Admin" },
];

function getInitials(email: string | undefined): string {
  if (!email) return "??";
  const local = email.split("@")[0];
  const parts = local.split(/[._-]+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return local.slice(0, 2).toUpperCase();
}

export function TopNav() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 h-[52px] flex items-center px-6 border-b border-border bg-surface/95 backdrop-blur-md shadow-[0_1px_0_#cce3db]">
      <Link to="/" className="flex items-center gap-2 mr-8 shrink-0 no-underline">
        <div className="w-7 h-7 rounded-[7px] bg-gradient-to-br from-teal to-accent flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="2" width="5" height="5" rx="1" fill="white" opacity="0.9" />
            <rect x="9" y="2" width="5" height="5" rx="1" fill="white" opacity="0.6" />
            <rect x="2" y="9" width="5" height="5" rx="1" fill="white" opacity="0.6" />
            <rect x="9" y="9" width="5" height="5" rx="1" fill="white" opacity="0.9" />
          </svg>
        </div>
        <span className="font-ui font-bold text-[0.9rem] text-text-primary tracking-[-0.02em]">
          Backlogstats
        </span>
      </Link>

      <nav className="flex gap-0.5 flex-1">
        {NAV_LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              [
                "font-ui font-medium text-[0.82rem] px-3 py-1 rounded no-underline transition-colors",
                isActive
                  ? "text-text-primary bg-black/5"
                  : "text-text-secondary hover:text-text-primary hover:bg-black/5",
              ].join(" ")
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={logout}
          className="font-ui font-medium text-[0.78rem] text-text-secondary hover:text-text-primary transition-colors"
        >
          Sign out
        </button>
        <div
          title={user?.email}
          className="w-8 h-8 rounded-full bg-gradient-to-br from-teal to-accent flex items-center justify-center font-ui font-bold text-[0.75rem] text-white cursor-default"
        >
          {getInitials(user?.email)}
        </div>
      </div>
    </header>
  );
}
