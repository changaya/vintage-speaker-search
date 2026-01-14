'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import type {
  TonearmWithBrand,
  CartridgeWithBrand,
  SUTWithBrand,
  PhonoPreampWithBrand,
  MatcherResponse,
} from '@/types/matcher';
import { calculateMatching } from '@/lib/matcher-api';
import ComponentSelector from '@/components/matcher/ComponentSelector';
import MatchingResults from '@/components/matcher/MatchingResults';

export default function MatcherPage() {
  // Component data (with brand relations from API)
  const [tonearms, setTonearms] = useState<TonearmWithBrand[]>([]);
  const [cartridges, setCartridges] = useState<CartridgeWithBrand[]>([]);
  const [suts, setSuts] = useState<SUTWithBrand[]>([]);
  const [phonoPreamps, setPhonoPreamps] = useState<PhonoPreampWithBrand[]>([]);

  // Selected components
  const [selectedTonearm, setSelectedTonearm] = useState<TonearmWithBrand | null>(null);
  const [selectedCartridge, setSelectedCartridge] = useState<CartridgeWithBrand | null>(null);
  const [selectedSUT, setSelectedSUT] = useState<SUTWithBrand | null>(null);
  const [selectedPhonoPreamp, setSelectedPhonoPreamp] = useState<PhonoPreampWithBrand | null>(null);
  const [headshellWeight, setHeadshellWeight] = useState<number>(5);

  // UI state
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState<MatcherResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch all components on mount
  useEffect(() => {
    fetchAllComponents();
  }, []);

  const fetchAllComponents = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

      const [tonearmsRes, cartridgesRes, sutsRes, phonoRes] = await Promise.all([
        fetch(`${apiUrl}/api/tonearms`),
        fetch(`${apiUrl}/api/cartridges`),
        fetch(`${apiUrl}/api/suts`),
        fetch(`${apiUrl}/api/phono-preamps`),
      ]);

      if (!tonearmsRes.ok || !cartridgesRes.ok || !sutsRes.ok || !phonoRes.ok) {
        throw new Error('Failed to fetch components');
      }

      const [tonearmsData, cartridgesData, sutsData, phonoData] = await Promise.all([
        tonearmsRes.json(),
        cartridgesRes.json(),
        sutsRes.json(),
        phonoRes.json(),
      ]);

      setTonearms(tonearmsData);
      setCartridges(cartridgesData);
      setSuts(sutsData);
      setPhonoPreamps(phonoData);
      setError(null);
    } catch (err) {
      console.error('Error fetching components:', err);
      setError('Failed to load components. Please try again.');
      toast.error('Failed to load components');
    } finally {
      setLoading(false);
    }
  };

  const handleCalculate = async () => {
    if (!selectedTonearm || !selectedCartridge) {
      toast.error('Please select both tonearm and cartridge');
      return;
    }

    try {
      setCalculating(true);
      setError(null);

      // Determine headshell weight to send
      const isRemovableHeadshell = selectedTonearm.headshellType &&
        (selectedTonearm.headshellType.includes('removable') || selectedTonearm.headshellType === 'removable-SME' || selectedTonearm.headshellType === 'removable-other');

      const weightToSend = isRemovableHeadshell ? headshellWeight : 0;

      const matchingResult = await calculateMatching({
        tonearmId: selectedTonearm.id,
        cartridgeId: selectedCartridge.id,
        sutId: selectedSUT?.id,
        phonoPreampId: selectedPhonoPreamp?.id,
        headshellWeight: weightToSend,
      });

      setResult(matchingResult);
      toast.success('Matching calculation completed!');
    } catch (err: any) {
      console.error('Calculate matching error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to calculate matching';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setCalculating(false);
    }
  };

  // Check if SUT should be enabled (only for MC cartridges)
  const isSUTEnabled = selectedCartridge?.cartridgeType === 'MC';

  // Check if calculate button should be enabled
  const canCalculate = selectedTonearm && selectedCartridge && !calculating;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading components...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Component Matcher
          </h1>
          <p className="text-gray-600">
            Select your components to calculate matching compatibility and get detailed analysis.
          </p>
        </div>

        {/* Component Selection Panel */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Select Components
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Tonearm Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tonearm <span className="text-red-500">*</span>
              </label>
              <ComponentSelector
                type="tonearm"
                components={tonearms}
                selectedComponent={selectedTonearm}
                onSelect={(c) => setSelectedTonearm(c as TonearmWithBrand | null)}
                placeholder="Select a tonearm..."
              />

              {/* Headshell Weight Input */}
              {selectedTonearm && selectedTonearm.headshellType &&
               (selectedTonearm.headshellType.includes('removable') ||
                selectedTonearm.headshellType === 'removable-SME' ||
                selectedTonearm.headshellType === 'removable-other') && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <label className="block text-sm font-medium text-blue-900 mb-1">
                    Headshell Weight (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="3"
                    max="15"
                    value={headshellWeight}
                    onChange={(e) => setHeadshellWeight(parseFloat(e.target.value) || 5)}
                    className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-xs text-blue-700">
                    일반적인 headshell: 5-7g, 무거운 headshell: 10-12g
                  </p>
                </div>
              )}
            </div>

            {/* Cartridge Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cartridge <span className="text-red-500">*</span>
              </label>
              <ComponentSelector
                type="cartridge"
                components={cartridges}
                selectedComponent={selectedCartridge}
                onSelect={(c) => setSelectedCartridge(c as CartridgeWithBrand | null)}
                placeholder="Select a cartridge..."
              />
            </div>

            {/* SUT Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SUT (Step-Up Transformer)
                {!isSUTEnabled && (
                  <span className="ml-2 text-xs text-gray-500">
                    (Only for MC cartridges)
                  </span>
                )}
              </label>
              <ComponentSelector
                type="sut"
                components={suts}
                selectedComponent={selectedSUT}
                onSelect={(c) => setSelectedSUT(c as SUTWithBrand | null)}
                placeholder={
                  isSUTEnabled
                    ? 'Select a SUT (optional)...'
                    : 'Select MC cartridge first...'
                }
                disabled={!isSUTEnabled}
              />
            </div>

            {/* Phono Preamp Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phono Preamp (Optional)
              </label>
              <ComponentSelector
                type="phonopreamp"
                components={phonoPreamps}
                selectedComponent={selectedPhonoPreamp}
                onSelect={(c) => setSelectedPhonoPreamp(c as PhonoPreampWithBrand | null)}
                placeholder="Select a phono preamp (optional)..."
              />
            </div>
          </div>

          {/* Calculate Button */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleCalculate}
              disabled={!canCalculate}
              className={`px-8 py-3 rounded-md font-medium text-white transition-colors ${
                canCalculate
                  ? 'bg-primary-600 hover:bg-primary-700'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              {calculating ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Calculating...
                </span>
              ) : (
                'Calculate Matching'
              )}
            </button>
          </div>

          {/* Required field notice */}
          <p className="mt-4 text-sm text-gray-500 text-center">
            * Required fields
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results Display */}
        {result && (
          <MatchingResults
            result={result}
            selectedComponents={{
              tonearm: selectedTonearm,
              cartridge: selectedCartridge,
              sut: selectedSUT,
              phonoPreamp: selectedPhonoPreamp,
            }}
          />
        )}

        {/* Empty State */}
        {!result && !error && !calculating && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🎯</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Ready to Match Components
            </h3>
            <p className="text-gray-500">
              Select a tonearm and cartridge to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
