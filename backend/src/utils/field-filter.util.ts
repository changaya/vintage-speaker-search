/**
 * Field Filtering Utilities
 *
 * Provides functions to filter hidden fields from API responses and DTOs.
 * Works in conjunction with field-visibility.config.ts
 */

import {
  FIELD_VISIBILITY,
  getHiddenFields,
  getVisibleFields,
  isFieldVisible,
  type FieldVisibilityConfig,
} from '../config/field-visibility.config';

type ModelName = keyof FieldVisibilityConfig;

/**
 * Filter hidden fields from a single object
 *
 * @param modelName - The model name (e.g., 'cartridge', 'tonearm')
 * @param data - The data object to filter
 * @returns Filtered object with only visible fields
 */
export function filterHiddenFields<T extends Record<string, any>>(
  modelName: ModelName,
  data: T
): Partial<T> {
  if (!data) return data;

  const hiddenFields = getHiddenFields(modelName);
  const filtered: any = { ...data };

  // Remove hidden fields
  hiddenFields.forEach((field) => {
    delete filtered[field];
  });

  return filtered;
}

/**
 * Filter hidden fields from an array of objects
 *
 * @param modelName - The model name
 * @param dataArray - Array of data objects to filter
 * @returns Array of filtered objects
 */
export function filterHiddenFieldsArray<T extends Record<string, any>>(
  modelName: ModelName,
  dataArray: T[]
): Partial<T>[] {
  if (!dataArray || !Array.isArray(dataArray)) return dataArray;

  return dataArray.map((item) => filterHiddenFields(modelName, item));
}

/**
 * Get Prisma select object with only visible fields
 *
 * @param modelName - The model name
 * @returns Prisma select object { field1: true, field2: true, ... }
 */
export function getPrismaSelect(modelName: ModelName): Record<string, boolean> | undefined {
  const visibleFields = getVisibleFields(modelName);

  // If visible is null, return undefined (select all fields)
  if (visibleFields === null) {
    return undefined;
  }

  // Build select object
  const select: Record<string, boolean> = {};
  visibleFields.forEach((field) => {
    select[field] = true;
  });

  return select;
}

/**
 * Filter DTO data to only include visible fields (for CREATE/UPDATE operations)
 *
 * This ensures that hidden fields are not accidentally included in create/update operations
 * from the frontend.
 *
 * @param modelName - The model name
 * @param data - The DTO data object
 * @returns Filtered DTO with only visible fields
 */
export function filterDtoFields<T extends Record<string, any>>(
  modelName: ModelName,
  data: T
): Partial<T> {
  if (!data) return data;

  const visibleFields = getVisibleFields(modelName);

  // If visible is null, only remove explicitly hidden fields
  if (visibleFields === null) {
    return filterHiddenFields(modelName, data);
  }

  // Otherwise, only keep visible fields (except auto-managed fields)
  const filtered: any = {};
  const autoManagedFields = ['id', 'createdAt', 'updatedAt'];

  Object.keys(data).forEach((key) => {
    // Include if field is visible (and not auto-managed for CREATE)
    if (isFieldVisible(modelName, key) && !autoManagedFields.includes(key)) {
      filtered[key] = data[key];
    }
  });

  return filtered;
}

/**
 * Merge user input with existing data, respecting field visibility
 *
 * Used for UPDATE operations to ensure hidden fields in existing data
 * are not overwritten with undefined.
 *
 * @param modelName - The model name
 * @param existingData - Existing data from database
 * @param newData - New data from user input
 * @returns Merged data
 */
export function mergeWithExistingData<T extends Record<string, any>>(
  modelName: ModelName,
  existingData: T,
  newData: Partial<T>
): T {
  const filtered = filterDtoFields(modelName, newData);

  return {
    ...existingData,
    ...filtered,
  };
}

/**
 * Check if request body contains any hidden fields
 *
 * Useful for validation to warn/reject requests that include hidden fields
 *
 * @param modelName - The model name
 * @param data - The request body data
 * @returns Array of hidden field names found in the data
 */
export function findHiddenFieldsInRequest(modelName: ModelName, data: Record<string, any>): string[] {
  if (!data) return [];

  const hiddenFields = getHiddenFields(modelName);
  const foundHiddenFields: string[] = [];

  Object.keys(data).forEach((key) => {
    if (hiddenFields.includes(key) && data[key] !== undefined) {
      foundHiddenFields.push(key);
    }
  });

  return foundHiddenFields;
}

/**
 * Get field statistics for debugging
 *
 * @param modelName - The model name
 * @returns Object with field counts
 */
export function getFieldStats(modelName: ModelName) {
  const config = FIELD_VISIBILITY[modelName];
  const hiddenCount = config.hidden.length;
  const visibleCount = config.visible ? config.visible.length : 'all';

  return {
    modelName,
    hiddenCount,
    visibleCount,
    hiddenFields: config.hidden,
    visibleFields: config.visible,
  };
}

/**
 * Build Prisma include object with field filtering for relations
 *
 * @param modelName - The model name
 * @param relations - Relations to include (e.g., { brand: true })
 * @returns Prisma include object with select applied
 */
export function getPrismaIncludeWithSelect(
  modelName: ModelName,
  relations: Record<string, boolean | object>
): Record<string, any> {
  const select = getPrismaSelect(modelName);
  const include: Record<string, any> = {};

  Object.entries(relations).forEach(([relationName, relationValue]) => {
    if (relationValue === true) {
      // Simple include, apply select if available
      include[relationName] = select ? { select } : true;
    } else {
      // Complex include (with nested options), keep as is
      include[relationName] = relationValue;
    }
  });

  return include;
}
