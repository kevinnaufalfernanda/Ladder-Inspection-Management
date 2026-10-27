@echo off
title Launcher Otomatis - Ladder Inspection
echo =======================================================
echo     MENYIAPKAN PROTOTIPE LADDER INSPECTION MANAGEMENT
echo =======================================================
echo.

cd /d "%~dp0"

:: 1. Deteksi Lokasi XAMPP secara Dinamis
echo [1/3] Memeriksa dan mengaktifkan service XAMPP...
set "XAMPP_PATH="
if exist "C:\xampp\xampp_start.exe" (
    set "XAMPP_PATH=C:\xampp"
) else if exist "D:\xampp\xampp_start.exe" (
    set "XAMPP_PATH=D:\xampp"
)

if "%XAMPP_PATH%"=="" (
    echo [ERROR] XAMPP tidak ditemukan di C:\xampp maupun D:\xampp
    pause
    exit
)

start "" "%XAMPP_PATH%\xampp_start.exe"
timeout /t 5 /nobreak >nul

:: 2. Otomatisasi Database
echo [2/3] Mengonfigurasi database ladder_inspection...
set "MYSQL_PATH=%XAMPP_PATH%\mysql\bin\mysql.exe"
set "PHP_PATH=%XAMPP_PATH%\php"
set PATH=%PHP_PATH%;%PATH%

if exist "%~dp0ladder_inspection.sql" (
    "%MYSQL_PATH%" -u root -e "CREATE DATABASE IF NOT EXISTS ladder_inspection;" 2>nul
    "%MYSQL_PATH%" -u root ladder_inspection < "%~dp0ladder_inspection.sql"
    echo [SUKSES] Database berhasil dikonfigurasi otomatis.
)
echo.

:: 3. Mengambil IP Wi-Fi & Otomatis Clear Cache / Config
echo [3/3] Menyalakan server Laravel untuk akses Laptop & HP...

:: Mengambil IP Address dinamis dari Wi-Fi klien
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do set IP=%%a
set IP=%IP: =%

:: Bersihkan cache config bawaan agar laravel membaca setingan baru
php artisan config:clear >nul 2>&1

:: Jalankan server Laravel
start /b php artisan serve --host=0.0.0.0 --port=8000 >nul 2>&1
timeout /t 2 /nobreak >nul

start "" http://localhost:8000

echo =======================================================
echo  Aplikasi Berhasil Dijalankan!
echo =======================================================
echo.
echo  CARA MENGAKSES LEWAT HP:
echo  1. Pastikan HP dan Laptop terhubung ke Wi-Fi yang SAMA.
echo  2. Buka browser di HP (Chrome / Safari).
echo  3. Ketik alamat IP ini di HP: http://%IP%:8000
echo.
echo =======================================================
echo Tekan tombol apa saja untuk mematikan server aplikasi...
pause >nul

taskkill /f /im php.exe >nul 2>&1
exit
