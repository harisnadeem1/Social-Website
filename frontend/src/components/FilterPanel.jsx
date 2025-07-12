import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Filter, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const FilterPanel = ({ onFiltersChange, onSearchChange, searchTerm }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    ageMin: 18,
    ageMax: 100,
    gender: '',
    location: '',
    intent: ''
  });
  
  // Local state for input values to handle editing
  const [inputValues, setInputValues] = useState({
    ageMin: '18',
    ageMax: '100'
  });

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleAgeInputChange = (key, value) => {
    // Update the input display value immediately
    setInputValues(prev => ({ ...prev, [key]: value }));
    
    // Only update filters if value is valid
    if (value === '' || (parseInt(value) >= 18 && parseInt(value) <= 100)) {
      const numValue = value === '' ? (key === 'ageMin' ? 18 : 100) : parseInt(value);
      handleFilterChange(key, numValue);
    }
  };

  const handleAgeInputBlur = (key) => {
    // Ensure valid values on blur
    const currentValue = inputValues[key];
    if (currentValue === '' || parseInt(currentValue) < 18) {
      const defaultValue = key === 'ageMin' ? '18' : '100';
      setInputValues(prev => ({ ...prev, [key]: defaultValue }));
      handleFilterChange(key, parseInt(defaultValue));
    } else if (parseInt(currentValue) > 100) {
      setInputValues(prev => ({ ...prev, [key]: '100' }));
      handleFilterChange(key, 100);
    }
  };

  const clearFilters = () => {
    const clearedFilters = {
      ageMin: 18,
      ageMax: 100,
      gender: '',
      location: '',
      intent: ''
    };
    setFilters(clearedFilters);
    setInputValues({ ageMin: '18', ageMax: '100' });
    onFiltersChange(clearedFilters);
  };

  // For mobile, only count age filters as active (when different from defaults)
  const mobileActiveFiltersCount = (filters.ageMin !== 18 || filters.ageMax !== 100) ? 1 : 0;
  
  // For desktop, count all non-default filters
  const desktopActiveFiltersCount = Object.values(filters).filter(value => 
    value !== '' && value !== 18 && value !== 100
  ).length;

  return (
    <>
      {/* Mobile Layout - Floating Filter Button */}
      <div className="lg:hidden">
        {/* Floating Filter Button - Fixed Position */}
        <div className="fixed right-1 z-40" style={{ top: '4.2rem' }}>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="h-12 w-12 rounded-full bg-pink-500 hover:bg-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 relative"
          >
            <Filter className="w-7 h-7" />
            
            {mobileActiveFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-white text-pink-500 text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold border-2 border-pink-500">
                {mobileActiveFiltersCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Desktop Layout - Full Search and Filters */}
      <div className="hidden lg:block mb-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-12 border-gray-200 focus:border-pink-400 focus:ring-pink-400 text-base"
              style={{ fontSize: '16px' }}
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setIsModalOpen(true)}
            className="h-12 px-6 border-gray-200 hover:border-pink-400 hover:text-pink-600"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {desktopActiveFiltersCount > 0 && (
              <span className="ml-2 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {desktopActiveFiltersCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Filter Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 lg:hidden"
              onClick={() => setIsModalOpen(false)}
            />
            
            {/* Mobile Modal - Age Filter Only */}
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 500 }}
              className="fixed bottom-20 left-0 right-0 bg-white rounded-t-3xl z-50 lg:hidden shadow-2xl"
            >
              <div className="p-6 pb-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Age Filter</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsModalOpen(false)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Age Range Filter Only */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">Age Range</Label>
                  <div className="flex items-center space-x-3">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={inputValues.ageMin}
                      onChange={(e) => handleAgeInputChange('ageMin', e.target.value)}
                      onBlur={() => handleAgeInputBlur('ageMin')}
                      className="flex-1 h-12 text-base"
                      style={{ fontSize: '16px' }}
                      min="18"
                      max="100"
                    />
                    <span className="text-gray-500 font-medium">to</span>
                    <Input
                      type="number"
                      placeholder="Max"
                      value={inputValues.ageMax}
                      onChange={(e) => handleAgeInputChange('ageMax', e.target.value)}
                      onBlur={() => handleAgeInputBlur('ageMax')}
                      className="flex-1 h-12 text-base"
                      style={{ fontSize: '16px' }}
                      min="18"
                      max="100"
                    />
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setInputValues({ ageMin: '18', ageMax: '100' });
                      handleFilterChange('ageMin', 18);
                      handleFilterChange('ageMax', 100);
                    }}
                    className="flex-1 h-12"
                  >
                    Reset
                  </Button>
                  <Button
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 h-12 bg-pink-500 hover:bg-pink-600"
                  >
                    Apply Filter
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Desktop Modal - Full Filters */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4 hidden lg:flex"
              onClick={() => setIsModalOpen(false)}
            >
              <motion.div
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto"
              >
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">Filter Profiles</h3>
                    <Button
                      variant="ghost"
                      onClick={() => setIsModalOpen(false)}
                      className="h-10 w-10 p-0"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className="text-base font-medium">Age Range</Label>
                      <div className="flex items-center space-x-3">
                        <Input
                          type="number"
                          placeholder="Min"
                          value={inputValues.ageMin}
                          onChange={(e) => handleAgeInputChange('ageMin', e.target.value)}
                          onBlur={() => handleAgeInputBlur('ageMin')}
                          className="w-24 h-12 text-base"
                          style={{ fontSize: '16px' }}
                          min="18"
                          max="100"
                        />
                        <span className="text-gray-500">to</span>
                        <Input
                          type="number"
                          placeholder="Max"
                          value={inputValues.ageMax}
                          onChange={(e) => handleAgeInputChange('ageMax', e.target.value)}
                          onBlur={() => handleAgeInputBlur('ageMax')}
                          className="w-24 h-12 text-base"
                          style={{ fontSize: '16px' }}
                          min="18"
                          max="100"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-base font-medium">Gender</Label>
                      <select
                        value={filters.gender}
                        onChange={(e) => handleFilterChange('gender', e.target.value)}
                        className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-base"
                        style={{ fontSize: '16px' }}
                      >
                        <option value="">All Genders</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="non-binary">Non-Binary</option>
                      </select>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-base font-medium">Location</Label>
                      <Input
                        type="text"
                        placeholder="City or Country"
                        value={filters.location}
                        onChange={(e) => handleFilterChange('location', e.target.value)}
                        className="h-12 text-base"
                        style={{ fontSize: '16px' }}
                      />
                    </div>

                    <div className="space-y-3">
                      <Label className="text-base font-medium">Looking For</Label>
                      <select
                        value={filters.intent}
                        onChange={(e) => handleFilterChange('intent', e.target.value)}
                        className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-base"
                        style={{ fontSize: '16px' }}
                      >
                        <option value="">All Intentions</option>
                        <option value="dating">Dating</option>
                        <option value="friendship">Friendship</option>
                        <option value="long-term">Long-Term</option>
                        <option value="casual">Casual</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
                    <Button
                      variant="outline"
                      onClick={clearFilters}
                      className="flex-1 h-12"
                    >
                      Clear All
                    </Button>
                    <Button
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 h-12 bg-pink-500 hover:bg-pink-600"
                    >
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default FilterPanel;