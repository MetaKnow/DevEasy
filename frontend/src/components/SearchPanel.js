import React, { useState, useEffect } from 'react';
import dictConfig from '../config/dictConfig.js';
import { searchTasks } from '../services/taskService.js';

const SearchPanel = ({ onClose, onTaskSelect }) => {
  const [searchCriteria, setSearchCriteria] = useState({
    taskOrStep: '',
    isComplete: '',
    isLate: '',
    responsibility: ''
  });
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // 执行搜索
  const handleSearch = async () => {
    setLoading(true);
    setHasSearched(true);
    try {
      const results = await searchTasks(searchCriteria);
      setSearchResults(results);
    } catch (error) {
      console.error('搜索失败:', error);
      alert('搜索失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  // 清空搜索条件
  const handleClear = () => {
    setSearchCriteria({
      taskOrStep: '',
      isComplete: '',
      isLate: '',
      responsibility: ''
    });
    setSearchResults([]);
    setHasSearched(false);
  };

  // 选择任务
  const handleTaskClick = (task) => {
    if (onTaskSelect) {
      onTaskSelect(task);
    }
    // 不再自动关闭搜索面板，保持搜索结果可见
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      width: window.innerWidth > 1400 ? '18%' : (window.innerWidth > 1200 ? '22%' : '25%'),
      minWidth: '300px',
      maxWidth: '400px',
      height: '100vh',
      backgroundColor: 'white',
      boxShadow: '-2px 0 8px rgba(0, 0, 0, 0.1)',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* 标题栏 */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fafafa'
      }}>
        <h3 style={{ margin: 0, color: '#1890ff', fontSize: '16px' }}>任务检索</h3>
        <button 
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            color: '#999',
            padding: '0',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ×
        </button>
      </div>

      {/* 搜索条件 */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid #e0e0e0'
      }}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 'bold' }}>
            任务/步骤
          </label>
          <input
            type="text"
            value={searchCriteria.taskOrStep}
            onChange={(e) => setSearchCriteria({ ...searchCriteria, taskOrStep: e.target.value })}
            placeholder="输入任务名称或步骤内容"
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d9d9d9',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 'bold' }}>
            是否完成
          </label>
          <select
            value={searchCriteria.isComplete}
            onChange={(e) => setSearchCriteria({ ...searchCriteria, isComplete: e.target.value })}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d9d9d9',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          >
            <option value="">无</option>
            <option value="是">是</option>
            <option value="否">否</option>
          </select>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 'bold' }}>
            是否超期
          </label>
          <select
            value={searchCriteria.isLate}
            onChange={(e) => setSearchCriteria({ ...searchCriteria, isLate: e.target.value })}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d9d9d9',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          >
            <option value="">无</option>
            <option value="是">是</option>
            <option value="否">否</option>
          </select>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 'bold' }}>
            责任人
          </label>
          <select
            value={searchCriteria.responsibility}
            onChange={(e) => setSearchCriteria({ ...searchCriteria, responsibility: e.target.value })}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d9d9d9',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          >
            <option value="">无</option>
            {dictConfig.responsiblePerson.map(person => (
              <option key={person} value={person}>{person}</option>
            ))}
          </select>
        </div>

        {/* 操作按钮 */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleSearch}
            disabled={loading}
            style={{
              flex: 1,
              padding: '10px',
              backgroundColor: loading ? '#f5f5f5' : '#1890ff',
              color: loading ? '#999' : 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px'
            }}
          >
            {loading ? '搜索中...' : '搜索'}
          </button>
          <button
            onClick={handleClear}
            style={{
              flex: 1,
              padding: '10px',
              backgroundColor: '#f5f5f5',
              color: '#666',
              border: '1px solid #d9d9d9',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            清空
          </button>
        </div>
      </div>

      {/* 搜索结果 */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '20px'
      }}>
        {loading && (
          <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
            搜索中，请稍候...
          </div>
        )}
        
        {!loading && hasSearched && searchResults.length === 0 && (
          <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
            未找到符合条件的任务
          </div>
        )}
        
        {!loading && searchResults.length > 0 && (
          <div>
            <div style={{ marginBottom: '12px', fontSize: '14px', color: '#666' }}>
              找到 {searchResults.length} 个结果
            </div>
            {searchResults.map((task, index) => (
              <div
                key={index}
                onClick={() => handleTaskClick(task)}
                style={{
                  padding: '12px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  marginBottom: '8px',
                  cursor: 'pointer',
                  backgroundColor: '#fafafa',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#e6f7ff';
                  e.target.style.borderColor = '#1890ff';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#fafafa';
                  e.target.style.borderColor = '#e0e0e0';
                }}
              >
                <div style={{
                  fontWeight: 'bold',
                  color: '#1890ff',
                  marginBottom: '4px',
                  fontSize: '14px'
                }}>
                  {task.task_name}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#666'
                }}>
                  {task.year}年{task.month}月第{task.phase}阶段
                </div>
              </div>
            ))}
          </div>
        )}
        
        {!hasSearched && (
          <div style={{ textAlign: 'center', color: '#999', padding: '40px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
            <div>输入搜索条件，点击搜索按钮开始查找任务</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPanel;