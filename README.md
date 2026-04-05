# Desafio API SOAP (LogiTrack)

Monorepo contendo a implementação do desafio SOAP/XML da LogiTrack. O projeto implementa um servidor SOAP 1.1 e um cliente Web capaz de realizar chamadas e lidar ativamente com as respostas XML.

## 🏗️ Estrutura e Arquitetura

O projeto foi construído utilizando **NPM Workspaces** para a gestão do monorepo, contendo duas aplicações principais:

- **`apps/server`**: Servidor SOAP Node.js puro e TypeScript, orquestrando serviços com endpoints WSDL expostos.
- **`apps/client`**: Frontend em React + Vite + TypeScript para realizar o consumo.

### 🧠 Decisões Técnicas Principais

Atendendo aos critérios e exigências logísticas do desafio, algumas decisões-chave foram implementadas e desenhadas na arquitetura:

1. **DOMParser Nativo ao invés de bibliotecas defasadas de SOAP no Client:**
   A fim de manter o frontend leve, reduzir dependências passíveis de falha de segurança e provar domínio dos conceitos estruturais, o *parsing* dos envelopes XML de resposta SOAP recebidos pelo client foi construído manualmente utilizando o padrão Web `DOMParser`. Com a ajuda da API nativa Fetch do browser e de manipulações de Strings XML para as chamadas via `POST`, contornou-se a dependência pesada que muita gente sofre em React usando módulos desatualizados do tipo `soap-js`.

2. **Persistência em Memória e Dependency Injection:**
   O backend foi estruturado baseado no padrão de injeção de repositórios (`ShipmentRepository`). A implementação injetada para essa entrega salva os registros diretamente na memória (`InMemoryShipmentRepository`). Dessa forma focou-se o teste integralmente na troca de XML e validação de serviço Web Services - abstraindo e ignorando o esforço desnecessário de um avaliador precisar subir um banco MySQL/Postgres local configurado.

3. **Mapeamento Uniforme de Erros e SOAP Faults:**
   Todo o sistema de falhas e regras de negócio foi abstraído e encapsulado localmente (lançando instâncias de `ShipmentNotFoundError`, `ValidationError`, etc). Existe globalmente um parseador `toSoapFault` no serviço SOAP (`service-definition.ts`) que mapeia todos os erros num objeto SOAP Fault padronizado (`faultcode`, `faultstring`, `detail`). O client está apto e lê todos como `SoapClientError`.

## 🚀 Requisitos

- **Node.js**: v20 ou superior.
- **npm** instalado globalmente.

## 🛠️ Como rodar localmente

Você possui duas opções para executar a infraestrutura: utilizando Docker (Recomendado) ou via Node / NPM local. Em ambas, o servidor e o cliente sobem simultaneamente.

### Opção A: Via Docker (Diferencial ✨)
Requer apenas o Docker instalado na máquina. Com um único comando toda a infraestrutura e rede são montadas, garantindo um ambiente imutável.

```bash
docker compose up --build
```

### Opção B: Via Node (NPM Workspaces)
Instale as dependências na raiz e inicie o projeto utilizando o script `dev`. A configuração de *workspaces* cuidará de subir backend e frontend em paralelo no mesmo terminal.

```bash
# 1. Instale as dependências (na raiz do projeto)
npm install

# 2. Inicie o servidor e o cliente localmente
npm run dev
```

Pronto! Os serviços ficarão expostos em:
- **Frontend (Interface UI)**: [http://localhost:3000](http://localhost:3000)
- **SOAP Endpoint**: `http://localhost:3001/shipment`
- **Contrato WSDL**: `http://localhost:3001/shipment?wsdl`

*(Opcional: Na janela de UI do cliente visual, desenvolvi um painel dinâmico amigável de debug: **O Painel XML**. Ele reside na base da tela e serve para você inspecionar as requisições brutas que o navegador envia em formato String XML Envelope, facilitando testes).*

---

## 📡 Exemplo de Chamada Funcional SOAP (cURL)

Você pode testar e validar o XML gerado utilizando o próprio terminal ou os importando pro Postman/Insomnia caso prefira uma ferramenta de API dedicada ao invés do próprio Frontend React embutido para validar a camada isoladamente de backend.

Aqui está um exemplo funcional e validado de Payload (criando Remessa):

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

---

## 🧪 Build e Testes Automáticos

Existem scripts presentes na raiz para facilitar testes automatizados e o *build* nas integrações (CI/CD):

```bash
# Executa suites de teste (se existirem) nas workspaces
npm run test

# Executa o processo de gerar a build do server/client
npm run build
```
