'use client';

import { useEffect, useState } from 'react';
import AuthGuard from '@/components/admin/AuthGuard';
import AdminNav from '@/components/admin/AdminNav';
import ImageUpload from '@/components/admin/ImageUpload';
import BrandSelect from '@/components/admin/BrandSelect';
import { TagInput } from '@/components/admin/forms';
import { api } from '@/lib/api';
import { getImageUrl } from '@/lib/image-utils';
import toast from 'react-hot-toast';

interface Brand {
  id: string;
  name: string;
}

interface PhonoPreamp {
  id: string;
  brandId: string;
  modelName: string;
  supportsMM: boolean;
  supportsMC: boolean;
  mmGain?: number;
  mcGain?: number;
  amplifierType?: string;
  imageUrl?: string;
  brand?: {
    id: string;
    name: string;
  };
}

interface PhonoPreampFormData {
  brandId: string;
  modelName: string;
  modelNumber?: string;
  supportsMM: boolean;
  supportsMC: boolean;
  mmInputImpedance?: number | string;
  mmInputCapacitance?: number | string;
  mmGain?: number | string;
  mcInputImpedance: string;
  mcInputCapacitance?: number | string;
  mcGain?: number | string;
  gainAdjustable: boolean;
  gainRange?: string;
  impedanceAdjust: boolean;
  impedanceOptions: string;
  capacitanceAdjust: boolean;
  capacitanceRange?: string;
  equalizationCurve: string;
  freqRespLow?: number | string;
  freqRespHigh?: number | string;
  thd?: number | string;
  snr?: number | string;
  inputConnectors: string;
  outputConnectors: string;
  balanced: boolean;
  amplifierType?: string;
  powerSupply?: string;
  voltage?: string;
  width?: number | string;
  depth?: number | string;
  height?: number | string;
  weight?: number | string;
  specSheetUrl?: string;
  dataSource?: string;
  dataSourceUrl?: string;
  imageUrl?: string;
}

