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
    if (!response.ok) throw new Error('获取统计数据失败');
    return await response.json();
  } catch (error) {
    console.error('获取统计数据失败:', error);
    return null;
  }
};