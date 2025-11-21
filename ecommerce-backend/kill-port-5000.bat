@echo off
echo Checking for processes using port 5000...
netstat -ano | findstr :5000
if %errorlevel% equ 0 (
    echo.
    echo Found process(es) using port 5000. Killing them...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000 ^| findstr LISTENING') do (
        echo Killing process %%a...
        taskkill /F /PID %%a >nul 2>&1
    )
    echo.
    echo Port 5000 is now free!
    timeout /t 1 >nul
) else (
    echo Port 5000 is already free.
)
pause

