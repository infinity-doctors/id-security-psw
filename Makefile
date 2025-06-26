# ID Security PSW - One-Time Secret Corporate
# Makefile para automação de comandos

.PHONY: help build dev prod logs clean test lint format

# Default target
help: ## Mostra esta ajuda
	@echo "ID Security PSW - Comandos Disponíveis:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Development
dev: ## Inicia ambiente de desenvolvimento
	@echo "🚀 Iniciando ambiente de desenvolvimento..."
	docker-compose up --build -d
	@echo "✅ Ambiente iniciado!"
	@echo "📱 Frontend: http://localhost:3000"
	@echo "🔧 Backend: http://localhost:7143"

dev-logs: ## Mostra logs do ambiente de desenvolvimento
	docker-compose logs -f

dev-stop: ## Para ambiente de desenvolvimento
	docker-compose down

dev-local: ## Desenvolvimento local (apenas backend no Docker)
	@echo "🚀 Iniciando backend em Docker..."
	docker-compose up redis ots-backend -d
	@echo "🔧 Iniciando frontend localmente..."
	@echo "📌 Backend OTS: http://localhost:7143"
	@echo "📌 Execute 'cd frontend && npm run dev' para o frontend"
	@echo "✅ Backend rodando, inicie o frontend separadamente"

# Production
prod: ## Inicia ambiente de produção
	@echo "🚀 Iniciando ambiente de produção..."
	docker-compose -f docker-compose.prod.yml up --build -d
	@echo "✅ Ambiente de produção iniciado!"

prod-logs: ## Mostra logs do ambiente de produção
	docker-compose -f docker-compose.prod.yml logs -f

prod-stop: ## Para ambiente de produção
	docker-compose -f docker-compose.prod.yml down

# Build
build: ## Build das imagens Docker
	@echo "🔨 Fazendo build das imagens..."
	docker-compose build --no-cache

build-frontend: ## Build apenas do frontend
	@echo "🔨 Fazendo build do frontend..."
	cd frontend && npm run build

# Development helpers
install: ## Instala dependências do frontend
	@echo "📦 Instalando dependências..."
	cd frontend && npm install

lint: ## Executa linting do código
	@echo "🔍 Executando linting..."
	cd frontend && npm run lint

format: ## Formata o código
	@echo "💅 Formatando código..."
	cd frontend && npm run format

test: ## Executa testes
	@echo "🧪 Executando testes..."
	cd frontend && npm test

# Logs and monitoring
logs: ## Mostra logs de todos os serviços
	docker-compose logs -f

logs-frontend: ## Mostra logs apenas do frontend
	docker-compose logs -f frontend

logs-backend: ## Mostra logs apenas do backend
	docker-compose logs -f ots-backend

logs-redis: ## Mostra logs apenas do Redis
	docker-compose logs -f redis

# Maintenance
clean: ## Limpa containers, volumes e imagens não utilizados
	@echo "🧹 Limpando ambiente..."
	docker-compose down -v --remove-orphans
	docker system prune -f
	docker volume prune -f
	@echo "✅ Limpeza concluída!"

clean-all: ## Limpa tudo incluindo imagens
	@echo "🧹 Limpeza completa..."
	docker-compose down -v --remove-orphans
	docker system prune -af
	docker volume prune -f
	@echo "✅ Limpeza completa concluída!"

restart: ## Reinicia todos os serviços
	@echo "🔄 Reiniciando serviços..."
	docker-compose restart
	@echo "✅ Serviços reiniciados!"

restart-frontend: ## Reinicia apenas o frontend
	docker-compose restart frontend

restart-backend: ## Reinicia apenas o backend
	docker-compose restart ots-backend

# Status and health
status: ## Mostra status dos serviços
	@echo "📊 Status dos serviços:"
	docker-compose ps

health: ## Verifica saúde dos serviços
	@echo "🔍 Verificando saúde dos serviços..."
	@curl -s http://localhost:3000/health | grep -q "healthy" && echo "✅ Frontend: OK" || echo "❌ Frontend: ERRO"
	@curl -s http://localhost:7143/api/status | grep -q "status" && echo "✅ Backend: OK" || echo "❌ Backend: ERRO"

# Security
security-scan: ## Executa scan de segurança nas imagens
	@echo "🔒 Executando scan de segurança..."
	docker scout cves id-security-psw_frontend || echo "⚠️  Docker Scout não disponível"

# Database
redis-cli: ## Conecta ao Redis CLI
	docker-compose exec redis redis-cli

backup-redis: ## Backup do Redis
	@echo "💾 Fazendo backup do Redis..."
	docker-compose exec redis redis-cli save
	docker cp $$(docker-compose ps -q redis):/data/dump.rdb ./backups/redis-$$(date +%Y%m%d_%H%M%S).rdb
	@echo "✅ Backup salvo em ./backups/"

# Environment setup
setup: ## Setup inicial do projeto
	@echo "🛠️  Setup inicial do projeto..."
	@mkdir -p backups
	@cp .env.example .env
	@echo "📝 Configure o arquivo .env antes de continuar"
	@echo "✅ Setup concluído!"

# Docker helpers
shell-frontend: ## Abre shell no container frontend
	docker-compose exec frontend sh

shell-backend: ## Abre shell no container backend
	docker-compose exec ots-backend sh

shell-redis: ## Abre shell no container Redis
	docker-compose exec redis sh

# Update
update: ## Atualiza imagens Docker
	@echo "🔄 Atualizando imagens..."
	docker-compose pull
	@echo "✅ Imagens atualizadas!"

# Documentation
docs: ## Gera documentação do projeto
	@echo "📚 Gerando documentação..."
	@echo "📖 README.md já disponível"
	@echo "🌐 Acesse http://localhost:3000 para ver a aplicação" 