import React, { useEffect, useState } from 'react';
import accessConfig from '../config/accessConfig.js';

const AccessControl = ({ children }) => {
  const [accessGranted, setAccessGranted] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 检查访问权限
    const checkAccess = () => {
      const hasAccess = accessConfig.checkAccess();
      setAccessGranted(hasAccess);
      setLoading(false);
      
      if (!hasAccess && accessConfig.enableRedirectAccess) {
        console.warn('访问被拒绝:', {
          referrer: document.referrer,
          allowedReferrers: accessConfig.allowedReferrers,
          enableRedirectAccess: accessConfig.enableRedirectAccess
        });
      }
    };

    // 延迟检查，确保页面完全加载
    setTimeout(checkAccess, 100);
  }, []);

  // 加载中
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        正在验证访问权限...
      </div>
    );
  }

  // 访问被拒绝
  if (!accessGranted) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        padding: '20px',
        textAlign: 'center'
      }}>
        <div style={{
          backgroundColor: '#fff2f0',
          border: '1px solid #ffccc7',
          borderRadius: '8px',
          padding: '40px',
          maxWidth: '500px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            fontSize: '48px',
            color: '#ff4d4f',
            marginBottom: '20px'
          }}>
            🚫
          </div>
          <h2 style={{
            color: '#ff4d4f',
            marginBottom: '16px',
            fontSize: '24px'
          }}>
            访问被拒绝
          </h2>
          <p style={{
            color: '#666',
            fontSize: '16px',
            lineHeight: '1.5',
            marginBottom: '20px'
          }}>
            {accessConfig.accessDeniedMessage}
          </p>
          <div style={{
            fontSize: '14px',
            color: '#999',
            borderTop: '1px solid #f0f0f0',
            paddingTop: '16px'
          }}>
            {/* <p>当前来源：{document.referrer || '直接访问'}</p> */}
            {/* <p>允许的来源：{accessConfig.allowedReferrers.length > 0 ? accessConfig.allowedReferrers.join(', ') : '未配置'}</p> */}
          </div>
        </div>
      </div>
    );
  }

  // 访问允许，渲染子组件
  return children;
};

export default AccessControl;