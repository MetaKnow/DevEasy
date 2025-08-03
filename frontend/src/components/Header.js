import React from 'react';
import './Header.css';
import { useState, useEffect, useRef } from 'react';
import {
  getYears,
  getMonthsByYear,
  getPhasesByYearAndMonth,
  checkYearMonthPhaseExists,
  createTaskCircle,
  deleteTaskCircle
} from '../services/taskCircleService.js';
import { BASE_URL, getTaskCircleStats } from '../services/taskService.js';
import * as XLSX from 'xlsx';
import { getTasks } from '../services/taskService.js';

export default function Header({ onTaskCircleChange }) {
  // 状态管理
  const [years, setYears] = useState([]);
  const [months, setMonths] = useState([]);
  const [phases, setPhases] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedPhase, setSelectedPhase] = useState('');
  const [yearInput, setYearInput] = useState('');
  const [monthInput, setMonthInput] = useState('');
  const [phaseInput, setPhaseInput] = useState('');
  const [isAddPlanEnabled, setIsAddPlanEnabled] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showPhaseDropdown, setShowPhaseDropdown] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successInfo, setSuccessInfo] = useState({ year: '', month: '', phase: '' });
  // 新增：用于区分是添加还是删除操作的状态
  const [isAddOperation, setIsAddOperation] = useState(true);

  // 引用
  const yearRef = useRef(null);
  const monthRef = useRef(null);
  const phaseRef = useRef(null);

  // 组件加载时获取年份
  useEffect(() => {
    const fetchYears = async () => {
      const data = await getYears();
      setYears(data);
    };
    fetchYears();
  }, []);

  // 监听成功消息显示状态
  useEffect(() => {
    let timer;
    if (showSuccessMessage) {
      timer = setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000); // 3秒后自动隐藏
    }
    return () => clearTimeout(timer);
  }, [showSuccessMessage]);

  // 监听年份变化，更新月份
  useEffect(() => {
    if (selectedYear) {
      const fetchMonths = async () => {
        const data = await getMonthsByYear(selectedYear);
        setMonths(data);
        setSelectedMonth('');
        setPhases([]);
        setSelectedPhase('');
      };
      fetchMonths();
    } else {
      setMonths([]);
      setPhases([]);
    }
  }, [selectedYear]);

  // 监听月份变化，更新阶段
  useEffect(() => {
    if (selectedYear && selectedMonth) {
      const fetchPhases = async () => {
        const data = await getPhasesByYearAndMonth(selectedYear, selectedMonth);
        setPhases(data);
        setSelectedPhase('');
      };
      fetchPhases();
    } else if (selectedYear) {
      setPhases([]);
    }
  }, [selectedYear, selectedMonth]);

  // 监听输入变化，检查是否存在匹配数据
  // 增加状态，跟踪是否可以删除计划
  const [isDeletePlanEnabled, setIsDeletePlanEnabled] = useState(false);
  
  // 修改监听输入变化的 useEffect，同时检查是否可以删除计划
  useEffect(() => {
    if (yearInput && monthInput && phaseInput) {
      const checkExists = async () => {
        try {
          console.log('检查数据是否存在:', yearInput, monthInput, phaseInput);
          const exists = await checkYearMonthPhaseExists(
            yearInput,
            monthInput,
            phaseInput
          );
          console.log('数据存在结果:', exists);
          // 只有当数据不存在时才启用添加按钮
          setIsAddPlanEnabled(!exists);
          // 只有当数据存在时才启用删除按钮
          setIsDeletePlanEnabled(exists);
          console.log('添加按钮状态:', !exists);
          console.log('删除按钮状态:', exists);
        } catch (error) {
          console.error('检查年月阶段失败:', error);
          // 发生错误时禁用按钮
          setIsAddPlanEnabled(false);
          setIsDeletePlanEnabled(false);
        }
      };
      checkExists();
    } else {
      setIsAddPlanEnabled(false);
      setIsDeletePlanEnabled(false);
      console.log('输入不完整，禁用按钮');
    }
  }, [yearInput, monthInput, phaseInput]);
  
  // 处理删除计划按钮点击
  const handleDeletePlan = async () => {
    if (isDeletePlanEnabled) {
      try {
        // 显示确认对话框
        if (window.confirm(`确定要删除 ${yearInput}年${monthInput}月${phaseInput} 计划及其所有任务和步骤吗？`)) {
          // 删除计划
          await deleteTaskCircle(yearInput, monthInput, phaseInput);
          
          // 保存成功信息
          setSuccessInfo({
            year: yearInput,
            month: monthInput,
            phase: phaseInput
          });
          // 设置为删除操作
          setIsAddOperation(false);
          setShowSuccessMessage(true);
          
          // 通知父组件刷新表格
          if (onTaskCircleChange) {
            onTaskCircleChange('', false);
          }
          
          // 成功后刷新列表
          // 刷新年份列表
          const yearsData = await getYears();
          setYears(yearsData);
          
          // 如果有选择年份，刷新月份列表
          if (yearInput) {
            const monthsData = await getMonthsByYear(yearInput);
            setMonths(monthsData);
            
            // 如果有选择月份，刷新阶段列表
            if (monthInput) {
              const phasesData = await getPhasesByYearAndMonth(yearInput, monthInput);
              setPhases(phasesData);
            }
          }
          
          // 重置输入
          setYearInput('');
          setMonthInput('');
          setPhaseInput('');
        }
      } catch (error) {
        console.error('删除计划失败:', error);
        alert('删除计划失败，请稍后再试。');
      }
    }
  };
  
  // 修改渲染部分，添加删除计划按钮
  // 在 return 语句中的适当位置添加
  <button
    className="delete-plan-button"
    onClick={handleDeletePlan}
    disabled={!isDeletePlanEnabled}
  >
    删除计划
  </button>
    const handleAddPlan = async () => {
      if (isAddPlanEnabled) {
        try {
          // 创建新计划
          await createTaskCircle(yearInput, monthInput, phaseInput);
          
          // 保存成功信息
          setSuccessInfo({
            year: yearInput,
            month: monthInput,
            phase: phaseInput
          });
          // 设置为添加操作
          setIsAddOperation(true);
          setShowSuccessMessage(true);
          
          // 成功后获取新计划的task_circle_id并设置
          await getTaskCircleId(yearInput, monthInput, phaseInput);
          
          // 成功后更新按钮状态
          setIsAddPlanEnabled(false);
          setIsDeletePlanEnabled(true);
          
          // 成功后刷新列表
          // 刷新年份列表
          const yearsData = await getYears();
          setYears(yearsData);
          
          // 如果有选择年份，刷新月份列表
          if (yearInput) {
            const monthsData = await getMonthsByYear(yearInput);
            setMonths(monthsData);
            
            // 如果有选择月份，刷新阶段列表
            if (monthInput) {
              const phasesData = await getPhasesByYearAndMonth(yearInput, monthInput);
              setPhases(phasesData);
            }
          }
        } catch (error) {
          console.error('添加计划失败:', error);
          alert('添加计划失败，请稍后再试。');
        }
      }
    };

    // 点击空白处关闭下拉菜单
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          yearRef.current && !yearRef.current.contains(event.target)
        ) {
          setShowYearDropdown(false);
        }
        if (
          monthRef.current && !monthRef.current.contains(event.target)
        ) {
          setShowMonthDropdown(false);
        }
        if (
          phaseRef.current && !phaseRef.current.contains(event.target)
        ) {
          setShowPhaseDropdown(false);
        }
      };
    
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

    // 处理年份选择
    // 添加状态管理
    const [taskCircleId, setTaskCircleId] = useState('');
    const [loading, setLoading] = useState(false);
    // 删除统计数据状态
    // const [stats, setStats] = useState(null);

    // 添加获取 task_circle_id 的函数
    const getTaskCircleId = async (year, month, phase) => {
      try {
        setLoading(true);
        if (onTaskCircleChange) {
          onTaskCircleChange('', true);
        }
        const response = await fetch(`${BASE_URL}/task_circle/id?year=${year}&month=${month}&phase=${phase}`);
        const data = await response.json();
        setTaskCircleId(data.id);
        
        // 删除以下几行
        // if (data.id) {
        //   const statsData = await getTaskCircleStats(data.id);
        //   setStats(statsData);
        // }
        
        if (onTaskCircleChange) {
          onTaskCircleChange(data.id, false);
        }
        return data.id;
      } catch (error) {
        console.error('获取 task_circle_id 失败:', error);
        if (onTaskCircleChange) {
          onTaskCircleChange('', false);
        }
        return '';
      } finally {
        setLoading(false);
      }
    };

    // 修改 handleYearSelect、handleMonthSelect、handlePhaseSelect 函数
    const handleYearSelect = (year) => {
      setSelectedYear(year);
      setYearInput(year);
      setShowYearDropdown(false);
      if (year && selectedMonth && selectedPhase) {
        getTaskCircleId(year, selectedMonth, selectedPhase);
      }
    };

    const handleMonthSelect = (month) => {
      setSelectedMonth(month);
      setMonthInput(month);
      setShowMonthDropdown(false);
      if (selectedYear && month && selectedPhase) {
        getTaskCircleId(selectedYear, month, selectedPhase);
      }
    };

    const handlePhaseSelect = (phase) => {
      setSelectedPhase(phase);
      setPhaseInput(phase);
      setShowPhaseDropdown(false);
      if (selectedYear && selectedMonth && phase) {
        getTaskCircleId(selectedYear, selectedMonth, phase);
      }
    };

    const handleExportExcel = async () => {
      if (!taskCircleId) return;

      try {
        // 获取当前计划的任务和步骤数据
        const tasks = await getTasks(taskCircleId);

        // 准备导出数据（展平任务和步骤关系）
        const exportData = [];
        tasks.forEach(task => {
          // 检查是否有步骤数组
          if (Array.isArray(task.steps) && task.steps.length > 0) {
            // 有步骤，遍历步骤
            task.steps.forEach(step => {
              exportData.push({
                '任务名称': task.task_name,
                '步骤名称': step.task_step,
                '开始日期': step.startdate || '',
                '截止日期': step.enddate || '',
                '负责人': step.responsibility || '',
                '状态': step.taskstate || '',
                '是否完成': step.iscomplete || '',
                '是否逾期': step.islate || '',
                '优先级': step.priority || '',
                '备注': step.remark || ''
              });
            });
          } else {
            // 没有步骤，添加仅包含任务信息的条目
            exportData.push({
              '任务名称': task.task_name,
              '步骤名称': '',
              '开始日期': '',
              '截止日期': '',
              '负责人': '',
              '状态': '',
              '是否完成': '',
              '是否逾期': '',
              '优先级': '',
              '备注': ''
            });
          }
        });

        // 创建工作簿和工作表
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, '任务步骤列表');

        // 生成文件名（当前年月阶段）
        const fileName = `${yearInput}年${monthInput}月第${phaseInput}阶段任务步骤.xlsx`;

        // 导出并下载
        XLSX.writeFile(workbook, fileName);
      } catch (error) {
        console.error('导出Excel失败:', error);
        alert('导出Excel失败，请稍后再试');
      }
    };

    return (
      <div className="header-container">
        {loading && <div className="loading-overlay">加载中...</div>}
        <div className="title-wrapper">
          <h2 className="title">
            <div className="dropdown-container" ref={yearRef}>
              <input
                type="text"
                placeholder="年"
                value={yearInput}
                onChange={(e) => {
                  setYearInput(e.target.value);
                  setSelectedYear('');
                }}
                onClick={() => setShowYearDropdown(!showYearDropdown)}
              />
              <span className="label">年</span>
              {showYearDropdown && (
                <div className="dropdown">
                  {years.map((year) => (
                    <div
                      key={year}
                      className="dropdown-item"
                      onClick={() => handleYearSelect(year)}
                    >
                      {year}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="dropdown-container" ref={monthRef}>
              <input
                type="text"
                placeholder="月"
                value={monthInput}
                onChange={(e) => {
                  setMonthInput(e.target.value);
                  setSelectedMonth('');
                }}
                onClick={() => setShowMonthDropdown(!showMonthDropdown)}
              />
              <span className="label">月</span>
              {showMonthDropdown && (
                <div className="dropdown">
                  {months.map((month) => (
                    <div
                      key={month}
                      className="dropdown-item"
                      onClick={() => handleMonthSelect(month)}
                    >
                      {month}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="dropdown-container" ref={phaseRef}>
              <input
                type="text"
                placeholder="阶段"
                value={phaseInput}
                onChange={(e) => {
                  setPhaseInput(e.target.value);
                  setSelectedPhase('');
                }}
                onClick={() => setShowPhaseDropdown(!showPhaseDropdown)}
              />
              <span className="label">阶段项目交付及产品研发计划</span>
              {showPhaseDropdown && (
                <div className="dropdown">
                  {phases.map((phase) => (
                    <div
                      key={phase}
                      className="dropdown-item"
                      onClick={() => handlePhaseSelect(phase)}
                    >
                      第{phase}阶段
                    </div>
                  ))}
                </div>
              )}
            </div>
          </h2>
          {/* 显示成功信息 */}
          {showSuccessMessage && (
            <div className="success-message">
              {isAddOperation ? '计划添加成功' : '计划删除成功'}: {successInfo.year}年{successInfo.month}月 第{successInfo.phase}阶段
            </div>
          )}
        </div>
        <button
          className="add-plan"
          onClick={handleAddPlan}
          disabled={!isAddPlanEnabled}
        >
          增加计划
        </button>
        <button
          className="add-plan"
          onClick={handleDeletePlan}
          disabled={!isDeletePlanEnabled}
          style={{ marginLeft: '10px' }}
        >
          删除计划
        </button>
        {/* 添加导出按钮 */}
        <button
          className="add-plan"
          onClick={handleExportExcel}
          disabled={!isDeletePlanEnabled}
          style={{ marginLeft: '10px' }}
        >
          导出表格
        </button>
      </div>
    );
}

