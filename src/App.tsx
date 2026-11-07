import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { DatabaseModal } from './components/DatabaseModal';

import { DashboardPage } from './pages/DashboardPage';
import { PlotsPage } from './pages/PlotsPage';
import { CropsPage } from './pages/CropsPage';
import { WorkersPage } from './pages/WorkersPage';
import { TasksPage } from './pages/TasksPage';
import { IrrigationPage } from './pages/IrrigationPage';
import { FinancePage } from './pages/FinancePage';
import { MachineryPage } from './pages/MachineryPage';
import { InventoryPage } from './pages/InventoryPage';
import { CropHealthPage } from './pages/CropHealthPage';
import { HarvestSalesPage } from './pages/HarvestSalesPage';
import { WeatherPage } from './pages/WeatherPage';
import { AIAdvisorPage } from './pages/AIAdvisorPage';

export function App() {
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-emerald-600 selection:text-white">
          
          {/* Header */}
          <Header
            onOpenDbModal={() => setIsDbModalOpen(true)}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            isSidebarOpen={isSidebarOpen}
          />

          <div className="flex-1 flex max-w-7xl w-full mx-auto">
            {/* Desktop / Sliding Sidebar */}
            <Sidebar
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
              onOpenDbModal={() => setIsDbModalOpen(true)}
            />

            {/* Main Application Content Area */}
            <main className="flex-1 px-3 sm:px-6 lg:px-8 py-5 min-w-0">
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/ai-advisor" element={<AIAdvisorPage />} />
                <Route path="/plots" element={<PlotsPage />} />
                <Route path="/crops" element={<CropsPage />} />
                <Route path="/workers" element={<WorkersPage />} />
                <Route path="/tasks" element={<TasksPage />} />
                <Route path="/irrigation" element={<IrrigationPage />} />
                <Route path="/finance" element={<FinancePage />} />
                <Route path="/machinery" element={<MachineryPage />} />
                <Route path="/inventory" element={<InventoryPage />} />
                <Route path="/crop-health" element={<CropHealthPage />} />
                <Route path="/harvest-sales" element={<HarvestSalesPage />} />
                <Route path="/weather" element={<WeatherPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>

          {/* Mobile Bottom Navigation for Father's phone */}
          <BottomNav onOpenMoreMenu={() => setIsSidebarOpen(true)} />

          {/* Database Setup & Supabase Auth Modal */}
          <DatabaseModal
            isOpen={isDbModalOpen}
            onClose={() => setIsDbModalOpen(false)}
          />

        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
