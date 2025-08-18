import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import './Tooltip.css';

const Tooltip = ({ children, content, disabled = false }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef(null);
  const containerRef = useRef(null);

  const showTooltip = (e) => {
    if (disabled || !content || content.trim() === '') return;
    
    setIsVisible(true);
    
    // 计算气泡位置（使用fixed定位，不需要scroll偏移）
    const rect = e.currentTarget.getBoundingClientRect();
    
    setPosition({
      top: rect.bottom + 5, // 在元素下方5px
      left: rect.left + rect.width / 2 // 水平居中
    });
  };

  const hideTooltip = () => {
    setIsVisible(false);
  };

  useEffect(() => {
    if (isVisible && tooltipRef.current) {
      const tooltip = tooltipRef.current;
      const rect = tooltip.getBoundingClientRect();
      
      // 检查是否超出右边界
      if (rect.right > window.innerWidth) {
        setPosition(prev => ({
          ...prev,
          left: prev.left - (rect.right - window.innerWidth) - 10
        }));
      }
      
      // 检查是否超出左边界
      if (rect.left < 0) {
        setPosition(prev => ({
          ...prev,
          left: 10
        }));
      }
      
      // 检查是否超出下边界
      if (rect.bottom > window.innerHeight) {
        const containerRect = containerRef.current.getBoundingClientRect();
        setPosition(prev => ({
          ...prev,
          top: containerRect.top - tooltip.offsetHeight - 5 // 在元素上方
        }));
      }
    }
  }, [isVisible]);

  return (
    <>
      <div
        ref={containerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        style={{ display: 'inline-block', width: '100%' }}
      >
        {children}
      </div>
      {isVisible && content && createPortal(
        <div
          ref={tooltipRef}
          className="tooltip"
          style={{
            position: 'fixed',
            top: position.top,
            left: position.left,
            transform: 'translateX(-50%)',
            zIndex: 9999
          }}
        >
          <div className="tooltip-content">
            {content}
          </div>
          <div className="tooltip-arrow"></div>
        </div>,
        document.body
      )}
    </>
  );
};

export default Tooltip;