import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardTiles } from '@/components/dashboard/DashboardTiles';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Users, DollarSign, ShoppingCart, Shield, Ban } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { EmptyState } from '@/components/ui/empty-state';

export default function Admin() {
  const { user } = useAuthStore();

  // Mock data - will be replaced with API call in Task 3
  const stats = {
    totalSuppliers: 15,
    pendingSuppliers: 3,
    totalProducts: 156,
    activeProducts: 142,
    totalOrders: 248,
    totalRevenueCents: 3500000,
  };

  const pendingSuppliers = user?.role === 'ADMIN' ? [
    {
      id: 1,
      email: 'nouvel@fournisseur.com',
      firstName: 'Ibrahim',
      lastName: 'Sawadogo',
      orgName: 'Semences Bio Sahel',
      isSupplierVerified: false,
    },
    {
      id: 2,
      email: 'seeds@africa.com',
      firstName: 'Aminata',
      lastName: 'Diallo',
      orgName: 'Africa Seeds Co',
      isSupplierVerified: false,
    },
  ] : [];

  const kpiTiles = [
    {
      title: 'Fournisseurs',
      value: stats.totalSuppliers.toString(),
      icon: Users,
    },
    {
      title: 'Produits Actifs',
      value: stats.activeProducts.toString(),
      icon: Package,
    },
    {
      title: 'Commandes',
      value: stats.totalOrders.toString(),
      icon: ShoppingCart,
    },
    {
      title: 'Revenu Total',
      value: `${(stats.totalRevenueCents / 100).toLocaleString('fr-FR')} XOF`,
      icon: DollarSign,
    },
  ];

  const handleVerifySupplier = (supplierId: number) => {
    console.log('Verify supplier', supplierId);
    // Will be implemented with API in Task 3
  };

  const handleBlockProduct = (productId: number) => {
    console.log('Block product', productId);
    // Will be implemented with API in Task 3
  };

  // if (user?.role !== 'ADMIN') {
  //   return (
  //     <div className="container mx-auto px-4 py-16">
  //       <EmptyState
  //         icon={Shield}
  //         title="Accès restreint"
  //         description="Cette page est réservée aux administrateurs"
  //         action={{
  //           label: 'Retour à l\'accueil',
  //           onClick: () => window.location.href = '/',
  //         }}
  //       />
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-muted/30 border-b">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-2" data-testid="text-admin-title">
            Administration
          </h1>
          <p className="text-muted-foreground">
            Gérez la plateforme AGRI-SEM
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* KPIs */}
        <DashboardTiles tiles={kpiTiles} />

        {/* Pending Suppliers */}
        <Card>
          <CardHeader>
            <CardTitle>
              Fournisseurs en attente de validation ({stats.pendingSuppliers})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingSuppliers.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Aucun fournisseur en attente
              </p>
            ) : (
              <div className="space-y-4">
                {pendingSuppliers.map((supplier) => (
                  <div
                    key={supplier.id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                    data-testid={`supplier-${supplier.id}`}
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold">{supplier.orgName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {supplier.firstName} {supplier.lastName} - {supplier.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">En attente</Badge>
                      <Button
                        size="sm"
                        onClick={() => handleVerifySupplier(supplier.id)}
                        data-testid={`button-verify-${supplier.id}`}
                      >
                        <Shield className="h-4 w-4 mr-1" />
                        Vérifier
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Products (Stub) */}
        <Card>
          <CardHeader>
            <CardTitle>Produits récents</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground py-8">
              Liste des produits récents - À implémenter
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
