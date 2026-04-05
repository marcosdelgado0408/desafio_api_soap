import http from "node:http";
import soap from "soap";
import { InMemoryShipmentRepository } from "./repositories/shipment-repository.js";
import { ShipmentService } from "./services/shipment-service.js";
import { createSoapServiceDefinition } from "./soap/service-definition.js";
import { wsdlXml } from "./soap/wsdl.js";

const port = Number(process.env.PORT ?? 3001);

const repository = new InMemoryShipmentRepository();
const shipmentService = new ShipmentService(repository);
const soapService = createSoapServiceDefinition(shipmentService);

const server = http.createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok" }));
    return;
  }

  res.statusCode = 404;
  res.end("Not Found");
});

soap.listen(server, "/shipment", soapService, wsdlXml);

if (import.meta.url === `file://${process.argv[1]}`) {
  server.listen(port, () => {
    console.log(`SOAP server running at http://localhost:${port}/shipment`);
    console.log(`WSDL available at http://localhost:${port}/shipment?wsdl`);
  });
}

export { server };
