/**
 * Flow Builder - Core Types
 * 
 * Framework-agnostic type definitions for the flow builder.
 * These types can be used in any React project (Next.js, CRA, Vite, etc.)
 */

// ============================================
// Core Data Types
// ============================================

// Section count constraints
export const MIN_SECTIONS = 2;
export const MAX_SECTIONS = 8;
export const DEFAULT_SECTION_COUNT = 4;

export interface FlowNode {
  id: string;
  appId: string;
  appName: string;
  mappedAppId?: string;
  description: string;
  type: 'Internal' | 'External' | null;
  sectionIndex: number;
  orderInSection: number;
  nodeWidth: number;
  nodeHeight: number;
  xPosition: number;
  yPosition: number;
}

export interface FlowConnection {
  id: string;
  fromNodeId: string;
  toNodeId: string;
}

export interface FlowConfiguration {
  id?: string;
  region: string;
  area?: string;
  sectionCount: number;
  sectionHeaders: string[];
  nodes: FlowNode[];
  connections: FlowConnection[];
  createdAt?: string;
  updatedAt?: string;
}

// ============================================
// UI State Types
// ============================================

export type WizardStep = 1 | 2 | 3 | 4 | 5 | 6;

export interface FlowBuilderState {
  currentStep: WizardStep;
  region: string | null;
  area: string;
  sectionCount: number;
  sectionHeaders: string[];
  nodes: FlowNode[];
  connections: FlowConnection[];
  isGenerating: boolean;
  isSaving: boolean;
  error: string | null;
}

// ============================================
// Configuration & Constants
// ============================================

export interface PositionConfig {
  canvasPadding: number;
  headerY: number;
  firstNodeY: number;
  defaultNodeWidth: number;
  defaultNodeHeight: number;
  nodeGapY: number;
  sectionGapX: number;
}

export const DEFAULT_POSITION_CONFIG: PositionConfig = {
  canvasPadding: 50,
  headerY: 20,
  firstNodeY: 100,
  defaultNodeWidth: 294,
  defaultNodeHeight: 174,
  nodeGapY: 26,
  sectionGapX: 106,
};

// Helper to calculate X position for a section
export function getSectionXPosition(sectionIndex: number, config: PositionConfig = DEFAULT_POSITION_CONFIG): number {
  return config.canvasPadding + sectionIndex * (config.defaultNodeWidth + config.sectionGapX);
}

// Helper to calculate canvas width based on section count
export function getCanvasWidth(sectionCount: number, config: PositionConfig = DEFAULT_POSITION_CONFIG): number {
  return config.canvasPadding * 2 + sectionCount * config.defaultNodeWidth + (sectionCount - 1) * config.sectionGapX;
}

// Helper to generate default headers based on section count
export function generateDefaultHeaders(count: number): string[] {
  const defaultNames = [
    'Initiation',
    'Processing',
    'Clearing',
    'Settlement',
    'Confirmation',
    'Archival',
    'Audit',
    'Reporting',
  ];
  return Array.from({ length: count }, (_, i) => defaultNames[i] || `Section ${i + 1}`);
}

export interface RegionOption {
  id: string;
  name: string;
  description: string;
}

export const DEFAULT_REGIONS: RegionOption[] = [
  { id: 'US', name: 'United States', description: 'US Wire Transfer Flow' },
  { id: 'INDIA', name: 'India', description: 'India Payment Flow' },
  { id: 'APAC', name: 'Asia Pacific', description: 'APAC Regional Flow' },
];

export const DEFAULT_SECTION_HEADERS: string[] = generateDefaultHeaders(DEFAULT_SECTION_COUNT);

// ============================================
// Action Types (for reducer pattern)
// ============================================

export type FlowBuilderAction =
  | { type: 'SET_STEP'; payload: WizardStep }
  | { type: 'SET_REGION'; payload: string }
  | { type: 'SET_AREA'; payload: string }
  | { type: 'SET_SECTION_COUNT'; payload: number }
  | { type: 'SET_HEADER'; payload: { index: number; value: string } }
  | { type: 'ADD_NODE'; payload: Omit<FlowNode, 'id' | 'xPosition' | 'yPosition'> }
  | { type: 'UPDATE_NODE'; payload: { id: string; updates: Partial<FlowNode> } }
  | { type: 'DELETE_NODE'; payload: string }
  | { type: 'ADD_CONNECTION'; payload: { fromNodeId: string; toNodeId: string } }
  | { type: 'DELETE_CONNECTION'; payload: string }
  | { type: 'SET_GENERATING'; payload: boolean }
  | { type: 'SET_SAVING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET' }
  | { type: 'LOAD_CONFIGURATION'; payload: FlowConfiguration };

// ============================================
// Persistence Interface (for adapter pattern)
// ============================================

export interface FlowPersistenceAdapter {
  saveConfiguration(config: FlowConfiguration): Promise<{ success: boolean; id?: string; error?: string }>;
  loadConfiguration(id: string): Promise<FlowConfiguration | null>;
  loadConfigurationsByRegion(region: string): Promise<FlowConfiguration[]>;
  deleteConfiguration(id: string): Promise<{ success: boolean; error?: string }>;
}

// ============================================
// Component Props Types
// ============================================

export interface FlowBuilderProps {
  /** Initial configuration to load */
  initialConfig?: Partial<FlowConfiguration>;
  /** Available regions to select from */
  regions?: RegionOption[];
  /** Position configuration for node layout */
  positionConfig?: PositionConfig;
  /** Persistence adapter for saving/loading */
  persistenceAdapter?: FlowPersistenceAdapter;
  /** Callback when configuration is saved */
  onSave?: (config: FlowConfiguration) => void;
  /** Callback when flow is generated */
  onGenerate?: (config: FlowConfiguration) => void;
  /** Custom class name */
  className?: string;
}

export interface StepProps {
  state: FlowBuilderState;
  dispatch: React.Dispatch<FlowBuilderAction>;
  positionConfig: PositionConfig;
  regions: RegionOption[];
}
