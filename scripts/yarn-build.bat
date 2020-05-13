@echo off
setlocal

set THIS_DIR=%~dp0
call "%THIS_DIR%\setenv.bat"

cd "%THIS_DIR%\..\"

call yarn install
if errorlevel 1 (
	exit /b %errorlevel%
)

call yarn run test
if errorlevel 1 (
	exit /b %errorlevel%
)

call yarn run build
if errorlevel 1 (
	exit /b %errorlevel%
)
