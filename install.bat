@echo off
echo ========================================
echo   Poker Hands Manager - Instalacao
echo ========================================
echo.

echo [1/4] Instalando dependencias do Bot...
cd bot
call npm install
if %errorlevel% neq 0 (
    echo ERRO ao instalar dependencias do bot!
    pause
    exit /b 1
)
cd ..

echo.
echo [2/4] Instalando dependencias do Backend...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ERRO ao instalar dependencias do backend!
    pause
    exit /b 1
)
cd ..

echo.
echo [3/4] Instalando dependencias do Dashboard...
cd dashboard
call npm install
if %errorlevel% neq 0 (
    echo ERRO ao instalar dependencias do dashboard!
    pause
    exit /b 1
)
cd ..

echo.
echo [4/4] Criando arquivos .env...
if not exist "bot\.env" (
    copy "bot\.env.example" "bot\.env"
    echo - bot/.env criado
)
if not exist "backend\.env" (
    copy "backend\.env.example" "backend\.env"
    echo - backend/.env criado
)
if not exist "dashboard\.env" (
    copy "dashboard\.env.example" "dashboard\.env"
    echo - dashboard/.env criado
)

echo.
echo ========================================
echo   Instalacao Concluida!
echo ========================================
echo.
echo Proximos passos:
echo 1. Configure os arquivos .env em cada pasta
echo 2. Crie o banco de dados PostgreSQL
echo 3. Execute: cd backend ^&^& npm run migrate
echo 4. Inicie os sistemas (veja SETUP.md)
echo.
echo Consulte SETUP.md para instrucoes detalhadas!
echo.
pause
