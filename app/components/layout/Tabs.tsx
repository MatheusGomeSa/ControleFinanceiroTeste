import React from "react";
import { TabOption } from "../../utils/estrutura-dados";

interface TabsProps {
  activeTab: TabOption;
  onSelectTab: (tab: TabOption) => void;
}

export const Tabs: React.FC<TabsProps> = ({ activeTab, onSelectTab }) => {
  const tabs: { id: TabOption; label: string }[] = [
    { id: "settings", label: "Configuração" },
    { id: "transactions", label: "Lançamentos" },
    { id: "summary", label: "Resumo" },
    { id: "history", label: "Histórico" },
  ];

  return (
    <nav className="flex border-b border-slate-200 mb-6 bg-slate-50 p-1 rounded-lg">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`flex-1 py-2 px-4 text-center font-medium text-sm rounded-md transition-all ${
              isActive
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
};
