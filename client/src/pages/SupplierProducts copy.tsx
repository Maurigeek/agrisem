import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StockBadge } from '@/components/product/StockBadge';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { EmptyState } from '@/components/ui/empty-state';
import { Package2 } from 'lucide-react';

export default function SupplierProducts() {
  const { user } = useAuthStore();
  const [view, setView] = useState<'grid' | 'table'>('grid');

  // Mock products - will be replaced with API call in Task 3
  const products = user?.role === 'SUPPLIER' ? [
    {
      id: 1,
      title: 'Semences Maïs Hybride FBC6 - Sac 25kg',
      sku: 'SKU-1001',
      priceCents: 15000,
      currency: 'XOF',
      stock: 45,
      status: 'ACTIVE' as const,
      images: ['https://picsum.photos/seed/1/400/300'],
    },
    {
      id: 2,
      title: 'Semences Riz NERICA - Sac 20kg',
      sku: 'SKU-1002',
      priceCents: 18000,
      currency: 'XOF',
      stock: 8,
      status: 'ACTIVE' as const,
      images: ['https://picsum.photos/seed/2/400/300'],
    },
    {
      id: 3,
      title: 'Semences Tomate Roma - 500g',
      sku: 'SKU-1003',
      priceCents: 5000,
      currency: 'XOF',
      stock: 0,
      status: 'DRAFT' as const,
      images: ['https://picsum.photos/seed/3/400/300'],
    },
  ] : [];

  if (user?.role !== 'SUPPLIER') {
    return (
      <div className="container mx-auto px-4 py-16">
        <EmptyState
          icon={Package2}
          title="Accès restreint"
          description="Cette page est réservée aux fournisseurs"
          action={{
            label: 'Retour à l\'accueil',
            onClick: () => window.location.href = '/',
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-muted/30 border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">
                Mes Produits
              </h1>
              <p className="text-muted-foreground">
                Gérez votre catalogue de semences
              </p>
            </div>
            <Button data-testid="button-add-product">
              <Plus className="h-4 w-4 mr-2" />
              Nouveau produit
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {products.length === 0 ? (
          <EmptyState
            icon={Package2}
            title="Aucun produit"
            description="Commencez par ajouter votre premier produit au catalogue"
            action={{
              label: 'Ajouter un produit',
              onClick: () => console.log('Add product'),
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} data-testid={`card-product-${product.id}`}>
                <div className="aspect-[4/3] relative overflow-hidden bg-muted rounded-t-lg">
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute top-2 right-2">
                    <StockBadge stock={product.stock} />
                  </div>
                  <div className="absolute top-2 left-2">
                    <Badge variant={product.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {product.status === 'ACTIVE' ? 'Actif' : 'Brouillon'}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2 line-clamp-2">
                    {product.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    SKU: {product.sku}
                  </p>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-xl font-bold text-brand-accent">
                      {(product.priceCents / 100).toLocaleString('fr-FR')}
                    </span>
                    <span className="text-sm text-muted-foreground">{product.currency}</span>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" data-testid={`button-edit-${product.id}`}>
                      <Edit className="h-4 w-4 mr-1" />
                      Modifier
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive" data-testid={`button-delete-${product.id}`}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
