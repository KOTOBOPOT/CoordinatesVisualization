#!/bin/bash

# CoordViz Status Script
# Скрипт для проверки статуса приложения CoordViz

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════╗"
echo "║       CoordViz Status Check           ║"
echo "╚═══════════════════════════════════════╝"
echo -e "${NC}"

# Check container status
CONTAINER_NAME="coordviz-app"

if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo -e "${GREEN}✓ Контейнер запущен${NC}"
    
    # Get container info
    echo ""
    echo -e "${BLUE}Информация о контейнере:${NC}"
    docker ps --filter "name=${CONTAINER_NAME}" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    
    echo ""
    echo -e "${BLUE}Использование ресурсов:${NC}"
    docker stats ${CONTAINER_NAME} --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" 2>/dev/null || \
    docker stats ${CONTAINER_NAME} --no-stream 2>/dev/null || echo "  (статистика недоступна)"
    
    # Check if app is responding
    echo ""
    echo -e "${YELLOW}Проверка доступности приложения...${NC}"
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080)
    
    if [ "$HTTP_CODE" -eq 200 ] || [ "$HTTP_CODE" -eq 301 ] || [ "$HTTP_CODE" -eq 302 ]; then
        echo -e "${GREEN}✓ Приложение доступно (HTTP $HTTP_CODE)${NC}"
        echo -e "${GREEN}🌐 http://localhost:8080${NC}"
    else
        echo -e "${RED}⚠️  Приложение недоступно (HTTP $HTTP_CODE)${NC}"
    fi
    
    echo ""
    echo -e "${YELLOW}Показать логи: ${NC}docker-compose logs -f"
    
elif docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo -e "${YELLOW}⚠️  Контейнер существует, но остановлен${NC}"
    echo -e "${YELLOW}Запустить: ${NC}./start.sh"
else
    echo -e "${RED}❌ Контейнер не найден${NC}"
    echo -e "${YELLOW}Запустить: ${NC}./start.sh"
fi

echo ""

