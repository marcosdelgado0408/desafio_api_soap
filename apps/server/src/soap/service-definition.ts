import {
  InvalidStatusError,
  ShipmentNotFoundError,
  ValidationError
} from "../models/errors.js";
import type { Shipment } from "../models/shipment.js";
import { ShipmentService } from "../services/shipment-service.js";

type SoapFault = {
  Fault: {
    faultcode: string;
    faultstring: string;
    detail: Record<string, unknown>;
  };
};

const toSoapFault = (error: unknown): SoapFault => {
  if (error instanceof ShipmentNotFoundError) {
    return {
      Fault: {
        faultcode: "soap:Client",
        faultstring: "RemessaNaoEncontradaFault",
        detail: { message: error.message }
      }
    };
  }

  if (error instanceof InvalidStatusError) {
    return {
      Fault: {
        faultcode: "soap:Client",
        faultstring: "StatusInvalidoFault",
        detail: { message: error.message }
      }
    };
  }

  if (error instanceof ValidationError) {
    return {
      Fault: {
        faultcode: "soap:Client",
        faultstring: "ValidacaoFault",
        detail: { message: error.message }
      }
    };
  }

  return {
    Fault: {
      faultcode: "soap:Server",
      faultstring: "ErroInterno",
      detail: { message: "Erro interno inesperado." }
    }
  };
};

const mapShipmentToSoap = (shipment: Shipment) => ({
  remessaId: shipment.remessaId,
  clienteId: shipment.clienteId,
  origem: shipment.origem,
  destino: shipment.destino,
  pesoKg: shipment.pesoKg,
  descricao: shipment.descricao,
  status: shipment.status,
  criadoEm: shipment.criadoEm,
  historicoStatus: shipment.historicoStatus
});

export const createSoapServiceDefinition = (shipmentService: ShipmentService) => ({
  ShipmentService: {
    ShipmentPort: {
      criarRemessa(args: Record<string, string | number>) {
        try {
          const shipment = shipmentService.create({
            clienteId: String(args.clienteId ?? ""),
            origem: String(args.origem ?? ""),
            destino: String(args.destino ?? ""),
            pesoKg: Number(args.pesoKg),
            descricao: String(args.descricao ?? "")
          });

          return {
            remessaId: shipment.remessaId,
            status: shipment.status,
            criadoEm: shipment.criadoEm
          };
        } catch (error) {
          throw toSoapFault(error);
        }
      },

      consultarRemessa(args: Record<string, string>) {
        try {
          const shipment = shipmentService.getById(String(args.remessaId ?? ""));
          return {
            remessa: mapShipmentToSoap(shipment)
          };
        } catch (error) {
          throw toSoapFault(error);
        }
      },

      atualizarStatus(args: Record<string, string>) {
        try {
          const shipment = shipmentService.updateStatus(
            String(args.remessaId ?? ""),
            args.status
          );

          return {
            remessaId: shipment.remessaId,
            status: shipment.status
          };
        } catch (error) {
          throw toSoapFault(error);
        }
      },

      listarRemessas(args: Record<string, string>) {
        try {
          const result = shipmentService.list({
            status: args.status,
            clienteId: args.clienteId,
            pagina: args.pagina,
            tamanhoPagina: args.tamanhoPagina
          });

          return {
            remessas: result.dados.map(mapShipmentToSoap),
            pagina: result.pagina,
            tamanhoPagina: result.tamanhoPagina,
            total: result.total
          };
        } catch (error) {
          throw toSoapFault(error);
        }
      }
    }
  }
});
