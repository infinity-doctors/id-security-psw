# ID Security PSW - One-Time Secret Corporate

Solução corporativa baseada no One-Time Secret com interface personalizada para compartilhamento seguro de informações sensíveis.

## 🏗️ Arquitetura

- **Backend**: One-Time Secret oficial (pglombardo/one-time-secret)
- **Frontend**: Interface customizada com HTML + TypeScript + WindiCSS
- **Containerização**: Docker + Docker Compose

## 📁 Estrutura do Projeto

```
id-security-psw/
├── frontend/                 # Interface personalizada
│   ├── src/
│   │   ├── components/       # Componentes TypeScript modulares
│   │   ├── services/         # Comunicação com API OTS
│   │   ├── styles/          # Configurações WindiCSS
│   │   └── utils/           # Funções utilitárias
│   ├── public/              # Assets estáticos
│   └── dist/                # Build de produção
├── docker/                  # Configurações Docker
├── docker-compose.yml       # Orquestração dos serviços
├── Dockerfile.frontend      # Build do frontend
└── README.md               # Documentação
```

## 🚀 Quick Start

### Pré-requisitos
- Docker
- Docker Compose

### Executar o ambiente completo

```bash
# Clone o repositório
git clone <repository-url>
cd id-security-psw

# Iniciar todos os serviços
docker-compose up -d

# Aguardar inicialização (primeiro build pode demorar)
docker-compose logs -f

# Acessar a aplicação
open http://localhost:3000
```

### URLs dos Serviços

- **Frontend**: http://localhost:3000
- **Backend OTS**: http://localhost:7143
- **API OTS**: http://localhost:7143/api

## 🛠️ Desenvolvimento

### Build do Frontend

```bash
# Desenvolvimento
cd frontend
npm install
npm run dev

# Build de produção
npm run build

# Preview do build
npm run preview
```

### Logs e Debug

```bash
# Logs de todos os serviços
docker-compose logs -f

# Logs específicos
docker-compose logs -f frontend
docker-compose logs -f ots-backend

# Restart de serviços
docker-compose restart frontend
```

## ⚙️ Configuração

### Variáveis de Ambiente

O arquivo `.env` permite customizar:

```env
# Portas dos serviços
FRONTEND_PORT=3000
OTS_BACKEND_PORT=7143

# Configurações OTS
OTS_SECRET=your-secret-key-here
OTS_HOST=0.0.0.0

# Configurações Redis (se necessário)
REDIS_URL=redis://redis:6379
```

### Personalização da Interface

A interface pode ser customizada editando:

- **Cores e temas**: `frontend/src/styles/theme.css`
- **Componentes**: `frontend/src/components/`
- **Lógica de negócio**: `frontend/src/services/`

## 🔒 Segurança

- Comunicação entre frontend e backend via proxy reverso
- Headers de segurança configurados
- Validação de entrada em TypeScript
- Sanitização de dados sensíveis

## 📦 Deploy em Produção

### Usando Docker Compose

```bash
# Build e deploy
docker-compose -f docker-compose.prod.yml up -d

# Atualização
docker-compose pull
docker-compose up -d --force-recreate
```

### Usando Kubernetes (Helm)

```bash
# Deploy com Helm
helm install id-security-psw ./helm/

# Upgrade
helm upgrade id-security-psw ./helm/
```

## 🧪 Testes

```bash
# Testes unitários
cd frontend
npm test

# Testes e2e
npm run test:e2e

# Linting e formatação
npm run lint
npm run format
```

## 📝 API Reference

### Endpoints Principais

```typescript
// Criar segredo
POST /api/secret
{
  "secret": "string",
  "ttl": number,
  "passphrase": "string?" // opcional
}

// Recuperar segredo
GET /api/secret/:key/:passphrase?

// Status do serviço
GET /api/status
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🆘 Suporte

- **Issues**: Reporte bugs ou solicite features via GitHub Issues
- **Documentação**: Wiki do projeto
- **Contato**: [seu-email@empresa.com] 