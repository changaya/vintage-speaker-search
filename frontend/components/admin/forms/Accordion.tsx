'use client';

import { ReactNode, useState, createContext, useContext } from 'react';

interface AccordionContextType {
  openSections: Set<string>;
  toggleSection: (id: string) => void;
}

const AccordionContext = createContext<AccordionContextType | undefined>(undefined);

interface AccordionProps {
  children: ReactNode;
  defaultOpenSections?: string[];
}

/**
 * Accordion Component
 *
 * Container for collapsible sections. Manages which sections are open/closed.
 *
 * Usage:
 * ```tsx
 * <Accordion defaultOpenSections={['basic', 'output']}>
 *   <AccordionItem id="basic" title="Basic Information">
 *     <FormInput label="Brand" {...register('brand')} />
 *   </AccordionItem>
 *   <AccordionItem id="output" title="Output">
 *     <FormInput label="Voltage" {...register('voltage')} />
 *   </AccordionItem>
 * </Accordion>
 * ```
 */
export const Accordion = ({ children, defaultOpenSections = [] }: AccordionProps) => {
  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set(defaultOpenSections)
  );

  const toggleSection = (id: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <AccordionContext.Provider value={{ openSections, toggleSection }}>
      <div className="space-y-3">{children}</div>
    </AccordionContext.Provider>
  );
};

interface AccordionItemProps {
  id: string;
  title: string;
  children: ReactNode;
  badge?: string;
}

/**
 * Accordion Item Component
 *
 * Individual collapsible section within an Accordion.
 * Must be used as a child of Accordion component.
 *
 * Props:
 * - id: Unique identifier for this section
 * - title: Section header text
 * - badge: Optional badge text (e.g., "Required")
 * - children: Section content
 */
export const AccordionItem = ({ id, title, children, badge }: AccordionItemProps) => {
  const context = useContext(AccordionContext);

  if (!context) {
    throw new Error('AccordionItem must be used within an Accordion');
  }

  const { openSections, toggleSection } = context;
  const isOpen = openSections.has(id);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => toggleSection(id)}
        className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          {badge && (
            <span className="px-2 py-0.5 text-xs bg-primary-100 text-primary-800 rounded">
              {badge}
            </span>
          )}
        </div>
        <svg
          className={`w-5 h-5 text-gray-600 transition-transform ${
            isOpen ? 'transform rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="p-4 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
        </div>
      )}
    </div>
  );
};
