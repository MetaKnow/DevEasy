@echo off
setlocal enabledelayedexpansion

REM 检查Node.js是否安装
where node >nul 2>nul
if %errorlevel% neq 0 (
echo 错误：未找到Node.js，请先安装Node.js
pause
exit /b 1
)

REM 启动后端服务
start "Backend Server" cmd /k "cd backend && node app.js"

REM 等待后端启动（可根据实际情况调整等待时间）
echo 等待后端服务启动...
timeout /t 10 /nobreak >nul

REM 启动前端服务
start "Frontend Server" cmd /k "cd frontend && npm start"

REM 打开默认浏览器访问应用
echo 启动浏览器...
start http://localhost:3000

endlocal