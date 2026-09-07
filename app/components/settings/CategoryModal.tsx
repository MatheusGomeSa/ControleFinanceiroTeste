import React, { useState } from "react";
import { Category } from "../../utils/estrutura-dados";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryToEdit?: Category | null;
  onSaveCategory: (data: {
    id?: string;
    name: string;
    percentage: number;
    color: string;
  }) => void;
  maxAvailablePercentage: number;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  categoryToEdit,
  onSaveCategory,
  maxAvailablePercentage,
}) => {
  // Inicializa o estado diretamente a partir das props
  const [name, setName] = useState(categoryToEdit?.name ?? "");
  const [percentage, setPercentage] = useState(categoryToEdit?.percentage ?? 0);
  const [color, setColor] = useState(categoryToEdit?.color ?? "#3b82f6");

  if (!isOpen) return null;

  // Se estiver editando, o limite máximo inclui a porcentagem atual da categoria
  const currentMax = categoryToEdit
    ? maxAvailablePercentage + categoryToEdit.percentage
    : maxAvailablePercentage;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSaveCategory({
      id: categoryToEdit?.id,
      name,
      percentage: Number(percentage),
      color,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl border border-slate-100">
        <h2 className="text-lg font-bold text-slate-800 mb-4">
          {categoryToEdit ? "Editar Categoria" : "Nova Categoria"}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nome
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Alimentação"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Percentual inicial (%)
            </label>
            <input
              type="number"
              min={0}
              max={currentMax}
              value={percentage}
              onChange={(e) => setPercentage(Number(e.target.value))}
              className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-xs text-slate-400 mt-1 block">
              Máximo disponível: {currentMax}%
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Cor de identificação
            </label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-12 h-10 border border-slate-300 rounded cursor-pointer p-1"
            />
          </div>

          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
