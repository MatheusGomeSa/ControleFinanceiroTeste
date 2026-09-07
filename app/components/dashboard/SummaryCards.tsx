import React from "react";

interface SummaryCardsProps {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  totalIncome,
  totalExpenses,
  balance,
}) => {
  const formatCurrency = (val: number) =>
    val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Renda Total
        </span>
        <p className="text-2xl font-bold text-emerald-600 mt-1">
          {formatCurrency(totalIncome)}
        </p>
      </div>

      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Despesas Totais
        </span>
        <p className="text-2xl font-bold text-rose-600 mt-1">
          {formatCurrency(totalExpenses)}
        </p>
      </div>

      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Saldo Restante
        </span>
        <p
          className={`text-2xl font-bold mt-1 ${
            balance >= 0 ? "text-slate-800" : "text-rose-600"
          }`}
        >
          {formatCurrency(balance)}
        </p>
      </div>
    </div>
  );
};
