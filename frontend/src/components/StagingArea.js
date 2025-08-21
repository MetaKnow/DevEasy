import React, { useRef, useEffect, useState, useCallback } from 'react';
import './TableComponent.css';
import Tooltip from './Tooltip.js';

import dictConfig from '../config/dictConfig.js';
import {
  getYears,
  getMonthsByYear,
  getPhasesByYearAndMonth
} from '../services/taskCircleService.js';
import { getStagedTasks, deleteStagedTask, restoreStagedTask, deleteStagedStep } from '../services/taskService.js';

const StagingArea = ({ onClose }) => {
  const tableRef = useRef(null);
  const [showAddTaskRow, setShowAddTaskRow] = useState(false);
  const [showAddStepRow, setShowAddStepRow] = useState(null);
  const [newTaskName, setNewTaskName] = useState('');
  const [newStepData, setNewStepData] = useState({
    task_step: '',
    startdate: '',
    enddate: '',
    responsibility: '',
    taskstate: '',
    iscomplete: '否',
    islate: '否',
    priority: '',
    remark: ''
  });
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [stagedData, setStagedData] = useState([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [moveTaskId, setMoveTaskId] = useState(null);
  const [targetYear, setTargetYear] = useState('');
  const [targetMonth, setTargetMonth] = useState('');
  const [targetPhase, setTargetPhase] = useState('');
  const [availableYears, setAvailableYears] = useState([]);
  const [availableMonths, setAvailableMonths] = useState([]);
  const [availablePhases, setAvailablePhases] = useState([]);

  // 辅助函数：判断文本是否需要显示气泡提示
  const shouldShowTooltip = (text, maxLength = 5) => {
    return text && text.toString().length > maxLength;
  };

  // 辅助函数：创建带气泡提示的单元格内容
  const createCellWithTooltip = (content, displayContent = null) => {
    const display = displayContent || content;
    const needsTooltip = shouldShowTooltip(content);
    
    if (needsTooltip) {
      return (
        <Tooltip content={content}>
          <div className="cell-with-tooltip">
            {display}
          </div>
        </Tooltip>
      );
    }
    
    return display;
  };

  // 获取暂存数据
  const fetchStagedData = useCallback(async () => {
    try {
      const data = await getStagedTasks();
      setStagedData(data);
    } catch (error) {
      console.error('获取暂存数据失败:', error);
      setStagedData([]);
    }
  }, []);

  useEffect(() => {
    fetchStagedData();
  }, [fetchStagedData]);

  // 处理移动任务到年月阶段
  const handleMoveTask = async (taskId) => {
    setMoveTaskId(taskId);
    setShowMoveDialog(true);
    
    try {
      const years = await getYears();
      setAvailableYears(years);
    } catch (error) {
      console.error('获取年份列表失败:', error);
      alert('获取年份列表失败，请稍后再试');
    }
  };

  // 处理目标年份变化
  const handleTargetYearChange = async (year) => {
    setTargetYear(year);
    setTargetMonth('');
    setTargetPhase('');
    setAvailableMonths([]);
    setAvailablePhases([]);
    
    if (year) {
      try {
        const months = await getMonthsByYear(year);
        setAvailableMonths(months);
      } catch (error) {
        console.error('获取月份列表失败:', error);
      }
    }
  };

  // 处理目标月份变化
  const handleTargetMonthChange = async (month) => {
    setTargetMonth(month);
    setTargetPhase('');
    setAvailablePhases([]);
    
    if (targetYear && month) {
      try {
        const phases = await getPhasesByYearAndMonth(targetYear, month);
        setAvailablePhases(phases);
      } catch (error) {
        console.error('获取阶段列表失败:', error);
      }
    }
  };

  // 确认移动任务
  const confirmMoveTask = async () => {
    if (!targetYear || !targetMonth || !targetPhase) {
      alert('请选择完整的目标年月阶段');
      return;
    }

    try {
      // 调用恢复任务的API
      await restoreStagedTask(moveTaskId, targetYear, targetMonth, targetPhase);
      
      alert(`任务已成功恢复到 ${targetYear}年${targetMonth}月第${targetPhase}阶段`);
      
      setShowMoveDialog(false);
      setMoveTaskId(null);
      setTargetYear('');
      setTargetMonth('');
      setTargetPhase('');
      setAvailableYears([]);
      setAvailableMonths([]);
      setAvailablePhases([]);
      
      fetchStagedData();
    } catch (error) {
      console.error('恢复任务失败:', error);
      alert('恢复任务失败，请稍后再试');
    }
  };

  // 取消移动任务
  const cancelMoveTask = () => {
    setShowMoveDialog(false);
    setMoveTaskId(null);
    setTargetYear('');
    setTargetMonth('');
    setTargetPhase('');
    setAvailableYears([]);
    setAvailableMonths([]);
    setAvailablePhases([]);
  };

  // 处理删除暂存任务
  const handleDeleteStagedTask = async (taskId) => {
    if (window.confirm('确定要永久删除这个暂存任务及其所有步骤吗？')) {
      try {
        // 调用删除暂存任务的API
        await deleteStagedTask(taskId);
        alert('暂存任务已成功删除');
        fetchStagedData();
      } catch (error) {
        console.error('删除暂存任务失败:', error);
        alert('删除暂存任务失败，请稍后再试');
      }
    }
  };

  // 处理删除暂存步骤
  const handleDeleteStagedStep = async (stepId) => {
    if (window.confirm('确定要删除这个暂存步骤吗？')) {
      try {
        // 调用删除暂存步骤的API
        await deleteStagedStep(stepId);
        alert('暂存步骤已成功删除');
        fetchStagedData();
      } catch (error) {
        console.error('删除暂存步骤失败:', error);
        alert('删除暂存步骤失败，请稍后再试');
      }
    }
  };

  return (
    <>
      <div className="staging-area-overlay" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 10000,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div className="staging-area-dialog" style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          width: '90%',
          height: '80%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <div className="staging-area-header" style={{
            padding: '20px',
            borderBottom: '1px solid #e0e0e0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h2 style={{ margin: 0, color: '#fa8c16' }}>暂存区管理</h2>
            <button 
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#999'
              }}
            >
              ×
            </button>
          </div>
          
          <div className="staging-area-content" style={{
            flex: 1,
            overflow: 'auto',
            padding: '20px'
          }}>
            <div className="table-container">
              <table ref={tableRef} className="resizable-table">
                <thead>
                  <tr>
                    <th style={{ position: 'relative', paddingLeft: '30px' }}>
                      <button 
                        className="collapse-btn"
                        style={{
                          position: 'absolute',
                          left: '5px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: '20px',
                          height: '20px',
                          backgroundColor: '#1890ff',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px'
                        }}
                        onClick={() => setIsCollapsed(!isCollapsed)}
                      >
                        {isCollapsed ? '+' : '-'}
                      </button>
                      任务名称
                    </th>
                    <th>任务步骤</th>
                    <th>开始日期</th>
                    <th>截至日期</th>
                    <th>责任人</th>
                    <th>当前状态</th>
                    <th>是否完成</th>
                    <th>是否超期</th>
                    <th>优先级</th>
                    <th>备注</th>
                  </tr>
                </thead>
                <tbody>
                  {stagedData.length === 0 ? (
                    <tr>
                      <td colSpan="10" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                        暂存区暂无数据
                      </td>
                    </tr>
                  ) : (
                    stagedData.map(task => (
                      <React.Fragment key={task.id}>
                        {/* 任务行 */}
                        <tr className="task-row">
                          <td style={{ position: 'relative', paddingLeft: '55px' }}>
                            {/* 删除按钮 */}
                            <button 
                              className="delete-task-btn"
                              style={{
                                position: 'absolute',
                                left: '5px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                width: '20px',
                                height: '20px',
                                backgroundColor: '#ff4d4f',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '12px'
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteStagedTask(task.id);
                              }}
                            >
                              ×
                            </button>
                            {/* 恢复按钮 */}
                            <button 
                              className="move-task-btn"
                              style={{
                                position: 'absolute',
                                left: '30px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                width: '20px',
                                height: '20px',
                                backgroundColor: '#52c41a',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '12px'
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveTask(task.id);
                              }}
                            >
                              ↗
                            </button>
                            {createCellWithTooltip(task.task_name)}
                          </td>
                          <td colSpan="9"></td>
                        </tr>

                        {/* 任务的步骤 */}
                        {!isCollapsed && (task.stagedSteps || []).map(step => (
                          <tr key={step.id} className="step-row">
                            <td></td>
                            <td style={{ position: 'relative' }}>
                              {/* 步骤删除按钮 */}
                              <button 
                                className="delete-step-btn"
                                style={{
                                  position: 'absolute',
                                  left: '5px',
                                  top: '50%',
                                  transform: 'translateY(-50%)',
                                  width: '16px',
                                  height: '16px',
                                  backgroundColor: '#ff4d4f',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '3px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '10px'
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteStagedStep(step.id);
                                }}
                              >
                                ×
                              </button>
                              <div style={{ paddingLeft: '25px' }}>
                                {createCellWithTooltip(step.task_step)}
                              </div>
                            </td>
                            <td>{step.startdate ? new Date(step.startdate).toLocaleDateString('zh-CN') : ''}</td>
                            <td>{step.enddate ? new Date(step.enddate).toLocaleDateString('zh-CN') : ''}</td>
                            <td>{createCellWithTooltip(step.responsibility)}</td>
                            <td>{createCellWithTooltip(step.taskstate)}</td>
                            <td>{createCellWithTooltip(step.iscomplete)}</td>
                            <td>{createCellWithTooltip(step.islate)}</td>
                            <td>{createCellWithTooltip(step.priority)}</td>
                            <td>{createCellWithTooltip(step.remark)}</td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      {/* 移动任务对话框 */}
      {showMoveDialog && (
        <div className="move-dialog-overlay">
          <div className="move-dialog">
            <h3>恢复任务到指定阶段</h3>
            
            <div className="move-form">
              <div className="form-group">
                <label>目标年份：</label>
                <select 
                  value={targetYear} 
                  onChange={(e) => handleTargetYearChange(e.target.value)}
                >
                  <option value="">请选择年份</option>
                  {availableYears.map(year => (
                    <option key={year} value={year}>{year}年</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>目标月份：</label>
                <select 
                  value={targetMonth} 
                  onChange={(e) => handleTargetMonthChange(e.target.value)}
                  disabled={!targetYear}
                >
                  <option value="">请选择月份</option>
                  {availableMonths.map(month => (
                    <option key={month} value={month}>{month}月</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>目标阶段：</label>
                <select 
                  value={targetPhase} 
                  onChange={(e) => setTargetPhase(e.target.value)}
                  disabled={!targetMonth}
                >
                  <option value="">请选择阶段</option>
                  {availablePhases.map(phase => (
                    <option key={phase} value={phase}>第{phase}阶段</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="dialog-buttons">
              <button 
                className="confirm-move-btn" 
                onClick={confirmMoveTask}
                disabled={!targetYear || !targetMonth || !targetPhase}
              >
                确认恢复
              </button>
              <button 
                className="cancel-move-btn" 
                onClick={cancelMoveTask}
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StagingArea;