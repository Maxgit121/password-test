import React, { useState } from 'react';
import { Eye, EyeOff, ExternalLink, Clipboard, Star, Heart } from 'lucide-react';
import { Password } from '../../types';
import { usePasswords } from '../../context/PasswordContext';
import Button from '../ui/Button';

interface PasswordListProps {
  data: Password[];
  onEdit: (password: Password) => void;
}

const PasswordList: React.FC<PasswordListProps> = ({ data, onEdit }) => {
  const [revealedPasswords, setRevealedPasswords] = useState<Record<number, boolean>>({});
  const [copiedId, setCopiedId] = useState<number | null>(null);
  
  const { decryptPassword, toggleFavorite } = usePasswords();
  
  const togglePasswordVisibility = (id: number) => {
    setRevealedPasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };
  
  const handleToggleFavorite = async (id: number) => {
    await toggleFavorite(id);
  };
  
  const formatWebsite = (url: string): string => {
    if (!url) return '';
    
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      return urlObj.hostname;
    } catch {
      return url;
    }
  };
  
  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      'Personal': 'bg-blue-100 text-blue-800',
      'Work': 'bg-green-100 text-green-800',
      'Finance': 'bg-purple-100 text-purple-800',
      'Social': 'bg-pink-100 text-pink-800',
      'Shopping': 'bg-yellow-100 text-yellow-800',
      'Travel': 'bg-indigo-100 text-indigo-800',
      'Entertainment': 'bg-orange-100 text-orange-800'
    };
    
    return colors[category] || 'bg-gray-100 text-gray-800';
  };
  
  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-gray-50 rounded-lg p-8 inline-block">
          <div className="text-gray-400 mb-4">
            <Lock size={64} className="mx-auto" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">No passwords yet</h3>
          <p className="text-gray-500 mb-4">Add your first password to get started</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white overflow-hidden shadow-sm rounded-lg divide-y divide-gray-200">
      {data.map((item) => (
        <div 
          key={item.id} 
          className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
          onClick={() => onEdit(item)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center">
                <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (item.id) handleToggleFavorite(item.id);
                  }}
                  className="ml-2 text-gray-400 hover:text-pink-500 transition-colors"
                >
                  {item.favorite ? (
                    <Heart className="h-5 w-5 fill-pink-500 text-pink-500" />
                  ) : (
                    <Heart className="h-5 w-5" />
                  )}
                </button>
              </div>
              
              <div className="mt-1 text-sm text-gray-500">{item.username}</div>
              
              {item.category && (
                <span className={`inline-flex items-center mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
                  {item.category}
                </span>
              )}
            </div>
            
            <div className="flex flex-col items-end">
              <div className="flex space-x-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (item.id) togglePasswordVisibility(item.id);
                  }}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                >
                  {revealedPasswords[item.id as number] ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(decryptPassword(item.password), item.id as number);
                  }}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                >
                  <Clipboard size={18} />
                </button>
                
                {item.website && (
                  <a
                    href={item.website.startsWith('http') ? item.website : `https://${item.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-1 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                  >
                    <ExternalLink size={18} />
                  </a>
                )}
              </div>
              
              {copiedId === item.id && (
                <span className="text-xs text-green-600 mt-1 animate-fade-in">
                  Copied!
                </span>
              )}
              
              <div className="mt-2">
                <div className="relative min-w-[140px] bg-gray-100 rounded py-1 px-2 text-sm text-gray-800 font-mono">
                  {revealedPasswords[item.id as number] 
                    ? decryptPassword(item.password) 
                    : '••••••••••••'}
                </div>
              </div>
            </div>
          </div>
          
          {item.website && (
            <div className="mt-2 text-xs text-gray-500 flex items-center">
              <Globe size={14} className="mr-1" />
              {formatWebsite(item.website)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const Lock = (props: any) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
};

const Globe = (props: any) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" x2="22" y1="12" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
};

export default PasswordList;