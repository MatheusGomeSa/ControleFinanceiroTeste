import React, { useState } from "react";
import {
  Category,
  getMaxCategoryPercentage,
} from "../../utils/estrutura-dados";

interface CategorySliderProps {
  category: Category;
  categories: Category[];
  onUpdatePercentage: (id: string, newPercentage: number) => void;
  onEditCategory: (category: Category) => void;
  onRemoveCategory: (id: string) => void;
}

export const CategorySlider: React.FC<CategorySliderProps> = ({
  category,
  categories,
  onUpdatePercentage,
  onEditCategory,
  onRemoveCategory,
}) => {
  const [isBouncing, setIsBouncing] = useState(false);
  const maxAllowed = getMaxCategoryPercentage(categories, category.id);

  const triggerLimitAlert = () => {
    setIsBouncing(true);
    setTimeout(() => {
      setIsBouncing(false);
    }, 400);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const requestedValue = Number(e.target.value);

    // Se tentar ultrapassar o limite disponível
    if (requestedValue > maxAllowed) {
      onUpdatePercentage(category.id, maxAllowed);
      triggerLimitAlert();
    } else {
      onUpdatePercentage(category.id, requestedValue);
    }
  };

  return (
    <div
      className={`flex flex-col gap-2 p-4 bg-white rounded-lg border transition-all duration-200 shadow-sm ${
        isBouncing
          ? "border-red-500 ring-2 ring-red-500/20 scale-[1.01]"
          : "border-slate-200"
      }`}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span
            className="w-3.5 h-3.5 rounded-full border border-black/10"
            style={{ backgroundColor: category.color }}
          />
          <span className="font-semibold text-slate-800">{category.name}</span>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`font-bold transition-colors ${
              isBouncing ? "text-red-600 scale-110" : "text-slate-700"
            }`}
          >
            {category.percentage}%
          </span>
          <button
            onClick={() => onEditCategory(category)}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            Editar
          </button>
          <button
            onClick={() => onRemoveCategory(category.id)}
            className="text-xs text-red-500 hover:text-red-700 font-medium"
          >
            Remover
          </button>
        </div>
      </div>

      {/* Slider com preenchimento linear dinâmico */}
      <input
        type="range"
        min={0}
        max={100}
        value={category.percentage}
        onChange={handleChange}
        style={{
          accentColor: category.color,
          background: `linear-gradient(to right, ${category.color} 0%, ${category.color} ${category.percentage}%, #f1f5f9 ${category.percentage}%, #f1f5f9 100%)`,
        }}
        className={`w-full cursor-pointer h-2.5 rounded-lg appearance-none transition-all ${
          isBouncing ? "accent-red-500" : ""
        }`}
      />

      <div className="flex justify-between text-xs">
        <span className="text-slate-400">0%</span>
        <span
          className={isBouncing ? "text-red-600 font-bold" : "text-slate-400"}
        >
          Limite disponível:{" "}
          <strong className={isBouncing ? "text-red-600" : "text-slate-600"}>
            {maxAllowed}%
          </strong>
        </span>
      </div>
    </div>
  );
};
