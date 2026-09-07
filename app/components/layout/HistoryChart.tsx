"use client";

import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { Category, MonthlyHistory } from "../../utils/estrutura-dados";

interface HistoryChartProps {
  history: MonthlyHistory[];
  categories: Category[];
}

export const HistoryChart: React.FC<HistoryChartProps> = ({
  history,
  categories,
}) => {
  if (history.length === 0) return null;

  // Reordena do mês mais antigo para o mais recente para a linha do tempo do gráfico
  const chartData = [...history].reverse().map((item) => {
    const dataPoint: Record<string, string | number> = {
      month: item.monthLabel,
      Receita: item.totalIncome,
      Despesas: item.totalExpenses,
      Saldo: item.balance,
    };

    // Adiciona o valor de cada categoria como uma propriedade dinâmica
    categories.forEach((cat) => {
      dataPoint[cat.name] = item.expensesByCategory[cat.id] || 0;
    });

    return dataPoint;
  });

  const formatCurrency = (value: number) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="flex flex-col gap-8 mb-8">
      {/* 1. Gráfico de Evolução Geral (Receita vs Despesas vs Saldo) */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-4">
        <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
          Evolução do Balanço Geral
        </h3>
        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
              <YAxis
                stroke="#64748b"
                fontSize={12}
                tickFormatter={(v) => `R$ ${v}`}
              />
              <Tooltip
                formatter={(value, name) => [
                  typeof value === "number" ? formatCurrency(value) : "R$ 0,00",
                  String(name ?? ""),
                ]}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="Receita"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="Despesas"
                stroke="#f43f5e"
                strokeWidth={2.5}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="Saldo"
                stroke="#3b82f6"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Gráfico de Evolução de Gastos por Categoria */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-4">
        <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
          Evolução dos Gastos por Tag
        </h3>
        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
              <YAxis
                stroke="#64748b"
                fontSize={12}
                tickFormatter={(v) => `R$ ${v}`}
              />
              <Tooltip
                formatter={(value, name) => [
                  typeof value === "number" ? formatCurrency(value) : "R$ 0,00",
                  String(name ?? ""),
                ]}
              />
              <Legend />
              {categories.map((cat) => (
                <Area
                  key={cat.id}
                  type="monotone"
                  dataKey={cat.name}
                  stackId="1"
                  stroke={cat.color}
                  fill={cat.color}
                  fillOpacity={0.6}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
