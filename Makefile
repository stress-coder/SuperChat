.PHONY: setup dev prod down reset

setup:
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo ""; \
		echo "Created .env from .env.example."; \
		echo "Fill in DB_USERNAME, DB_PASSWORD, DB_DATABASE, and JWT_SECRET before running."; \
		echo ""; \
		exit 1; \
	fi

dev: setup
	docker compose up --build

prod: setup
	docker compose -f docker-compose.prod.yml up --build

down:
	docker compose down

reset:
	docker compose down -v
