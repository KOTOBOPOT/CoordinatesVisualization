#!/bin/bash

# CoordViz Stop Script
# Скрипт для остановки приложения CoordViz

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════╗"
echo "║        CoordViz Stop Script           ║"
echo "╚═══════════════════════════════════════╝"
echo -e "${NC}"

# Stop containers
echo -e "${YELLOW}Остановка контейнеров...${NC}"
if docker compose version &> /dev/null; then
    docker compose down
else
    docker-compose down
fi

echo ""
echo -e "${GREEN}✓ Приложение остановлено${NC}"
echo ""

# Optional: Remove volumes
if [ "$1" == "--clean" ] || [ "$1" == "-c" ]; then
    echo -e "${YELLOW}Очистка volumes...${NC}"
    if docker compose version &> /dev/null; then
        docker compose down -v
    else
        docker-compose down -v
    fi
    echo -e "${GREEN}✓ Volumes очищены${NC}"
fi

# Optional: Remove images
if [ "$1" == "--full" ] || [ "$1" == "-f" ]; then
    echo -e "${YELLOW}Удаление образов...${NC}"
    docker rmi coordinates_visualization_coordviz 2>/dev/null || true
    echo -e "${GREEN}✓ Образы удалены${NC}"
fi

