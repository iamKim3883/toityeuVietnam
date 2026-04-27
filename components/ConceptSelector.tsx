import React from 'react';
import { CONCEPTS } from '../constants';
import { Star } from 'lucide-react';

interface ConceptSelectorProps {
  selectedConcept: string | null;
  onSelectConcept: (conceptKey: string) => void;
}

const ConceptSelector: React.FC<ConceptSelectorProps> = ({ selectedConcept, onSelectConcept }) => {
  // Group concepts by category
  const categorizedConcepts = CONCEPTS.reduce((acc, concept) => {
    const cat = concept.category || 'Khác';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(concept);
    return acc;
  }, {} as Record<string, typeof CONCEPTS>);

  return (
    <div className="text-white">
      <h2 className="text-lg font-bold text-yellow-400 mb-6 flex items-center gap-3 uppercase tracking-tighter">
        <Star className="w-5 h-5 fill-yellow-400" />
        Lựa chọn bản sắc
      </h2>
      
      <div className="space-y-8 max-h-[500px] overflow-y-auto pr-3 custom-scrollbar px-1">
        {Object.entries(categorizedConcepts).map(([category, concepts]) => (
          <div key={category} className="space-y-3">
            <h3 className="text-xs font-black text-yellow-500/50 uppercase tracking-[0.25em] pl-1 flex items-center gap-2">
              <span className="w-1 h-1 bg-yellow-500/50 rounded-full"></span>
              {category}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {concepts.map((concept) => (
                <button
                  key={concept.key}
                  onClick={() => onSelectConcept(concept.key)}
                  className={`px-3 py-3 text-[11px] font-bold rounded-xl border transition-all duration-300 transform active:scale-95 text-left leading-tight h-full flex items-center
                    ${selectedConcept === concept.key 
                      ? 'bg-yellow-400 border-yellow-400 text-red-900 shadow-lg shadow-yellow-500/20 z-10' 
                      : 'bg-red-950/30 border-yellow-500/5 text-yellow-200/60 hover:bg-red-800/40 hover:border-yellow-500/20'
                    }`}
                >
                  {concept.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConceptSelector;