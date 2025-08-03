import React from 'react';
import './StatsCard.css';

const StatsCard = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="stats-container">
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-label">总任务数</div>
          <div className="stat-value">{stats.total_task}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">总步骤数</div>
          <div className="stat-value">{stats.total_step}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">已完成任务数</div>
          <div className="stat-value">{stats.complete_task}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">已完成步骤数</div>
          <div className="stat-value">{stats.complete_step}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">已超期任务数</div>
          <div className="stat-value">{stats.late_task}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">已超期步骤数</div>
          <div className="stat-value">{stats.late_step}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">进行中步骤数</div>
          <div className="stat-value">{stats.going_step}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">未开始步骤数</div>
          <div className="stat-value">{stats.not_start_step}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">完成率</div>
          <div className="stat-value">{stats.complete_percent}%</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">超期率</div>
          <div className="stat-value">{stats.late_percent}%</div>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;