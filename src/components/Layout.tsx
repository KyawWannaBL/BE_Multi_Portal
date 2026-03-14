import { useState } from "react";
import { Menu, X, Bell, Search } from "lucide-react";
import { EnterpriseSidebar } from "@/components/EnterpriseSidebar";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useI18n } from "@/i18n";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

type LayoutProps = {
  children: React.ReactNode;
};

export function Layout({ children }: LayoutProps) {
  const { bi } = useI18n();
  const auth = useAuth?.() ?? {};
  const [mobileOpen, setMobileOpen] = useState(false);

  const displayName =
    auth?.user?.name ||
    auth?.name ||
    auth?.username ||
    "User";

  const role =
    auth?.user?.role ||
    auth?.role ||
    "GUEST";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <EnterpriseSidebar />
        </div>

        {/* Mobile Sidebar Overlay */}
        {mobileOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setMobileOpen(false)}
            />
            <div className="absolute left-0 top-0 h-full w-80 bg-background shadow-xl">
              <div className="flex items-center justify-between border-b p-4">
                <div>
                  <div className="text-lg font-bold">Enterprise Logistics</div>
                  <div className="text-xs text-muted-foreground">
                    Unified operations
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <EnterpriseSidebar onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        ) : null}

        {/* Main Area */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Topbar */}
          <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
            <div className="flex h-16 items-center gap-3 px-4 md:px-6">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>

              <div className="hidden min-w-0 flex-1 md:block">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    placeholder={bi(
                      "Search pages, ways, routes, riders...",
                      "စာမျက်နှာများ၊ way များ၊ route များ၊ rider များကို ရှာဖွေပါ..."
                    )}
                  />
                </div>
              </div>

              <div className="ml-auto flex items-center gap-2 md:gap-3">
                <LanguageToggle />

                <Button variant="ghost" size="icon">
                  <Bell className="h-5 w-5" />
                </Button>

                <div className="hidden text-right sm:block">
                  <div className="text-sm font-medium">{displayName}</div>
                  <div className="text-xs uppercase text-muted-foreground">
                    {role}
                  </div>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                  {String(displayName).charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}