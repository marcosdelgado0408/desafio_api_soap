import { useMemo, useState, type FormEvent } from "react";
import { SoapClient, type CreateShipmentInput } from "../api/soapClient";
import { XmlDebugPanel } from "../components/XmlDebugPanel";
import { SHIPMENT_STATUSES, type Shipment, type ShipmentStatus, type SoapDebugInfo } from "../types/shipment";

const endpoint = import.meta.env.VITE_SOAP_ENDPOINT ?? "/shipment";

const defaultCreateForm: CreateShipmentInput = {
  clienteId: "",
  origem: "",
  destino: "",
  pesoKg: 1,
  descricao: ""
};

export function App() {
  const client = useMemo(() => new SoapClient({ endpoint }), []);

  const [createForm, setCreateForm] = useState<CreateShipmentInput>(defaultCreateForm);
  const [consultaId, setConsultaId] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<ShipmentStatus | "">("");
  const [filtroClienteId, setFiltroClienteId] = useState("");
  const [pagina, setPagina] = useState(1);
  const [tamanhoPagina] = useState(10);
  const [mensagem, setMensagem] = useState("");
  const [debug, setDebug] = useState<SoapDebugInfo | null>(null);
  const [shipmentDetalhe, setShipmentDetalhe] = useState<Shipment | null>(null);
  const [lista, setLista] = useState<{ remessas: Shipment[]; total: number }>({ remessas: [], total: 0 });

  const runAction = async (action: () => Promise<SoapDebugInfo>) => {
    setMensagem("");
    try {
      const debugInfo = await action();
      setDebug(debugInfo);
    } catch (error) {
      const err = error as Error & { fault?: { detailMessage?: string }; debug?: SoapDebugInfo };
      setMensagem(err.fault?.detailMessage ?? err.message);
      setDebug(err.debug ?? null);
    }
  };

  const handleCriar = async (event: FormEvent) => {
    event.preventDefault();
    await runAction(async () => {
      const { data, debug } = await client.criarRemessa(createForm);
      setMensagem(`Remessa criada: ${data.remessaId} (${data.status})`);
      setCreateForm(defaultCreateForm);
      return debug;
    });
  };

  const handleConsultar = async (event: FormEvent) => {
    event.preventDefault();
    await runAction(async () => {
      const { data, debug } = await client.consultarRemessa(consultaId);
      setShipmentDetalhe(data);
      setMensagem(`Remessa ${data.remessaId} encontrada.`);
      return debug;
    });
  };

  const loadLista = async () => {
    await runAction(async () => {
      const { data, debug } = await client.listarRemessas({
        status: filtroStatus || undefined,
        clienteId: filtroClienteId || undefined,
        pagina,
        tamanhoPagina
      });
      setLista({ remessas: data.remessas, total: data.total });
      return debug;
    });
  };

  const atualizarStatus = async (remessaId: string, status: ShipmentStatus) => {
    await runAction(async () => {
      const { debug } = await client.atualizarStatus(remessaId, status);
      setMensagem(`Status atualizado para ${status}.`);
      const refreshed = await client.listarRemessas({
        status: filtroStatus || undefined,
        clienteId: filtroClienteId || undefined,
        pagina,
        tamanhoPagina
      });
      setLista({ remessas: refreshed.data.remessas, total: refreshed.data.total });
      return debug;
    });
  };

  return (
    <main className="layout">
      <header className="hero">
        <p className="hero__eyebrow">LogiTrack</p>
        <h1>SOAP Client Console</h1>
        <p className="hero__sub">Endpoint ativo: {endpoint}</p>
        {mensagem && <p className="hero__message">{mensagem}</p>}
      </header>

      <section className="card">
        <h2>Criar Remessa</h2>
        <form className="grid-form" onSubmit={handleCriar}>
          <input
            placeholder="Cliente ID"
            value={createForm.clienteId}
            onChange={(e) => setCreateForm((p) => ({ ...p, clienteId: e.target.value }))}
            required
          />
          <input
            placeholder="Origem"
            value={createForm.origem}
            onChange={(e) => setCreateForm((p) => ({ ...p, origem: e.target.value }))}
            required
          />
          <input
            placeholder="Destino"
            value={createForm.destino}
            onChange={(e) => setCreateForm((p) => ({ ...p, destino: e.target.value }))}
            required
          />
          <input
            type="number"
            step="0.1"
            min="0.1"
            placeholder="Peso (kg)"
            value={createForm.pesoKg}
            onChange={(e) => setCreateForm((p) => ({ ...p, pesoKg: Number(e.target.value) }))}
            required
          />
          <input
            className="grid-form__span"
            placeholder="Descrição"
            value={createForm.descricao}
            onChange={(e) => setCreateForm((p) => ({ ...p, descricao: e.target.value }))}
            required
          />
          <button className="button button--primary" type="submit">
            Criar
          </button>
        </form>
      </section>

      <section className="card">
        <h2>Consultar Remessa</h2>
        <form className="line-form" onSubmit={handleConsultar}>
          <input
            placeholder="Remessa ID"
            value={consultaId}
            onChange={(e) => setConsultaId(e.target.value)}
            required
          />
          <button className="button" type="submit">
            Consultar
          </button>
        </form>
        {shipmentDetalhe && (
          <article className="shipment-detail">
            <p><strong>ID:</strong> {shipmentDetalhe.remessaId}</p>
            <p><strong>Cliente:</strong> {shipmentDetalhe.clienteId}</p>
            <p><strong>Origem:</strong> {shipmentDetalhe.origem}</p>
            <p><strong>Destino:</strong> {shipmentDetalhe.destino}</p>
            <p><strong>Peso:</strong> {shipmentDetalhe.pesoKg}</p>
            <p><strong>Descrição:</strong> {shipmentDetalhe.descricao}</p>
            <p><strong>Status:</strong> {shipmentDetalhe.status}</p>
            <label className="line-form">
              <span>Atualizar status</span>
              <select
                onChange={(e) =>
                  atualizarStatus(shipmentDetalhe.remessaId, e.target.value as ShipmentStatus)
                }
                defaultValue=""
              >
                <option value="" disabled>
                  Selecione
                </option>
                {SHIPMENT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
          </article>
        )}
      </section>

      <section className="card">
        <h2>Listar Remessas</h2>
        <div className="toolbar">
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value as ShipmentStatus | "")}
          >
            <option value="">Todos os status</option>
            {SHIPMENT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <input
            placeholder="Filtro clienteId"
            value={filtroClienteId}
            onChange={(e) => setFiltroClienteId(e.target.value)}
          />
          <button className="button" onClick={loadLista}>
            Buscar
          </button>
          <button className="button" onClick={() => setPagina((p) => Math.max(1, p - 1))}>
            Pagina anterior
          </button>
          <button className="button" onClick={() => setPagina((p) => p + 1)}>
            Proxima pagina
          </button>
          <span className="pagination">Pagina atual: {pagina}</span>
        </div>
        <p className="total">Total: {lista.total}</p>
        <ul className="shipment-list">
          {lista.remessas.map((item) => (
            <li key={item.remessaId}>
              <div>
                <strong>{item.remessaId}</strong>
                <span>{item.status}</span>
                <span>{item.clienteId}</span>
              </div>
              <select
                onChange={(e) => atualizarStatus(item.remessaId, e.target.value as ShipmentStatus)}
                defaultValue=""
              >
                <option value="" disabled>
                  Atualizar status
                </option>
                {SHIPMENT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </li>
          ))}
        </ul>
      </section>

      <XmlDebugPanel debug={debug} />
    </main>
  );
}
