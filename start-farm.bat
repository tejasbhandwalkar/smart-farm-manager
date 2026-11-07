@echo off
title SMART FARM MANAGER (20-Acre Farm)
cd /d "%~dp0"
echo =====================================================================
echo  SMART FARM MANAGER - 20-ACRE FAMILY FARM APPLICATION
echo  Crops: Sugarcane, Wheat, Onion | Multilingual: Marathi, Hindi, English
echo =====================================================================
echo Starting development server...
npm run dev -- --host
pause
