@echo off
setlocal enabledelayedexpansion

REM Extract API key from .env.local
for /f "tokens=2 delims==" %%i in ('findstr /B "DEEPSEEK_API_KEY=" .env.local') do set "DEEPSEEK_API_KEY=%%i"

REM Set environment variables
set DEEPSEEK_API_KEY=%DEEPSEEK_API_KEY%
set VAGENT_REDIS_URL=redis://localhost:6379

echo Starting sAgent...
echo DEEPSEEK_API_KEY=%DEEPSEEK_API_KEY%
echo VAGENT_REDIS_URL=%VAGENT_REDIS_URL%
echo.

npm run dev
