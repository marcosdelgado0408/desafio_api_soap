# Client Web (React + Vite + TypeScript)

Cliente web para consumir a API SOAP da LogiTrack.

## Requisitos

- Node.js 20+
- npm

## Configuração

Crie um arquivo `.env` em `apps/client` (opcional):

```bash
VITE_SOAP_ENDPOINT=/shipment
```

Por padrão, o Vite faz proxy de `/shipment` para `http://localhost:3001`.

## Rodando localmente

```bash
npm install
npm run dev -w apps/client
```

App: `http://localhost:3000`

## Testes

```bash
npm run test -w apps/client
```

## Funcionalidades

- Criar remessa
- Consultar remessa por ID
- Listar remessas com paginação e filtro por status
- Atualizar status na consulta/listagem
- Painel de debug com XML bruto (request/response)
