/**
 * ComponentSelector
 * Searchable dropdown for component selection using react-select
 */

'use client';

import Select, { StylesConfig, GroupBase } from 'react-select';
import type {
  Tonearm,
  Cartridge,
  SUT,
  PhonoPreamp,
  ComponentOption,
  GroupedOption,
} from '@/types/matcher';

type Component = Tonearm | Cartridge | SUT | PhonoPreamp;

interface ComponentSelectorProps {
  type: 'tonearm' | 'cartridge' | 'sut' | 'phonopreamp';
  components: Component[];
  selectedComponent: Component | null;
  onSelect: (component: Component | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function ComponentSelector({
  type,
  components,
  selectedComponent,
  onSelect,
  placeholder = 'Select a component...',
  disabled = false,
}: ComponentSelectorProps) {
  // Format options with brand grouping
  const getOptions = (): GroupedOption[] => {
    const grouped = components.reduce((acc, component) => {
      const brandName = component.brand.name;
      if (!acc[brandName]) {
        acc[brandName] = [];
      }

      let specs = '';
      if (type === 'tonearm' && 'effectiveMass' in component) {
        // Format: length / mass (e.g., "12" / 20g or 20g if no length)
        const lengthStr = component.effectiveLength
          ? `${Math.round(component.effectiveLength / 25.4)}" / `
          : '';
        specs = `${lengthStr}${component.effectiveMass}g`;
      } else if (type === 'cartridge' && 'cartridgeType' in component) {
        specs = component.cartridgeType;
      } else if (type === 'sut' && 'gainRatio' in component) {
        specs = component.gainRatio || `${component.gainDb}dB`;
      } else if (type === 'phonopreamp' && 'preampType' in component) {
        specs = component.preampType;
      }

      acc[brandName].push({
        value: component.id,
        label: `${component.modelName}${specs ? ` (${specs})` : ''}`,
        brand: brandName,
        model: component.modelName,
        specs,
      });

      return acc;
    }, {} as Record<string, ComponentOption[]>);

    return Object.keys(grouped)
      .sort()
      .map((brand) => ({
        label: brand,
        options: grouped[brand].sort((a, b) => a.model.localeCompare(b.model)),
      }));
  };

  const options = getOptions();

  // Get selected value
  const selectedValue = selectedComponent
    ? {
        value: selectedComponent.id,
        label: selectedComponent.modelName,
        brand: selectedComponent.brand.name,
        model: selectedComponent.modelName,
      }
    : null;

  // Handle selection change
  const handleChange = (option: ComponentOption | null) => {
    if (option) {
      const component = components.find((c) => c.id === option.value);
      onSelect(component || null);
    } else {
      onSelect(null);
    }
  };

  // Custom styles to match Tailwind theme
  const customStyles: StylesConfig<ComponentOption, false, GroupBase<ComponentOption>> = {
    control: (provided, state) => ({
      ...provided,
      borderColor: state.isFocused ? '#0284c7' : '#d1d5db',
      boxShadow: state.isFocused ? '0 0 0 1px #0284c7' : 'none',
      '&:hover': {
        borderColor: '#0284c7',
      },
      minHeight: '42px',
      backgroundColor: disabled ? '#f9fafb' : 'white',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? '#0284c7'
        : state.isFocused
        ? '#e0f2fe'
        : 'white',
      color: state.isSelected ? 'white' : '#111827',
      '&:active': {
        backgroundColor: '#0369a1',
      },
    }),
    groupHeading: (provided) => ({
      ...provided,
      color: '#6b7280',
      fontSize: '0.75rem',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#9ca3af',
    }),
  };

  return (
    <Select<ComponentOption, false, GroupBase<ComponentOption>>
      options={options}
      value={selectedValue}
      onChange={handleChange}
      placeholder={placeholder}
      isDisabled={disabled}
      isClearable
      isSearchable
      styles={customStyles}
      className="react-select-container"
      classNamePrefix="react-select"
    />
  );
}
