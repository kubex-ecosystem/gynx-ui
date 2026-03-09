import { Plus } from "lucide-react";
import { Idea, Ideas } from "@/types";
import * as React from "react";

interface Theme {
  [key: string]: string;
}

interface IdeasInputProps {
  currentInput: Ideas;
  setCurrentInput: (
    value: Ideas,
  ) => void;
  addIdea: (ideas: Ideas) => void;
  currentTheme: Theme;
}

const IdeasInput: React.FC<IdeasInputProps> = ({
  currentInput,
  setCurrentInput,
  addIdea,
  currentTheme,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && e.ctrlKey) {
      addIdea(currentInput);
    }
  };

  return (
    <div id="ideas-input">
      <h2 className="text-xl font-semibold mb-4 text-white">
        Adicionar Ideias
      </h2>
      <div className="space-y-4">
        {currentInput.map((idea) => (
          <textarea
            key={idea.id}
            value={idea.text}
            onChange={(e) => setCurrentInput([idea])}
            placeholder="Cole suas notas, ideias brutas ou pensamentos desorganizados aqui..."
            className="w-full h-32 px-4 py-3 rounded-lg border border-gray-600 bg-gray-700/80 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none transition-colors"
            onKeyDown={handleKeyDown}
          />
        ))}
        <button
          onClick={() => addIdea(currentInput)}
          disabled={!currentInput.length}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 hover:from-purple-700 hover:to-blue-600"
        >
          <Plus size={20} />
          Incluir (Ctrl + Enter)
        </button>
      </div>
    </div>
  );
};

export default IdeasInput;
