import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import type { Culture } from '@/shared/schema';

interface ProductFiltersProps {
  cultures: Culture[];
  selectedCultures: number[];
  onCultureChange: (cultureIds: number[]) => void;
  priceRange: [number, number];
  onPriceChange: (range: [number, number]) => void;
  onReset: () => void;
}

export function ProductFilters({
  cultures,
  selectedCultures,
  onCultureChange,
  priceRange,
  onPriceChange,
  onReset,
}: ProductFiltersProps) {
  const handleCultureToggle = (cultureId: number) => {
    if (selectedCultures.includes(cultureId)) {
      onCultureChange(selectedCultures.filter(id => id !== cultureId));
    } else {
      onCultureChange([...selectedCultures, cultureId]);
    }
  };

  const maxPrice = 100000; // 1000 XOF max for slider

  return (
    <Card data-testid="card-filters">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg">Filtres</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="h-8 px-2"
          data-testid="button-reset-filters"
        >
          <X className="h-4 w-4 mr-1" />
          Réinitialiser
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Cultures */}
        <div>
          <Label className="text-base font-semibold mb-3 block">Cultures</Label>
          <div className="space-y-2">
            {cultures.map((culture) => (
              <div key={culture.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`culture-${culture.id}`}
                  checked={selectedCultures.includes(culture.id)}
                  onCheckedChange={() => handleCultureToggle(culture.id)}
                  data-testid={`checkbox-culture-${culture.id}`}
                />
                <label
                  htmlFor={`culture-${culture.id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {culture.name}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <Label className="text-base font-semibold mb-3 block">
            Prix (XOF)
          </Label>
          <div className="space-y-4">
            <Slider
              min={0}
              max={maxPrice}
              step={1000}
              value={priceRange}
              onValueChange={(value) => onPriceChange(value as [number, number])}
              className="w-full"
              data-testid="slider-price"
            />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span data-testid="text-min-price">
                {(priceRange[0] / 100).toLocaleString('fr-FR')} XOF
              </span>
              <span data-testid="text-max-price">
                {(priceRange[1] / 100).toLocaleString('fr-FR')} XOF
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
