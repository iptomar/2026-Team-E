import { Search, X } from 'lucide-react';
import React, { useState } from 'react';

// Definimos o que é um Template (ajusta as propriedades se necessário)
interface Template {
  id: number | string;
  nome: string;
}

interface SearchTemplatesProps {
  templates: Template[];
  onFilter: (filtered: Template[]) => void;
}

const SearchTemplates: React.FC<SearchTemplatesProps> = ({ templates, onFilter }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    // Filtra a lista original
    const filtered = templates.filter((t) =>
      t.nome.toLowerCase().includes(value.toLowerCase())
    );
    onFilter(filtered);
  };

  const toggleSearch = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    
    if (nextState === false) {
      setQuery("");
      onFilter(templates); // Reseta a lista ao fechar
    }
  };

  return (
    <div className="flex items-center gap-2">
      {isOpen && (
        <input
          type="text"
          placeholder="Pesquisar templates..."
          className="p-1 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          value={query}
          onChange={handleSearch}
          autoFocus
        />
      )}
      <button onClick={toggleSearch} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
        {isOpen ? <X size={20} /> : <Search size={20} />}
      </button>
    </div>
  );
};

export default SearchTemplates;
