# Server SOAP (Node.js + TypeScript)

Servidor SOAP 1.1 para o desafio LogiTrack.

## Requisitos

- Node.js 20+
- npm

## Rodando localmente

```bash
npm install
npm run dev -w apps/server
```

Servidor: `http://localhost:3001/shipment`  
WSDL: `http://localhost:3001/shipment?wsdl`

## Testes

```bash
npm run test -w apps/server
```

## Exemplo de chamada SOAP (curl)

```bash
curl -X POST http://localhost:3001/shipment \
  -H "Content-Type: text/xml; charset=utf-8" \
  -H "SOAPAction: criarRemessa" \
  -d '<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:log="http://logitrack.com.br/shipment">
  <soap:Body>
    <log:criarRemessa>
      <clienteId>CLI-001</clienteId>
      <origem>São Paulo, SP</origem>
      <destino>Recife, PE</destino>
      <pesoKg>12.5</pesoKg>
      <descricao>Equipamentos eletrônicos</descricao>
    </log:criarRemessa>
  </soap:Body>
</soap:Envelope>'
```
