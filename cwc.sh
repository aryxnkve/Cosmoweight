#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════
#  Cosmic Weight Calculator — Docker Helper Script
#  Usage: ./cwc.sh <command>
# ═══════════════════════════════════════════════════════════════════

set -e

COMPOSE="docker compose"
PROJECT="cosmic-weight-calculator"
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
BLUE="\033[0;34m"
NC="\033[0m"   # No colour

banner() {
  echo -e "${BLUE}"
  echo "  ╔══════════════════════════════════════════╗"
  echo "  ║   🪐  Cosmic Weight Calculator           ║"
  echo "  ║      Docker Management Script            ║"
  echo "  ╚══════════════════════════════════════════╝"
  echo -e "${NC}"
}

usage() {
  banner
  echo -e "  ${GREEN}Usage:${NC} ./cwc.sh <command>\n"
  echo -e "  ${YELLOW}Development:${NC}"
  echo "    dev           Start website in dev mode (hot-reload on :5173)"
  echo "    stop          Stop all running containers"
  echo "    logs          Stream logs from web container"
  echo "    shell         Open a bash shell inside the web container"
  echo ""
  echo -e "  ${YELLOW}Testing:${NC}"
  echo "    test          Run all web unit tests (Vitest)"
  echo "    test-watch    Run tests in watch mode"
  echo ""
  echo -e "  ${YELLOW}Production:${NC}"
  echo "    build         Build production Docker images"
  echo "    prod          Start production web server on :80"
  echo ""
  echo -e "  ${YELLOW}Android:${NC}"
  echo "    apk           Build debug APK (outputs to ./android/app/build/outputs/apk/)"
  echo "    apk-release   Build release APK (requires keystore env vars)"
  echo ""
  echo -e "  ${YELLOW}Maintenance:${NC}"
  echo "    clean         Remove all CWC containers and images"
  echo "    nuke          Remove containers, images, AND named volumes (full reset)"
  echo "    status        Show status of all CWC containers"
  echo "    health        Run health checks on running containers"
  echo ""
}

require_docker() {
  if ! command -v docker &>/dev/null; then
    echo -e "${RED}❌ Docker is not installed or not in PATH.${NC}"
    echo "   Install Docker Desktop from https://www.docker.com/products/docker-desktop"
    exit 1
  fi
  if ! docker info &>/dev/null; then
    echo -e "${RED}❌ Docker daemon is not running. Please start Docker Desktop.${NC}"
    exit 1
  fi
}

cmd_dev() {
  echo -e "${GREEN}🚀 Starting dev server...${NC}"
  $COMPOSE up web --build
}

cmd_stop() {
  echo -e "${YELLOW}⏹  Stopping all CWC containers...${NC}"
  $COMPOSE down
  echo -e "${GREEN}✅ Stopped.${NC}"
}

cmd_logs() {
  echo -e "${BLUE}📋 Streaming logs (Ctrl+C to exit)...${NC}"
  $COMPOSE logs -f web
}

cmd_shell() {
  echo -e "${BLUE}🐚 Opening shell in web container...${NC}"
  $COMPOSE exec web sh
}

cmd_test() {
  echo -e "${GREEN}🧪 Running unit tests...${NC}"
  $COMPOSE run --rm --profile test test
}

cmd_test_watch() {
  echo -e "${GREEN}🧪 Running tests in watch mode...${NC}"
  $COMPOSE run --rm --profile test -e CI=false test npm run test
}

cmd_build() {
  echo -e "${GREEN}🏗  Building production images...${NC}"
  $COMPOSE --profile production build web-prod
  echo -e "${GREEN}✅ Build complete.${NC}"
}

cmd_prod() {
  echo -e "${GREEN}🚀 Starting production server on port 80...${NC}"
  $COMPOSE --profile production up web-prod -d
  echo -e "${GREEN}✅ Production server running at http://localhost${NC}"
}

cmd_apk() {
  echo -e "${GREEN}📱 Building debug APK...${NC}"
  echo -e "${YELLOW}   This may take 5–15 min on first run (downloading Gradle + SDK packages).${NC}"
  $COMPOSE --profile android run --rm android-builder
  APK_PATH="./android/app/build/outputs/apk/debug/app-debug.apk"
  if [ -f "$APK_PATH" ]; then
    SIZE=$(du -sh "$APK_PATH" | cut -f1)
    echo -e "${GREEN}✅ APK ready: ${APK_PATH} (${SIZE})${NC}"
  else
    echo -e "${RED}❌ APK not found. Check build logs above.${NC}"
    exit 1
  fi
}

cmd_apk_release() {
  echo -e "${GREEN}📱 Building release APK...${NC}"
  if [ -z "$KEYSTORE_PATH" ] || [ -z "$KEY_ALIAS" ] || [ -z "$KEY_PASSWORD" ]; then
    echo -e "${RED}❌ Release build requires environment variables:${NC}"
    echo "   KEYSTORE_PATH, KEY_ALIAS, KEY_PASSWORD, STORE_PASSWORD"
    exit 1
  fi
  $COMPOSE --profile android run --rm \
    -e BUILD_TYPE=release \
    -e KEYSTORE_PATH="$KEYSTORE_PATH" \
    -e KEY_ALIAS="$KEY_ALIAS" \
    -e KEY_PASSWORD="$KEY_PASSWORD" \
    -e STORE_PASSWORD="$STORE_PASSWORD" \
    android-builder bash -c "./gradlew assembleRelease --no-daemon"
}

cmd_status() {
  echo -e "${BLUE}📊 Container status:${NC}"
  $COMPOSE ps
}

cmd_health() {
  echo -e "${BLUE}❤️  Health checks:${NC}"
  for svc in web nginx; do
    STATUS=$(docker inspect --format='{{.State.Health.Status}}' "cwc-${svc}" 2>/dev/null || echo "not running")
    if [ "$STATUS" = "healthy" ]; then
      echo -e "  ${GREEN}✅ cwc-${svc}: ${STATUS}${NC}"
    else
      echo -e "  ${YELLOW}⚠️  cwc-${svc}: ${STATUS}${NC}"
    fi
  done
}

cmd_clean() {
  echo -e "${YELLOW}🧹 Removing all CWC containers and images...${NC}"
  $COMPOSE down --rmi local
  echo -e "${GREEN}✅ Cleaned.${NC}"
}

cmd_nuke() {
  echo -e "${RED}💣 Full reset: removing containers, images, and volumes...${NC}"
  read -rp "   Are you sure? This deletes all build caches. (y/N): " confirm
  if [[ "$confirm" =~ ^[Yy]$ ]]; then
    $COMPOSE down --rmi all --volumes --remove-orphans
    echo -e "${GREEN}✅ Everything removed. Fresh start on next run.${NC}"
  else
    echo "Aborted."
  fi
}

# ── Main ────────────────────────────────────────────────────────
require_docker

case "${1:-}" in
  dev)          cmd_dev ;;
  stop)         cmd_stop ;;
  logs)         cmd_logs ;;
  shell)        cmd_shell ;;
  test)         cmd_test ;;
  test-watch)   cmd_test_watch ;;
  build)        cmd_build ;;
  prod)         cmd_prod ;;
  apk)          cmd_apk ;;
  apk-release)  cmd_apk_release ;;
  status)       cmd_status ;;
  health)       cmd_health ;;
  clean)        cmd_clean ;;
  nuke)         cmd_nuke ;;
  *)            usage ;;
esac
