'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Globe, MapPin } from 'lucide-react';
import { REGIONS, RegionId } from './types';

interface StepRegionSelectorProps {
  selectedRegion: string | null;
  onRegionSelect: (regionId: RegionId) => void;
}

export function StepRegionSelector({ selectedRegion, onRegionSelect }: StepRegionSelectorProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Select Region</h2>
        <p className="text-muted-foreground">
          Choose the region for which you want to create or configure a payment flow.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {REGIONS.map((region) => {
          const isSelected = selectedRegion === region.id;
          return (
            <Card
              key={region.id}
              className={cn(
                'cursor-pointer transition-all hover:border-primary/50 hover:shadow-md',
                isSelected && 'border-primary bg-primary/5 ring-2 ring-primary ring-offset-2'
              )}
              onClick={() => onRegionSelect(region.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-lg',
                      isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    )}
                  >
                    {region.id === 'US' ? (
                      <MapPin className="h-5 w-5" />
                    ) : (
                      <Globe className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-base">{region.name}</CardTitle>
                    <CardDescription className="text-xs">{region.id}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{region.description}</p>
                {isSelected && (
                  <div className="mt-3 flex items-center gap-2 text-sm font-medium text-primary">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    Selected
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="rounded-lg border bg-muted/50 p-4">
        <div className="flex items-start gap-3">
          <Globe className="mt-0.5 h-5 w-5 text-muted-foreground" />
          <div>
            <Label className="text-sm font-medium">Region Configuration</Label>
            <p className="text-sm text-muted-foreground">
              Each region can have its own unique flow configuration with different nodes and
              connections. Changes to one region will not affect others.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