export default function PhonoPreampPage() {
  const [phonoPreamps, setPhonoPreamps] = useState<PhonoPreamp[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPreamp, setEditingPreamp] = useState<PhonoPreamp | undefined>();
  const [formData, setFormData] = useState<PhonoPreampFormData>({
    brandId: '',
    modelName: '',
    modelNumber: '',
    supportsMM: true,
    supportsMC: false,
    mmInputImpedance: '',
    mmInputCapacitance: '',
    mmGain: '',
    mcInputImpedance: '',
    mcInputCapacitance: '',
    mcGain: '',
    gainAdjustable: false,
    gainRange: '',
    impedanceAdjust: false,
    impedanceOptions: '["47000"]',
    capacitanceAdjust: false,
    capacitanceRange: '',
    equalizationCurve: '["RIAA"]',
    freqRespLow: '',
    freqRespHigh: '',
    thd: '',
    snr: '',
    inputConnectors: '["RCA"]',
    outputConnectors: '["RCA"]',
    balanced: false,
    amplifierType: '',
    powerSupply: '',
    voltage: '',
    width: '',
    depth: '',
    height: '',
    weight: '',
    specSheetUrl: '',
    dataSource: '',
    dataSourceUrl: '',
    imageUrl: '',
  });

  const fetchPhonoPreamps = async () => {
    try {
      const response = await api.get<PhonoPreamp[]>('/api/phono-preamps');
      setPhonoPreamps(response.data);
    } catch (error) {
      console.error('Failed to fetch phono preamps:', error);
      toast.error('Failed to load phono preamps');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await api.get<Brand[]>('/api/brands');
      setBrands(response.data);
    } catch (error) {
      console.error('Failed to fetch brands:', error);
      toast.error('Failed to load brands');
    }
  };

  useEffect(() => {
    fetchPhonoPreamps();
    fetchBrands();
  }, []);

  const handleCreate = () => {
    setEditingPreamp(undefined);
    setFormData({
      brandId: '',
      modelName: '',
      modelNumber: '',
      supportsMM: true,
      supportsMC: false,
      mmInputImpedance: '',
      mmInputCapacitance: '',
      mmGain: '',
      mcInputImpedance: '',
      mcInputCapacitance: '',
      mcGain: '',
      gainAdjustable: false,
      gainRange: '',
      impedanceAdjust: false,
      impedanceOptions: '["47000"]',
      capacitanceAdjust: false,
      capacitanceRange: '',
      equalizationCurve: '["RIAA"]',
      freqRespLow: '',
      freqRespHigh: '',
      thd: '',
      snr: '',
      inputConnectors: '["RCA"]',
      outputConnectors: '["RCA"]',
      balanced: false,
      amplifierType: '',
      powerSupply: '',
      voltage: '',
      width: '',
      depth: '',
      height: '',
      weight: '',
      specSheetUrl: '',
      dataSource: '',
      dataSourceUrl: '',
      imageUrl: '',
    });
    setShowForm(true);
  };

  const handleEdit = async (preamp: PhonoPreamp) => {
    try {
      // Fetch full Phono Preamp details
      const response = await api.get(`/api/phono-preamps/${preamp.id}`);
      const fullPreamp = response.data;

      setEditingPreamp(preamp);
      setFormData({
        brandId: fullPreamp.brandId,
        modelName: fullPreamp.modelName,
        modelNumber: fullPreamp.modelNumber || '',
        supportsMM: fullPreamp.supportsMM ?? true,
        supportsMC: fullPreamp.supportsMC ?? false,
        mmInputImpedance: fullPreamp.mmInputImpedance || '',
        mmInputCapacitance: fullPreamp.mmInputCapacitance || '',
        mmGain: fullPreamp.mmGain || '',
        mcInputImpedance: fullPreamp.mcInputImpedance || '',
        mcInputCapacitance: fullPreamp.mcInputCapacitance || '',
        mcGain: fullPreamp.mcGain || '',
        gainAdjustable: fullPreamp.gainAdjustable ?? false,
        gainRange: fullPreamp.gainRange || '',
        impedanceAdjust: fullPreamp.impedanceAdjust ?? false,
        impedanceOptions: fullPreamp.impedanceOptions || '["47000"]',
        capacitanceAdjust: fullPreamp.capacitanceAdjust ?? false,
        capacitanceRange: fullPreamp.capacitanceRange || '',
        equalizationCurve: fullPreamp.equalizationCurve || '["RIAA"]',
        freqRespLow: fullPreamp.freqRespLow || '',
        freqRespHigh: fullPreamp.freqRespHigh || '',
        thd: fullPreamp.thd || '',
        snr: fullPreamp.snr || '',
        inputConnectors: fullPreamp.inputConnectors || '["RCA"]',
        outputConnectors: fullPreamp.outputConnectors || '["RCA"]',
        balanced: fullPreamp.balanced ?? false,
        amplifierType: fullPreamp.amplifierType || '',
        powerSupply: fullPreamp.powerSupply || '',
        voltage: fullPreamp.voltage || '',
        width: fullPreamp.width || '',
        depth: fullPreamp.depth || '',
        height: fullPreamp.height || '',
        weight: fullPreamp.weight || '',
        specSheetUrl: fullPreamp.specSheetUrl || '',
        dataSource: fullPreamp.dataSource || '',
        dataSourceUrl: fullPreamp.dataSourceUrl || '',
        imageUrl: fullPreamp.imageUrl || '',
      });
      setShowForm(true);
    } catch (error) {
      console.error('Failed to fetch phono preamp details:', error);
      toast.error('Failed to load phono preamp details');
    }
  };

  const handleDelete = async (id: string, modelName: string) => {
    if (!confirm(`Are you sure you want to delete "${modelName}"?`)) {
      return;
    }

    try {
      await api.delete(`/api/phono-preamps/${id}`);
      toast.success('Phono preamp deleted successfully');
      fetchPhonoPreamps();
    } catch (error: any) {
      console.error('Delete error:', error);
      const message = error.response?.data?.message || 'Failed to delete phono preamp';
      toast.error(message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clean up payload: convert empty strings to undefined
    const payload = {
      brandId: formData.brandId,
      modelName: formData.modelName,
      modelNumber: formData.modelNumber?.trim() || undefined,
      supportsMM: formData.supportsMM,
      supportsMC: formData.supportsMC,
      mmInputImpedance: formData.mmInputImpedance ? Number(formData.mmInputImpedance) : undefined,
      mmInputCapacitance: formData.mmInputCapacitance ? Number(formData.mmInputCapacitance) : undefined,
      mmGain: formData.mmGain ? Number(formData.mmGain) : undefined,
      mcInputImpedance: formData.mcInputImpedance,
      mcInputCapacitance: formData.mcInputCapacitance ? Number(formData.mcInputCapacitance) : undefined,
      mcGain: formData.mcGain ? Number(formData.mcGain) : undefined,
      gainAdjustable: formData.gainAdjustable,
      gainRange: formData.gainRange?.trim() || undefined,
      impedanceAdjust: formData.impedanceAdjust,
      impedanceOptions: formData.impedanceOptions,
      capacitanceAdjust: formData.capacitanceAdjust,
      capacitanceRange: formData.capacitanceRange?.trim() || undefined,
      equalizationCurve: formData.equalizationCurve,
      freqRespLow: formData.freqRespLow ? Number(formData.freqRespLow) : undefined,
      freqRespHigh: formData.freqRespHigh ? Number(formData.freqRespHigh) : undefined,
      thd: formData.thd ? Number(formData.thd) : undefined,
      snr: formData.snr ? Number(formData.snr) : undefined,
      inputConnectors: formData.inputConnectors,
      outputConnectors: formData.outputConnectors,
      balanced: formData.balanced,
      amplifierType: formData.amplifierType?.trim() || undefined,
      powerSupply: formData.powerSupply?.trim() || undefined,
      voltage: formData.voltage?.trim() || undefined,
      width: formData.width ? Number(formData.width) : undefined,
      depth: formData.depth ? Number(formData.depth) : undefined,
      height: formData.height ? Number(formData.height) : undefined,
      weight: formData.weight ? Number(formData.weight) : undefined,
      specSheetUrl: formData.specSheetUrl?.trim() || undefined,
      dataSource: formData.dataSource?.trim() || undefined,
      dataSourceUrl: formData.dataSourceUrl?.trim() || undefined,
      imageUrl: formData.imageUrl?.trim() || undefined,
    };

    try {
      if (editingPreamp) {
        await api.put(`/api/phono-preamps/${editingPreamp.id}`, payload);
        toast.success('Phono preamp updated successfully');
      } else {
        await api.post('/api/phono-preamps', payload);
        toast.success('Phono preamp created successfully');
      }
      setShowForm(false);
      fetchPhonoPreamps();
    } catch (error: any) {
      console.error('Submit error:', error);
      const message = error.response?.data?.message || 'Failed to save phono preamp';
      toast.error(message);
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <AdminNav />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Phono Preamps</h1>
              <p className="mt-2 text-gray-600">Manage phono preamplifiers</p>
            </div>
            <button
              onClick={handleCreate}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              Add New Phono Preamp
            </button>
          </div>

          {showForm && (
            <div className="mb-8 bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {editingPreamp ? 'Edit Phono Preamp' : 'Create New Phono Preamp'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Section 1: Basic Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3 pb-2 border-b">
                    Basic Information
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Brand *
                      </label>
                      <BrandSelect
                        value={formData.brandId}
                        onChange={(brandId) => setFormData({ ...formData, brandId })}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Model Name *
                      </label>
                      <input
                        type="text"
                        value={formData.modelName}
                        onChange={(e) => setFormData({ ...formData, modelName: e.target.value })}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Model Number
                      </label>
                      <input
                        type="text"
                        value={formData.modelNumber}
                        onChange={(e) => setFormData({ ...formData, modelNumber: e.target.value })}
                        placeholder="e.g., 834P-MK2"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Cartridge Support */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3 pb-2 border-b">
                    Cartridge Support
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center pt-2">
                      <input
                        type="checkbox"
                        id="supportsMM"
                        checked={formData.supportsMM}
                        onChange={(e) => setFormData({ ...formData, supportsMM: e.target.checked })}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor="supportsMM" className="ml-2 block text-sm font-medium text-gray-700">
                        Supports MM (Moving Magnet)
                      </label>
                    </div>

                    <div className="flex items-center pt-2">
                      <input
                        type="checkbox"
                        id="supportsMC"
                        checked={formData.supportsMC}
                        onChange={(e) => setFormData({ ...formData, supportsMC: e.target.checked })}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor="supportsMC" className="ml-2 block text-sm font-medium text-gray-700">
                        Supports MC (Moving Coil)
                      </label>
                    </div>
                  </div>
                </div>

                {/* Section 3: MM Input */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3 pb-2 border-b">
                    MM Input
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        MM Input Impedance (Ω)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.mmInputImpedance}
                        onChange={(e) => setFormData({ ...formData, mmInputImpedance: e.target.value })}
                        placeholder="e.g., 47000"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        MM Input Capacitance (pF)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.mmInputCapacitance}
                        onChange={(e) => setFormData({ ...formData, mmInputCapacitance: e.target.value })}
                        placeholder="e.g., 150"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        MM Gain (dB)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.mmGain}
                        onChange={(e) => setFormData({ ...formData, mmGain: e.target.value })}
                        placeholder="e.g., 40"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 4: MC Input */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3 pb-2 border-b">
                    MC Input
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        MC Input Impedance (Ω) *
                      </label>
                      <input
                        type="text"
                        value={formData.mcInputImpedance}
                        onChange={(e) => setFormData({ ...formData, mcInputImpedance: e.target.value })}
                        required
                        placeholder="e.g., 100-47000"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        MC Input Capacitance (pF)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.mcInputCapacitance}
                        onChange={(e) => setFormData({ ...formData, mcInputCapacitance: e.target.value })}
                        placeholder="e.g., 100"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        MC Gain (dB)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.mcGain}
                        onChange={(e) => setFormData({ ...formData, mcGain: e.target.value })}
                        placeholder="e.g., 60"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 5: Adjustment Features */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3 pb-2 border-b">
                    Adjustment Features
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center pt-2">
                      <input
                        type="checkbox"
                        id="gainAdjustable"
                        checked={formData.gainAdjustable}
                        onChange={(e) => setFormData({ ...formData, gainAdjustable: e.target.checked })}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor="gainAdjustable" className="ml-2 block text-sm font-medium text-gray-700">
                        Gain Adjustable
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gain Range
                      </label>
                      <input
                        type="text"
                        value={formData.gainRange}
                        onChange={(e) => setFormData({ ...formData, gainRange: e.target.value })}
                        placeholder="e.g., 40-60dB"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div className="flex items-center pt-2">
                      <input
                        type="checkbox"
                        id="impedanceAdjust"
                        checked={formData.impedanceAdjust}
                        onChange={(e) => setFormData({ ...formData, impedanceAdjust: e.target.checked })}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor="impedanceAdjust" className="ml-2 block text-sm font-medium text-gray-700">
                        Impedance Adjustable
                      </label>
                    </div>

                    <div>
                      <TagInput
                        label="Impedance Options (Ω)"
                        value={JSON.parse(formData.impedanceOptions || '[]')}
                        onChange={(arr) => setFormData({ ...formData, impedanceOptions: JSON.stringify(arr) })}
                        suggestions={['100', '1000', '10000', '47000']}
                        required
                        helpText="Common impedance values for phono preamps"
                      />
                    </div>

                    <div className="flex items-center pt-2">
                      <input
                        type="checkbox"
                        id="capacitanceAdjust"
                        checked={formData.capacitanceAdjust}
                        onChange={(e) => setFormData({ ...formData, capacitanceAdjust: e.target.checked })}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor="capacitanceAdjust" className="ml-2 block text-sm font-medium text-gray-700">
                        Capacitance Adjustable
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Capacitance Range
                      </label>
                      <input
                        type="text"
                        value={formData.capacitanceRange}
                        onChange={(e) => setFormData({ ...formData, capacitanceRange: e.target.value })}
                        placeholder="e.g., 100-500pF"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 6: Equalization & Performance */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3 pb-2 border-b">
                    Equalization & Performance
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <TagInput
                        label="Equalization Curve"
                        value={JSON.parse(formData.equalizationCurve || '[]')}
                        onChange={(arr) => setFormData({ ...formData, equalizationCurve: JSON.stringify(arr) })}
                        suggestions={['RIAA', 'Columbia', 'Decca', 'FFRR']}
                        required
                        helpText="Supported equalization curves"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Low Frequency (Hz)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.freqRespLow}
                        onChange={(e) => setFormData({ ...formData, freqRespLow: e.target.value })}
                        placeholder="e.g., 10"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        High Frequency (kHz)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.freqRespHigh}
                        onChange={(e) => setFormData({ ...formData, freqRespHigh: e.target.value })}
                        placeholder="e.g., 100"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        THD (%)
                      </label>
                      <input
                        type="number"
                        step="0.001"
                        value={formData.thd}
                        onChange={(e) => setFormData({ ...formData, thd: e.target.value })}
                        placeholder="e.g., 0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        S/N Ratio (dB)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.snr}
                        onChange={(e) => setFormData({ ...formData, snr: e.target.value })}
                        placeholder="e.g., 80"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 7: Connections & Amplifier Type */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3 pb-2 border-b">
                    Connections & Amplifier Type
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <TagInput
                        label="Input Connectors"
                        value={JSON.parse(formData.inputConnectors || '[]')}
                        onChange={(arr) => setFormData({ ...formData, inputConnectors: JSON.stringify(arr) })}
                        suggestions={['RCA', 'XLR', 'DIN']}
                        required
                        helpText="Available input connector types"
                      />
                    </div>

                    <div>
                      <TagInput
                        label="Output Connectors"
                        value={JSON.parse(formData.outputConnectors || '[]')}
                        onChange={(arr) => setFormData({ ...formData, outputConnectors: JSON.stringify(arr) })}
                        suggestions={['RCA', 'XLR']}
                        required
                        helpText="Available output connector types"
                      />
                    </div>

                    <div className="flex items-center pt-6">
                      <input
                        type="checkbox"
                        id="balanced"
                        checked={formData.balanced}
                        onChange={(e) => setFormData({ ...formData, balanced: e.target.checked })}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor="balanced" className="ml-2 block text-sm font-medium text-gray-700">
                        Balanced Output
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Amplifier Type
                      </label>
                      <select
                        value={formData.amplifierType}
                        onChange={(e) => setFormData({ ...formData, amplifierType: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="">Select type...</option>
                        <option value="tube">Tube (Valve)</option>
                        <option value="solid-state">Solid State</option>
                        <option value="hybrid">Hybrid</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 8: Power & Dimensions */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3 pb-2 border-b">
                    Power & Dimensions
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Power Supply
                      </label>
                      <select
                        value={formData.powerSupply}
                        onChange={(e) => setFormData({ ...formData, powerSupply: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="">Select type...</option>
                        <option value="internal">Internal</option>
                        <option value="external">External</option>
                        <option value="battery">Battery</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Voltage
                      </label>
                      <input
                        type="text"
                        value={formData.voltage}
                        onChange={(e) => setFormData({ ...formData, voltage: e.target.value })}
                        placeholder="e.g., 120V"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Width (mm)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.width}
                        onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Depth (mm)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.depth}
                        onChange={(e) => setFormData({ ...formData, depth: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Height (mm)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.height}
                        onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Weight (kg)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.weight}
                        onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 9: Documentation & Data Source */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3 pb-2 border-b">
                    Documentation & Data Source
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Spec Sheet URL
                      </label>
                      <input
                        type="url"
                        value={formData.specSheetUrl}
                        onChange={(e) => setFormData({ ...formData, specSheetUrl: e.target.value })}
                        placeholder="https://..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Data Source
                      </label>
                      <input
                        type="text"
                        value={formData.dataSource}
                        onChange={(e) => setFormData({ ...formData, dataSource: e.target.value })}
                        placeholder="e.g., EAR Official"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Data Source URL
                      </label>
                      <input
                        type="url"
                        value={formData.dataSourceUrl}
                        onChange={(e) => setFormData({ ...formData, dataSourceUrl: e.target.value })}
                        placeholder="https://..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 10: Image */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3 pb-2 border-b">
                    Image
                  </h3>
                  <ImageUpload
                    currentImageUrl={formData.imageUrl}
                    onImageUploaded={(url) => setFormData({ ...formData, imageUrl: url })}
                    label="Phono Preamp Image"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                  >
                    {editingPreamp ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : phonoPreamps.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-12 text-center">
              <p className="text-gray-500">No phono preamps found. Create your first phono preamp!</p>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Image
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Brand
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Model
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Specs
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {phonoPreamps.map((preamp) => (
                    <tr key={preamp.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {preamp.imageUrl ? (
                          <img
                            src={getImageUrl(preamp.imageUrl)!}
                            alt={preamp.modelName}
                            className="h-12 w-12 rounded object-cover"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded bg-gray-100 flex items-center justify-center">
                            <span className="text-gray-400 text-xs">No img</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {preamp.brand?.name || brands.find(b => b.id === preamp.brandId)?.name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {preamp.modelName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {[preamp.supportsMM && 'MM', preamp.supportsMC && 'MC'].filter(Boolean).join('/')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {preamp.amplifierType || '-'}
                        {preamp.mmGain && ` / MM:${preamp.mmGain}dB`}
                        {preamp.mcGain && ` / MC:${preamp.mcGain}dB`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEdit(preamp)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(preamp.id, preamp.modelName)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
