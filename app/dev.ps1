param(
    [string]$cmd
)

switch ($cmd) {
    "up" {
        docker compose -f docker-compose.dev.yml up
    }
    "build" {
        docker compose -f docker-compose.dev.yml up --build
    }
    "down" {
        docker compose -f docker-compose.dev.yml down -v
    }
    "logs" {
        docker compose -f docker-compose.dev.yml logs -f
    }
    "restart" {
        docker compose -f docker-compose.dev.yml down
        docker compose -f docker-compose.dev.yml up
    }

    "build-no-cache" {
        docker compose -f docker-compose.dev.yml build --no-cache
        docker compose -f docker-compose.dev.yml up
    }

    "restore-prune"{
        docker builder prune -a
    }
    default {
        Write-Host "Uso: ./dev.ps1 {up|build|down|logs|restart|build-no-cache|restore-prune}"
    }
}