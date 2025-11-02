#!/bin/bash

# CoordViz Startup Script
# Скрипт для запуска приложения CoordViz

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Banner
echo -e "${BLUE}"
echo "╔═══════════════════════════════════════╗"
echo "║       CoordViz Startup Script         ║"
echo "║   Визуализация географических точек  ║"
echo "╚═══════════════════════════════════════╝"
echo -e "${NC}"

# Check if Docker is installed
echo -e "${YELLOW}Проверка зависимостей...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker не установлен. Установите Docker: https://docs.docker.com/get-docker/${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker установлен${NC}"

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ Docker Compose не установлен.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker Compose установлен${NC}"

# Check if Docker daemon is running
if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker daemon не запущен. Запустите Docker Desktop.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker daemon запущен${NC}"

echo ""

# Build and start containers
echo -e "${YELLOW}Сборка и запуск контейнеров...${NC}"
if docker compose version &> /dev/null; then
    docker compose up -d --build
else
    docker-compose up -d --build
fi

# Wait for container to be ready
echo -e "${YELLOW}Ожидание готовности приложения...${NC}"
sleep 3

# Check if container is running
CONTAINER_NAME="coordviz-app"
if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo -e "${GREEN}✓ Контейнер ${CONTAINER_NAME} запущен${NC}"
else
    echo -e "${RED}❌ Ошибка запуска контейнера${NC}"
    exit 1
fi

# Check if app is responding
echo -e "${YELLOW}Проверка доступности приложения...${NC}"
MAX_RETRIES=10
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080 | grep -q "200\|301\|302"; then
        echo -e "${GREEN}✓ Приложение доступно${NC}"
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo -e "${YELLOW}  Попытка $RETRY_COUNT из $MAX_RETRIES...${NC}"
    sleep 1
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo -e "${RED}⚠️  Не удалось подтвердить доступность приложения${NC}"
fi

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════╗${NC}"
echo -e "${GREEN}║          Приложение запущено! 🎉      ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}🌐 Откройте в браузере:${NC} ${GREEN}http://localhost:8080${NC}"
echo ""
echo -e "${YELLOW}Полезные команды:${NC}"
echo -e "  ${BLUE}Логи:${NC}         docker-compose logs -f"
echo -e "  ${BLUE}Остановить:${NC}   docker-compose down"
echo -e "  ${BLUE}Перезапуск:${NC}   docker-compose restart"
echo -e "  ${BLUE}Статус:${NC}       docker-compose ps"
echo ""

# Open browser (optional)
if [ "$1" == "--open" ] || [ "$1" == "-o" ]; then
    echo -e "${YELLOW}Открываю браузер...${NC}"
    if command -v open &> /dev/null; then
        # macOS
        open http://localhost:8080
    elif command -v xdg-open &> /dev/null; then
        # Linux
        xdg-open http://localhost:8080
    elif command -v start &> /dev/null; then
        # Windows (Git Bash)
        start http://localhost:8080
    else
        echo -e "${YELLOW}Не удалось открыть браузер автоматически${NC}"
    fi
fi

