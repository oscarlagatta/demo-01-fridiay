'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LayoutGrid, Minus, Plus } from 'lucide-react';
import { MIN_SECTIONS, MAX_SECTIONS, generateDefaultHeaders } from './types';

interface StepSectionHeadersProps {
  sectionCount: number;
  sectionHeaders: string[];
  onSectionCountChange: (count: number) => void;
  onHeaderChange: (index: number, value: string) => void;
}

export function StepSectionHeaders({
  sectionCount,
  sectionHeaders,
  onSectionCountChange,
  onHeaderChange,
}: StepSectionHeadersProps) {
  const getSectionDescription = (index: number): string => {
    const descriptions: Record<number, string> = {
      0: 'First stage of the payment flow - typically where transactions originate',
      1: 'Second stage - where payment validation and processing occurs',
      2: 'Third stage - clearing and intermediate processing steps',
      3: 'Fourth stage - settlement and completion of transactions',
      4: 'Fifth stage - confirmation and acknowledgment',
      5: 'Sixth stage - archival and record keeping',
      6: 'Seventh stage - audit and compliance',
      7: 'Eighth stage - reporting and analytics',
    };
    return descriptions[index] || `Stage ${index + 1} of the payment flow`;
  };

  const handleIncrement = () => {
    if (sectionCount < MAX_SECTIONS) {
      onSectionCountChange(sectionCount + 1);
    }
  };

  const handleDecrement = () => {
    if (sectionCount > MIN_SECTIONS) {
      onSectionCountChange(sectionCount - 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= MIN_SECTIONS && value <= MAX_SECTIONS) {
      onSectionCountChange(value);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Configure Section Headers</h2>
        <p className="text-muted-foreground">
          Define the number of sections and their names for your payment flow. These headers will be
          displayed at the top of each column in the flow diagram.
        </p>
      </div>

      {/* Section Count Selector */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Number of Sections</CardTitle>
          <CardDescription>
            Choose how many sections your flow will have (between {MIN_SECTIONS} and {MAX_SECTIONS})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleDecrement}
                disabled={sectionCount <= MIN_SECTIONS}
                className="h-10 w-10"
              >
                <Minus className="h-4 w-4" />
              </Button>
              
              <div className="relative">
                <Input
                  type="number"
                  min={MIN_SECTIONS}
                  max={MAX_SECTIONS}
                  value={sectionCount}
                  onChange={handleInputChange}
                  className="h-10 w-20 text-center text-lg font-semibold [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
              </div>
              
              <Button
                variant="outline"
                size="icon"
                onClick={handleIncrement}
                disabled={sectionCount >= MAX_SECTIONS}
                className="h-10 w-10"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1">
              <input
                type="range"
                min={MIN_SECTIONS}
                max={MAX_SECTIONS}
                value={sectionCount}
                onChange={(e) => onSectionCountChange(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>{MIN_SECTIONS}</span>
                <span>{MAX_SECTIONS}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section Headers Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: sectionCount }).map((_, index) => (
          <Card key={index} className="transition-all hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">
                  {index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base">Section {index + 1}</CardTitle>
                  <CardDescription className="text-xs truncate">
                    {getSectionDescription(index)}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor={`section-${index}`}>Header Name</Label>
                <Input
                  id={`section-${index}`}
                  value={sectionHeaders[index] || ''}
                  onChange={(e) => onHeaderChange(index, e.target.value)}
                  placeholder={`Enter section ${index + 1} name`}
                  maxLength={50}
                />
                <p className="text-xs text-muted-foreground">
                  {(sectionHeaders[index] || '').length}/50 characters
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="rounded-lg border bg-muted/50 p-4">
        <div className="flex items-start gap-3">
          <LayoutGrid className="mt-0.5 h-5 w-5 text-muted-foreground" />
          <div>
            <Label className="text-sm font-medium">Section Layout</Label>
            <p className="text-sm text-muted-foreground">
              The flow diagram will display {sectionCount} columns from left to right, each representing a stage
              in the payment process. Nodes you add will be organized under these sections.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
