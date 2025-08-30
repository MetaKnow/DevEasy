// 访问控制配置
// 直接在此文件中修改配置即可
const accessConfig = {
  // 是否开启跳转访问控制
  // false: 允许直接访问
  // true: 只允许从指定系统跳转访问
  enableRedirectAccess: false,
  
  // 允许的来源系统地址列表
  // 当 enableRedirectAccess 为 true 时生效
  // 示例：['https://example.com', 'http://localhost:8080']
  allowedReferrers: [
    // 在此处添加允许的来源系统地址
    // 'https://your-system.com',
    // 'http://localhost:3001'
    'http://127.0.0.1:8080/'
  ],
  
  // 访问被拒绝时的提示信息
  accessDeniedMessage: '访问被拒绝：请通过指定系统跳转访问本系统',
  
  // 检查访问权限（内部方法，无需修改）
  checkAccess: () => {
    // 如果未开启跳转访问控制，直接允许访问
    if (!accessConfig.enableRedirectAccess) {
      return true;
    }
    
    // 检查referrer
    const referrer = document.referrer;
    
    // 如果没有referrer（直接访问），拒绝访问
    if (!referrer) {
      return false;
    }
    
    // 检查referrer是否在允许列表中
    return accessConfig.allowedReferrers.some(allowedReferrer => {
      try {
        const referrerUrl = new URL(referrer);
        const allowedUrl = new URL(allowedReferrer);
        return referrerUrl.origin === allowedUrl.origin;
      } catch (error) {
        console.error('URL解析错误:', error);
        return false;
      }
    });
  }
};

export default accessConfig;