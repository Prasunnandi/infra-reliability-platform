import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import CausalityRadar from './pages/CausalityRadar';
import ApiGuardianView from './pages/ApiGuardianView';
import ServerHealthView from './pages/ServerHealthView';
import DeployMateView from './pages/DeployMateView';

export default function App() {
  const [activeTab, setActiveTab] = useState('causality');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onRefresh={handleRefresh} isRefreshing={isRefreshing} />
        
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'causality' && <CausalityRadar />}
          {activeTab === 'api' && <ApiGuardianView />}
          {activeTab === 'servers' && <ServerHealthView />}
          {activeTab === 'deployments' && <DeployMateView />}
        </main>
      </div>
    </div>
  );
}
