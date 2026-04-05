import { SHIPMENT_STATUSES, type Shipment, type ShipmentStatus, type SoapClientError, type SoapDebugInfo } from "../types/shipment";

type SoapClientOptions = {
  endpoint: string;
};

type SoapResult<T> = {
  data: T;
  debug: SoapDebugInfo;
};

export type CreateShipmentInput = {
  clienteId: string;
  origem: string;
  destino: string;
  pesoKg: number;
  descricao: string;
};

export type ListShipmentsInput = {
  status?: ShipmentStatus;
  clienteId?: string;
  pagina: number;
  tamanhoPagina: number;
};

const NS = "http://logitrack.com.br/shipment";

const xmlEscape = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

const getFirst = (parent: Element | Document, selector: string): string => {
  const node = parent.querySelector(selector);
  return node?.textContent?.trim() ?? "";
};

const extractFault = (doc: Document): SoapClientError | null => {
  const fault = doc.querySelector("Fault");
  if (!fault) {
    return null;
  }

  return {
    faultCode: getFirst(fault, "faultcode"),
    faultString: getFirst(fault, "faultstring"),
    detailMessage: getFirst(fault, "detail > message") || "Erro SOAP"
  };
};

const ensureStatus = (value: string): ShipmentStatus => {
  if (SHIPMENT_STATUSES.includes(value as ShipmentStatus)) {
    return value as ShipmentStatus;
  }
  return "AGUARDANDO";
};

const parseShipment = (node: Element): Shipment => {
  const historicoNodes = Array.from(node.querySelectorAll("historicoStatus"));

  return {
    remessaId: getFirst(node, "remessaId"),
    clienteId: getFirst(node, "clienteId"),
    origem: getFirst(node, "origem"),
    destino: getFirst(node, "destino"),
    pesoKg: Number(getFirst(node, "pesoKg")) || 0,
    descricao: getFirst(node, "descricao"),
    status: ensureStatus(getFirst(node, "status")),
    criadoEm: getFirst(node, "criadoEm"),
    historicoStatus: historicoNodes.map((item) => ({
      status: ensureStatus(getFirst(item, "status")),
      atualizadoEm: getFirst(item, "atualizadoEm")
    }))
  };
};

export class SoapClient {
  private endpoint: string;

  constructor(options: SoapClientOptions) {
    this.endpoint = options.endpoint;
  }

  async criarRemessa(input: CreateShipmentInput): Promise<SoapResult<{ remessaId: string; status: ShipmentStatus; criadoEm: string }>> {
    const body = `<log:criarRemessa>
      <clienteId>${xmlEscape(input.clienteId)}</clienteId>
      <origem>${xmlEscape(input.origem)}</origem>
      <destino>${xmlEscape(input.destino)}</destino>
      <pesoKg>${input.pesoKg}</pesoKg>
      <descricao>${xmlEscape(input.descricao)}</descricao>
    </log:criarRemessa>`;

    const { doc, debug } = await this.send("criarRemessa", body);
    return {
      data: {
        remessaId: getFirst(doc, "criarRemessaResponse remessaId"),
        status: ensureStatus(getFirst(doc, "criarRemessaResponse status")),
        criadoEm: getFirst(doc, "criarRemessaResponse criadoEm")
      },
      debug
    };
  }

  async consultarRemessa(remessaId: string): Promise<SoapResult<Shipment>> {
    const { doc, debug } = await this.send(
      "consultarRemessa",
      `<log:consultarRemessa><remessaId>${xmlEscape(remessaId)}</remessaId></log:consultarRemessa>`
    );

    const node = doc.querySelector("consultarRemessaResponse remessa");
    if (!node) {
      throw new Error("Resposta SOAP inválida para consultarRemessa.");
    }

    return { data: parseShipment(node), debug };
  }

  async atualizarStatus(remessaId: string, status: ShipmentStatus): Promise<SoapResult<{ remessaId: string; status: ShipmentStatus }>> {
    const { doc, debug } = await this.send(
      "atualizarStatus",
      `<log:atualizarStatus>
        <remessaId>${xmlEscape(remessaId)}</remessaId>
        <status>${status}</status>
      </log:atualizarStatus>`
    );

    return {
      data: {
        remessaId: getFirst(doc, "atualizarStatusResponse remessaId"),
        status: ensureStatus(getFirst(doc, "atualizarStatusResponse status"))
      },
      debug
    };
  }

  async listarRemessas(input: ListShipmentsInput): Promise<SoapResult<{ remessas: Shipment[]; pagina: number; tamanhoPagina: number; total: number }>> {
    const statusNode = input.status ? `<status>${input.status}</status>` : "";
    const clienteNode = input.clienteId ? `<clienteId>${xmlEscape(input.clienteId)}</clienteId>` : "";

    const { doc, debug } = await this.send(
      "listarRemessas",
      `<log:listarRemessas>
        ${statusNode}
        ${clienteNode}
        <pagina>${input.pagina}</pagina>
        <tamanhoPagina>${input.tamanhoPagina}</tamanhoPagina>
      </log:listarRemessas>`
    );

    return {
      data: {
        remessas: Array.from(doc.querySelectorAll("listarRemessasResponse remessas")).map(parseShipment),
        pagina: Number(getFirst(doc, "listarRemessasResponse pagina")) || input.pagina,
        tamanhoPagina: Number(getFirst(doc, "listarRemessasResponse tamanhoPagina")) || input.tamanhoPagina,
        total: Number(getFirst(doc, "listarRemessasResponse total")) || 0
      },
      debug
    };
  }

  private async send(operation: string, operationBody: string): Promise<{ doc: Document; debug: SoapDebugInfo }> {
    const requestXml = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:log="${NS}">
  <soap:Body>
    ${operationBody}
  </soap:Body>
</soap:Envelope>`;

    const response = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        SOAPAction: operation
      },
      body: requestXml
    });

    const responseXml = await response.text();
    const doc = new DOMParser().parseFromString(responseXml, "text/xml");

    const fault = extractFault(doc);
    if (fault) {
      const error = new Error(`${fault.faultString}: ${fault.detailMessage}`) as Error & {
        fault: SoapClientError;
        debug: SoapDebugInfo;
      };
      error.fault = fault;
      error.debug = { operation, requestXml, responseXml };
      throw error;
    }

    return {
      doc,
      debug: {
        operation,
        requestXml,
        responseXml
      }
    };
  }
}
