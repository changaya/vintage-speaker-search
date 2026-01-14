/**
 * Matcher Types
 * Re-exports types from shared package for easier imports
 *
 * @see /docs/SHARED_TYPES.md for complete type reference
 */

export type {
  // Base entity types
  Tonearm,
  Cartridge,
  SUT,
  PhonoPreamp,
  Brand,
  // Entity types with brand relation (used when fetching from API)
  TonearmWithBrand,
  CartridgeWithBrand,
  SUTWithBrand,
  PhonoPreampWithBrand,
  // Matcher types
  MatcherRequest,
  MatcherResponse,
  MatchingResult,
  ResonanceResult,
  SUTMatchingResult,
  ComponentOption,
  GroupedOption,
  ComponentInfo,
  TonearmInfo,
  CartridgeInfo,
} from '@vintage-audio/shared';
