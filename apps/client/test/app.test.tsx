import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { App } from "../src/features/App";

describe("App", () => {
  it("renderiza seções principais e permite digitar no formulário", () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ text: async () => "<ok/>" }));

    render(<App />);

    expect(screen.getByText("Criar Remessa")).toBeInTheDocument();
    expect(screen.getByText("Consultar Remessa")).toBeInTheDocument();
    expect(screen.getByText("Listar Remessas")).toBeInTheDocument();

    const clienteInput = screen.getByPlaceholderText("Cliente ID") as HTMLInputElement;
    fireEvent.change(clienteInput, { target: { value: "CLI-123" } });

    expect(clienteInput.value).toBe("CLI-123");
  });
});
