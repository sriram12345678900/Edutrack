@echo off
title EduTrack - 100%% Self-Sufficient Local AI Mode
color 0A

echo =======================================================================
echo     EduTrack AI - 100%% Self-Sufficient & Offline Mode Launcher
echo =======================================================================
echo.

set USE_LOCAL_AI=true
set LOCAL_LLM_URL=http://localhost:11434/v1
set LOCAL_LLM_MODEL=llama3.2:3b

echo [1/3] Checking Local AI Providers...
curl -s http://localhost:11434/api/tags >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo  [OK] Ollama is active on http://localhost:11434
) else (
    curl -s http://localhost:1234/v1/models >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo  [OK] LM Studio is active on http://localhost:1234
    ) else (
        echo  [INFO] No local LLM daemon detected.
        echo  [INFO] EduTrack will run using its built-in NCERT Knowledge Engine.
        echo  [TIP] To enable local chat reasoning, run: 'ollama run llama3.2:3b'
    )
)

echo.
echo [2/3] Preparing EduTrack Next.js App...
echo.
echo [3/3] Starting EduTrack at http://localhost:3000...
echo =======================================================================
echo.

npm run dev
pause
