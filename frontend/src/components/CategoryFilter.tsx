"use client";

import React from "react";
import { motion } from "framer-motion";
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
      case "Atom": return Atom;
      case "Calculator": return Calculator;
      case "Code2": return Code2;
      case "FlaskConical": return FlaskConical;
      case "Sparkles": return Sparkles;
      case "Dna": return Dna;
      default: return Compass;
    }
  };

  return (
    <div className="w-full overflow-x-auto pb-2 scrollbar-none">
      <div className="flex items-center gap-2.5 min-w-max p-1">
        {MOCK_CATEGORIES.map((cat) => {
          const Icon = getIcon(cat.icon);
          const isSelected = selectedCategory === cat.id;

          return (
            <motion.button
              key={cat.id}
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                isSelected
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30 border border-transparent"
                  : "bg-white text-slate-700 hover:text-purple-700 hover:bg-purple-50/70 border border-slate-200/90 shadow-2xs hover:shadow-xs"
              }`}
            >
              <Icon
                className={`w-4 h-4 transition-colors ${
                  isSelected ? "text-amber-300" : "text-slate-400 group-hover:text-purple-600"
                }`}
              />
              <span>{cat.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
