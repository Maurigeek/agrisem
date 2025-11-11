import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Package, Truck, Shield, Sprout } from 'lucide-react';
import { WeatherWidget } from '@/components/weather/WeatherWidget';
import { useQuery } from '@tanstack/react-query';

export default function Home() {
  // Fetch weather data from API
  const { data: weatherData } = useQuery({
    queryKey: ['/api/v1/advice/weather'],
  });

  const stats = [
    { value: '6', label: 'Cultures Disponibles', icon: Sprout },
    { value: '40+', label: 'Variétés Certifiées', icon: Package },
    { value: '100%', label: 'Livraison Garantie', icon: Truck },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative container mx-auto px-4 py-24 md:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6" data-testid="text-hero-title">
              Semences Certifiées pour l'Agriculture Moderne
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-foreground/90">
              Découvrez notre sélection de semences de qualité supérieure pour
              une agriculture productive et durable
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/catalog">
                <Button size="lg" variant="secondary" className="text-lg" data-testid="button-browse-catalog">
                  Parcourir le Catalogue
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/articles">
                <Button size="lg" variant="outline" className="text-lg bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20" data-testid="button-view-articles">
                  Comment ça marche
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-background border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <stat.icon className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <div className="text-4xl font-bold text-primary mb-2" data-testid={`stat-value-${index}`}>
                    {stat.value}
                  </div>
                  <p className="text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Weather Widget Section */}
      <section className="bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Prévisions Météorologiques</h2>
          {weatherData && (
            <WeatherWidget
              forecast={weatherData.forecast}
              cumulativeRainfall={weatherData.cumulativeRainfall}
            />
          )}
        </div>
      </section>

      {/* Conseil du Jour */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Conseil du Jour</h2>
          <Card className="overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/3">
                <img
                  src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&h=400&fit=crop"
                  alt="Conseil agricole"
                  className="w-full h-64 md:h-full object-cover"
                />
              </div>
              <div className="md:w-2/3 p-6 md:p-8">
                <h3 className="text-2xl font-bold mb-4">
                  Préparation du Sol pour la Saison des Pluies
                </h3>
                <p className="text-muted-foreground mb-6">
                  Découvrez les meilleures pratiques pour préparer votre sol avant les
                  semis. Un bon travail du sol garantit une germination optimale et une
                  croissance vigoureuse de vos cultures.
                </p>
                <Link href="/articles">
                  <Button data-testid="button-read-more">
                    Lire la suite
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Trust Section */}
      <section className="bg-brand-light py-12">
        <div className="container mx-auto px-4 text-center">
          <Shield className="h-16 w-16 mx-auto mb-6 text-primary" />
          <h2 className="text-3xl font-bold mb-4">Qualité et Confiance</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Toutes nos semences sont certifiées et testées pour garantir un taux de
            germination élevé et des récoltes abondantes. Rejoignez des milliers
            d'agriculteurs qui nous font confiance.
          </p>
        </div>
      </section>
    </div>
  );
}
