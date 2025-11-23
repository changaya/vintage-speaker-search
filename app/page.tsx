'use client';

import { useState, useMemo } from 'react';
import SpeakerCard from '@/components/SpeakerCard';
import SpeakerFilter from '@/components/SpeakerFilter';
import { Speaker, FilterOptions } from '@/types/speaker';
import speakersData from '@/data/speakers.json';

export default function Home() {
  const speakers = speakersData as Speaker[];

  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    brand: '',
    type: '',
    yearFrom: 0,
    yearTo: 9999
  });

  // Extract unique brands and types from data
  const brands = useMemo(() => {
    return Array.from(new Set(speakers.map(s => s.brand))).sort();
  }, [speakers]);

  const types = useMemo(() => {
    return Array.from(new Set(speakers.map(s => s.type))).sort();
  }, [speakers]);

  // Filter speakers based on current filters
  const filteredSpeakers = useMemo(() => {
    return speakers.filter(speaker => {
      // Search filter
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = !filters.search ||
        speaker.name.toLowerCase().includes(searchLower) ||
        speaker.brand.toLowerCase().includes(searchLower) ||
        speaker.description.toLowerCase().includes(searchLower);

      // Brand filter
      const matchesBrand = !filters.brand || speaker.brand === filters.brand;

      // Type filter
      const matchesType = !filters.type || speaker.type === filters.type;

      // Year range filter
      const matchesYearFrom = !filters.yearFrom || speaker.year >= filters.yearFrom;
      const matchesYearTo = !filters.yearTo || speaker.year <= filters.yearTo;

      return matchesSearch && matchesBrand && matchesType && matchesYearFrom && matchesYearTo;
    });
  }, [speakers, filters]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Header */}
      <header className="bg-amber-900 text-white py-8 shadow-lg">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">🎵 Vintage Speaker Search</h1>
          <p className="text-amber-100">
            Discover classic and legendary speakers from the golden age of audio
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Filters */}
        <SpeakerFilter
          filters={filters}
          onFilterChange={setFilters}
          brands={brands}
          types={types}
        />

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-gray-600">
            Showing <span className="font-semibold">{filteredSpeakers.length}</span> of{' '}
            <span className="font-semibold">{speakers.length}</span> speakers
          </p>
        </div>

        {/* Speaker Grid */}
        {filteredSpeakers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredSpeakers.map((speaker) => (
              <SpeakerCard key={speaker.id} speaker={speaker} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">
              No speakers found matching your filters.
            </p>
            <button
              onClick={() => setFilters({ search: '', brand: '', type: '', yearFrom: 0, yearTo: 9999 })}
              className="mt-4 text-amber-600 hover:text-amber-700 font-medium"
            >
              Clear all filters
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>Vintage Speaker Search - A catalog of classic audio equipment</p>
        </div>
      </footer>
    </div>
  );
}
