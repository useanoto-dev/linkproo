import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useDeviceFingerprint } from "@/hooks/use-device-fingerprint";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  noPadding?: boolean;
}

export function DashboardLayout({ children, title, noPadding }: DashboardLayoutProps) {
  useDeviceFingerprint(); // silently tracks device on every authenticated page

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center gap-4 border-b border-border/60 px-4 sticky top-0 z-20 shrink-0 bg-background">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors duration-200" />
            {title && (
              <h1 className="font-display text-base sm:text-lg font-semibold text-foreground truncate">{title}</h1>
            )}
          </header>
          <main className={noPadding ? "flex-1 min-h-0" : "flex-1 p-4 sm:p-6"}>
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
