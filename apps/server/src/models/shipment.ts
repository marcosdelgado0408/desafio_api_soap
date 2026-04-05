export const SHIPMENT_STATUSES = [
  "AGUARDANDO",
  "EM_TRANSITO",
  "ENTREGUE",
  "CANCELADO"
] as const;

export type ShipmentStatus = (typeof SHIPMENT_STATUSES)[number];

export type ShipmentStatusHistory = {
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
  historicoStatus: ShipmentStatusHistory[];
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
