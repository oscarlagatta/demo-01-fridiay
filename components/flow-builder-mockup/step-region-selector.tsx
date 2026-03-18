'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Globe, MapPin, Plus } from 'lucide-react';
import { DEFAULT_REGIONS, Region, RegionId } from './types';

interface StepRegionSelectorProps {
  selectedRegion: string | null;
  onRegionSelect: (regionId: RegionId) => void;
  customRegions?: Region[];
  onAddCustomRegion?: (region: Region) => void;
}

export function StepRegionSelector({
  selectedRegion,
  onRegionSelect,
  customRegions = [],
  onAddCustomRegion,
}: StepRegionSelectorProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newRegion, setNewRegion] = useState<Partial<Region>>({
    id: '',
    name: '',
    description: '',
  });
  const [errors, setErrors] = useState<{ id?: string; name?: string }>({});

  // Combine default and custom regions
  const allRegions = [...DEFAULT_REGIONS, ...customRegions];

  const validateAndAddRegion = () => {
    const newErrors: { id?: string; name?: string } = {};

    if (!newRegion.id?.trim()) {
      newErrors.id = 'Region ID is required';
    } else if (allRegions.some((r) => r.id.toUpperCase() === newRegion.id?.toUpperCase())) {
      newErrors.id = 'Region ID already exists';
    }

    if (!newRegion.name?.trim()) {
      newErrors.name = 'Region name is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const region: Region = {
      id: newRegion.id!.toUpperCase().trim(),
      name: newRegion.name!.trim(),
      description: newRegion.description?.trim() || `${newRegion.name} Payment Flow`,
      isCustom: true,
    };

    onAddCustomRegion?.(region);
    setIsDialogOpen(false);
    setNewRegion({ id: '', name: '', description: '' });
    setErrors({});

    // Auto-select the newly created region
    onRegionSelect(region.id);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Select Region</h2>
        <p className="text-muted-foreground">
          Choose an existing region or create a new one for your payment flow configuration.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {allRegions.map((region) => {
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
                    <CardTitle className="text-base">
                      {region.name}
                      {region.isCustom && (
                        <span className="ml-2 text-xs font-normal text-muted-foreground">
                          (Custom)
                        </span>
                      )}
                    </CardTitle>
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

        {/* Add New Region Card */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Card className="cursor-pointer border-dashed transition-all hover:border-primary/50 hover:bg-muted/50">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <Plus className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Add New Region</CardTitle>
                    <CardDescription className="text-xs">Create custom region</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Create a new region with custom configuration for your payment flows.
                </p>
              </CardContent>
            </Card>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Region</DialogTitle>
              <DialogDescription>
                Add a new region to configure payment flows for a specific geographic area.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="region-id">
                  Region ID <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="region-id"
                  placeholder="e.g., EMEA, LATAM, UK"
                  value={newRegion.id}
                  onChange={(e) => {
                    setNewRegion({ ...newRegion, id: e.target.value });
                    setErrors({ ...errors, id: undefined });
                  }}
                  className={cn(errors.id && 'border-destructive')}
                />
                {errors.id && <p className="text-xs text-destructive">{errors.id}</p>}
                <p className="text-xs text-muted-foreground">
                  Short identifier (will be converted to uppercase)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="region-name">
                  Region Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="region-name"
                  placeholder="e.g., Europe, Middle East & Africa"
                  value={newRegion.name}
                  onChange={(e) => {
                    setNewRegion({ ...newRegion, name: e.target.value });
                    setErrors({ ...errors, name: undefined });
                  }}
                  className={cn(errors.name && 'border-destructive')}
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="region-description">Description</Label>
                <Textarea
                  id="region-description"
                  placeholder="e.g., EMEA Regional Payment Flow"
                  value={newRegion.description}
                  onChange={(e) => setNewRegion({ ...newRegion, description: e.target.value })}
                  rows={2}
                />
                <p className="text-xs text-muted-foreground">
                  Optional description for this region
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={validateAndAddRegion}>Create Region</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
