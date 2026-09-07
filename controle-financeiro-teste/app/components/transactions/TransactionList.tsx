import React from "react";
import { Transaction, Category } from "../../utils/estrutura-dados";

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  onRemoveTransaction: (id: string) => void;
  onOpenModal: () => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  categories,
  onRemoveTransaction,
  onOpenModal,
}) => {
  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return "—";
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : "Desconhecida";
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-slate-800">Lançamentos</h2>
        <button
          onClick={onOpenModal}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          + Novo lançamento
        </button>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
        {transactions.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            Nenhum lançamento registrado.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="p-3">Descrição</th>
                  <th className="p-3">Tipo</th>
                  <th className="p-3">Categoria</th>
                  <th className="p-3">Data</th>
                  <th className="p-3 text-right">Valor</th>
                  <th className="p-3 text-center">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((tx) => {
                  const isIncome = tx.type === "income";
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-medium text-slate-800">
                        {tx.description}
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-block px-2 py-0.5 text-xs rounded-full font-medium ${
                            isIncome
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {isIncome ? "Receita" : "Despesa"}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600">
                        {isIncome ? "—" : getCategoryName(tx.categoryId)}
                      </td>
                      <td className="p-3 text-slate-500">{tx.date}</td>
                      <td
                        className={`p-3 text-right font-bold ${
                          isIncome ? "text-emerald-600" : "text-slate-800"
                        }`}
                      >
                        {isIncome ? "+" : "-"} R${" "}
                        {tx.amount.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => onRemoveTransaction(tx.id)}
                          className="text-xs text-red-500 hover:text-red-700 font-medium"
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
