import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { OverviewPage } from './pages/OverviewPage';
import { useEffect } from "react";
import { ForecastPage } from './pages/ForecastPage';
import { ProductionPage } from './pages/ProductionPage';
import { RiskPage } from './pages/RiskPage';

import { WhatIfPage } from './pages/WhatIfPage';
import { AssistantPage } from './pages/AssistantPage';

import { API_BASE_URL } from './config';

export function App() {
  useEffect(() => {
    console.log("🚀 App loaded!");

    fetch(`${API_BASE_URL}/forecast`)
      .then((response) => response.json())
      .then((data) => {
        console.log("✅ Forecast data received:", data);
      })
      .catch((error) => {
        console.error("❌ Error fetching forecast:", error);
      });
  }, []);
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-slate-50 font-sans antialiased text-slate-900">
        {/* Persistent Left Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
          <Routes>
            <Route path="/" element={<OverviewPage />} />

            <Route path="/forecast" element={<ForecastPage />} />

            <Route path="/production" element={<ProductionPage />} />
            <Route path="/risk" element={<RiskPage />} />
            <Route path="/what-if" element={<WhatIfPage />} />
            <Route path="/assistant" element={<AssistantPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
