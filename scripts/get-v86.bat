@echo off
echo Downloading v86 binaries...

set TARGET=frontend\public\v86
set RELEASE=https://github.com/copy/v86/releases/download/latest

if not exist "%TARGET%" mkdir "%TARGET%"

echo.
echo Downloading libv86.js...
curl -L -o "%TARGET%\libv86.js" "%RELEASE%/libv86.js"

echo Downloading seabios.bin...
curl -L -o "%TARGET%\seabios.bin" "%RELEASE%/bios/seabios.bin"

echo Downloading vgabios.bin...
curl -L -o "%TARGET%\vgabios.bin" "%RELEASE%/bios/vgabios.bin"

echo Downloading freedos722.img...
curl -L -o "%TARGET%\freedos722.img" "%RELEASE%/images/freedos722.img"

echo.
echo Done! Files are in %TARGET%
echo If downloads fail, get them manually from:
echo https://github.com/copy/v86/releases
pause
