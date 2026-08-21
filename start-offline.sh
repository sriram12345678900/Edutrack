#!/bin/bash
# EduTrack - 100% Self-Sufficient Local AI Mode Launcher

echo "======================================================================="
echo "    EduTrack AI - 100% Self-Sufficient & Offline Mode Launcher"
echo "======================================================================="
echo ""

export USE_LOCAL_AI=true
export LOCAL_LLM_URL=http://localhost:11434/v1
export LOCAL_LLM_MODEL=llama3.2:3b

echo "[1/3] Checking Local AI Providers..."
if curl -s --connect-timeout 1 http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo " [OK] Ollama is active on http://localhost:11434"
elif curl -s --connect-timeout 1 http://localhost:1234/v1/models > /dev/null 2>&1; then
    echo " [OK] LM Studio is active on http://localhost:1234"
else
    echo " [INFO] No local LLM daemon detected."
    echo " [INFO] EduTrack will run using its built-in NCERT Knowledge Engine."
    echo " [TIP] To enable local chat reasoning, run: 'ollama run llama3.2:3b'"
fi

echo ""
echo "[2/3] Preparing EduTrack Next.js App..."
echo ""
echo "[3/3] Starting EduTrack at http://localhost:3000..."
echo "======================================================================="
echo ""

npm run dev
