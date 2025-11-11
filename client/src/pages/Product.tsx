import { useState } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StockBadge } from '@/components/product/StockBadge';
import { useCartStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import {
  ShoppingCart,
  MessageCircle,
  Plus,
  Minus,
  Truck,
  Shield,
  Clock,
  Sun,
  Droplets,
  ChevronLeft,
} from 'lucide-react';
import { Link } from 'wouter';

export default function Product() {
  const [, params] = useRoute('/products/:id');
  const [, navigate] = useLocation();
  const productId = params?.id ? parseInt(params.id) : null;
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCartStore();
  const { toast } = useToast();

  // Fetch product data from API
  const { data: product, isLoading } = useQuery({
    queryKey: ['/api/v1/products', productId],
    enabled: !!productId,
  });

  // Mock variety and supplier data (would be fetched from API in full implementation)
  const variety = product ? {
    id: product.varietyId,
    cultureId: 1,
    name: 'Maïs Hybride FBC6',
    maturityDays: 90,
    description: 'Variété hybride à haut rendement, résistante à la sécheresse',
    climateSuitability: {
      temperature: '25-35°C',
      rainfall: 'Modéré (600-800mm)',
      zones: ['Sahel', 'Savane'],
    },
  } : null;

  const supplier = product ? {
    id: product.supplierId,
    firstName: 'Amadou',
    lastName: 'Diallo',
    orgName: 'Semences du Sahel',
    isSupplierVerified: true,
  } : null;

  const handleAddToCart = () => {
    if (!product) return;

    addItem({
      id: Date.now(),
      cartId: 1,
      productId: product.id!,
      qty: quantity,
      product,
    });

    toast({
      title: 'Produit ajouté au panier',
      description: `${quantity} x ${product.title}`,
    });
  };

  const handleContactSupplier = () => {
    navigate('/messaging');
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-muted rounded mb-4 mx-auto" />
          <div className="h-4 w-32 bg-muted rounded mx-auto" />
        </div>
      </div>
    );
  }

  // Show not found only after loading
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Produit non trouvé</h1>
        <Link href="/catalog">
          <Button>Retour au catalogue</Button>
        </Link>
      </div>
    );
  }

  const price = (product.priceCents / 100).toLocaleString('fr-FR');

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/catalog">
            <a className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Retour au catalogue
            </a>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div>
            <div className="aspect-[4/3] rounded-lg overflow-hidden bg-muted mb-4">
              <img
                src={product.images[selectedImage]}
                alt={product.title}
                className="w-full h-full object-cover"
                data-testid="img-product-main"
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === index
                      ? 'border-primary'
                      : 'border-transparent hover:border-muted-foreground'
                  }`}
                  data-testid={`button-thumbnail-${index}`}
                >
                  <img
                    src={image}
                    alt={`${product.title} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2" data-testid="text-product-title">
                  {product.title}
                </h1>
                <p className="text-muted-foreground">{variety.name}</p>
              </div>
              <StockBadge stock={product.stock} />
            </div>

            {/* Supplier */}
            <div className="flex items-center gap-2 mb-6 p-4 rounded-lg bg-muted/50">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Fournisseur</p>
                <p className="font-medium">{supplier.orgName}</p>
              </div>
              {supplier.isSupplierVerified && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <Shield className="h-3 w-3 mr-1" />
                  Vérifié
                </Badge>
              )}
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-bold text-brand-accent" data-testid="text-product-price">
                  {price}
                </span>
                <span className="text-xl text-muted-foreground">{product.currency}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Quantité minimum: {product.minOrderQty}
              </p>
            </div>

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Quantité</label>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(product.minOrderQty, quantity - 1))}
                  disabled={quantity <= product.minOrderQty}
                  data-testid="button-decrease-qty"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-xl font-semibold w-12 text-center" data-testid="text-quantity">
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={quantity >= product.stock}
                  data-testid="button-increase-qty"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 mb-8">
              <Button
                size="lg"
                className="flex-1"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                data-testid="button-add-to-cart"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Ajouter au panier
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleContactSupplier}
                data-testid="button-contact-supplier"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Contacter
              </Button>
            </div>

            {/* Climate Suitability */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4">Adaptation Climatique</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Sun className="h-5 w-5 text-brand-accent" />
                    <div>
                      <p className="text-sm text-muted-foreground">Température</p>
                      <p className="font-medium">{variety.climateSuitability.temperature}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Droplets className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Pluviométrie</p>
                      <p className="font-medium">{variety.climateSuitability.rainfall}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Maturité</p>
                      <p className="font-medium">{variety.maturityDays} jours</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Info */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Truck className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold mb-2">Livraison</h3>
                    <p className="text-sm text-muted-foreground">
                      Livraison disponible dans toute la région. Délai estimé: 3-5 jours ouvrables.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Specifications */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Spécifications</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Taux de germination</p>
                  <p className="font-medium">{product.specs.germination}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Origine</p>
                  <p className="font-medium">{product.specs.origin}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Certification</p>
                  <p className="font-medium">{product.specs.certification}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Pureté</p>
                  <p className="font-medium">{product.specs.purity}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">SKU</p>
                  <p className="font-medium">{product.sku}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Description */}
        {variety.description && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Description</h2>
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground leading-relaxed">
                  {variety.description}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
