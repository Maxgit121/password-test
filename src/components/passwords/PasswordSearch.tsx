import React, { useState } from 'react';
import { Search, X, Filter } from 'lucide-react';

interface PasswordSearchProps {
  onSearch: (query: string) => void;
  onFilter: (category: string) => void;
  categories: string[];
}

const PasswordSearch: React.FC<PasswordSearchProps> = ({ 
  onSearch, 
  onFilter,
  categories 
}) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilter, setShowFilter] = useState(false);
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };
  
  const clearSearch = () => {
    setQuery('');
    onSearch('');
  };
  
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    onFilter(category);
    setShowFilter(false);
  };
  
  return (
    <div className="mb-6 relative">
      <div className="flex gap-2">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search passwords..."
            value={query}
            onChange={handleSearch}
            className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
          {query && (
            <button
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={clearSearch}
            >
              <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
        
        <button
          className={`px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 flex items-center ${
            selectedCategory !== 'all' ? 'bg-blue-50 border-blue-200 text-blue-700' : ''
          }`}
          onClick={() => setShowFilter(!showFilter)}
        >
          <Filter className="h-5 w-5" />
          <span className="ml-1 hidden sm:inline">Filter</span>
        </button>
      </div>
      
      {showFilter && (
        <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10 overflow-hidden">
          <div className="py-1">
            <button
              className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left ${
                selectedCategory === 'all' ? 'bg-blue-50 text-blue-700' : ''
              }`}
              onClick={() => handleCategoryChange('all')}
            >
              All Passwords
            </button>
            <button
              className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left ${
                selectedCategory === 'favorites' ? 'bg-blue-50 text-blue-700' : ''
              }`}
              onClick={() => handleCategoryChange('favorites')}
            >
              Favorites
            </button>
            
            {categories.length > 0 && <hr className="my-1" />}
            
            {categories.map((category) => (
              <button
                key={category}
                className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left ${
                  selectedCategory === category ? 'bg-blue-50 text-blue-700' : ''
                }`}
                onClick={() => handleCategoryChange(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordSearch;