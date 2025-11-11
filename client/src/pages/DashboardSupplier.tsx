import React, { useState, ChangeEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardTiles } from "@/components/dashboard/DashboardTiles";
import { Package, DollarSign, ShoppingCart, MessageCircle, Bell } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useAuthStore } from "@/lib/store";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

/* ---------------------- Types ---------------------- */

type Stats = {
  totalSales: number;
  ordersCount: number;
  activeProducts: number;
  unreadMessages: number;
};

type Order = {
  id: number;
  orderNumber: string;
  buyer: string;
  total: number;
  status: "PENDING" | "CONFIRMED" | "PREPARING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | string;
  createdAt: string;
};

type Product = {
  id: number;
  title: string;
  price: number;
  stock: number;
  status: "ACTIVE" | "DRAFT" | "BLOCKED";
};

type Thread = {
  id: number;
  partner: string;
  lastMessage: string;
  unreadCount: number;
  lastAt: string;
};

type SalesPoint = { month: string; revenue: number };

type UpdateOrderStatusArgs = { orderId: number; status: string };

/* ---------------------- API client ---------------------- */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE ?? "/api/v1",
  headers: { "Content-Type": "application/json" },
});

/* ---------------------- Main Component ---------------------- */

export default function SupplierDashboard() {
  const { user } = useAuthStore() as any;
  const { toast } = useToast();
  const qc = useQueryClient();

  // UI states
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isMessagesOpen, setMessagesOpen] = useState(false);
  const [isProductsOpen, setProductsOpen] = useState(false);

  /* ---------------------- Queries ---------------------- */

  const { data: stats = {} as Stats } = useQuery<Stats>({
    queryKey: ["supplier-stats", user?.id],
    queryFn: async () => ({
      totalSales: 1280000,
      ordersCount: 42,
      activeProducts: 18,
      unreadMessages: 3,
    }),
    enabled: !!user,
  });

  const { data: recentOrders = [] } = useQuery<Order[]>({
    queryKey: ["supplier-orders", user?.id],
    queryFn: async () => [
      {
        id: 601,
        orderNumber: "AG-2025-000601",
        buyer: "Ferme de la Vallée",
        total: 95000,
        status: "PENDING",
        createdAt: new Date().toISOString(),
      },
      {
        id: 602,
        orderNumber: "AG-2025-000602",
        buyer: "Coopérative Sud",
        total: 185000,
        status: "CONFIRMED",
        createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
      },
    ],
    enabled: !!user,
  });

  const { data: salesData = [] } = useQuery<SalesPoint[]>({
    queryKey: ["supplier-sales", user?.id],
    queryFn: async () => [
      { month: "Jan", revenue: 85000 },
      { month: "Fév", revenue: 120000 },
      { month: "Mar", revenue: 97000 },
      { month: "Avr", revenue: 150000 },
      { month: "Mai", revenue: 178000 },
      { month: "Juin", revenue: 220000 },
      { month: "Juil", revenue: 200000 },
      { month: "Août", revenue: 240000 },
      { month: "Sep", revenue: 210000 },
      { month: "Oct", revenue: 260000 },
    ],
    enabled: !!user,
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["supplier-products", user?.id],
    queryFn: async () => [
      { id: 1, title: "Tomate Roma F1", price: 250, stock: 150, status: "ACTIVE" },
      { id: 2, title: "Maïs hybride K2", price: 150, stock: 300, status: "ACTIVE" },
    ],
    enabled: !!user,
  });

  const { data: threads = [] } = useQuery<Thread[]>({
    queryKey: ["supplier-threads", user?.id],
    queryFn: async () => [
      {
        id: 1,
        partner: "Ferme du Nord",
        lastMessage: "Quand livrez-vous ma commande ?",
        unreadCount: 2,
        lastAt: new Date().toISOString(),
      },
      {
        id: 2,
        partner: "Amadou Sow",
        lastMessage: "Merci pour la livraison rapide",
        unreadCount: 0,
        lastAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
      },
    ],
    enabled: !!user,
  });

  /* ---------------------- Mutations ---------------------- */

  const updateOrderStatus = useMutation({
    mutationFn: async ({ orderId, status }: UpdateOrderStatusArgs) => {
      // simulate API call
      await new Promise((r) => setTimeout(r, 600));
      return { success: true, newStatus: status };
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["supplier-orders", user?.id] });
      toast({
        title: "Statut mis à jour",
        description: `La commande #${vars.orderId} est maintenant ${vars.status}`,
      } as any);
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible de changer le statut" } as any);
    },
  });

  /* ---------------------- KPI tiles ---------------------- */
  const kpiTiles = [
    { title: "Commandes reçues", value: stats.ordersCount, icon: ShoppingCart, trend: { value: 5, isPositive: true } },
    { title: "Revenus totaux", value: `${(stats.totalSales ?? 0).toLocaleString("fr-FR")} XOF`, icon: DollarSign, trend: { value: 10, isPositive: true } },
    { title: "Produits actifs", value: stats.activeProducts, icon: Package, trend: { value: 0, isPositive: true } },
    { title: "Messages non lus", value: stats.unreadMessages, icon: MessageCircle, trend: { value: 0, isPositive: false } },
  ];

  /* ---------------------- Render ---------------------- */
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-muted/30 border-b">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-2">Tableau de bord fournisseur</h1>
          <p className="text-muted-foreground">Bienvenue, {user?.orgName || `${user?.firstName} ${user?.lastName}`}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        <DashboardTiles tiles={kpiTiles as any} />

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Sales Chart */}
            <Card>
              <CardHeader><CardTitle>Revenus mensuels (10 mois)</CardTitle></CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => [`${value.toLocaleString("fr-FR")} XOF`, "Revenu"]} />
                      <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Orders management */}
            <Card>
              <CardHeader><CardTitle>Commandes récentes</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex justify-between items-center border p-3 rounded-lg">
                      <div>
                        <div className="font-medium">{order.orderNumber}</div>
                        <div className="text-sm text-muted-foreground">
                          Client : {order.buyer} • {order.total.toLocaleString("fr-FR")} XOF
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={order.status} />
                        <Button
                          size="sm"
                          onClick={() =>
                            updateOrderStatus.mutate({
                              orderId: order.id,
                              status: order.status === "PENDING" ? "CONFIRMED" : "SHIPPED",
                            })
                          }
                        >
                          {order.status === "PENDING" ? "Confirmer" : "Expédier"}
                        </Button>
                      </div>
                    </div>
                  ))}
                  {recentOrders.length === 0 && (
                    <p className="text-sm text-muted-foreground">Aucune commande récente.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Products list */}
            <Card>
              <CardHeader><CardTitle>Produits actifs</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {products.map((p) => (
                    <div key={p.id} className="flex justify-between border p-3 rounded-lg">
                      <div>
                        <div className="font-medium">{p.title}</div>
                        <div className="text-sm text-muted-foreground">{p.stock} en stock — {p.price} XOF</div>
                      </div>
                      <StatusBadge status={p.status} />
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-right">
                  <Button variant="ghost" onClick={() => setProductsOpen(true)}>Gérer mes produits</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right side */}
          <div className="space-y-6">
            {/* Messages */}
            <Card>
              <CardHeader><CardTitle>Messagerie</CardTitle></CardHeader>
              <CardContent>
                <MessagesPanel threads={threads} onOpen={() => setMessagesOpen(true)} />
              </CardContent>
            </Card>

            {/* Quick actions */}
            <Card>
              <CardHeader><CardTitle>Actions rapides</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={() => (window.location.href = "/supplier/products")}>🛠️ Gérer mes produits</Button>
                  <Button onClick={() => (window.location.href = "/supplier/orders")}>📦 Voir commandes</Button>
                  <Button onClick={() => (window.location.href = "/articles")}>✍️ Publier un article</Button>
                  <Button onClick={() => setMessagesOpen(true)}>💬 Messagerie</Button>
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
  const map: Record<string, { text: string; color: string }> = {
    PENDING: { text: "En attente", color: "bg-yellow-100 text-yellow-800" },
    CONFIRMED: { text: "Confirmée", color: "bg-blue-100 text-blue-800" },
    PREPARING: { text: "Préparation", color: "bg-indigo-100 text-indigo-800" },
    SHIPPED: { text: "Expédiée", color: "bg-purple-100 text-purple-800" },
    DELIVERED: { text: "Livrée", color: "bg-green-100 text-green-800" },
    CANCELLED: { text: "Annulée", color: "bg-red-100 text-red-800" },
    ACTIVE: { text: "Actif", color: "bg-green-100 text-green-800" },
    DRAFT: { text: "Brouillon", color: "bg-gray-100 text-gray-800" },
    BLOCKED: { text: "Bloqué", color: "bg-red-100 text-red-800" },
  };
  const s = map[status] ?? { text: status, color: "bg-muted/20 text-muted-foreground" };
  return <span className={`px-2 py-1 text-xs rounded-full ${s.color}`}>{s.text}</span>;
}

function MessagesPanel({ threads, onOpen }: { threads: Thread[]; onOpen: () => void }) {
  return (
    <div className="space-y-2">
      {threads.map((t) => (
        <div key={t.id} className="flex items-center justify-between p-2 rounded hover:bg-muted/50">
          <div>
            <div className="font-medium">{t.partner}</div>
            <div className="text-sm text-muted-foreground">{t.lastMessage}</div>
          </div>
          <div className="text-right">
            {t.unreadCount > 0 && <Badge>{t.unreadCount}</Badge>}
            <div className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(t.lastAt), { addSuffix: true, locale: fr })}
            </div>
            <div className="mt-2"><Button size="sm" onClick={onOpen}>Ouvrir</Button></div>
          </div>
        </div>
      ))}
      {threads.length === 0 && <div className="text-sm text-muted-foreground">Aucune discussion.</div>}
    </div>
  );
}
