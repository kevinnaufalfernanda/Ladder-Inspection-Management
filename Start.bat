@echo off
title Launcher Otomatis - Ladder Inspection
echo =======================================================
echo     MENYIAPKAN PROTOTIPE LADDER INSPECTION MANAGEMENT
echo =======================================================
echo.

:: 1. Cek dan Jalankan XAMPP otomatis (Apache & MySQL)
echo [1/3] Memeriksa dan mengaktifkan service XAMPP...
if exist "C:\xampp\xampp_start.exe" (
    start "" "C:\xampp\xampp_start.exe"
    timeout /t 3 /nobreak >nul
) else (
    echo [ERROR] XAMPP tidak ditemukan di C:\xampp\
    echo Pastikan XAMPP terinstall di lokasi standar C:\xampp
    pause
    exit
)

:: 2. Otomatisasi Database (Cek, Buat, dan Impor)
echo [2/3] Mengonfigurasi database ladder_inspection...
set "MYSQL_PATH=C:\xampp\mysql\bin\mysql.exe"

:: Tunggu sampai port MySQL benar-benar siap
timeout /t 2 /nobreak >nul

:: Buat database jika belum ada, lalu langsung impor file SQL
if exist "%~dp0ladder_inspection.sql" (
    "%MYSQL_PATH%" -u root -e "CREATE DATABASE IF NOT EXISTS ladder_inspection;" 2>nul
    "%MYSQL_PATH%" -u root ladder_inspection < "%~dp0ladder_inspection.sql"
    echo [SUKSES] Database berhasil dikonfigurasi otomatis.
) else (
    echo [PERINGATAN] File ladder_inspection.sql tidak ditemukan di folder projek.
    echo Aplikasi akan tetap berjalan, namun database mungkin kosong.
)
echo.

:: 3. Jalankan Browser dan Server Laravel
echo [3/3] Menyalakan server Laravel...
start "" http://127.0.0.1:8000
php artisan serve

pause
