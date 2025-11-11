import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, CheckCircle, Truck, XCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useAuthStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { EmptyState } from "@/components/ui/empty-state";
import {
  useSupplierOrders,
  useUpdateOrderStatus,
} from "@/hooks/useSupplier";

export default function SupplierOrders() {
  const { user } = useAuthStore();
  const { toast } = useToast();

  const { data: orders = [], isLoading } = useSupplierOrders();
  const updateStatus = useUpdateOrderStatus();

  const handleStatus = (id: number, status: string) => {
    updateStatus.mutate({ id, status });
    toast({ title: `Commande ${status.toLowerCase()} ✅` });
  };

  if (user?.role !== "SUPPLIER") {
    return (
      <EmptyState
        icon={Package}
        title="Accès restreint"
        description="Cette page est réservée aux fournisseurs"
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Commandes reçues</h1>
      {isLoading ? (
        <p>Chargement...</p>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Aucune commande"
          description="Vous n'avez pas encore reçu de commandes."
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Commande {order.orderNumber}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Client : {order.buyer?.firstName} {order.buyer?.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(order.createdAt), {
                        addSuffix: true,
                        locale: fr,
                      })}
                    </p>
                  </div>
                  <Badge>{order.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {order.items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-sm py-1">
                    <span>
                      {item.title} × {item.qty}
                    </span>
                    <span className="font-medium">
                      {((item.priceCents * item.qty) / 100).toLocaleString("fr-FR")}{" "}
                      {order.currency}
                    </span>
                  </div>
                ))}
                <div className="border-t mt-2 pt-2 flex justify-between font-semibold">
                  <span>Total</span>
                  <span>
                    {(order.totalCents / 100).toLocaleString("fr-FR")} {order.currency}
                  </span>
                </div>

                {/* Boutons de statut */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {order.status === "PENDING" && (
                    <Button onClick={() => handleStatus(order.id, "CONFIRMED")}>
                      <CheckCircle className="h-4 w-4 mr-1" /> Confirmer
                    </Button>
                  )}
                  {order.status === "CONFIRMED" && (
                    <Button onClick={() => handleStatus(order.id, "PREPARING")}>
                      <Package className="h-4 w-4 mr-1" /> Préparer
                    </Button>
                  )}
                  {order.status === "PREPARING" && (
                    <Button onClick={() => handleStatus(order.id, "SHIPPED")}>
                      <Truck className="h-4 w-4 mr-1" /> Expédier
                    </Button>
                  )}
                  {order.status === "SHIPPED" && (
                    <Button
                      variant="secondary"
                      onClick={() => handleStatus(order.id, "DELIVERED")}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" /> Livrée
                    </Button>
                  )}
                  {(order.status === "PENDING" || order.status === "CONFIRMED") && (
                    <Button
                      variant="destructive"
                      onClick={() => handleStatus(order.id, "CANCELLED")}
                    >
                      <XCircle className="h-4 w-4 mr-1" /> Annuler
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
