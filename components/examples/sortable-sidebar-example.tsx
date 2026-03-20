'use client';

/**
 * Example: Sortable Sidebar Implementation
 * 
 * This demonstrates how to integrate the SortableSidebar component
 * with a full sidebar layout using shadcn UI components.
 */

import * as React from 'react';
import {
  Home,
  Users,
  FileText,
  Settings,
  Bell,
  Calendar,
  Mail,
  BarChart3,
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { 
  SortableSidebar, 
  useSortableSidebar,
  type SortableSidebarItem,
} from '@/components/ui/sortable-sidebar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

// Define initial sidebar items with icons
const INITIAL_ITEMS: SortableSidebarItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <Home className="h-4 w-4" /> },
  { id: 'users', label: 'Users', icon: <Users className="h-4 w-4" />, badge: 12 },
  { id: 'documents', label: 'Documents', icon: <FileText className="h-4 w-4" /> },
  { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="h-4 w-4" /> },
  { id: 'calendar', label: 'Calendar', icon: <Calendar className="h-4 w-4" /> },
  { id: 'mail', label: 'Messages', icon: <Mail className="h-4 w-4" />, badge: 5 },
  { id: 'notifications', label: 'Notifications', icon: <Bell className="h-4 w-4" /> },
  { id: 'settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> },
];

export function SortableSidebarExample() {
  const [selectedId, setSelectedId] = React.useState('dashboard');
  
  // Use the hook with persistence
  const { items, handleReorder, resetOrder } = useSortableSidebar({
    initialItems: INITIAL_ITEMS,
    persistence: {
      storageKey: 'example-sidebar-order',
      storageType: 'local',
    },
    onChange: (newItems, event) => {
      // Optional: track analytics or sync to server
      console.log('Sidebar reordered:', {
        movedItem: event.activeId,
        fromIndex: event.oldIndex,
        toIndex: event.newIndex,
      });
    },
  });

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="border-b">
          <div className="flex items-center gap-2 px-2 py-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Home className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">My App</span>
              <span className="text-xs text-muted-foreground">Workspace</span>
            </div>
          </div>
        </SidebarHeader>
        
        <SidebarContent>
          {/* Sortable Navigation */}
          <SortableSidebar
            items={items}
            onReorder={handleReorder}
            selectedId={selectedId}
            onSelect={setSelectedId}
            groupLabel="Navigation"
            showDragHandles={true}
            ariaLabel="Main navigation, drag to reorder"
          />
        </SidebarContent>
        
        <SidebarFooter className="border-t">
          <div className="p-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={resetOrder}
            >
              Reset Order
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
      
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b px-6">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-6" />
          <h1 className="text-lg font-semibold">
            {items.find(i => i.id === selectedId)?.label || 'Dashboard'}
          </h1>
        </header>
        
        <main className="flex-1 p-6">
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-xl font-semibold mb-4">
              Drag & Drop Sidebar Demo
            </h2>
            <p className="text-muted-foreground mb-4">
              Drag the grip handles in the sidebar to reorder navigation items.
              Your order is automatically saved to localStorage.
            </p>
            <div className="grid gap-2 text-sm">
              <p><strong>Selected:</strong> {selectedId}</p>
              <p><strong>Total Items:</strong> {items.length}</p>
              <p><strong>Current Order:</strong> {items.map(i => i.label).join(' → ')}</p>
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
