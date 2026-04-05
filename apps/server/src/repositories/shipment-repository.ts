import type { Shipment } from "../models/shipment.js";

export interface ShipmentRepository {
  save(shipment: Shipment): void;
  findById(remessaId: string): Shipment | undefined;
  list(): Shipment[];
}

export class InMemoryShipmentRepository implements ShipmentRepository {
  private readonly store = new Map<string, Shipment>();

  save(shipment: Shipment): void {
    this.store.set(shipment.remessaId, shipment);
  }

  findById(remessaId: string): Shipment | undefined {
    return this.store.get(remessaId);
  }

  list(): Shipment[] {
    return [...this.store.values()];
  }
}
