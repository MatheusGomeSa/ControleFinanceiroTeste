import {
  Category,
  Transaction,
  FinancialOverview,
  CategorySummary,
  MonthlyHistory,
} from "../utils/estrutura-dados";

/**
 * Consolida o panorama financeiro geral e os desvios por categoria.
 */
export function calculateFinancialOverview(
  categories: Category[],
  transactions: Transaction[],
): FinancialOverview {
  // 1. Calcula os totais de Receita e Despesa
  const totalIncome = transactions
    .filter((tx) => tx.type === "income")
    .reduce((acc, tx) => acc + tx.amount, 0);

  const totalExpenses = transactions
    .filter((tx) => tx.type === "expense")
    .reduce((acc, tx) => acc + tx.amount, 0);

  const balance = totalIncome - totalExpenses;

  // 2. Porcentagens da distribuição geral
  const allocatedPercentage = categories.reduce(
    (acc, cat) => acc + cat.percentage,
    0,
  );
  const availablePercentage = Math.max(0, 100 - allocatedPercentage);

  // 3. Mapeia o resumo individual para cada categoria
  const categoriesSummary: CategorySummary[] = categories.map((category) => {
    // Soma de todas as despesas vinculadas a esta categoria
    const actualAmount = transactions
      .filter((tx) => tx.type === "expense" && tx.categoryId === category.id)
      .reduce((sum, tx) => sum + tx.amount, 0);

    // Valor planejado em Reais (com base no % definido e na renda total)
    const plannedAmount = (totalIncome * category.percentage) / 100;

    // Percentual real consumido frente à renda total
    const actualPercentage =
      totalIncome > 0 ? (actualAmount / totalIncome) * 100 : 0;

    // Desvios (% e R$)
    const percentageDeviation = actualPercentage - category.percentage;
    const amountDeviation = actualAmount - plannedAmount;

    return {
      category,
      plannedPercentage: category.percentage,
      plannedAmount,
      actualAmount,
      actualPercentage,
      percentageDeviation,
      amountDeviation,
    };
  });

  return {
    totalIncome,
    totalExpenses,
    balance,
    allocatedPercentage,
    availablePercentage,
    categoriesSummary,
  };
}

export function calculateMonthlyHistory(
  transactions: Transaction[],
  categories: Category[],
): MonthlyHistory[] {
  const historyMap = new Map<string, MonthlyHistory>();

  transactions.forEach((tx) => {
    // Extrai "YYYY-MM" do campo date ("2026-09-05")
    const monthKey = tx.date.substring(0, 7);

    if (!historyMap.has(monthKey)) {
      const [year, month] = monthKey.split("-");
      const dateObj = new Date(Number(year), Number(month) - 1, 1);
      const monthLabel = dateObj.toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
      });

      // Capitaliza a primeira letra do mês
      const formattedLabel =
        monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);

      const initialCategoryMap: Record<string, number> = {};
      categories.forEach((cat) => {
        initialCategoryMap[cat.id] = 0;
      });

      historyMap.set(monthKey, {
        monthKey,
        monthLabel: formattedLabel,
        totalIncome: 0,
        totalExpenses: 0,
        balance: 0,
        expensesByCategory: initialCategoryMap,
      });
    }

    const item = historyMap.get(monthKey)!;

    if (tx.type === "income") {
      item.totalIncome += tx.amount;
    } else {
      item.totalExpenses += tx.amount;
      if (tx.categoryId) {
        item.expensesByCategory[tx.categoryId] =
          (item.expensesByCategory[tx.categoryId] || 0) + tx.amount;
      }
    }

    item.balance = item.totalIncome - item.totalExpenses;
  });

  // Retorna ordenado do mês mais recente para o mais antigo
  return Array.from(historyMap.values()).sort((a, b) =>
    b.monthKey.localeCompare(a.monthKey),
  );
}
