@echo off
echo ============================================================
echo   Building Rahul Mallick's Portfolio from Content Folders
echo ============================================================
python scripts/build.py
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Build failed! Check Python error above.
    pause
    exit /b %ERRORLEVEL%
)
echo.
echo [SUCCESS] Site generated successfully!
pause
