import React, { useRef, useEffect, useState, useCallback } from 'react';
import './TableComponent.css';
import Tooltip from './Tooltip.js';

import dictConfig from '../config/dictConfig.js';
import {
  getTasks,
  createTask,
  createStep,
  updateStep,
  deleteStep,
  deleteTask,
  updateTask,
  moveTask,
  getTaskCircleId,
  stageTask
} from '../services/taskService.js';
import {
  getYears,
  getMonthsByYear,
  getPhasesByYearAndMonth
} from '../services/taskCircleService.js';

const TableComponent = ({ taskCircleId, loading }) => {
  const tableRef = useRef(null);
  const [showAddTaskRow, setShowAddTaskRow] = useState(false);
  const [showAddStepRow, setShowAddStepRow] = useState(null);
  const [newTaskName, setNewTaskName] = useState('');
  // 1. 修改初始状态定义
  const [newStepData, setNewStepData] = useState({
    task_step: '',
    startdate: '',
    enddate: '',
    responsibility: '',
    taskstate: '',
    iscomplete: '否', // 默认设为“否”
    islate: '否',     // 默认设为“否”
    priority: '',
    remark: ''
  });
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [tableData, setTableData] = useState([]);
  const [isCollapsed, setIsCollapsed] = useState(false); // 新增：折叠状态
  const [showMoveDialog, setShowMoveDialog] = useState(false); // 移动对话框显示状态
  const [moveTaskId, setMoveTaskId] = useState(null); // 要移动的任务ID
  const [targetYear, setTargetYear] = useState(''); // 目标年份
  const [targetMonth, setTargetMonth] = useState(''); // 目标月份
  const [targetPhase, setTargetPhase] = useState(''); // 目标阶段
  const [availableYears, setAvailableYears] = useState([]); // 可用年份列表
  const [availableMonths, setAvailableMonths] = useState([]); // 可用月份列表
  const [availablePhases, setAvailablePhases] = useState([]); // 可用阶段列表

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

  // 列宽调整功能保持不变
  useEffect(() => {
    if (!tableRef.current) return;

    const table = tableRef.current;
    const cols = table.querySelectorAll('th');
    let isResizing = false;
    let currentCol = null;
    let startX = 0;
    let startWidth = 0;

    const handleMouseDown = (e) => {
      if (e.target.classList.contains('resizer')) {
        isResizing = true;
        currentCol = e.target.parentElement;
        startX = e.pageX;
        startWidth = currentCol.offsetWidth;
        document.body.style.cursor = 'col-resize';
      }
    };

    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const width = startWidth + (e.pageX - startX);
      if (width > 50) {
        currentCol.style.width = `${width}px`;
      }
    };

    const handleMouseUp = () => {
      isResizing = false;
      document.body.style.cursor = '';
    };

    table.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      table.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // 修改handleAddStep函数
  // 修改handleAddStep函数中的初始值
  const handleAddStep = (taskId) => {
    setShowAddStepRow(taskId);
    setNewStepData({
      task_step: '',
      startdate: '',
      enddate: '',
      responsibility: '',
      taskstate: '',
      iscomplete: '否', // 默认设为“否”
      islate: '否',     // 默认设为“否”
      priority: '',
      remark: ''
    });
  };

  // 处理双击单元格事件
  const handleCellDoubleClick = (taskId, stepId, field, value) => {
    setEditingCell({ taskId, stepId, field });
    setEditValue(value);
  };

  // 处理保存编辑
  const handleSaveEdit = async () => {
    if (!editingCell) return;

    const { taskId, stepId, field } = editingCell;

    // 添加日期验证
    if (stepId && (field === 'startdate' || field === 'enddate')) {
      // 找到对应的步骤
      let step = null;
      let task = null;
      for (const t of tableData) {
        if (t.id === taskId) {
          task = t;
          for (const s of t.steps) {
            if (s.id === stepId) {
              step = s;
              break;
            }
          }
          break;
        }
      }

      if (step) {
        let startDate, endDate;
        if (field === 'startdate') {
          startDate = new Date(editValue);
          endDate = new Date(step.enddate);
          // 只有当截止日期不为空时，才进行验证
          if (step.enddate && endDate < startDate) {
            alert('截止日期不能早于开始日期');
            return;
          }
        } else {
          startDate = new Date(step.startdate);
          endDate = new Date(editValue);
          if (endDate < startDate) {
            alert('截止日期不能早于开始日期');
            return;
          }
        }
      }
    }

    // 更新本地数据
    const updatedData = tableData.map(task => {
      if (task.id === taskId) {
        // 如果是任务名称字段
        if (field === 'task_name') {
          // 准备更新数据
          const updatedTask = {
            ...task,
            task_name: editValue
          };
          // 调用更新函数
          updateTask(taskId, { task_name: editValue })
            .then(response => {
              console.log('更新任务成功:', response);
            })
            .catch(error => {
              console.error('更新任务失败:', error);
            });
          return updatedTask;
        }
        // 如果是步骤字段
        else if (stepId) {
          return {
            ...task,
            steps: task.steps.map(step => {
              if (step.id === stepId) {
                // 准备更新数据
                const updatedStep = {
                  ...step,
                  [field]: editValue
                };
                // 调用更新函数
                updateStep(stepId, updatedStep)
                  .then(response => {
                    console.log('更新步骤成功:', response);
                  })
                  .catch(error => {
                    console.error('更新步骤失败:', error);
                  });
                return updatedStep;
              }
              return step;
            })
          };
        }
      }
      return task;
    });

    setTableData(updatedData);
    setEditingCell(null);
  };

  // 处理取消编辑
  const handleCancelEdit = () => {
    setEditingCell(null);
  };

  // 使用 useCallback 包装获取数据的函数
  const fetchData = useCallback(async () => {
    if (taskCircleId) {
      const data = await getTasks(taskCircleId);
      setTableData(data);
    } else {
      setTableData([]);
    }
  }, [taskCircleId]);

  // 监听 taskCircleId 变化，重新获取数据
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 异步处理添加任务
  const handleAddTask = async () => {
    if (newTaskName.trim() && taskCircleId) {
      try {
        // 创建新任务
        const newTask = await createTask(newTaskName, taskCircleId);
        // 更新表格数据
        setTableData([
          ...tableData,
          newTask
        ]);
        // 重置表单
        setNewTaskName('');
        setShowAddTaskRow(false);
      } catch (error) {
        console.error('添加任务失败:', error);
        alert('添加任务失败，请稍后再试。');
      }
    }
  };

  // 异步处理保存步骤
  const handleSaveStep = async (taskId) => {
    if (newStepData.task_step.trim() && taskId && taskCircleId) {
      // 添加日期验证
      if (newStepData.startdate && newStepData.enddate) {
        const startDate = new Date(newStepData.startdate);
        const endDate = new Date(newStepData.enddate);
        if (endDate < startDate) {
          alert('截止日期不能早于开始日期');
          return;
        }
      }

      try {
        // 创建新步骤
        const newStep = await createStep(newStepData, taskId, taskCircleId);
        // 更新表格数据
        const updatedData = tableData.map(task => {
          if (task.id === taskId) {
            // 添加新步骤
            return {
              ...task,
              steps: Array.isArray(task.steps) ? [...task.steps, newStep] : [newStep]
            };
          }
          return task;
        });
        setTableData(updatedData);
        setShowAddStepRow(null);
      } catch (error) {
        console.error('添加步骤失败:', error);
        alert('添加步骤失败，请稍后再试。');
      }
    }
  };

  // 新增：处理删除步骤
  const handleDeleteStep = async (taskId, stepId) => {
    if (window.confirm('确定要删除这个步骤吗？')) {
      try {
        // 调用删除步骤的API
        await deleteStep(stepId);
        // 更新本地数据
        const updatedData = tableData.map(task => {
          if (task.id === taskId) {
            return {
              ...task,
              steps: task.steps.filter(step => step.id !== stepId)
            };
          }
          return task;
        });
        setTableData(updatedData);
      } catch (error) {
        console.error('删除步骤失败:', error);
        alert('删除步骤失败，请稍后再试。');
      }
    }
  };

  // 删除任务及其所有步骤
  const handleDeleteTask = async (taskId) => {
    try {
      // 这里我们假设会有一个 deleteTask 函数来删除任务
      // 你需要在 taskService.js 中添加这个函数
      await deleteTask(taskId);
      // 更新本地数据
      setTableData(prevData => prevData.filter(task => task.id !== taskId));
      // 显示成功消息
      alert('任务及其所有步骤已成功删除');
    } catch (error) {
      console.error('删除任务失败:', error);
      alert('删除任务失败，请重试');
    }
  };

  // 处理移动任务按钮点击
  const handleMoveTask = async (taskId) => {
    setMoveTaskId(taskId);
    setShowMoveDialog(true);
    
    // 获取可用的年份列表
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
       // 调用移动任务的API
       await moveTask(moveTaskId, targetYear, targetMonth, targetPhase);
       
       // 显示成功消息
       alert(`任务已成功移动到 ${targetYear}年${targetMonth}月第${targetPhase}阶段`);
       
       // 关闭对话框并重置状态
       setShowMoveDialog(false);
       setMoveTaskId(null);
       setTargetYear('');
       setTargetMonth('');
       setTargetPhase('');
       setAvailableYears([]);
       setAvailableMonths([]);
       setAvailablePhases([]);
       
       // 刷新表格数据
       fetchData();
     } catch (error) {
       console.error('移动任务失败:', error);
       alert('移动任务失败，请稍后再试');
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

    // 处理暂存任务
     const handleStageTask = async (taskId) => {
       if (window.confirm('确定要将此任务及其所有步骤移动到暂存区吗？')) {
         try {
           // 调用暂存任务的API
           await stageTask(taskId);
           
           // 显示成功消息
           alert('任务已成功移动到暂存区');
           
           // 刷新表格数据
           fetchData();
         } catch (error) {
           console.error('暂存任务失败:', error);
           alert('暂存任务失败，请稍后再试');
         }
       }
     };

  return (
    <>
    <div className="table-container">
      {loading && <div className="loading-overlay">加载中...</div>}
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
              任务名称 <div className="resizer"></div>
            </th>
            <th>任务步骤 <div className="resizer"></div></th>
            <th>开始日期 <div className="resizer"></div></th>
            <th>截至日期 <div className="resizer"></div></th>
            <th>责任人 <div className="resizer"></div></th>
            <th>当前状态 <div className="resizer"></div></th>
            <th>是否完成 <div className="resizer"></div></th>
            <th>是否超期 <div className="resizer"></div></th>
            <th>优先级 <div className="resizer"></div></th>
            <th>备注 <div className="resizer"></div></th>
          </tr>
        </thead>
        <tbody>
          {/* 新任务的可编辑行 */}
          {showAddTaskRow && (
            <tr className="new-task-row">
              <td>
                <div className="new-task-input-container">
                  <input
                    type="text"
                    value={newTaskName}
                    onChange={(e) => setNewTaskName(e.target.value)}
                    placeholder="输入任务名称"
                    autoFocus
                  />
                  <div className="new-task-buttons">
                    <button className="save-task-btn" onClick={handleAddTask}>保存</button>
                    <button className="cancel-task-btn" onClick={() => setShowAddTaskRow(false)}>取消</button>
                  </div>
                </div>
              </td>
              {/* 其他列的空单元格 */}
              {[...Array(9)].map((_, i) => (
                <td key={`empty-${i}`}></td>
              ))}
            </tr>
          )}

          {/* 现有任务和步骤 */}
          {tableData.map(task => (
            <React.Fragment key={task.id}>
              {/* 任务行 */}
              <tr className="task-row">
                <td
                  onDoubleClick={() => handleCellDoubleClick(task.id, null, 'task_name', task.task_name)}
                  style={{ position: 'relative', paddingLeft: '80px' }} // 增加左侧内边距容纳三个按钮
                >
                  {/* 任务删除按钮 */}
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
                      e.stopPropagation(); // 防止触发双击编辑
                      if (window.confirm('确定要删除这个任务及其所有步骤吗？')) {
                        handleDeleteTask(task.id);
                      }
                    }}
                  >
                    ×
                  </button>
                  {/* 任务移动按钮 */}
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
                      e.stopPropagation(); // 防止触发双击编辑
                      handleMoveTask(task.id);
                    }}
                  >
                    ↗
                  </button>
                  {/* 任务暂存按钮 */}
                  <button 
                    className="stage-task-btn"
                    style={{
                      position: 'absolute',
                      left: '55px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '20px',
                      height: '20px',
                      backgroundColor: '#fa8c16',
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
                      e.stopPropagation(); // 防止触发双击编辑
                      handleStageTask(task.id);
                    }}
                  >
                    📦
                  </button>
                  {editingCell && editingCell.taskId === task.id && editingCell.field === 'task_name' && !editingCell.stepId ? (
                    <div className="edit-cell-container">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        autoFocus
                      />
                      <div className="edit-buttons">
                        <button className="save-edit-btn" onClick={handleSaveEdit}>保存</button>
                        <button className="cancel-edit-btn" onClick={handleCancelEdit}>取消</button>
                      </div>
                    </div>
                  ) : (
                    createCellWithTooltip(task.task_name)
                  )}
                </td>
                <td colSpan="9"></td> {/* 合并其他列 */}
              </tr>

              {/* 任务的步骤 - 根据折叠状态决定是否显示 */}
              {!isCollapsed && (task.steps || []).map(step => (
                <tr key={step.id} className="step-row">
                  <td></td> {/* 任务名称列为空 */}
                  <td
                    onDoubleClick={() => handleCellDoubleClick(task.id, step.id, 'task_step', step.task_step)}
                    style={{ position: 'relative', paddingLeft: '30px' }} // 增加左侧内边距容纳按钮
                  >
                    {/* 调整：删除按钮 - 放在步骤单元格的左侧，靠近左边框 */}
                    <button 
                      className="delete-step-btn"
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
                        e.stopPropagation(); // 防止触发双击编辑
                        handleDeleteStep(task.id, step.id);
                      }}
                    >
                      ×
                    </button>
                    {editingCell && editingCell.taskId === task.id && editingCell.stepId === step.id && editingCell.field === 'task_step' ? (
                      <div className="edit-cell-container">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          autoFocus
                        />
                        <div className="edit-buttons">
                          <button className="save-edit-btn" onClick={handleSaveEdit}>保存</button>
                          <button className="cancel-edit-btn" onClick={handleCancelEdit}>取消</button>
                        </div>
                      </div>
                    ) : (
                      createCellWithTooltip(step.task_step)
                    )}
                  </td>
                  <td
                    onDoubleClick={() => handleCellDoubleClick(task.id, step.id, 'startdate', step.startdate)}
                  >
                    {editingCell && editingCell.taskId === task.id && editingCell.stepId === step.id && editingCell.field === 'startdate' ? (
                      <div className="edit-cell-container">
                        <input
                          type="date"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          autoFocus
                        />
                        <div className="edit-buttons">
                          <button className="save-edit-btn" onClick={handleSaveEdit}>保存</button>
                          <button className="cancel-edit-btn" onClick={handleCancelEdit}>取消</button>
                        </div>
                      </div>
                    ) : (
                      step.startdate ? new Date(step.startdate).toLocaleDateString('zh-CN') : ''
                    )}
                  </td>
                  <td
                    onDoubleClick={() => handleCellDoubleClick(task.id, step.id, 'enddate', step.enddate)}
                  >
                    {editingCell && editingCell.taskId === task.id && editingCell.stepId === step.id && editingCell.field === 'enddate' ? (
                      <div className="edit-cell-container">
                        <input
                          type="date"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          autoFocus
                        />
                        <div className="edit-buttons">
                          <button className="save-edit-btn" onClick={handleSaveEdit}>保存</button>
                          <button className="cancel-edit-btn" onClick={handleCancelEdit}>取消</button>
                        </div>
                      </div>
                    ) : (
                      step.enddate ? new Date(step.enddate).toLocaleDateString('zh-CN') : ''
                    )}
                  </td>
                  <td
                    onDoubleClick={() => handleCellDoubleClick(task.id, step.id, 'responsibility', step.responsibility)}
                  >
                    {editingCell && editingCell.taskId === task.id && editingCell.stepId === step.id && editingCell.field === 'responsibility' ? (
                      <div className="edit-cell-container">
                        <select
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          autoFocus
                        >
                          <option value="">选择责任人</option>
                          {dictConfig.responsiblePerson.map(person => (
                            <option key={person} value={person}>{person}</option>
                          ))}
                        </select>
                        <div className="edit-buttons">
                          <button className="save-edit-btn" onClick={handleSaveEdit}>保存</button>
                          <button className="cancel-edit-btn" onClick={handleCancelEdit}>取消</button>
                        </div>
                      </div>
                    ) : (
                      createCellWithTooltip(step.responsibility)
                    )}
                  </td>
                  <td
                    onDoubleClick={() => handleCellDoubleClick(task.id, step.id, 'taskstate', step.taskstate)}
                  >
                    {editingCell && editingCell.taskId === task.id && editingCell.stepId === step.id && editingCell.field === 'taskstate' ? (
                      <div className="edit-cell-container">
                        <select
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          autoFocus
                        >
                          <option value="">选择当前状态</option>
                          {dictConfig.status.map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                        <div className="edit-buttons">
                          <button className="save-edit-btn" onClick={handleSaveEdit}>保存</button>
                          <button className="cancel-edit-btn" onClick={handleCancelEdit}>取消</button>
                        </div>
                      </div>
                    ) : (
                      createCellWithTooltip(step.taskstate)
                    )}
                  </td>
                  <td
                    // 修改双击事件处理函数的参数
                      onDoubleClick={() => handleCellDoubleClick(task.id, step.id, 'iscomplete', step.iscomplete)}
                    >
                      {editingCell && editingCell.taskId === task.id && editingCell.stepId === step.id && editingCell.field === 'iscomplete' ? (
                        <div className="edit-cell-container">
                          <select
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            autoFocus
                          >
                            <option value="是">是</option>
                            <option value="否">否</option>
                          </select>
                          <div className="edit-buttons">
                            <button className="save-edit-btn" onClick={handleSaveEdit}>保存</button>
                            <button className="cancel-edit-btn" onClick={handleCancelEdit}>取消</button>
                          </div>
                        </div>
                      ) : (
                        createCellWithTooltip(step.iscomplete)  // 直接显示枚举值，不再使用三元表达式
                      )}
                    </td>
                    
                    
                    <td
                      onDoubleClick={() => handleCellDoubleClick(task.id, step.id, 'islate', step.islate)}
                    >
                      {editingCell && editingCell.taskId === task.id && editingCell.stepId === step.id && editingCell.field === 'islate' ? (
                        <div className="edit-cell-container">
                          <select
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            autoFocus
                          >
                            <option value="是">是</option>
                            <option value="否">否</option>
                          </select>
                          <div className="edit-buttons">
                            <button className="save-edit-btn" onClick={handleSaveEdit}>保存</button>
                            <button className="cancel-edit-btn" onClick={handleCancelEdit}>取消</button>
                          </div>
                        </div>
                      ) : (
                        createCellWithTooltip(step.islate)  // 直接显示枚举值，不再使用三元表达式
                      )}
                    </td>
                  <td
                    onDoubleClick={() => handleCellDoubleClick(task.id, step.id, 'priority', step.priority)}
                  >
                    {editingCell && editingCell.taskId === task.id && editingCell.stepId === step.id && editingCell.field === 'priority' ? (
                      <div className="edit-cell-container">
                        <select
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          autoFocus
                        >
                          <option value="">选择优先级</option>
                          {dictConfig.priority.map(priority => (
                            <option key={priority} value={priority}>{priority}</option>
                          ))}
                        </select>
                        <div className="edit-buttons">
                          <button className="save-edit-btn" onClick={handleSaveEdit}>保存</button>
                          <button className="cancel-edit-btn" onClick={handleCancelEdit}>取消</button>
                        </div>
                      </div>
                    ) : (
                      createCellWithTooltip(step.priority)
                    )}
                  </td>
                  <td
                    onDoubleClick={() => handleCellDoubleClick(task.id, step.id, 'remark', step.remark)}
                  >
                    {editingCell && editingCell.taskId === task.id && editingCell.stepId === step.id && editingCell.field === 'remark' ? (
                      <div className="edit-cell-container">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          autoFocus
                        />
                        <div className="edit-buttons">
                          <button className="save-edit-btn" onClick={handleSaveEdit}>保存</button>
                          <button className="cancel-edit-btn" onClick={handleCancelEdit}>取消</button>
                        </div>
                      </div>
                    ) : (
                      createCellWithTooltip(step.remark)
                    )}
                  </td>
                </tr>
              ))}

              {/* 步骤添加行 */}
              <tr className="add-step-row">
                <td></td> {/* 任务名称列为空 */}
                <td>
                  <button 
                    className="add-step-btn"
                    onClick={() => handleAddStep(task.id)}
                  >
                    +
                  </button>
                </td>
                {/* 其他列的空单元格 */}
                {[...Array(8)].map((_, i) => (
                  <td key={`step-empty-${i}`}></td>
                ))}
              </tr>

              {/* 步骤编辑行
              修改渲染部分，将输入框改为下拉菜单
              找到新步骤行的渲染部分 */}

              {showAddStepRow === task.id && (
                <tr className="new-step-row">
                  <td rowSpan="1"></td>
                  <td>
                    <input
                      type="text"
                      value={newStepData.task_step}
                      onChange={(e) => setNewStepData({...newStepData, task_step: e.target.value})}
                      placeholder="输入任务步骤"
                      autoFocus
                    />
                    <div className="new-step-buttons">
                      <button className="save-step-btn" onClick={() => handleSaveStep(task.id)}>保存</button>
                      <button className="cancel-step-btn" onClick={() => setShowAddStepRow(null)}>取消</button>
                    </div>
                  </td>
                  <td>
                    <input
                      type="date"
                      value={newStepData.startdate}
                      onChange={(e) => setNewStepData({...newStepData, startdate: e.target.value})}
                    />
                  </td>
                  <td>
                    <input
                      type="date"
                      value={newStepData.enddate}
                      onChange={(e) => setNewStepData({...newStepData, enddate: e.target.value})}
                    />
                  </td>
                  <td>
                    <select
                      value={newStepData.responsibility}
                      onChange={(e) => setNewStepData({...newStepData, responsibility: e.target.value})}
                    >
                      <option value="">选择责任人</option>
                      {dictConfig.responsiblePerson.map(person => (
                        <option key={person} value={person}>{person}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <select
                      value={newStepData.taskstate}
                      onChange={(e) => setNewStepData({...newStepData, taskstate: e.target.value})}
                    >
                      <option value="">选择当前状态</option>
                      {dictConfig.status.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <select
                      value={newStepData.iscomplete}
                      onChange={(e) => setNewStepData({...newStepData, iscomplete: e.target.value})}
                    >
                      <option value="">选择</option>
                      <option value="是">是</option>
                      <option value="否">否</option>
                    </select>
                  </td>
                  <td>
                    <select
                      value={newStepData.islate}
                      onChange={(e) => setNewStepData({...newStepData, islate: e.target.value})}
                    >
                      <option value="">选择</option>
                      <option value="是">是</option>
                      <option value="否">否</option>
                    </select>
                  </td>
                  <td>
                    <select
                      value={newStepData.priority}
                      onChange={(e) => setNewStepData({...newStepData, priority: e.target.value})}
                    >
                      <option value="">选择优先级</option>
                      {dictConfig.priority.map(priority => (
                        <option key={priority} value={priority}>{priority}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      type="text"
                      value={newStepData.remark}
                      onChange={(e) => setNewStepData({...newStepData, remark: e.target.value})}
                      placeholder="备注"
                    />
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}

          {/* 带添加按钮的持久行 */}
          <tr className="add-task-row">
            <td>
              <button 
                className="add-task-btn"
                onClick={() => setShowAddTaskRow(true)}
              >
                +
              </button>
            </td>
            {/* 其他列的空单元格 */}
            {[...Array(9)].map((_, i) => (
              <td key={`add-empty-${i}`}></td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
    
    {/* 移动任务对话框 */}
    {showMoveDialog && (
      <div className="move-dialog-overlay">
        <div className="move-dialog">
          <h3>移动任务到其他阶段</h3>
          
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
              确认移动
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

export default TableComponent;