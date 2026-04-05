import type { SoapDebugInfo } from "../types/shipment";

type Props = {
  debug: SoapDebugInfo | null;
};

export function XmlDebugPanel({ debug }: Props) {
  return (
    <section className="card xml-panel">
      <h2>Debug XML</h2>
      {debug ? (
        <div>
          <p><strong>Operação:</strong> {debug.operation}</p>
          <h3>Request</h3>
          <pre>{debug.requestXml}</pre>
          <h3>Response</h3>
          <pre>{debug.responseXml}</pre>
        </div>
      ) : (
        <p>Nenhuma operação executada ainda.</p>
      )}
    </section>
  );
}
