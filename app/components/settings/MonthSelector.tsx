import React from "react";

interface MonthSelectorProps {
  selectedMonth: string; // Formato "YYYY-MM"
  onChangeMonth: (month: string) => void;
}

export const MonthSelector: React.FC<MonthSelectorProps> = ({
  selectedMonth,
  onChangeMonth,
}) => {
  const [year, month] = selectedMonth.split("-");
  const currentDate = new Date(Number(year), Number(month) - 1, 1);

  const handlePrevMonth = () => {
    const prev = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      1,
    );
    const newKey = prev.toISOString().substring(0, 7);
    onChangeMonth(newKey);
  };

  const handleNextMonth = () => {
    const next = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      1,
    );
    const newKey = next.toISOString().substring(0, 7);
    onChangeMonth(newKey);
  };

  const formattedLabel = currentDate.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-3 shadow-sm mb-6">
      <button
        onClick={handlePrevMonth}
        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 font-bold transition-colors"
      >
        ◀ Mês anterior
      </button>

      <div className="flex items-center gap-2">
        <span className="font-bold text-slate-800 capitalize">
          {formattedLabel}
        </span>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => e.target.value && onChangeMonth(e.target.value)}
          className="border border-slate-300 rounded-md text-xs p-1 text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
        />
      </div>

      <button
        onClick={handleNextMonth}
        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 font-bold transition-colors"
      >
        Próximo mês ▶
      </button>
    </div>
  );
};
