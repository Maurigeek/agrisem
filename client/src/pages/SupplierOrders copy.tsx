import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, CheckCircle, Truck, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuthStore } from '@/lib/store';
import { EmptyState } from '@/components/ui/empty-state';
import type { OrderStatus } from '@/shared/schema';

export default function SupplierOrders() {
  const { user } = useAuthStore();

  // Mock orders - will be replaced with API call in Task 3
  const orders = user?.role === 'SUPPLIER' ? [
    {
      id: 1,
      orderNumber: 'ORD-001234',
      buyerId: 2,
      totalCents: 45000,
      currency: 'XOF',
      status: 'PENDING' as OrderStatus,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      buyer: { firstName: 'Marie', lastName: 'Ouédraogo' },
      items: [
        { productId: 1, title: 'Maïs Hybride FBC6', qty: 3, priceCents: 15000 },
      ],
    },
    {
      id: 2,
      orderNumber: 'ORD-001235',
      buyerId: 3,
      totalCents: 36000,
      currency: 'XOF',
      status: 'CONFIRMED' as OrderStatus,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      buyer: { firstName: 'Abdoul', lastName: 'Traoré' },
      items: [
        { productId: 2, title: 'Riz NERICA', qty: 2, priceCents: 18000 },
      ],
    },
    {
      id: 3,
      orderNumber: 'ORD-001236',
      buyerId: 4,
      totalCents: 15000,
      currency: 'XOF',
      status: 'SHIPPED' as OrderStatus,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      buyer: { firstName: 'Fatou', lastName: 'Koné' },
      items: [
        { productId: 1, title: 'Maïs Hybride FBC6', qty: 1, priceCents: 15000 },
      ],
    },
  ] : [];

  const getStatusColor = (status: OrderStatus) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      PREPARING: 'bg-purple-100 text-purple-800',
      SHIPPED: 'bg-indigo-100 text-indigo-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colors[status];
  };

  const getStatusLabel = (status: OrderStatus) => {
    const labels = {
      PENDING: 'En attente',
      CONFIRMED: 'Confirmée',
      PREPARING: 'En préparation',
      SHIPPED: 'Expédiée',
      DELIVERED: 'Livrée',
      CANCELLED: 'Annulée',
    };
    return labels[status];
  };

  const handleUpdateStatus = (orderId: number, newStatus: OrderStatus) => {
    console.log('Update order', orderId, 'to', newStatus);
    // Will be implemented with API in Task 3
  };

  if (user?.role !== 'SUPPLIER') {
    return (
      <div className="container mx-auto px-4 py-16">
        <EmptyState
          icon={Package}
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
          <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">
            Commandes Reçues
          </h1>
          <p className="text-muted-foreground">
            Gérez les commandes de vos clients
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {orders.length === 0 ? (
          <EmptyState
            icon={Package}
            title="Aucune commande"
            description="Vous n'avez pas encore reçu de commandes"
          />
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} data-testid={`card-order-${order.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        Commande {order.orderNumber}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Client: {order.buyer.firstName} {order.buyer.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(order.createdAt), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </p>
                    </div>
                    <Badge className={getStatusColor(order.status)}>
                      {getStatusLabel(order.status)}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  {/* Order Items */}
                  <div className="mb-4">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm py-2">
                        <span>{item.title} × {item.qty}</span>
                        <span className="font-medium">
                          {((item.priceCents * item.qty) / 100).toLocaleString('fr-FR')} {order.currency}
                        </span>
                      </div>
                    ))}
                    <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
                      <span>Total</span>
                      <span>
                        {(order.totalCents / 100).toLocaleString('fr-FR')} {order.currency}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                    <div className="flex flex-wrap gap-2">
                      {order.status === 'PENDING' && (
                        <Button
                          size="sm"
                          onClick={() => handleUpdateStatus(order.id, 'CONFIRMED')}
                          data-testid={`button-confirm-${order.id}`}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Confirmer
                        </Button>
                      )}
                      {order.status === 'CONFIRMED' && (
                        <Button
                          size="sm"
                          onClick={() => handleUpdateStatus(order.id, 'PREPARING')}
                          data-testid={`button-prepare-${order.id}`}
                        >
                          <Package className="h-4 w-4 mr-1" />
                          En préparation
                        </Button>
                      )}
                      {order.status === 'PREPARING' && (
                        <Button
                          size="sm"
                          onClick={() => handleUpdateStatus(order.id, 'SHIPPED')}
                          data-testid={`button-ship-${order.id}`}
                        >
                          <Truck className="h-4 w-4 mr-1" />
                          Expédier
                        </Button>
                      )}
                      {order.status === 'SHIPPED' && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleUpdateStatus(order.id, 'DELIVERED')}
                          data-testid={`button-deliver-${order.id}`}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Marquer livrée
                        </Button>
                      )}
                      {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleUpdateStatus(order.id, 'CANCELLED')}
                          data-testid={`button-cancel-${order.id}`}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Annuler
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
