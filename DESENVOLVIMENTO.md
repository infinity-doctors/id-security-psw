# 🚀 Ambiente de Desenvolvimento - ID Security PSW

## Status Atual

✅ **Ambiente de desenvolvimento funcional configurado!**

### Componentes Rodando

- **Redis**: Container Docker para armazenamento
- **Backend One-Time Secret**: Container Docker oficial (porta 7143)
- **Frontend**: Servidor Vite local (porta 3000) com proxy para API

## Como Usar

### 1. Iniciar o Ambiente

```bash
# Inicia apenas o backend em Docker (recomendado para desenvolvimento)
make dev-local

# Em outro terminal, inicia o frontend
cd frontend && npm run dev
```

### 2. Acessar a Aplicação

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:7143
- **API**: http://localhost:3000/api (proxy automático)

### 3. Comandos Úteis

```bash
# Ver status dos containers
make status

# Ver logs do backend
make logs-backend

# Parar ambiente
make dev-stop

# Instalar dependências do frontend
make install
```

## Estrutura Implementada

### Frontend (TypeScript + WindiCSS)
- **Componentes**: App, SecretForm, SecretView, Header, Footer, NotificationManager
- **Serviços**: OTSService para comunicação com API
- **Utilitários**: ValidationUtils, ClipboardUtils
- **Build**: Vite com TypeScript e WindiCSS

### Backend (One-Time Secret Oficial)
- **Container**: `onetimesecret/onetimesecret:latest`
- **API**: Endpoints REST para criar/recuperar segredos
- **Storage**: Redis para persistência

### Integração
- **Proxy**: Vite redireciona `/api/*` para `http://localhost:7143`
- **CORS**: Configurado para desenvolvimento local
- **Environment**: Variáveis configuradas via `.env`

## Resolução de Problemas

### Docker Build Issues
- Problema com dependências Rollup em ARM64 resolvido usando desenvolvimento local
- Frontend construído localmente, backend em container

### Configurações Importantes
- `SECRET`: Configurado para One-Time Secret
- `REDIS_URL`: Conecta backend ao Redis
- Proxy Vite: Permite comunicação frontend-backend sem CORS

## Próximos Passos

1. **Teste Manual**: Acesse http://localhost:3000 e teste a criação de segredos
2. **Desenvolvimento**: Modifique componentes em `frontend/src/`
3. **Deploy**: Use `make prod` para ambiente de produção

## Arquivos Criados/Modificados

- ✅ Dockerfile.frontend (multi-stage build)
- ✅ docker-compose.yml (backend + redis)
- ✅ Frontend completo em TypeScript
- ✅ Configuração Vite com proxy
- ✅ Makefile com comandos de desenvolvimento
- ✅ Configuração WindiCSS
- ✅ Estrutura de componentes modulares

**Status**: 🟢 Pronto para desenvolvimento e testes 