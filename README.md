# desafio_api_soap

Monorepo com implementação base do desafio SOAP/XML da LogiTrack.

## Estrutura

- `apps/server`: servidor SOAP 1.1 em Node.js + TypeScript
- `apps/client`: frontend React + Vite + TypeScript

## Requisitos

- Node.js 20+
- npm

## Rodando localmente

```bash
npm install
npm run dev
```

- Frontend: `http://localhost:3000`
- SOAP endpoint: `http://localhost:3001/shipment`
- WSDL: `http://localhost:3001/shipment?wsdl`

## Build e testes

```bash
npm run build
npm run test
```

## Escopo implementado

- 4 operações SOAP: `criarRemessa`, `consultarRemessa`, `atualizarStatus`, `listarRemessas`
- SOAP Faults de negócio e validação
- Persistência em memória
- Frontend com criação, consulta, listagem paginada/filtro, atualização de status
- Painel de debug com XML bruto de request/response
