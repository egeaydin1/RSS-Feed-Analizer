@echo off
echo 🚀 RSS Feed Analyzer - Windows Başlangıç Script'i
echo =========================================

REM Node.js kontrol
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js yüklü değil!
    echo Node.js'i yüklemek için: https://nodejs.org/
    pause
    exit /b 1
) else (
    echo ✅ Node.js bulundu
)

REM npm kontrol  
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm yüklü değil!
    pause
    exit /b 1
) else (
    echo ✅ npm bulundu
)

echo.
echo 🔧 Dependencies yükleniyor...
call npm install

if errorlevel 1 (
    echo ❌ Dependencies yüklenemedi!
    pause
    exit /b 1
) else (
    echo ✅ Dependencies başarıyla yüklendi
)

echo.
echo 🎉 Kurulum tamamlandı!
echo ==============================
echo 📖 Kullanım:
echo   npm start     - Production modunda başlat
echo   npm run dev   - Development modunda başlat  
echo   npm test      - Test suite çalıştır
echo.
echo 🌐 API Endpoints:
echo   http://localhost:3000/                    - Dokümantasyon
echo   http://localhost:3000/api/companies       - Şirket listesi
echo   http://localhost:3000/api/news/nvidia     - NVIDIA haberleri
echo   http://localhost:3000/api/news/all        - Tüm haberler
echo.
echo 🚀 Server başlatmak için: npm start
pause
