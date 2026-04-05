export const SHIPMENT_STATUSES = [
  "AGUARDANDO",
  "EM_TRANSITO",
  "ENTREGUE",
  "CANCELADO"
] as const;

export type ShipmentStatus = (typeof SHIPMENT_STATUSES)[number];

export type ShipmentHistoryItem = {
  status: ShipmentStatus;
  atualizadoEm: string;
};

export type Shipment = {
  remessaId: string;
  clienteId: string;
  origem: string;
  destino: string;
  pesoKg: number;
  descricao: string;
  status: ShipmentStatus;
  criadoEm: string;
  historicoStatus: ShipmentHistoryItem[];
};

export type SoapDebugInfo = {
  operation: string;
  requestXml: string;
  responseXml: string;
};

export type SoapClientError = {
  faultCode: string;
  faultString: string;
  detailMessage: string;
};
