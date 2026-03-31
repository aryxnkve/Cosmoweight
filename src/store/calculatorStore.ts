import { create } from 'zustand';
import type { CelestialBody, UnitType, ViewType, ThemeType, SortConfig, Category, MassUnit, RadiusUnit } from '../data/types';
import { celestialBodies } from '../data/celestialBodies';
import { detectDefaultUnit, parseShareUrl } from '../utils/calculations';

interface CalculatorState {
  // Input
  weightInput: string;
  selectedUnit: UnitType;
  selectedBody: CelestialBody;

  // View
  activeView: ViewType;
  searchQuery: string;

  // Compare
  compareSort: SortConfig;
  compareFilter: Category | 'all';

  // Theme
  theme: ThemeType;
  resolvedTheme: 'dark' | 'light';

  // Detail
  detailBody: CelestialBody | null;

  // Custom Body
  customBodyName: string;
  customMassInput: string;
  customMassUnit: MassUnit;
  customRadiusInput: string;
  customRadiusUnit: RadiusUnit;
  showBreakdown: boolean;

  // Actions
  setWeightInput: (value: string) => void;
  setSelectedUnit: (unit: UnitType) => void;
  setSelectedBody: (body: CelestialBody) => void;
  setActiveView: (view: ViewType) => void;
  setSearchQuery: (query: string) => void;
  setCompareSort: (sort: SortConfig) => void;
  setCompareFilter: (filter: Category | 'all') => void;
  setTheme: (theme: ThemeType) => void;
  setResolvedTheme: (theme: 'dark' | 'light') => void;
  setDetailBody: (body: CelestialBody | null) => void;
  openBodyDetail: (body: CelestialBody) => void;
  setCustomBodyName: (name: string) => void;
  setCustomMassInput: (value: string) => void;
  setCustomMassUnit: (unit: MassUnit) => void;
  setCustomRadiusInput: (value: string) => void;
  setCustomRadiusUnit: (unit: RadiusUnit) => void;
  setShowBreakdown: (show: boolean) => void;
}

function getInitialState() {
  const shareData = parseShareUrl();
  const defaultUnit = shareData?.unit || detectDefaultUnit();
  const defaultBody =
    (shareData?.bodyId
      ? celestialBodies.find((b) => b.id === shareData.bodyId)
      : null) || celestialBodies.find((b) => b.id === 'mars')!;
  const defaultWeight = shareData?.weight?.toString() || '70';

  return {
    weightInput: defaultWeight,
    selectedUnit: defaultUnit,
    selectedBody: defaultBody,
  };
}

export const useCalculatorStore = create<CalculatorState>((set) => {
  const initial = getInitialState();

  return {
    ...initial,
    activeView: 'calculator',
    searchQuery: '',
    compareSort: { field: 'gravity', direction: 'desc' },
    compareFilter: 'all',
    theme: 'dark',
    resolvedTheme: 'dark',
    detailBody: null,

    // Custom body defaults
    customBodyName: '',
    customMassInput: '',
    customMassUnit: 'earth_mass',
    customRadiusInput: '',
    customRadiusUnit: 'earth_radius',
    showBreakdown: false,

    setWeightInput: (value) => set({ weightInput: value }),
    setSelectedUnit: (unit) => set({ selectedUnit: unit }),
    setSelectedBody: (body) => set({ selectedBody: body }),
    setActiveView: (view) => set({ activeView: view }),
    setSearchQuery: (query) => set({ searchQuery: query }),
    setCompareSort: (sort) => set({ compareSort: sort }),
    setCompareFilter: (filter) => set({ compareFilter: filter }),
    setTheme: (theme) => set({ theme }),
    setResolvedTheme: (resolvedTheme) => set({ resolvedTheme }),
    setDetailBody: (body) => set({ detailBody: body }),
    openBodyDetail: (body) =>
      set({ detailBody: body, activeView: 'explore' }),
    setCustomBodyName: (name) => set({ customBodyName: name.slice(0, 40) }),
    setCustomMassInput: (value) => set({ customMassInput: value }),
    setCustomMassUnit: (unit) => set({ customMassUnit: unit }),
    setCustomRadiusInput: (value) => set({ customRadiusInput: value }),
    setCustomRadiusUnit: (unit) => set({ customRadiusUnit: unit }),
    setShowBreakdown: (show) => set({ showBreakdown: show }),
  };
});
