/**
 * Flow Builder Library
 * 
 * A modular, framework-agnostic flow builder for React applications.
 * Can be used in Next.js, Create React App, Vite, or any React project.
 * 
 * @example
 * ```tsx
 * import { useFlowBuilder, FlowBuilderProps } from '@/lib/flow-builder';
 * 
 * function MyFlowBuilder() {
 *   const flowBuilder = useFlowBuilder({
 *     regions: [{ id: 'US', name: 'United States', description: 'US Flow' }],
 *     onSave: (config) => console.log('Saved:', config),
 *   });
 * 
 *   return (
 *     <div>
 *       <p>Current Step: {flowBuilder.currentStep}</p>
 *       <button onClick={flowBuilder.goNext} disabled={!flowBuilder.canProceed}>
 *         Next
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */

// ============================================
// Types
// ============================================

export type {
  FlowNode,
  FlowConnection,
  FlowConfiguration,
  WizardStep,
  FlowBuilderState,
  FlowBuilderAction,
  PositionConfig,
  RegionOption,
  FlowPersistenceAdapter,
  FlowBuilderProps,
  StepProps,
} from './types';

export {
  DEFAULT_POSITION_CONFIG,
  DEFAULT_REGIONS,
  DEFAULT_SECTION_HEADERS,
} from './types';

// ============================================
// Utilities
// ============================================

export {
  generateId,
  calculateNodePosition,
  recalculateAllPositions,
  createNode,
  getNextOrderInSection,
  getNodesBySection,
  createConnection,
  isValidConnection,
  removeOrphanedConnections,
  validateConfiguration,
  configurationToJSON,
  configurationFromJSON,
  nodeToDbRecord,
  dbRecordToNode,
} from './utils';

export type { ValidationResult, DatabaseNodeRecord } from './utils';

// ============================================
// State Management
// ============================================

export {
  createInitialState,
  flowBuilderReducer,
  createFlowBuilderReducer,
} from './reducer';

// ============================================
// React Hook
// ============================================

export { useFlowBuilder } from './use-flow-builder';
export type { UseFlowBuilderOptions, UseFlowBuilderReturn } from './use-flow-builder';

// ============================================
// React Context
// ============================================

export { FlowBuilderProvider, useFlowBuilderContext } from './context';
export type { FlowBuilderProviderProps } from './context';
