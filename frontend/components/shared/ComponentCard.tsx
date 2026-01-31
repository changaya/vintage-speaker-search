'use client';

import Link from 'next/link';

export interface SpecItem {
  label: string;
  value: string | number | null | undefined;
  unit?: string;
  condition?: boolean;
}

export interface BadgeConfig {
  text: string;
  className?: string;
}

interface ComponentCardProps {
  href: string;
  imageUrl: string | null;
  imageAlt: string;
  placeholderIcon: string;
  title: string;
  subtitle: string | null;
  badges?: BadgeConfig[];
  specs: SpecItem[];
  dataSource?: string | null;
  dataSourceUrl?: string | null;
}

export default function ComponentCard({
  href,
  imageUrl,
  imageAlt,
  placeholderIcon,
  title,
  subtitle,
  badges = [],
  specs,
  dataSource,
  dataSourceUrl,
}: ComponentCardProps) {
  // Filter specs to only show those with values and passing conditions
  const visibleSpecs = specs.filter(
    (spec) => spec.value !== null && spec.value !== undefined && spec.condition !== false
  );

  return (
    <Link
      href={href}
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden border group"
    >
      {/* Image */}
      <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={imageAlt}
            className="max-w-[80%] max-h-[80%] object-contain group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="text-gray-400 text-6xl">{placeholderIcon}</div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
              {title}
            </h3>
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          </div>
          {badges.length > 0 && (
            <div className="flex gap-1">
              {badges.map((badge, index) => (
                <span
                  key={index}
                  className={
                    badge.className ||
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800'
                  }
                >
                  {badge.text}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Specs */}
        {visibleSpecs.length > 0 && (
          <div className="space-y-1 text-sm text-gray-600 mb-4">
            {visibleSpecs.map((spec, index) => (
              <div key={index} className="flex justify-between">
                <span className="text-gray-500">{spec.label}:</span>
                <span className="text-right">
                  {spec.value}
                  {spec.unit || ''}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Data Source or View Details */}
        {dataSource ? (
          <div className="pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Source:{' '}
              {dataSourceUrl ? (
                <span
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.open(dataSourceUrl, '_blank');
                  }}
                  className="text-primary-600 hover:underline cursor-pointer"
                >
                  {dataSource}
                </span>
              ) : (
                dataSource
              )}
            </p>
          </div>
        ) : (
          <div className="pt-3 border-t border-gray-100">
            <span className="text-sm text-primary-600 group-hover:underline">
              View details →
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
