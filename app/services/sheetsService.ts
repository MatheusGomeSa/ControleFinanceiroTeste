import { Category, Transaction } from "../utils/estrutura-dados";

export interface SheetData {
  categories: Category[];
  transactions: Transaction[];
  settings: Record<string, string>;
}

/**
 * Busca todos os dados da planilha (Categorias, Lançamentos e Configurações)
 */
export async function getSheetData(): Promise<SheetData> {
  try {
    const response = await fetch("/api/sheet");
    if (!response.ok) throw new Error("Falha ao carregar dados");

    return await response.json();
  } catch (error) {
    console.error("Erro em getSheetData:", error);
    return { categories: [], transactions: [], settings: {} };
  }
}

/**
 * Atualiza a lista completa de categorias na planilha
 */
export async function syncCategories(categories: Category[]): Promise<boolean> {
  try {
    const response = await fetch("/api/sheet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "saveCategories", data: categories }),
    });

    return response.ok;
  } catch (error) {
    console.error("Erro em syncCategories:", error);
    return false;
  }
}

/**
 * Adiciona um único lançamento ao final da aba Lançamentos
 */
export async function addTransaction(
  transaction: Transaction,
): Promise<boolean> {
  try {
    const response = await fetch("/api/sheet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "appendTransaction", data: transaction }),
    });

    return response.ok;
  } catch (error) {
    console.error("Erro em addTransaction:", error);
    return false;
  }
}

/**
 * Reescreve a lista completa de lançamentos (utilizado ao remover um registro)
 */
export async function syncTransactions(
  transactions: Transaction[],
): Promise<boolean> {
  try {
    const response = await fetch("/api/sheet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "saveTransactions", data: transactions }),
    });

    return response.ok;
  } catch (error) {
    console.error("Erro em syncTransactions:", error);
    return false;
  }
}
