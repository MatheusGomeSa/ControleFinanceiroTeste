import React from "react";
import { CategorySummary } from "../../utils/estrutura-dados";

interface CategoryComparisonProps {
  summaries: CategorySummary[];
}

export const CategoryComparison: React.FC<CategoryComparisonProps> = ({
  summaries,
}) => {
  const formatCurrency = (val: number) =>
    val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="flex flex-col gap-6">
      {/* Tabela de Comparação */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h3 className="font-bold text-slate-800">Distribuição da Renda</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="p-3">Categoria</th>
                <th className="p-3 text-center">Planejado (%)</th>
                <th className="p-3 text-center">Real (%)</th>
                <th className="p-3 text-right">Planejado (R$)</th>
                <th className="p-3 text-right">Real (R$)</th>
                <th className="p-3 text-center">Desvio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {summaries.map((item) => {
                const isOverBudget = item.percentageDeviation > 0;
                return (
                  <tr key={item.category.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-medium text-slate-800 flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.category.color }}
                      />
                      {item.category.name}
                    </td>
                    <td className="p-3 text-center font-medium text-slate-600">
                      {item.plannedPercentage}%
                    </td>
                    <td className="p-3 text-center font-semibold text-slate-800">
                      {item.actualPercentage.toFixed(1)}%
                    </td>
                    <td className="p-3 text-right text-slate-600">
                      {formatCurrency(item.plannedAmount)}
                    </td>
                    <td className="p-3 text-right font-semibold text-slate-800">
                      {formatCurrency(item.actualAmount)}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                          isOverBudget
                            ? "bg-rose-100 text-rose-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {isOverBudget ? "🔴 +" : "🟢 "}
                        {item.percentageDeviation.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Gráfico Visual de Barras */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col gap-6">
        <h3 className="font-bold text-slate-800">Comparativo Visual</h3>
        {summaries.map((item) => {
          const plannedWidth = Math.min(100, item.plannedPercentage);
          const actualWidth = Math.min(100, item.actualPercentage);

          return (
            <div key={item.category.id} className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-sm font-semibold">
                <span className="text-slate-800">{item.category.name}</span>
                <span
                  className={
                    item.percentageDeviation > 0
                      ? "text-rose-600"
                      : "text-emerald-600"
                  }
                >
                  {item.percentageDeviation > 0 ? "+" : ""}
                  {item.percentageDeviation.toFixed(1)}%
                </span>
              </div>

              {/* Barra Planejada */}
              <div className="flex flex-col gap-1">
                <span className="text-xs text-slate-400">
                  Planejado ({item.plannedPercentage}%)
                </span>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full transition-all duration-300 opacity-60"
                    style={{
                      width: `${plannedWidth}%`,
                      backgroundColor: item.category.color,
                    }}
                  />
                </div>
              </div>

              {/* Barra Realizada */}
              <div className="flex flex-col gap-1">
                <span className="text-xs text-slate-400">
                  Real ({item.actualPercentage.toFixed(1)}%)
                </span>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${actualWidth}%`,
                      backgroundColor: item.category.color,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
