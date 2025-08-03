import React, { useState } from 'react';
import './App.css';
import Header from './components/Header.js';
import TableComponent from './components/TableComponent.js';
import StatsCard from './components/StatsCard.js';
import { getTaskCircleStats } from './services/taskService.js';

function App() {
  const [taskCircleId, setTaskCircleId] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

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
    <div className="App">
      <Header onTaskCircleChange={handleTaskCircleChange} />
      {taskCircleId && <StatsCard stats={stats} />}
      <TableComponent taskCircleId={taskCircleId} loading={loading} />
    </div>
  );
}

export default App;