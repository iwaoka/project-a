@echo off
setlocal
cd /d "%~dp0"

REM このフォルダで必ず実行する（パス事故防止）
echo [publish] repo dir: %cd%

REM PowerShell 実行（ポリシー回避・プロファイル無効）
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0publish.ps1" %*
if errorlevel 1 (
  echo.
  echo [publish] FAILED
  pause
  exit /b 1
)

echo.
echo [publish] DONE
pause
