import {
  SHIPMENT_STATUSES,
  type CreateShipmentInput,
  type ListShipmentsInput,
  type Shipment,
  type ShipmentStatus
} from "../models/shipment.js";
import {
  InvalidStatusError,
  ShipmentNotFoundError,
  ValidationError
} from "../models/errors.js";
import type { ShipmentRepository } from "../repositories/shipment-repository.js";

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const parsePositiveInt = (value: unknown, field: string, fallback: number): number => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new ValidationError(`${field} deve ser um inteiro maior que zero.`);
  }

  return parsed;
};

const parseStatus = (value: unknown): ShipmentStatus | undefined => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const status = String(value).trim().toUpperCase();
  if (!SHIPMENT_STATUSES.includes(status as ShipmentStatus)) {
    throw new InvalidStatusError(String(value));
  }

  return status as ShipmentStatus;
};

export class ShipmentService {
  constructor(private readonly repository: ShipmentRepository) {}

  create(input: CreateShipmentInput): Shipment {
    this.validateCreateInput(input);

    const now = new Date().toISOString();
    const remessaId = this.generateShipmentId();
    const shipment: Shipment = {
      remessaId,
      clienteId: input.clienteId.trim(),
      origem: input.origem.trim(),
      destino: input.destino.trim(),
      pesoKg: Number(input.pesoKg),
      descricao: input.descricao.trim(),
      status: "AGUARDANDO",
      criadoEm: now,
      historicoStatus: [
        {
          status: "AGUARDANDO",
          atualizadoEm: now
        }
      ]
    };

    this.repository.save(shipment);
    return shipment;
  }

  getById(remessaId: string): Shipment {
    if (!isNonEmptyString(remessaId)) {
      throw new ValidationError("remessaId é obrigatório.");
    }

    const shipment = this.repository.findById(remessaId.trim());
    if (!shipment) {
      throw new ShipmentNotFoundError(remessaId);
    }

    return shipment;
  }

  updateStatus(remessaId: string, newStatusValue: unknown): Shipment {
    const shipment = this.getById(remessaId);
    const newStatus = parseStatus(newStatusValue);

    if (!newStatus) {
      throw new ValidationError("status é obrigatório.");
    }

    shipment.status = newStatus;
    shipment.historicoStatus.push({
      status: newStatus,
      atualizadoEm: new Date().toISOString()
    });

    this.repository.save(shipment);
    return shipment;
  }

  list(input: {
    status?: unknown;
    clienteId?: unknown;
    pagina?: unknown;
    tamanhoPagina?: unknown;
  }): {
    dados: Shipment[];
    pagina: number;
    tamanhoPagina: number;
    total: number;
  } {
    const normalizedInput: ListShipmentsInput = {
      status: parseStatus(input.status),
      clienteId: isNonEmptyString(input.clienteId) ? input.clienteId.trim() : undefined,
      pagina: parsePositiveInt(input.pagina, "pagina", 1),
      tamanhoPagina: parsePositiveInt(input.tamanhoPagina, "tamanhoPagina", 10)
    };

    const filtered = this.repository.list().filter((shipment) => {
      const matchStatus =
        normalizedInput.status === undefined || shipment.status === normalizedInput.status;
      const matchCliente =
        normalizedInput.clienteId === undefined || shipment.clienteId === normalizedInput.clienteId;

      return matchStatus && matchCliente;
    });

    const total = filtered.length;
    const offset = (normalizedInput.pagina - 1) * normalizedInput.tamanhoPagina;
    const dados = filtered.slice(offset, offset + normalizedInput.tamanhoPagina);

    return {
      dados,
      pagina: normalizedInput.pagina,
      tamanhoPagina: normalizedInput.tamanhoPagina,
      total
    };
  }

  private validateCreateInput(input: CreateShipmentInput): void {
    if (!isNonEmptyString(input.clienteId)) {
      throw new ValidationError("clienteId é obrigatório.");
    }

    if (!isNonEmptyString(input.origem)) {
      throw new ValidationError("origem é obrigatória.");
    }

    if (!isNonEmptyString(input.destino)) {
      throw new ValidationError("destino é obrigatório.");
    }

    if (!isNonEmptyString(input.descricao)) {
      throw new ValidationError("descricao é obrigatória.");
    }

    const peso = Number(input.pesoKg);
    if (Number.isNaN(peso) || peso <= 0) {
      throw new ValidationError("pesoKg deve ser um número maior que zero.");
    }
  }

  private generateShipmentId(): string {
    const randomPart = Math.floor(Math.random() * 9000 + 1000);
    const datePart = new Date().toISOString().slice(0, 10).replaceAll("-", "");
    return `REM-${datePart}-${randomPart}`;
  }
}
