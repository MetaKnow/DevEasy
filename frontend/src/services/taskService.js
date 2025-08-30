// 基础URL
export const BASE_URL = 'http://localhost:5000';

// 获取任务列表
export const getTasks = async (taskCircleId) => {
  try {
    const response = await fetch(`${BASE_URL}/tasks?task_circle_id=${taskCircleId}`);
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('获取任务列表失败:', error);
    return [];
  }
};

// 创建新任务
export const createTask = async (taskName, taskCircleId) => {
  try {
    const response = await fetch(`${BASE_URL}/tasks/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        task_name: taskName,
        task_circle_id: taskCircleId
      })
    });
    if (!response.ok) {
      throw new Error(`服务器响应错误: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('创建任务失败:', error);
    throw error;
  }
};

// 创建新步骤
export const createStep = async (stepData, taskId, task_circle_id) => {
  console.log('创建步骤参数:', stepData, taskId, task_circle_id);
  try {
    // 处理日期字段，将空字符串转为null
    const processedStepData = {
      ...stepData,
      startdate: stepData.startdate || null,
      enddate: stepData.enddate || null
    };

    const response = await fetch(`${BASE_URL}/dashboard/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...processedStepData,
        task_id: taskId,
        task_circle_id: task_circle_id
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('添加步骤失败:', response.status, errorText);
      throw new Error(`添加步骤失败: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    console.log('创建步骤成功:', data);
    return data;
  } catch (error) {
    console.error('添加步骤失败:', error);
    throw error;
  }
};

// 更新步骤
// 更新步骤
export const updateStep = async (stepId, updatedData) => {
  console.log('更新步骤参数:', stepId, updatedData);
  try {
    // 处理日期字段，但保留枚举字段原值
    const processedData = {
      ...updatedData,
      startdate: updatedData.startdate || null,
      enddate: updatedData.enddate || null
      // 不要转换iscomplete和islate字段
    };

    const response = await fetch(`${BASE_URL}/dashboard/${stepId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(processedData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('更新步骤失败:', response.status, errorText);
      throw new Error(`更新步骤失败: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    console.log('更新步骤成功:', data);
    return data;
  } catch (error) {
    console.error('更新步骤失败:', error);
    throw error;
  }
};

// 更新任务
export const updateTask = async (taskId, updatedData) => {
  console.log('更新任务参数:', taskId, updatedData);
  try {
    const response = await fetch(`${BASE_URL}/tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('更新任务失败:', response.status, errorText);
      throw new Error(`更新任务失败: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    console.log('更新任务成功:', data);
    return data;
  } catch (error) {
    console.error('更新任务失败:', error);
    throw error;
  }
};

// 删除步骤
export const deleteStep = async (stepId) => {
  console.log('删除步骤参数:', stepId);
  try {
    const response = await fetch(`${BASE_URL}/dashboard/${stepId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('删除步骤失败:', response.status, errorText);
      throw new Error(`删除步骤失败: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    console.log('删除步骤成功:', data);
    return data;
  } catch (error) {
    console.error('删除步骤失败:', error);
    throw error;
  }
};

// 删除任务
export const deleteTask = async (taskId) => {
  try {
    const response = await fetch(`${BASE_URL}/tasks/${taskId}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      throw new Error('删除任务失败');
    }
    return await response.json();
  } catch (error) {
    console.error('删除任务失败:', error);
    throw error;
  }
};

// 获取任务圈统计数据
export const getTaskCircleStats = async (taskCircleId) => {
  try {
    const response = await fetch(`${BASE_URL}/task_circle/stats?id=${taskCircleId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('获取统计数据失败:', error);
    return null;
  }
};

// 移动任务到其他年月阶段
export const moveTask = async (taskId, targetYear, targetMonth, targetPhase) => {
  try {
    const response = await fetch(`${BASE_URL}/tasks/move`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        task_id: taskId,
        target_year: targetYear,
        target_month: targetMonth,
        target_phase: targetPhase
      })
    });
    
    if (!response.ok) {
      throw new Error(`服务器响应错误: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('移动任务失败:', error);
    throw error;
  }
};

// 获取目标阶段的task_circle_id
export const getTaskCircleId = async (year, month, phase) => {
  try {
    const response = await fetch(`${BASE_URL}/task_circle/id?year=${year}&month=${month}&phase=${phase}`);
    const data = await response.json();
    return data.id;
  } catch (error) {
    console.error('获取task_circle_id失败:', error);
    throw error;
  }
};

// 暂存任务到暂存区
export const stageTask = async (taskId) => {
  try {
    const response = await fetch(`${BASE_URL}/tasks/stage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        task_id: taskId
      })
    });
    
    if (!response.ok) {
      throw new Error(`服务器响应错误: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('暂存任务失败:', error);
    throw error;
  }
};

// 获取暂存区数据
export const getStagedTasks = async () => {
  try {
    const response = await fetch(`${BASE_URL}/tasks/staged`);
    
    if (!response.ok) {
      throw new Error(`服务器响应错误: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('获取暂存数据失败:', error);
    throw error;
  }
};

// 删除暂存任务
export const deleteStagedTask = async (taskId) => {
  try {
    const response = await fetch(`${BASE_URL}/tasks/staged/${taskId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error(`服务器响应错误: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('删除暂存任务失败:', error);
    throw error;
  }
};

// 从暂存区恢复任务
export const restoreStagedTask = async (taskId, targetYear, targetMonth, targetPhase) => {
  try {
    const response = await fetch(`${BASE_URL}/tasks/staged/${taskId}/restore`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        target_year: targetYear,
        target_month: targetMonth,
        target_phase: targetPhase
      })
    });
    
    if (!response.ok) {
      throw new Error(`服务器响应错误: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('恢复暂存任务失败:', error);
    throw error;
  }
};

// 删除暂存步骤
export const deleteStagedStep = async (stepId) => {
  try {
    const response = await fetch(`${BASE_URL}/tasks/staged/step/${stepId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error(`服务器响应错误: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('删除暂存步骤失败:', error);
    throw error;
  }
};

// 搜索任务
export const searchTasks = async (criteria) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (criteria.taskOrStep) {
      queryParams.append('taskOrStep', criteria.taskOrStep);
    }
    if (criteria.isComplete) {
      queryParams.append('isComplete', criteria.isComplete);
    }
    if (criteria.isLate) {
      queryParams.append('isLate', criteria.isLate);
    }
    if (criteria.responsibility) {
      queryParams.append('responsibility', criteria.responsibility);
    }
    
    const response = await fetch(`${BASE_URL}/tasks/search?${queryParams.toString()}`);
    
    if (!response.ok) {
      throw new Error(`服务器响应错误: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('搜索任务失败:', error);
    throw error;
  }
};