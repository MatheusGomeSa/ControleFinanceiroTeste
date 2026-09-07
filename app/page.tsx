"use client";

import React, { useState, useEffect } from "react";
import {
  Category,
  Transaction,
  TabOption,
  INITIAL_CATEGORIES,
  INITIAL_TRANSACTIONS,
  getTotalAllocatedPercentage,
} from "./utils/estrutura-dados";
import { calculateFinancialOverview } from "./lib/calculations";
import { Tabs } from "./components/layout/Tabs";
import { CategorySlider } from "./components/settings/CategorySlider";
import { CategoryModal } from "./components/settings/CategoryModal";
import { TransactionList } from "./components/transactions/TransactionList";
import { TransactionModal } from "./components/transactions/TransactionModal";
import { SummaryCards } from "./components/dashboard/SummaryCards";
import { CategoryComparison } from "./components/dashboard/CategoryComparison";

export default function FinanceDashboard() {
  const [activeTab, setActiveTab] = useState<TabOption>("summary");

  // 1. Inicialização do estado via Lazy Initializer (evita setState síncrono dentro de useEffect)
  const [categories, setCategories] = useState<Category[]>(() => {
    if (typeof window === "undefined") return INITIAL_CATEGORIES;
    const saved = localStorage.getItem("@finance:categories");
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    if (typeof window === "undefined") return INITIAL_TRANSACTIONS;
    const saved = localStorage.getItem("@finance:transactions");
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const handleOpenCreateCategory = () => {
    setEditingCategory(null);
    setIsCategoryModalOpen(true);
  };

  // 2. Efeitos apenas para persistir dados (sincronizar estado React -> localStorage)
  useEffect(() => {
    localStorage.setItem("@finance:categories", JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem("@finance:transactions", JSON.stringify(transactions));
  }, [transactions]);

  // Modais
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

  // Handlers para Categorias
  const handleUpdatePercentage = (id: string, newPercentage: number) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === id ? { ...cat, percentage: newPercentage } : cat,
      ),
    );
  };
  const handleOpenEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = (data: {
    id?: string;
    name: string;
    percentage: number;
    color: string;
  }) => {
    if (data.id) {
      // Modo Edição
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === data.id
            ? {
                ...cat,
                name: data.name,
                percentage: data.percentage,
                color: data.color,
              }
            : cat,
        ),
      );
    } else {
      // Modo Criação
      const newCategory: Category = {
        id: `cat-${Date.now()}`,
        name: data.name,
        percentage: data.percentage,
        color: data.color,
      };
      setCategories((prev) => [...prev, newCategory]);
    }
  };

  const handleAddCategory = (
    name: string,
    initialPercentage: number,
    color: string,
  ) => {
    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      name,
      percentage: initialPercentage,
      color,
    };
    setCategories((prev) => [...prev, newCategory]);
  };

  const handleRemoveCategory = (id: string) => {
    setCategories((prev) => prev.filter((cat) => cat.id !== id));
  };

  // Handlers para Lançamentos
  const handleAddTransaction = (newTxData: {
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
  };

  const handleRemoveTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
  };

  const overview = calculateFinancialOverview(categories, transactions);
  const totalAllocated = getTotalAllocatedPercentage(categories);
  const availablePercentage = Math.max(0, 100 - totalAllocated);

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">
            Controle Financeiro
          </h1>
          <p className="text-sm text-slate-500">
            Planejamento percentual de orçamento e controle de desvios
          </p>
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

        {/* ABA 3: RESUMO */}
        {activeTab === "summary" && (
          <div>
            <SummaryCards
              totalIncome={overview.totalIncome}
              totalExpenses={overview.totalExpenses}
              balance={overview.balance}
            />
            <CategoryComparison summaries={overview.categoriesSummary} />
          </div>
        )}
      </div>
    </main>
  );
}
