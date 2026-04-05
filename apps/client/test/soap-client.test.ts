import { describe, expect, it, vi } from "vitest";
import { SoapClient } from "../src/api/soapClient";

const endpoint = "http://localhost:3001/shipment";

describe("SoapClient", () => {
  it("envia envelope e parseia criarRemessa", async () => {
    const mockResponse = `<?xml version="1.0"?>
      <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Body>
          <criarRemessaResponse>
            <remessaId>REM-1</remessaId>
            <status>AGUARDANDO</status>
            <criadoEm>2026-04-05T10:00:00Z</criadoEm>
          </criarRemessaResponse>
        </soap:Body>
      </soap:Envelope>`;

    const fetchMock = vi.fn().mockResolvedValue({
      text: () => Promise.resolve(mockResponse)
    });

    vi.stubGlobal("fetch", fetchMock);

    const client = new SoapClient({ endpoint });
    const result = await client.criarRemessa({
      clienteId: "CLI-1",
      origem: "SP",
      destino: "PE",
      pesoKg: 5,
      descricao: "Teste"
    });

    expect(result.data.remessaId).toBe("REM-1");
    expect(result.debug.requestXml).toContain("<log:criarRemessa>");
  });

  it("lança erro para SOAP Fault", async () => {
    const faultResponse = `<?xml version="1.0"?>
      <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Body>
          <soap:Fault>
            <faultcode>soap:Client</faultcode>
            <faultstring>ValidacaoFault</faultstring>
            <detail><message>erro de validação</message></detail>
          </soap:Fault>
        </soap:Body>
      </soap:Envelope>`;

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        text: () => Promise.resolve(faultResponse)
      })
    );

    const client = new SoapClient({ endpoint });
    await expect(client.consultarRemessa("REM-404")).rejects.toThrow("ValidacaoFault");
  });
});
