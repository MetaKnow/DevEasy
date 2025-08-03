const { TaskCircle, Task, dashboard } = require('../models');

/**
 * 计算并更新所有TaskCircle的统计字段
 */
async function updateAllTaskCircleStats() {
  try {
    // 获取所有TaskCircle记录
    const taskCircles = await TaskCircle.findAll();

    for (const circle of taskCircles) {
      // 计算total_task: 根据task_circle_id统计task表中的记录数
      const taskCount = await Task.count({
        where: {
          task_circle_id: circle.id
        }
      });

      // 计算total_step: 根据task_circle_id统计dashboard表中的记录数
      const stepCount = await dashboard.count({
        where: {
          task_circle_id: circle.id
        }
      });

      // 更新TaskCircle记录
      await circle.update({
        total_task: taskCount,
        total_step: stepCount
      });
    }

    console.log('Successfully updated all task circle stats');
    return true;
  } catch (error) {
    console.error('Error updating task circle stats:', error);
    throw error;
  }
}

/**
 * 计算并更新特定TaskCircle的统计字段
 * @param {number} taskCircleId - TaskCircle的ID
 */
async function updateTaskCircleStats(taskCircleId) {
  try {
    // 获取特定TaskCircle记录
    const circle = await TaskCircle.findByPk(taskCircleId);

    if (!circle) {
      throw new Error(`TaskCircle with id ${taskCircleId} not found`);
    }

    // 计算total_task: 根据task_circle_id统计task表中的记录数
    const taskCount = await Task.count({
      where: {
        task_circle_id: taskCircleId
      }
    });

    // 计算total_step: 根据task_circle_id统计dashboard表中的记录数
    const stepCount = await dashboard.count({
      where: {
        task_circle_id: taskCircleId
      }
    });

    // 更新TaskCircle记录
    await circle.update({
      total_task: taskCount,
      total_step: stepCount
    });

    console.log(`Successfully updated stats for task circle with id ${taskCircleId}`);
    return true;
  } catch (error) {
    console.error(`Error updating stats for task circle with id ${taskCircleId}:`, error);
    throw error;
  }
}

/**
 * 计算并更新特定TaskCircle的完成统计字段
 * @param {number} taskCircleId - TaskCircle的ID
 */
async function updateTaskCircleCompleteStats(taskCircleId) {
  try {
    // 获取特定TaskCircle记录
    const circle = await TaskCircle.findByPk(taskCircleId);
    console.log(circle)

    if (!circle) {
      throw new Error(`TaskCircle with id ${taskCircleId} not found`);
    }

    // 计算complete_task: 根据task_circle_id统计task表中iscomplete为是的记录数
    const completeTaskCount = await Task.count({
      where: {
        task_circle_id: taskCircleId,
        iscomplete: '是'
      }
    });

    // 计算complete_step: 根据task_circle_id统计dashboard表中iscomplete为是的记录数
    const completeStepCount = await dashboard.count({
      where: {
        task_circle_id: taskCircleId,
        iscomplete: '是'
      }
    });

    // 更新TaskCircle记录
    await circle.update({
      complete_task: completeTaskCount,
      complete_step: completeStepCount
    });

    console.log(`Successfully updated complete stats for task circle with id ${taskCircleId}`);
    return true;
  } catch (error) {
    console.error(`Error updating complete stats for task circle with id ${taskCircleId}:`, error);
    throw error;
  }
}

/**
 * 计算并更新特定TaskCircle的逾期统计字段
 * @param {number} taskCircleId - TaskCircle的ID
 */
async function updateTaskCircleLateStats(taskCircleId) {
  try {
    const circle = await TaskCircle.findByPk(taskCircleId);
    if (!circle) throw new Error(`TaskCircle with id ${taskCircleId} not found`);

    // 统计逾期任务数量 (islate = '是')
    const lateTaskCount = await Task.count({
      where: { task_circle_id: taskCircleId, islate: '是' }
    });

    // 统计逾期步骤数量 (islate = '是')
    const lateStepCount = await dashboard.count({
      where: { task_circle_id: taskCircleId, islate: '是' }
    });

    // 更新逾期统计字段
    await circle.update({
      late_task: lateTaskCount,
      late_step: lateStepCount
    });

    console.log(`Successfully updated late stats for task circle ${taskCircleId}`);
    return true;
  } catch (error) {
    console.error(`Error updating late stats:`, error);
    throw error;
  }
}

/**
 * 计算并更新特定TaskCircle的步骤状态统计字段
 * @param {number} taskCircleId - TaskCircle的ID
 */
async function updateTaskCircleStepStates(taskCircleId) {
  try {
    const circle = await TaskCircle.findByPk(taskCircleId);
    if (!circle) throw new Error(`TaskCircle with id ${taskCircleId} not found`);

    // 统计未开始步骤数量 (taskstate = '未开始')
    const notStartStepCount = await dashboard.count({
      where: { task_circle_id: taskCircleId, taskstate: '未开始' }
    });

    // 统计进行中步骤数量 (taskstate = '进行中')
    const goingStepCount = await dashboard.count({
      where: { task_circle_id: taskCircleId, taskstate: '进行中' }
    });

    // 更新步骤状态统计字段
    await circle.update({
      not_start_step: notStartStepCount,
      going_step: goingStepCount
    });

    console.log(`Successfully updated step states for task circle ${taskCircleId}`);
    return true;
  } catch (error) {
    console.error(`Error updating step states:`, error);
    throw error;
  }
}

/**
 * 计算并更新特定TaskCircle的完成率和逾期率自动计算
 * @param {number} taskCircleId - TaskCircle的ID
 */
async function updateTaskCirclePercentages(taskCircleId) {
  try {
    const circle = await TaskCircle.findByPk(taskCircleId);
    if (!circle) throw new Error(`TaskCircle with id ${taskCircleId} not found`);

    // 获取总步骤数
    const totalStepCount = await dashboard.count({
      where: { task_circle_id: taskCircleId }
    });

    // 计算百分比（处理除数为零情况）
    let completePercent = 0;
    let latePercent = 0;

    if (totalStepCount > 0) {
      // 获取已完成步骤数
      const completeStepCount = await dashboard.count({
        where: { task_circle_id: taskCircleId, iscomplete: '是' }
      });

      // 获取逾期步骤数
      const lateStepCount = await dashboard.count({
        where: { task_circle_id: taskCircleId, islate: '是' }
      });

      // 计算百分比并保留两位小数
      completePercent = Math.round((completeStepCount / totalStepCount) * 10000) / 100;
      latePercent = Math.round((lateStepCount / totalStepCount) * 10000) / 100;
    }

    // 更新百分比字段
    await circle.update({
      complete_percent: completePercent,
      late_percent: latePercent
    });

    console.log(`Successfully updated percentages for task circle ${taskCircleId}`);
    return true;
  } catch (error) {
    console.error(`Error updating percentages:`, error);
    throw error;
  }
}

module.exports = {
  updateAllTaskCircleStats,
  updateTaskCircleStats,
  updateTaskCircleCompleteStats,
  updateTaskCircleLateStats,
  updateTaskCircleStepStates,
  updateTaskCirclePercentages // 添加新函数导出
};