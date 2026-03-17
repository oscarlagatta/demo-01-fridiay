/**
 * Flow Builder - React Context
 * 
 * Context provider for sharing flow builder state across components.
 * Framework-agnostic - works in any React application.
 */

'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useFlowBuilder, UseFlowBuilderOptions, UseFlowBuilderReturn } from './use-flow-builder';

// ============================================
// Context
// ============================================

const FlowBuilderContext = createContext<UseFlowBuilderReturn | null>(null);

// ============================================
// Provider
// ============================================

export interface FlowBuilderProviderProps extends UseFlowBuilderOptions {
  children: ReactNode;
}

export function FlowBuilderProvider({ children, ...options }: FlowBuilderProviderProps) {
  const flowBuilder = useFlowBuilder(options);

  return (
    <FlowBuilderContext.Provider value={flowBuilder}>
      {children}
    </FlowBuilderContext.Provider>
  );
}

// ============================================
// Hook
// ============================================

export function useFlowBuilderContext(): UseFlowBuilderReturn {
  const context = useContext(FlowBuilderContext);
  if (!context) {
    throw new Error('useFlowBuilderContext must be used within a FlowBuilderProvider');
  }
  return context;
}
