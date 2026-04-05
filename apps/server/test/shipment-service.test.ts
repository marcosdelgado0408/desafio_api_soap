import { describe, expect, it } from "vitest";
import { InMemoryShipmentRepository } from "../src/repositories/shipment-repository.js";
import { ShipmentService } from "../src/services/shipment-service.js";
import { ShipmentNotFoundError, ValidationError } from "../src/models/errors.js";

const createService = () => {
  const repository = new InMemoryShipmentRepository();
  return new ShipmentService(repository);
};

describe("ShipmentService", () => {
  it("cria remessa com status inicial AGUARDANDO", () => {
    const service = createService();

    const shipment = service.create({
      clienteId: "CLI-001",
      origem: "SP",
      destino: "PE",
      pesoKg: 10,
      descricao: "Carga"
    });

    expect(shipment.status).toBe("AGUARDANDO");
    expect(shipment.historicoStatus).toHaveLength(1);
  });

  it("falha ao consultar remessa inexistente", () => {
    const service = createService();
    expect(() => service.getById("REM-404")).toThrowError(ShipmentNotFoundError);
  });

  it("atualiza status de remessa existente", () => {
    const service = createService();
    const shipment = service.create({
      clienteId: "CLI-001",
      origem: "SP",
      destino: "PE",
      pesoKg: 10,
      descricao: "Carga"
    });

    const updated = service.updateStatus(shipment.remessaId, "ENTREGUE");
    expect(updated.status).toBe("ENTREGUE");
    expect(updated.historicoStatus).toHaveLength(2);
  });

  it("lista remessas paginadas", () => {
    const service = createService();
    for (let i = 0; i < 3; i += 1) {
      service.create({
        clienteId: "CLI-001",
        origem: "SP",
        destino: "PE",
        pesoKg: 10,
        descricao: `Carga ${i}`
      });
    }

    const result = service.list({ pagina: 1, tamanhoPagina: 2 });
    expect(result.total).toBe(3);
    expect(result.dados).toHaveLength(2);
  });

  it("valida paginação inválida", () => {
    const service = createService();
    expect(() => service.list({ pagina: 0 })).toThrowError(ValidationError);
  });
});
