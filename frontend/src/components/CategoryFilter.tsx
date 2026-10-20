"use client";

import React from "react";
import { Compass, Atom, Calculator, Code2, FlaskConical, Sparkles, Dna } from "lucide-react";
import { MOCK_CATEGORIES } from "../data/mockCompetitions";

interface CategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Atom":
        return Atom;
      case "Calculator":
        return Calculator;
      case "Code2":
        return Code2;
      case "FlaskConical":
        return FlaskConical;
      case "Sparkles":
        return Sparkles;
      case "Dna":
        return Dna;
      default:
        return Compass;
    }
  };

  return (
    <div className="w-full overflow-x-auto pb-2 scrollbar-none">
      <div className="flex items-center gap-2.5 min-w-max">
        {MOCK_CATEGORIES.map((cat) => {
          const Icon = getIcon(cat.icon);
          const isSelected = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                isSelected
                  ? "bg-purple-600 text-white shadow-md shadow-purple-600/25 scale-[1.02]"
                  : "bg-white text-gray-700 border border-gray-200/90 hover:border-purple-200 hover:bg-purple-50/50"
              }`}
            >
              <Icon className={`w-4 h-4 ${isSelected ? "text-amber-300" : "text-gray-400"}`} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
