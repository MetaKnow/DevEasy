import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header.js';
import TableComponent from './components/TableComponent.js';
import StatsCard from './components/StatsCard.js';
import AccessControl from './components/AccessControl.js';
import { getTaskCircleStats } from './services/taskService.js';

function App() {
  const [taskCircleId, setTaskCircleId] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSearchPanel, setShowSearchPanel] = useState(false);

  const handleTaskCircleChange = async (id, isLoading) => {
    setLoading(isLoading);
    if (id) {
      setTaskCircleId(id);
      // 获取统计数据
      const statsData = await getTaskCircleStats(id);
      setStats(statsData);
    } else {
      setTaskCircleId('');
      setStats(null);
    }
  };

  return (
    <AccessControl>
      <div className="App" style={{
        marginRight: showSearchPanel ? (window.innerWidth > 1400 ? '18%' : (window.innerWidth > 1200 ? '22%' : '25%')) : '0',
        transition: 'margin-right 0.3s ease'
      }}>
        <Header 
          onTaskCircleChange={handleTaskCircleChange} 
          onSearchPanelToggle={setShowSearchPanel}
        />
        {taskCircleId && <StatsCard stats={stats} />}
        <TableComponent taskCircleId={taskCircleId} loading={loading} />
      </div>
    </AccessControl>
  );
}

export default App;