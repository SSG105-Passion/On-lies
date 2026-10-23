@echo off
title On-Lies Dev Server
echo ==========================================
echo Khoi chay On-Lies - Cyber Security Studio
echo ==========================================
set "NODE_EXE=C:\Users\Dumpling\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
set "VITE_JS=C:\Users\Dumpling\Desktop\SWP391-GROUP5\frontend\node_modules\vite\bin\vite.js"

if not exist "%NODE_EXE%" (
    echo Node.js runtime khong tim thay!
    pause
    exit /b 1
)

echo Dang mo Vite dev server tai http://localhost:5173/ ...
"%NODE_EXE%" "%VITE_JS%" "%~dp0on-lies" --port 5173 --open
pause
