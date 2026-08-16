@echo off
title WordPlay Studio Server
echo Starting WordPlay Studio...
cd /d "C:\Users\Admin\Downloads\kq wordplay-studio-main\wordplay-studio-main"
start http://localhost:8080
npm run dev
