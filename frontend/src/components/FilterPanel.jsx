import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const FilterPanel = ({ onFiltersChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    ageMin: 18,
    ageMax: 50,
    gender: '',
    location: '',
    intent: ''
  });

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      ageMin: 18,
      ageMax: 50,
      gender: '',
      location: '',
      intent: ''
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  return (
    <div className="mb-6">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full lg:w-auto flex items-center justify-between lg:justify-center space-x-2 mb-4 lg:mb-0"
      >
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4" />
          <span>Filters</span>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <Card className="mt-4 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age-range">Age Range</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="age-min"
                        type="number"
                        placeholder="Min"
                        value={filters.ageMin}
                        onChange={(e) => handleFilterChange('ageMin', parseInt(e.target.value) || 18)}
                        className="w-20"
                        min="18"
                        max="100"
                      />
                      <span className="text-gray-500">-</span>
                      <Input
                        id="age-max"
                        type="number"
                        placeholder="Max"
                        value={filters.ageMax}
                        onChange={(e) => handleFilterChange('ageMax', parseInt(e.target.value) || 50)}
                        className="w-20"
                        min="18"
                        max="100"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <select
                      id="gender"
                      value={filters.gender}
                      onChange={(e) => handleFilterChange('gender', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    >
                      <option value="">All Genders</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="non-binary">Non-Binary</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      type="text"
                      placeholder="City or Country"
                      value={filters.location}
                      onChange={(e) => handleFilterChange('location', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="intent">Looking For</Label>
                    <select
                      id="intent"
                      value={filters.intent}
                      onChange={(e) => handleFilterChange('intent', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    >
                      <option value="">All Intentions</option>
                      <option value="dating">Dating</option>
                      <option value="friendship">Friendship</option>
                      <option value="long-term">Long-Term</option>
                      <option value="casual">Casual</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="hover:bg-gray-50"
                  >
                    Clear Filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FilterPanel;