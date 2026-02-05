@echo off
setlocal
cd /d "%~dp0"

set "URL=http://localhost:4321/"
set "CHROME=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" set "CHROME=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"

echo [dev] dir: %cd%
echo [dev] starting: npm run dev
echo [dev] URL: %URL%
echo.

REM Dev serverを別ウィンドウで起動
start "Astro Dev Server" cmd /k "npm run dev"

REM ChromeがあればChromeで開く。なければ既定ブラウザで開く。
timeout /t 2 /nobreak >nul
if exist "%CHROME%" (
  start "" "%CHROME%" "%URL%"
) else (
  start "" "%URL%"
)

echo.
echo [dev] Dev server window is running. Close it to stop.
pause
