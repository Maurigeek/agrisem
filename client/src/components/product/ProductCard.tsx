import { Link } from 'wouter';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StockBadge } from './StockBadge';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Droplets, Sun, Clock } from 'lucide-react';
import type { Product } from '@/shared/schema';

interface ProductCardProps {
  product: Product;
  variety?: { name: string; maturityDays: number; climateSuitability: any };
}

export function ProductCard({ product, variety }: ProductCardProps) {
  const price = (product.priceCents / 100).toLocaleString('fr-FR');
  const imageUrl = product.images[0] || `https://picsum.photos/seed/${product.id}/400/300`;

  return (
    <Card
      className="overflow-hidden hover-elevate transition-all"
      data-testid={`card-product-${product.id}`}
    >
      <Link href={`/products/${product.id}`}>
        <div className="aspect-[4/3] relative overflow-hidden bg-muted cursor-pointer">
          <img
            src={imageUrl}
            alt={product.title}
            className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
            data-testid={`img-product-${product.id}`}
          />
          <div className="absolute top-2 right-2">
            <StockBadge stock={product.stock} />
          </div>
        </div>
      </Link>

      <CardContent className="p-4">
        <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 hover:text-primary transition-colors cursor-pointer">
            {product.title}
          </h3>
        </Link>

        {variety && (
          <p className="text-sm text-muted-foreground mb-3">{variety.name}</p>
        )}

        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-2xl font-bold text-brand-accent">
            {price}
          </span>
          <span className="text-sm text-muted-foreground">
            {product.currency}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {variety && (
            <>
              <Badge variant="secondary" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {variety.maturityDays}j
              </Badge>
              {variety.climateSuitability?.temperature && (
                <Badge variant="secondary" className="text-xs">
                  <Sun className="h-3 w-3 mr-1" />
                  {variety.climateSuitability.temperature}
                </Badge>
              )}
              {variety.climateSuitability?.rainfall && (
                <Badge variant="secondary" className="text-xs">
                  <Droplets className="h-3 w-3 mr-1" />
                  {variety.climateSuitability.rainfall}
                </Badge>
              )}
            </>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Link href={`/products/${product.id}`}>
          <Button
            className="w-full"
            disabled={product.stock === 0}
            data-testid={`button-view-product-${product.id}`}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {product.stock === 0 ? 'Rupture de stock' : 'Voir le produit'}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
