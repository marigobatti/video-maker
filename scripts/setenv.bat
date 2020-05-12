@echo off

for /f "tokens=1* delims==" %%A in (%~dp0\node-default.properties) do (
	if "%%A"=="NODE_HACK" set NODE_HACK=%%B
)


if exist %~dp0\node-fix.properties (
	for /f "tokens=1* delims==" %%A in (%~dp0\node-fix.properties) do (
		if "%%A"=="NODE_HACK" set NODE_HACK=%%B
	)
)

set PATH=%~dp0\..\node\%NODE_HACK%\node;%~dp0\..\node\%NODE_HACK%\node\yarn\dist\bin;%PATH%

echo Caminho node:
echo %~dp0\..\node\%NODE_HACK%\node

echo Versao node:
node --version

echo Versao yarn:
call yarn --version
