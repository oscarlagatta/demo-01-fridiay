'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutGrid } from 'lucide-react';

interface StepSectionHeadersProps {
  sectionHeaders: [string, string, string, string];
  onHeaderChange: (index: number, value: string) => void;
}

export function StepSectionHeaders({ sectionHeaders, onHeaderChange }: StepSectionHeadersProps) {
  const sectionDescriptions = [
    'First stage of the payment flow - typically where transactions originate',
    'Second stage - where payment validation and processing occurs',
    'Third stage - clearing and intermediate processing steps',
    'Final stage - settlement and completion of transactions',
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Configure Section Headers</h2>
        <p className="text-muted-foreground">
          Define the names for each of the 4 sections in your payment flow. These headers will be
          displayed at the top of each column in the flow diagram.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {sectionHeaders.map((header, index) => (
          <Card key={index} className="transition-all hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">
                  {index + 1}
                </div>
                <div>
                  <CardTitle className="text-base">Section {index + 1}</CardTitle>
                  <CardDescription className="text-xs">{sectionDescriptions[index]}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor={`section-${index}`}>Header Name</Label>
                <Input
                  id={`section-${index}`}
                  value={header}
                  onChange={(e) => onHeaderChange(index, e.target.value)}
                  placeholder={`Enter section ${index + 1} name`}
                  maxLength={50}
                />
                <p className="text-xs text-muted-foreground">{header.length}/50 characters</p>
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
              The flow diagram will display 4 columns from left to right, each representing a stage
              in the payment process. Nodes you add will be organized under these sections.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
