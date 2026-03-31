import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';

import { CalculatorView } from '../App';
import CompareView from '../components/CompareView';
import { BodyDetail } from '../components/BodyDetail';
import CustomBodyView from '../components/CustomBodyView';

// Mock the Zustand store for consistent snapshot rendering
vi.mock('../store/calculatorStore', () => ({
  useCalculatorStore: vi.fn(() => ({
    activeView: 'calculator',
    selectedBody: { id: 'mars', name: 'Mars', gravityMultiplier: 0.38, category: 'planet', surfaceGravityMs2: 3.72 },
    weightInput: '70',
    selectedUnit: 'lbs',
    displayG: false,
    theme: 'dark',
    compareSort: 'default',
    compareFilter: 'all',
    searchQuery: '',
    
    customBodyName: 'Test Body',
    customMassInput: '1',
    customMassUnit: 'earth',
    customRadiusInput: '1',
    customRadiusUnit: 'earth',
    showBreakdown: false,
    
    // Actions mock
    setActiveView: vi.fn(),
    setSelectedBodyId: vi.fn(),
    setWeightInput: vi.fn(),
    setSelectedUnit: vi.fn(),
    setDisplayG: vi.fn(),
    setTheme: vi.fn(),
    setResolvedTheme: vi.fn(),
    setCompareSort: vi.fn(),
    setCompareFilter: vi.fn(),
    setCustomBodyName: vi.fn(),
    setCustomMassInput: vi.fn(),
    setCustomMassUnit: vi.fn(),
    setCustomRadiusInput: vi.fn(),
    setCustomRadiusUnit: vi.fn(),
    setShowBreakdown: vi.fn(),
    openBodyDetail: vi.fn(),
    closeBodyDetail: vi.fn(),
  })),
}));

// Mock framer-motion AnimatePresence to avoid unpredictable wait times in jsdom
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion');
  return {
    ...actual,
    AnimatePresence: ({ children }: any) => <>{children}</>,
  };
});

describe('Component Snapshots', () => {
  it('CalculatorView matches snapshot', () => {
    const { container } = render(<CalculatorView />);
    expect(container).toMatchSnapshot();
  });

  it('CompareView matches snapshot', () => {
    const { container } = render(<CompareView />);
    expect(container).toMatchSnapshot();
  });

  it('BodyDetail matches snapshot', () => {
    const { container } = render(<BodyDetail />);
    expect(container).toMatchSnapshot();
  });

  it('CustomBodyView matches snapshot', () => {
    const { container } = render(<CustomBodyView />);
    expect(container).toMatchSnapshot();
  });
});
