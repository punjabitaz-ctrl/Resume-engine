@echo off
cd /d "%~dp0"
where py >nul 2>nul
if %errorlevel%==0 (
  py -3 serve.py
  goto end
)
where python >nul 2>nul
if %errorlevel%==0 (
  python serve.py
  goto end
)
echo Python is not installed, so Resume Engine cannot start.
echo Install it from python.org (see START-HERE), then double-click this file again.
pause
:end
