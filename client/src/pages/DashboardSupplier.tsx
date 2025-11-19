import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardTiles } from "@/components/dashboard/DashboardTiles";
import {
  Package,
  DollarSign,
  ShoppingCart,
  MessageCircle
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { useAuthStore } from "@/lib/store";
import { useSupplierStats, useSupplierOrders, useSupplierProducts } from "@/hooks/useSupplier";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function DashboardSupplier() {
  
  const { user } = useAuthStore();
  
  // === FETCH REAL DATA ===
  const { data: stats, isLoading: loadingStats } = useSupplierStats();
  const { data: orders = [] } = useSupplierOrders();
  const { data: products = [] } = useSupplierProducts();

  if (loadingStats) return <p>Chargement...</p>;

  // === KPI CARDS ===
  const kpiTiles = [
    {
      title: "Commandes reçues",
      value: stats?.totalOrders ?? 0,
      icon: ShoppingCart,
      trend: { value: 0, isPositive: true }
    },
    {
      title: "Revenus totaux",
      value: `${(stats?.totalRevenue / 100).toLocaleString("fr-FR")} XOF`,
      icon: DollarSign,
      trend: { value: 0, isPositive: true }
    },
    {
      title: "Produits actifs",
      value: stats?.activeProducts ?? 0,
      icon: Package,
      trend: { value: 0, isPositive: true }
    },
    // {
    //   title: "Messages non lus",
    //   value: 0,
    //   icon: MessageCircle,
    //   trend: { value: 0, isPositive: false }
    // }
  ];

  return (
    <div className="min-h-screen bg-background">

      {/* HEADER */}
      <div className="bg-muted/30 border-b">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-2">Tableau de bord fournisseur</h1>

          <p className="text-muted-foreground">
            Bienvenue, {user?.orgName || `${user?.firstName} ${user?.lastName}`}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">

        {/* KPIs */}
        <DashboardTiles tiles={kpiTiles as any} />

        <div className="grid lg:grid-cols-3 gap-6">

          {/* LEFT SIDE */}
          <div className="lg:col-span-2 space-y-6">

            {/* SALES CHART */}
            <Card>
              <CardHeader>
                <CardTitle>Revenus des 7 derniers jours</CardTitle>
              </CardHeader>

              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats?.salesByDay || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip
                        formatter={(value: number) => [
                          `${(value / 100).toLocaleString("fr-FR")} XOF`,
                          "Revenu"
                        ]}
                      />
                      <Line
                        type="monotone"
                        dataKey="total"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* RECENT ORDERS */}
            <Card>
              <CardHeader>
                <CardTitle>Commandes récentes</CardTitle>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">

                  {orders.slice(0, 5).map((order: any) => (
                    <div key={order.id} className="flex justify-between items-center border p-3 rounded-lg">
                      
                      <div>
                        <div className="font-medium">{order.orderNumber}</div>
                        <div className="text-sm text-muted-foreground">
                          Client : {order.buyer?.firstName || "Client"} —{" "}
                          {(order.totalCents / 100).toLocaleString("fr-FR")} XOF
                        </div>
                      </div>

                      <StatusBadge status={order.status} />
                    </div>
                  ))}

                  {orders.length === 0 && (
                    <p className="text-sm text-muted-foreground">Aucune commande récente.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* ACTIVE PRODUCTS */}
            <Card>
              <CardHeader>
                <CardTitle>Produits actifs</CardTitle>
              </CardHeader>

              <CardContent>
                <div className="space-y-2">

                  {products
                    .filter((p: any) => p.status === "ACTIVE")
                    .map((p: any) => (
                      <div
                        key={p.id}
                        className="flex justify-between border p-3 rounded-lg"
                      >
                        <div>
                          <div className="font-medium">{p.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {p.stock} en stock — {(p.priceCents / 100).toLocaleString("fr-FR")} XOF
                          </div>
                        </div>

                        <StatusBadge status={p.status} />
                      </div>
                    ))}

                  {products.length === 0 && (
                    <p className="text-sm text-muted-foreground">Aucun produit actif.</p>
                  )}
                </div>

                <div className="mt-4 text-right">
                  <Button variant="ghost" onClick={() => (window.location.href = "/supplier/products")}>
                    Gérer mes produits
                  </Button>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* RIGHT SIDE */}
          <div className="space-y-6">
            {/* Quick actions */}
            <Card>
              <CardHeader><CardTitle>Actions rapides</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={() => (window.location.href = "/supplier/products")}>
                    🛠️ Produits
                  </Button>
                  <Button onClick={() => (window.location.href = "/supplier/orders")}>
                    📦 Commandes
                  </Button>
                  <Button onClick={() => (window.location.href = "/articles")}>
                    ✍️ Article
                  </Button>
                  {/* <Button onClick={() => (window.location.href = "/messaging")}>
                    💬 Messages
                  </Button> */}
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}

/* ---------------------- Helpers ---------------------- */
function StatusBadge({ status }: { status: string }) {
  const colors: any = {
    PENDING: "bg-yellow-100 text-yellow-800",
    CONFIRMED: "bg-blue-100 text-blue-800",
    SHIPPED: "bg-purple-100 text-purple-800",
    DELIVERED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
    ACTIVE: "bg-green-100 text-green-800",
    BLOCKED: "bg-red-100 text-red-800"
  };

  return (
    <span className={`px-2 py-1 text-xs rounded-full ${colors[status] || "bg-gray-200 text-gray-700"}`}>
      {status}
    </span>
  );
}
