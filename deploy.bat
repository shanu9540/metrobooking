@echo off
title MetroGo GitHub Deployment Tool
echo ====================================================
echo      MetroGo Git Automation & Deployment Helper
echo ====================================================
echo.

:: Check if git is initialized
if not exist .git (
    echo [1/4] Initializing Git repository...
    git init
) else (
    echo [*] Git repository already initialized.
)

echo.
set /p repo_url="[2/4] Paste your GitHub Repository URL (https://github.com/...): "

if "%repo_url%"=="" (
    echo Error: Repository URL cannot be empty.
    pause
    exit /b
)

:: Clear old origin if exists and add new one
git remote remove origin >nul 2>&1
git remote add origin %repo_url%

echo.
echo [3/4] Staging and committing project files...
git add .
git commit -m "Initial commit of MetroGo Ticket Booking App"
git branch -M main

echo.
echo [4/4] Pushing code to GitHub...
echo (If prompted, please log in or paste your GitHub Personal Access Token in the Git Credential Manager pop-up)
echo.
git push -u origin main

if %errorlevel% neq 0 (
    echo.
    echo [!] Push failed. Please check your internet connection or GitHub credentials.
) else (
    echo.
    echo [INFO] Code successfully pushed to GitHub!
    echo.
    echo Now you can go to vercel.com and render.com to deploy it in 2 clicks.
)

pause
