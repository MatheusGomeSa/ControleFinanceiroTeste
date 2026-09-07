import { NextResponse } from "next/server";
import { getGoogleSheetsInstance } from "../../lib/googleSheets";

const SPREADSHEET_ID = process.env.NEXT_PUBLIC_GOOGLE_SPREADSHEET_ID;

// GET: Leitura das 3 abas da planilha
export async function GET() {
  try {
    const sheets = await getGoogleSheetsInstance();

    const response = await sheets.spreadsheets.values.batchGet({
      spreadsheetId: SPREADSHEET_ID,
      ranges: ["Categorias!A2:D", "Lançamentos!A2:F", "Configurações!A2:B"],
    });

    const valueRanges = response.data.valueRanges || [];

    // 1. Processa Categorias
    const categoriesRows = valueRanges[0]?.values || [];
    const categories = categoriesRows.map((row) => ({
      id: String(row[0] || ""),
      name: String(row[1] || ""),
      percentage: Number(row[2]) || 0,
      color: String(row[3] || "#3b82f6"),
    }));

    // 2. Processa Lançamentos (com proteção para colunas vazias)
    const transactionsRows = valueRanges[1]?.values || [];
    const transactions = transactionsRows
      .filter((row) => row.length >= 3) // Garante que a linha possui dados mínimos
      .map((row) => ({
        id: String(row[0] || `tx-${Math.random()}`),
        date: String(row[1] || ""),
        description: String(row[2] || ""),
        type: (row[3] === "income" ? "income" : "expense") as
          | "income"
          | "expense",
        amount: Number(row[4]) || 0,
        categoryId: row[5] && row[5].trim() !== "" ? String(row[5]) : null,
      }));

    // 3. Processa Configurações
    const settingsRows = valueRanges[2]?.values || [];
    const settings: Record<string, string> = {};
    settingsRows.forEach((row) => {
      if (row[0]) settings[row[0]] = String(row[1] || "");
    });

    return NextResponse.json({ categories, transactions, settings });
  } catch (error: unknown) {
    // Converte para Record de forma segura para acessar propriedades dinâmicas
    const err = error as {
      response?: { data?: { error?: { message?: string } } };
      message?: string;
    };
    const apiErrorDetails = err?.response?.data?.error?.message || err?.message;

    console.error("Erro na leitura da planilha:", err?.response?.data || error);

    return NextResponse.json(
      {
        error: "Erro ao buscar dados do Google Sheets",
        details: apiErrorDetails,
      },
      { status: 500 },
    );
  }
}

// POST: Gravação/Atualização de dados
export async function POST(request: Request) {
  try {
    const sheets = await getGoogleSheetsInstance();
    const { action, data } = await request.json();

    if (action === "saveCategories") {
      const values = data.map(
        (cat: {
          id: string;
          name: string;
          percentage: number;
          color: string;
        }) => [cat.id, cat.name, cat.percentage, cat.color],
      );

      // Limpa os dados antigos para reescrever a lista de categorias atualizada
      await sheets.spreadsheets.values.clear({
        spreadsheetId: SPREADSHEET_ID,
        range: "Categorias!A2:D100",
      });

      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: "Categorias!A2:D",
        valueInputOption: "USER_ENTERED",
        requestBody: { values },
      });

      return NextResponse.json({ success: true });
    }

    if (action === "appendTransaction") {
      const values = [
        [
          data.id ?? `tx-${Date.now()}`,
          data.date ?? new Date().toISOString().split("T")[0],
          data.description ?? "",
          data.type ?? "expense",
          Number(data.amount) || 0,
          data.categoryId ?? "",
        ],
      ];

      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: "Lançamentos!A:F",
        valueInputOption: "USER_ENTERED",
        insertDataOption: "INSERT_ROWS", // Garante a criação de uma nova linha
        requestBody: { values },
      });

      return NextResponse.json({ success: true });
    }

    if (action === "saveTransactions") {
      const values = data.map(
        (tx: {
          id: string;
          date: string;
          description: string;
          type: string;
          amount: number;
          categoryId: string | null;
        }) => [
          tx.id,
          tx.date,
          tx.description,
          tx.type,
          tx.amount,
          tx.categoryId ?? "",
        ],
      );

      await sheets.spreadsheets.values.clear({
        spreadsheetId: SPREADSHEET_ID,
        range: "Lançamentos!A2:F1000",
      });

      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: "Lançamentos!A2:F",
        valueInputOption: "USER_ENTERED",
        requestBody: { values },
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  } catch (error) {
    console.error("Erro na API de gravação da planilha:", error);
    return NextResponse.json(
      { error: "Erro ao salvar dados no Google Sheets" },
      { status: 500 },
    );
  }
}
