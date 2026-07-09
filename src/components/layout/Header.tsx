import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X, Zap } from "lucide-react";
import { NAV_ITEMS } from "@/constants";
import { cn } from "@/lib/utils";

export default function Header() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-[3px] border border-border bg-primary/15">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <span className="block font-heading text-sm text-foreground leading-none">SlabAI</span>
              <span className="block font-mono text-[10px] text-muted-foreground leading-none mt-0.5">ACI 318 · IS 456</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "px-4 py-2 rounded-[3px] text-sm font-medium transition-colors",
                  pathname === item.path
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/design"
              className="inline-flex items-center gap-2 rounded-[3px] bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Zap className="h-4 w-4" />
              Start Design
            </Link>
          </div>

          {/* Mobile */}
          <button
            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden border-t border-border bg-card px-4 py-3 space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setOpen(false)}
              className={cn(
                "block px-3 py-2 rounded-[3px] text-sm font-medium",
                pathname === item.path
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/design"
            onClick={() => setOpen(false)}
            className="block mt-2 text-center rounded-[3px] bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            Start Design
          </Link>
        </div>
      )}
    </header>
  );
}
