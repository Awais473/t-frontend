import { Provider } from "react-redux";
import { store } from "@/store";
import { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { useWebSocket } from "@/hooks/useWebSocket";
import type { WsCandle, WsSignal } from "@/hooks/useWebSocket";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { BtcPage } from "@/pages/BtcPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { TestingPage } from "@/pages/TestingPage";
import { StrategiesPage } from "@/pages/StrategiesPage";
import { ThemeProvider } from "@/components/theme-provider";
import { ProfileDropdown } from "@/components/profile-dropdown";

function AppContent() {
  const location = useLocation();
  const [liveCandle, setLiveCandle] = useState<WsCandle | null>(null);
  const [liveSignal, setLiveSignal] = useState<WsSignal | null>(null);

  const { lastMessage } = useWebSocket();

  useEffect(() => {
    if (!lastMessage) return;
    if (lastMessage.type === "candle") setLiveCandle(lastMessage);
  }, [lastMessage]);

  useEffect(() => {
    if (lastMessage?.type === "signal") setLiveSignal(lastMessage);
  }, [lastMessage]);

  return (
    <SidebarProvider className="overflow-x-hidden">
       <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4">
          <SidebarTrigger />
          <h1 className="text-lg font-semibold capitalize">{location.pathname === "/btc" ? "BTCUSDT" : location.pathname === "/testing" ? "Testing" : location.pathname === "/strategies" ? "Strategies" : "Dashboard"}</h1>
          <div className="ml-auto flex items-center gap-3">
            <span className={`h-2 w-2 rounded-full ${lastMessage ? "bg-emerald-500" : "bg-muted"}`} title={lastMessage ? "Live" : "Disconnected"} />
            <ProfileDropdown />
          </div>
        </header>

        <main className="flex-1 flex flex-col p-4 md:p-6 overflow-x-hidden">
          <Routes>
            <Route path="/btc" element={
              <BtcPage liveCandle={liveCandle} liveSignal={liveSignal} />
            } />
            <Route path="/testing" element={
              <TestingPage liveCandle={liveCandle} liveSignal={liveSignal} />
            } />
            <Route path="/strategies" element={
              <StrategiesPage />
            } />
            <Route path="*" element={
              <DashboardPage />
            } />
          </Routes>
        </main>

        <SidebarSeparator />
        <footer className="px-4 py-2 text-xs text-muted-foreground">
          Trading Bot v1.0
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Provider store={store}>
        <AppContent />
      </Provider>
    </ThemeProvider>
  );
}
