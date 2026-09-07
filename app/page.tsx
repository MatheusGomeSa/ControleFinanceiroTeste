"use client";

import React, { useState, useEffect } from "react";
import {
  Category,
  Transaction,
  TabOption,
  getTotalAllocatedPercentage,
} from "./utils/estrutura-dados";
import {
  calculateFinancialOverview,
  calculateMonthlyHistory,
} from "./lib/calculations";
import {
  getSheetData,
  syncCategories,
  addTransaction,
  syncTransactions,
} from "./services/sheetsService";

import { Tabs } from "./components/layout/Tabs";
import { CategorySlider } from "./components/settings/CategorySlider";
import { CategoryModal } from "./components/settings/CategoryModal";
import { TransactionList } from "./components/transactions/TransactionList";
import { TransactionModal } from "./components/transactions/TransactionModal";
import { SummaryCards } from "./components/dashboard/SummaryCards";
import { CategoryComparison } from "./components/dashboard/CategoryComparison";
import { HistoryView } from "./components/dashboard/HistoryView";
import { MonthSelector } from "./components/settings/MonthSelector";

export default function FinanceDashboard() {
  // Estado para controlar o mês de visualização (Padrão: Mês Atual "YYYY-MM")
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().substring(0, 7);
  });

  const [activeTab, setActiveTab] = useState<TabOption>("summary");
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Estados dos Modais
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

  // 1. Carregamento inicial direto da planilha Google Sheets
  useEffect(() => {
    async function loadInitialData() {
      setIsLoading(true);
      const data = await getSheetData();
      setCategories(data.categories);
      setTransactions(data.transactions);
      setIsLoading(false);
    }

    loadInitialData();
  }, []);

  // Handlers para Categorias
  const handleUpdatePercentage = async (id: string, newPercentage: number) => {
    const updatedCategories = categories.map((cat) =>
      cat.id === id ? { ...cat, percentage: newPercentage } : cat,
    );

    setCategories(updatedCategories);
    setIsSyncing(true);
    await syncCategories(updatedCategories);
    setIsSyncing(false);
  };

  const handleOpenCreateCategory = () => {
    setEditingCategory(null);
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (data: {
    id?: string;
    name: string;
    percentage: number;
    color: string;
  }) => {
    let updatedCategories: Category[];

    if (data.id) {
      updatedCategories = categories.map((cat) =>
        cat.id === data.id
          ? {
              ...cat,
              name: data.name,
              percentage: data.percentage,
              color: data.color,
            }
          : cat,
      );
    } else {
      const newCategory: Category = {
        id: `cat-${Date.now()}`,
        name: data.name,
        percentage: data.percentage,
        color: data.color,
      };
      updatedCategories = [...categories, newCategory];
    }

    setCategories(updatedCategories);
    setIsSyncing(true);
    await syncCategories(updatedCategories);
    setIsSyncing(false);
  };

  const handleRemoveCategory = async (id: string) => {
    const updatedCategories = categories.filter((cat) => cat.id !== id);
    setCategories(updatedCategories);
    setIsSyncing(true);
    await syncCategories(updatedCategories);
    setIsSyncing(false);
  };

  // Handlers para Lançamentos
  const handleAddTransaction = async (newTxData: {
    description: string;
    amount: number;
    type: "income" | "expense";
    categoryId: string | null;
    date: string;
  }) => {
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      ...newTxData,
    };

    setTransactions((prev) => [newTx, ...prev]);
    setIsSyncing(true);
    await addTransaction(newTx);
    setIsSyncing(false);
  };

  const handleRemoveTransaction = async (id: string) => {
    const updatedTransactions = transactions.filter((tx) => tx.id !== id);
    setTransactions(updatedTransactions);
    setIsSyncing(true);
    await syncTransactions(updatedTransactions);
    setIsSyncing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-500 gap-3">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium">Conectando ao Google Sheets...</p>
      </div>
    );
  }

  // Filtra os lançamentos do mês selecionado para o Resumo
  const filteredTransactions = transactions.filter((tx) =>
    tx.date.startsWith(selectedMonth),
  );
  const overview = calculateFinancialOverview(categories, filteredTransactions);
  const totalAllocated = getTotalAllocatedPercentage(categories);
  const availablePercentage = Math.max(0, 100 - totalAllocated);

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Controle Financeiro
            </h1>
            <p className="text-sm text-slate-500">
              Integrado ao Google Sheets em tempo real
            </p>
          </div>

          {/* Indicador de Sincronização */}
          {isSyncing && (
            <span className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full font-medium border border-blue-200 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              Sincronizando...
            </span>
          )}
        </header>

        {/* Navegação por Abas */}
        <Tabs activeTab={activeTab} onSelectTab={setActiveTab} />

        {/* ABA 1: CONFIGURAÇÃO */}
        {activeTab === "settings" && (
          <div className="flex flex-col gap-6">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <h2 className="font-bold text-slate-800">
                  Distribuição da Renda
                </h2>
                <p className="text-xs text-slate-500">
                  Defina o percentual planejado para cada categoria de gasto.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-xs font-semibold text-slate-400 block uppercase">
                    Total Distribuído
                  </span>
                  <span
                    className={`font-bold ${
                      totalAllocated === 100
                        ? "text-emerald-600"
                        : "text-amber-600"
                    }`}
                  >
                    {totalAllocated}% / 100%
                  </span>
                </div>
                <button
                  onClick={handleOpenCreateCategory}
                  className="px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  + Categoria
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {categories.map((category) => (
                <CategorySlider
                  key={category.id}
                  category={category}
                  categories={categories}
                  onUpdatePercentage={handleUpdatePercentage}
                  onEditCategory={handleOpenEditCategory}
                  onRemoveCategory={handleRemoveCategory}
                />
              ))}
            </div>

            <CategoryModal
              key={editingCategory ? editingCategory.id : "new-category-modal"}
              isOpen={isCategoryModalOpen}
              onClose={() => setIsCategoryModalOpen(false)}
              categoryToEdit={editingCategory}
              onSaveCategory={handleSaveCategory}
              maxAvailablePercentage={availablePercentage}
            />
          </div>
        )}

        {/* ABA 2: LANÇAMENTOS */}
        {activeTab === "transactions" && (
          <div>
            <TransactionList
              transactions={transactions}
              categories={categories}
              onRemoveTransaction={handleRemoveTransaction}
              onOpenModal={() => setIsTransactionModalOpen(true)}
            />

            <TransactionModal
              isOpen={isTransactionModalOpen}
              onClose={() => setIsTransactionModalOpen(false)}
              categories={categories}
              onAddTransaction={handleAddTransaction}
            />
          </div>
        )}

        {/* ABA 3: RESUMO COM FILTRO DE MÊS */}
        {activeTab === "summary" && (
          <div>
            {/* Seletor de Período */}
            <MonthSelector
              selectedMonth={selectedMonth}
              onChangeMonth={setSelectedMonth}
            />

            <SummaryCards
              totalIncome={overview.totalIncome}
              totalExpenses={overview.totalExpenses}
              balance={overview.balance}
            />

            <CategoryComparison summaries={overview.categoriesSummary} />
          </div>
        )}

        {/* ABA 4: HISTÓRICO */}
        {activeTab === "history" && (
          <HistoryView
            history={calculateMonthlyHistory(transactions, categories)}
            categories={categories}
          />
        )}
      </div>
    </main>
  );
}
