import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cloud, CloudRain, Sun, Droplets } from 'lucide-react';
import type { WeatherForecast } from '@/shared/schema';

interface WeatherWidgetProps {
  forecast: WeatherForecast[];
  cumulativeRainfall: number;
}

export function WeatherWidget({ forecast, cumulativeRainfall }: WeatherWidgetProps) {
  const getWeatherIcon = (condition: string) => {
    if (condition.toLowerCase().includes('rain')) return CloudRain;
    if (condition.toLowerCase().includes('cloud')) return Cloud;
    return Sun;
  };

  return (
    <Card data-testid="card-weather">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="h-5 w-5 text-primary" />
          Prévisions météo (7 jours)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
          {forecast.map((day, index) => {
            const Icon = getWeatherIcon(day.condition);
            const date = new Date(day.date);
            const dayName = date.toLocaleDateString('fr-FR', { weekday: 'short' });

            return (
              <div
                key={index}
                className="flex flex-col items-center p-4 rounded-lg bg-muted/50"
                data-testid={`weather-day-${index}`}
              >
                <span className="text-sm font-medium capitalize">{dayName}</span>
                <Icon className="h-8 w-8 my-2 text-primary" />
                <div className="text-center">
                  <p className="text-lg font-semibold">{day.tempMax}°C</p>
                  <p className="text-xs text-muted-foreground">{day.tempMin}°C</p>
                </div>
                {day.rainfallMm > 0 && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-blue-600">
                    <Droplets className="h-3 w-3" />
                    <span>{day.rainfallMm}mm</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2">
            <Droplets className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium">Pluie cumulée (7 jours)</p>
              <p className="text-2xl font-bold text-blue-600" data-testid="text-cumulative-rainfall">
                {cumulativeRainfall.toFixed(1)} mm
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
