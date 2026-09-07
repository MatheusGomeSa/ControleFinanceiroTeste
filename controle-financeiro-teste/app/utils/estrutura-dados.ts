// ==========================================
// 1. TIPOS FUNDAMENTAIS DE DADOS
// ==========================================

export type TransactionType = "income" | "expense";

export interface Category {
  id: string;
  name: string;
  percentage: number; // Percentual planejado (0 a 100)
  color: string; // Cor em formato hex ou classe CSS para a UI
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  categoryId: string | null; // Nulo se for do tipo 'income' ou despesa sem categoria
  date: string; // Formato YYYY-MM-DD
}

export type TabOption = "settings" | "transactions" | "summary";

// ==========================================
// 2. ESTRUTURAS AUXILIARES DO RESUMO / DASHBOARD
// ==========================================

export interface CategorySummary {
  category: Category;
  plannedPercentage: number; // Ex: 40%
  plannedAmount: number; // Ex: R$ 3.200,00 (baseado na renda total)
  actualAmount: number; // Ex: R$ 3.600,00 (soma real das despesas da categoria)
  actualPercentage: number; // Ex: 45% (actualAmount / totalIncome)
  percentageDeviation: number; // Ex: +5% (actualPercentage - plannedPercentage)
  amountDeviation: number; // Ex: +R$ 400,00 (actualAmount - plannedAmount)
}

export interface FinancialOverview {
  totalIncome: number; // Soma de todos os lançamentos do tipo 'income'
  totalExpenses: number; // Soma de todos os lançamentos do tipo 'expense'
  balance: number; // totalIncome - totalExpenses
  allocatedPercentage: number; // Soma dos % de todas as categorias criadas
  availablePercentage: number; // 100 - allocatedPercentage
  categoriesSummary: CategorySummary[];
}

// ==========================================
// 3. ESTADO INICIAL DO PROJETO (MOCK DATA)
// ==========================================

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: "fixed",
    name: "Gastos fixos",
    percentage: 40,
    color: "#ef4444",
  },
  {
    id: "food",
    name: "Alimentação",
    percentage: 20,
    color: "#f59e0b",
  },
  {
    id: "investment",
    name: "Investimentos",
    percentage: 30,
    color: "#22c55e",
  },
  {
    id: "leisure",
    name: "Lazer",
    percentage: 10,
    color: "#8b5cf6",
  },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: "tx-1",
    description: "Salário",
    amount: 8000.0,
    type: "income",
    categoryId: null,
    date: "2026-09-01",
  },
  {
    id: "tx-2",
    description: "Aluguel",
    amount: 2000.0,
    type: "expense",
    categoryId: "fixed",
    date: "2026-09-02",
  },
  {
    id: "tx-3",
    description: "Mercado",
    amount: 850.0,
    type: "expense",
    categoryId: "food",
    date: "2026-09-03",
  },
  {
    id: "tx-4",
    description: "Netflix",
    amount: 50.0,
    type: "expense",
    categoryId: "leisure",
    date: "2026-09-05",
  },
  {
    id: "tx-5",
    description: "Ações",
    amount: 500.0,
    type: "expense",
    categoryId: "investment",
    date: "2026-09-06",
  },
];

// ==========================================
// 4. FUNÇÕES UTILITÁRIAS PARA REGRAS DE NEGÓCIO
// ==========================================

/**
 * Calcula o percentual máximo que um slider de determinada categoria pode atingir.
 * Regra: max = 100 - soma das outras categorias.
 */
export function getMaxCategoryPercentage(
  categories: Category[],
  currentCategoryId: string,
): number {
  const otherCategoriesTotal = categories
    .filter((cat) => cat.id !== currentCategoryId)
    .reduce((sum, cat) => sum + cat.percentage, 0);

  return Math.max(0, 100 - otherCategoriesTotal);
}

/**
 * Calcula a soma total dos percentuais alocados.
 */
export function getTotalAllocatedPercentage(categories: Category[]): number {
  return categories.reduce((total, cat) => total + cat.percentage, 0);
}
