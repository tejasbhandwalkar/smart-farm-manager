@echo off
title UPLOAD SMART FARM MANAGER TO GITHUB
cd /d "%~dp0"
echo =========================================================================
echo   SMART FARM MANAGER - AUTOMATIC GITHUB UPLOADER
echo =========================================================================
echo.
echo If you don't have a token yet, generate one in 1 minute here:
echo   https://github.com/settings/tokens/new (Check "repo" scope)
echo.
set /p GITHUB_TOKEN="Paste your GitHub Token (e.g. ghp_...): "
if "%GITHUB_TOKEN%"=="" (
  echo No token provided. Exiting.
  pause
  exit /b
)
echo.
set /p REPO_NAME="Enter Repository Name (Default: smart-farm-manager): "
if "%REPO_NAME%"=="" (
  set REPO_NAME=smart-farm-manager
)
echo.
echo Starting direct upload to GitHub...
node push-to-github.js "%GITHUB_TOKEN%" "%REPO_NAME%"
echo.
pause
