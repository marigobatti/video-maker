@echo off
setlocal

set THIS_DIR=%~dp0
call "%THIS_DIR%\setenv.bat"

cd "%THIS_DIR%\..\"

call yarn run dev
if errorlevel 1 (
	exit /b %errorlevel%
)
