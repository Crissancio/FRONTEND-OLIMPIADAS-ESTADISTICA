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
    default {
        Write-Host "Uso: ./dev.ps1 {up|build|down|logs|restart}"
    }
}