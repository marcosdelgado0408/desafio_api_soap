import { describe, expect, it } from "vitest";
import { InMemoryShipmentRepository } from "../src/repositories/shipment-repository.js";
import { ShipmentService } from "../src/services/shipment-service.js";
import { createSoapServiceDefinition } from "../src/soap/service-definition.js";
import { wsdlXml } from "../src/soap/wsdl.js";

describe("SOAP contract and handlers", () => {
  it("mantém WSDL com operações obrigatórias", () => {
    expect(wsdlXml).toContain("ShipmentService");
    expect(wsdlXml).toContain("criarRemessa");
    expect(wsdlXml).toContain("consultarRemessa");
    expect(wsdlXml).toContain("atualizarStatus");
    expect(wsdlXml).toContain("listarRemessas");
  });

  it("mapeia erro para SOAP Fault esperado", () => {
    const service = new ShipmentService(new InMemoryShipmentRepository());
    const soapDefinition = createSoapServiceDefinition(service);

    try {
      soapDefinition.ShipmentService.ShipmentPort.consultarRemessa({ remessaId: "REM-404" });
    } catch (error) {
      const fault = error as {
        Fault?: {
          faultstring?: string;
        };
      };
      expect(fault.Fault?.faultstring).toBe("RemessaNaoEncontradaFault");
      return;
    }

    throw new Error("Era esperado um SOAP Fault para remessa inexistente.");
  });
});
