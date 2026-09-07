import React from "react";
import { Category, MonthlyHistory } from "../../utils/estrutura-dados";
import { HistoryChart } from "../layout/HistoryChart";

interface HistoryViewProps {
  history: MonthlyHistory[];
  categories: Category[];
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  categories,
}) => {
  const formatCurrency = (val: number) =>
    val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  if (history.length === 0) {
    return (
      <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-400 text-sm">
        Nenhum histórico disponível. Adicione lançamentos para visualizar a
        evolução mensal.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Gráficos de Evolução no Topo */}
      <HistoryChart history={history} categories={categories} />
      {history.map((item) => {
        const isOverBudget = item.totalExpenses > item.totalIncome;
        const hasIncome = item.totalIncome > 0;

        // Base 100%: Renda total ou Total de Saídas (se estourado ou sem renda)
        const baseAmount =
          hasIncome && !isOverBudget ? item.totalIncome : item.totalExpenses;

        // Filtra apenas categorias que possuem gastos no mês
        const activeCategories = categories
          .map((cat) => ({
            ...cat,
            spentAmount: item.expensesByCategory[cat.id] || 0,
            percentage:
              baseAmount > 0
                ? ((item.expensesByCategory[cat.id] || 0) / baseAmount) * 100
                : 0,
          }))
          .filter((cat) => cat.spentAmount > 0);

        const totalSpentPercentage =
          baseAmount > 0 ? (item.totalExpenses / baseAmount) * 100 : 0;

        return (
          <div
            key={item.monthKey}
            className={`bg-white rounded-xl border p-6 shadow-sm flex flex-col gap-5 transition-all ${
              isOverBudget
                ? "border-rose-300 ring-2 ring-rose-500/10"
                : "border-slate-200"
            }`}
          >
            {/* Cabeçalho do Mês e Resumo Financeiro */}
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-4 gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  {item.monthLabel}
                </h3>
                {isOverBudget && (
                  <span className="text-xs font-semibold text-rose-600 flex items-center gap-1 mt-0.5">
                    ⚠️ Atenção: Saídas excederam a renda total do mês!
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
                <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                  Entradas: {formatCurrency(item.totalIncome)}
                </span>
                <span
                  className={`px-2.5 py-1 rounded-md border ${
                    isOverBudget
                      ? "text-rose-700 bg-rose-50 border-rose-200 font-bold"
                      : "text-slate-700 bg-slate-50 border-slate-200"
                  }`}
                >
                  Saídas: {formatCurrency(item.totalExpenses)}
                </span>
                <span
                  className={`px-2.5 py-1 rounded-md font-bold ${
                    item.balance >= 0
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-rose-100 text-rose-800"
                  }`}
                >
                  Saldo: {formatCurrency(item.balance)}
                </span>
              </div>
            </div>

            {/* Bloco idêntico à imagem enviada */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                GASTOS POR TAG{" "}
                {isOverBudget || !hasIncome
                  ? "(BASEADO NO TOTAL DE SAÍDAS)"
                  : "(BASEADO NA RENDA)"}
              </span>

              {/* Linha de Legendas e Valor Total */}
              <div className="flex justify-between items-center text-sm">
                <div className="flex flex-wrap items-center gap-6">
                  {activeCategories.length === 0 ? (
                    <span className="text-slate-400 text-xs">
                      Sem despesas registradas
                    </span>
                  ) : (
                    activeCategories.map((cat) => (
                      <span
                        key={cat.id}
                        className="flex items-center gap-2 text-slate-800 font-medium text-xs md:text-sm"
                      >
                        <span
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: cat.color }}
                        />
                        {cat.name}
                      </span>
                    ))
                  )}
                </div>

                <div className="text-right font-bold text-slate-900 text-base flex items-center gap-1">
                  <span>{formatCurrency(item.totalExpenses)}</span>
                  <span className="text-slate-500 font-normal text-xs md:text-sm">
                    ({totalSpentPercentage.toFixed(1)}%)
                  </span>
                </div>
              </div>

              {/* Barra Única Empilhada Segmentada */}
              <div className="w-full bg-slate-100/80 rounded-full h-3.5 flex overflow-hidden p-0.5">
                {activeCategories.map((cat) => (
                  <div
                    key={cat.id}
                    className="h-full transition-all duration-500 first:rounded-l-full last:rounded-r-full"
                    style={{
                      width: `${cat.percentage}%`,
                      backgroundColor: cat.color,
                    }}
                    title={`${cat.name}: ${formatCurrency(cat.spentAmount)} (${cat.percentage.toFixed(1)}%)`}
                  />
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
