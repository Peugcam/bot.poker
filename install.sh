#!/bin/bash

echo "========================================"
echo "  Poker Hands Manager - Instalação"
echo "========================================"
echo ""

echo "[1/4] Instalando dependências do Bot..."
cd bot
npm install
if [ $? -ne 0 ]; then
    echo "ERRO ao instalar dependências do bot!"
    exit 1
fi
cd ..

echo ""
echo "[2/4] Instalando dependências do Backend..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "ERRO ao instalar dependências do backend!"
    exit 1
fi
cd ..

echo ""
echo "[3/4] Instalando dependências do Dashboard..."
cd dashboard
npm install
if [ $? -ne 0 ]; then
    echo "ERRO ao instalar dependências do dashboard!"
    exit 1
fi
cd ..

echo ""
echo "[4/4] Criando arquivos .env..."
if [ ! -f "bot/.env" ]; then
    cp "bot/.env.example" "bot/.env"
    echo "- bot/.env criado"
fi
if [ ! -f "backend/.env" ]; then
    cp "backend/.env.example" "backend/.env"
    echo "- backend/.env criado"
fi
if [ ! -f "dashboard/.env" ]; then
    cp "dashboard/.env.example" "dashboard/.env"
    echo "- dashboard/.env criado"
fi

echo ""
echo "========================================"
echo "  Instalação Concluída!"
echo "========================================"
echo ""
echo "Próximos passos:"
echo "1. Configure os arquivos .env em cada pasta"
echo "2. Crie o banco de dados PostgreSQL"
echo "3. Execute: cd backend && npm run migrate"
echo "4. Inicie os sistemas (veja SETUP.md)"
echo ""
echo "Consulte SETUP.md para instruções detalhadas!"
echo ""
