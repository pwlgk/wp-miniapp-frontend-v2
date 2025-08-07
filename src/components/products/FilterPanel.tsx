"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Button from '../ui/Button';
import { Tag } from '@/types';
import { Check, Square } from 'lucide-react';

export interface FilterValues {
  search: string;
  onSale: boolean;
  featured: boolean;
  selectedTags: number[];
}

interface FilterPanelProps {
  isOpen: boolean;
  allTags: Tag[];
  initialFilters: FilterValues;
  onApply: (filters: FilterValues) => void;
}

export default function FilterPanel({ isOpen, allTags, initialFilters, onApply }: FilterPanelProps) {
  const [localFilters, setLocalFilters] = useState<FilterValues>(initialFilters);

  useEffect(() => {
    setLocalFilters(initialFilters);
  }, [initialFilters]);

  const handleApply = () => { onApply(localFilters); };
  
  const handleReset = () => {
    const defaultFilters = { search: '', onSale: false, featured: false, selectedTags: [] };
    setLocalFilters(defaultFilters);
    onApply(defaultFilters);
  };

  const handleTagToggle = (tagId: number) => {
    setLocalFilters(prev => {
      const newSelectedTags = prev.selectedTags.includes(tagId)
        ? prev.selectedTags.filter(id => id !== tagId)
        : [...prev.selectedTags, tagId];
      return { ...prev, selectedTags: newSelectedTags };
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="overflow-hidden"
        >
          <div className="p-4 bg-gray-100 rounded-xl mt-4 space-y-4">
            <input
              type="text"
              placeholder="Поиск по названию..."
              value={localFilters.search}
              onChange={(e) => setLocalFilters(prev => ({...prev, search: e.target.value}))}
              className="w-full h-12 px-4 rounded-lg bg-white border border-gray-300 focus:border-accent focus:ring-0 text-main-text"
            />
            
            {/* Переключатель скидок */}
            <div className="flex justify-between items-center">
              <span className="font-semibold">Только со скидкой</span>
              <button 
                onClick={() => setLocalFilters(prev => ({...prev, onSale: !prev.onSale}))} 
                className={`flex items-center w-12 h-6 rounded-full p-1 bg-gray-300 transition-colors ${
                  localFilters.onSale ? 'bg-accent justify-end' : 'bg-gray-300 justify-start'
                }`}
              >
                <motion.div layout className="w-4 h-4 rounded-full bg-white shadow-md" />
              </button>
            </div>
            
            {/* Переключатель рекомендуемых */}
            <div className="flex justify-between items-center">
              <span className="font-semibold">Рекомендуемые</span>
              <button 
                onClick={() => setLocalFilters(prev => ({...prev, featured: !prev.featured}))} 
                className={`flex items-center w-12 h-6 rounded-full p-1 bg-gray-300 transition-colors ${
                  localFilters.featured ? 'bg-accent justify-end' : 'bg-gray-300 justify-start'
                }`}
              >
                <motion.div layout className="w-4 h-4 rounded-full bg-white shadow-md" />
              </button>
            </div>            
            
            {allTags.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-bold">Метки</h4>
                <div className="flex flex-wrap gap-2">
                  {allTags.map(tag => (
                    <button
                      key={tag.id}
                      onClick={() => handleTagToggle(tag.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full border transition-colors ${
                        localFilters.selectedTags.includes(tag.id)
                          ? 'bg-accent border-gray-600 text-main-text'
                          : 'bg-white border border-gray-300'
                      }`}
                    >
                      {localFilters.selectedTags.includes(tag.id) ? <Check size={14} /> : <Square size={14} className="opacity-50" />}
                      <span>{tag.name} ({tag.count})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex gap-4 pt-2">
              <Button onClick={handleApply} variant="primary">Применить</Button>
              <Button onClick={handleReset} variant="secondary">Сбросить</Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
