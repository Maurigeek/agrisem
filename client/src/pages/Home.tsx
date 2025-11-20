import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Package, Truck, Shield, Sprout } from 'lucide-react';
import { WeatherWidget } from '@/components/weather/WeatherWidget';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { BestProducts } from '@/components/home/BestProducts';
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { WeatherPanel } from '@/components/weather/WeatherPanel';



// Images du carrousel Hero
const heroImages = [
  "/images/se.jpg",
];

const API_BASE = import.meta.env.VITE_API_BASE;


export default function Home() {
  // Carousel
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Weather API REAL CALL
  const { data: weatherData } = useQuery({
    queryKey: ['/api/v1/weather'],
    queryFn: () =>
    fetch(`${API_BASE}/weather`).then((r) => r.json()),
  });

  // console.log("Weather response:", weatherData);

  const stats = [
    { value: '6', label: 'Cultures Disponibles', icon: Sprout },
    { value: '40+', label: 'Variétés Certifiées', icon: Package },
    { value: '100%', label: 'Livraison Garantie', icon: Truck },
  ];

  return (
    <div className="min-h-screen">

      {/* ====================== */}
      {/* 🚀 HERO AVEC CAROUSEL */}
      {/* ====================== */}
      <section className="relative bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        
        {/* IMAGES */}
        {heroImages.map((img, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-[1200ms] ${
              index === current ? "opacity-100" : "opacity-0"
            }`}
            style={{
              backgroundImage: `url(${img})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          ></div>
        ))}

        {/* OVERLAY */}
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />

        {/* TEXTE */}
        <div className="relative container mx-auto px-4 py-24 md:py-32">
          <div className="max-w-3xl text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-lg">
              Semences Certifiées pour l'Agriculture Moderne
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Des semences de haute qualité pour une agriculture productive et durable
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href="/catalog">
                <Button size="lg" variant="secondary" className="text-lg">
                  Parcourir le Catalogue
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/articles">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg border-white text-white hover:bg-white/20"
                >
                  Comment ça marche
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================================ */}
      {/* 📊 STATISTIQUES VISUELLES         */}
      {/* ================================ */}
      <section className="bg-background border-b py-12">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center shadow-sm hover:shadow-md transition">
              <CardContent className="pt-6">
                <stat.icon className="h-12 w-12 mx-auto mb-4 text-primary" />
                <div className="text-4xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <p className="text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ================================ */}
      {/* 🌦️ WIDGET METEO REALISTE         */}
      {/* ================================ */}
      {/* <section className="bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Prévisions Météorologiques</h2>
          {weatherData ? (
            <WeatherWidget
              forecast={weatherData.forecast}
              cumulativeRainfall={weatherData.cumulativeRainfall}
            />
          ) : (
             <div className="w-full flex justify-center py-12">
              <LoadingSpinner />
            </div>
          )}
        </div>
      </section> */}


<section className="bg-muted/30 py-12">
  <div className="container mx-auto px-4">
    <h2 className="text-3xl font-bold mb-2">Prévisions Météorologiques</h2>
    <p className="text-muted-foreground mb-8">
      Pour votre zone — détection automatique. Vous pouvez aussi sélectionner une ville.
    </p>
    <WeatherPanel />
  </div>
</section>

      
      {/* ================================ */}
      {/* 🌟 MEILLEURS PRODUITS */}
      {/* ================================ */}

      <section className="py-12 bg-background border-t">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Meilleures Semences</h2>

          <BestProducts />
        </div>
      </section>


      {/* ================================ */}
      {/* 🌱 CONSEIL DU JOUR                */}
      {/* ================================ */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Conseil du Jour</h2>
          <Card className="overflow-hidden shadow">
            <div className="md:flex">
              <img
                src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&h=400"
                className="md:w-1/3 h-64 md:h-full object-cover"
                alt=""
              />

              <div className="md:w-2/3 p-8">
                <h3 className="text-2xl font-bold mb-4">
                  Préparation du Sol pour la Saison des Pluies
                </h3>
                <p className="text-muted-foreground mb-6">
                 Découvrez les meilleures pratiques pour préparer votre sol avant les semis. 
                 Un bon travail du sol garantit une germination optimale et une croissance 
                 vigoureuse de vos cultures.
                </p>
                <Link href="/articles">
                  <Button>
                    Lire la suite  
                    <ArrowRight className="ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ================================ */}
      {/* 🛡️ SECTION CONFIANCE              */}
      {/* ================================ */}
      <section className="bg-brand-light py-16 text-center">
        <Shield className="h-16 w-16 mx-auto mb-6 text-primary" />
        <h2 className="text-3xl font-bold mb-4">Qualité et Confiance</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Nos semences sont testées et certifiées pour garantir des récoltes abondantes.
        </p>
      </section>
    </div>
  );
}
