export class ShipmentNotFoundError extends Error {
  constructor(public readonly remessaId: string) {
    super(`Remessa '${remessaId}' não encontrada.`);
    this.name = "RemessaNaoEncontrada";
  }
}

export class InvalidStatusError extends Error {
  constructor(public readonly status: string) {
    super(`Status inválido: '${status}'.`);
    this.name = "StatusInvalido";
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "Validacao";
  }
}
