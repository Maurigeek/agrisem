import React, { useState, ChangeEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardTiles } from '@/components/dashboard/DashboardTiles';
import { Package, DollarSign, ShoppingCart, Users, Clock, Bell } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useAuthStore } from '@/lib/store';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

/**
 * ProducerDashboard.tsx
 * - Complete TSX implementation of Producer Dashboard (MVP features)
 * - Replace TODO endpoints / api calls with your real API client
 */

/* ---------------------- Types ---------------------- */

type Weather = {
  temp: number;
  rain7d: number;
  condition: string;
  alerts: string[]; // list of short alert texts or codes
};

type Stats = {
  ordersCount: number;
  expenses: number;
  pendingOrders: number;
  weather: Weather;
};

type Order = {
  id: number;
  orderNumber: string;
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | string;
  supplier: string;
  total: number;
  createdAt: string;
};

type Thread = {
  id: number;
  partner: string;
  lastMessage: string;
  unreadCount: number;
  lastAt: string;
};

type Article = {
  id: number;
  title: string;
  excerpt: string;
};

type Activity = {
  id: number;
  type: string;
  message: string;
  timestamp: string;
};

type UploadProofArgs = {
  orderId: number;
  file: File;
};

type SalesPoint = { month: string; revenue: number };

/* ---------------------- API client ---------------------- */

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE ?? '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

/* ---------------------- Main component ---------------------- */

export default function ProducerDashboard() {
  const { user } = useAuthStore() as any; // adapt type from your store if available
  const qc = useQueryClient();
  const { toast } = useToast();

  // UI state
  const [isCartOpen, setCartOpen] = useState<boolean>(false);
  const [selectedOrderForProof, setSelectedOrderForProof] = useState<Order | null>(null);
  const [isAlertsOpen, setAlertsOpen] = useState<boolean>(false);
  const [isMessagesOpen, setMessagesOpen] = useState<boolean>(false);

  /* ---------------------- Queries (mocks / TODO) ---------------------- */

  const { data: stats = {} as Stats } = useQuery<Stats>({
    queryKey: ['dashboard-stats', user?.id],
    queryFn: async () => {
      return {
        ordersCount: 24,
        expenses: 820000,
        pendingOrders: 3,
        weather: { temp: 32, rain7d: 5, condition: 'Ensoleillé', alerts: [] },
      };
    },
    enabled: !!user,
  });

  const { data: salesData = [] } = useQuery<SalesPoint[]>({
    queryKey: ['sales-data', user?.id],
    queryFn: async () => [
      
    ],
    enabled: !!user,
  });


  const { data: recentOrders = [] } = useQuery<Order[]>({
    queryKey: ['orders-recent', user?.id],
    queryFn: async () => [
      
    ],
    enabled: !!user,
  });


  const { data: threads = [] } = useQuery<Thread[]>({
    queryKey: ['threads', user?.id],
    queryFn: async () => [
      
    ],
    enabled: !!user,
  });


  const { data: articles = [] } = useQuery<Article[]>({
    queryKey: ['articles', 'advice'],
    queryFn: async () => [
      { id: 1, title: "Protéger vos plants avant la pluie", excerpt: "Découvrez comment éviter la pourriture des racines..." },
      { id: 2, title: "Rotation de culture pour améliorer le sol", excerpt: "Alternatives et calendrier simple pour le maïs..." },
      ],
    enabled: !!user,
  });


  // Activity feed (could be derived from webhooks/events in real app)
  const activities: Activity[] = [
  ];

  /* ---------------------- Mutations ---------------------- */

  const uploadProofMutation = useMutation({
    mutationFn: async ({ orderId, file }: UploadProofArgs) => {
      // Remplace plus tard par ton appel API réel :
      // const form = new FormData();
      // form.append("paymentProof", file);
      // return api.post(`/orders/${orderId}/upload-proof/`, form);

      await new Promise((r) => setTimeout(r, 700));
      return { success: true };
    },

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders-recent', user?.id] });
      toast({
        title: "Preuve uploadée",
        description: "La preuve de paiement a été envoyée au fournisseur.",
      } as any);
    },

    onError: () => {
      toast({
        title: "Erreur",
        description: "Échec de l'upload de la preuve de paiement.",
      } as any);
    },
  });


  /* ---------------------- KPI tiles ---------------------- */

  const kpiTiles = [
    {
      title: 'Commandes',
      value: String(0),
      icon: ShoppingCart,
      trend: { value:0, isPositive: true },
    },
    {
      title: 'Dépenses',
      value: `${(0).toLocaleString('fr-FR')} XOF`,
      icon: DollarSign,
      trend: { value: 0, isPositive: true },
    },
    {
      title: 'Produits',
      value: '',
      icon: Package,
      trend: { value: 0, isPositive: true },
    },
    
  ];

  /* ---------------------- Render ---------------------- */

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-muted/30 border-b">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-2" data-testid="text-dashboard-title">Tableau de bord</h1>
          <p className="text-muted-foreground">Bienvenue, {user?.firstName} {user?.lastName}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* KPI Tiles */}
        <DashboardTiles tiles={kpiTiles as any} />

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Sales Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Évolution des ventes (10 mois)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80" data-testid="chart-sales">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} tickLine={false} />
                      <YAxis tick={{ fontSize: 12 }} tickLine={false} tickFormatter={(value) => `${(Number(value) / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(value: number) => [`${value.toLocaleString('fr-FR')} XOF`, 'Revenu']} />
                      <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))', r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Recent orders */}
            <Card>
              <CardHeader className="flex items-center justify-between">
                <CardTitle>Commandes récentes</CardTitle>
                <div className="text-sm text-muted-foreground">{recentOrders.length} affichées</div>
              </CardHeader>
              <CardContent>
                <OrdersTable
                  orders={recentOrders}
                  onUploadProof={(order) => setSelectedOrderForProof(order)}
                />
                <div className="mt-4 text-right">
                  <Button variant="ghost" onClick={() => (window.location.href = '/orders')}>Voir toutes les commandes</Button>
                </div>
              </CardContent>
            </Card>

            {/* Activity feed */}
            {/* <Card>
              <CardHeader>
                <CardTitle>Activité récente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-4 p-4 rounded-lg bg-muted/50"
                      data-testid={`activity-${activity.id}`}
                    >
                      <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true, locale: fr })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card> */}
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Weather */}
            {/* <Card>
              <CardHeader>
                <CardTitle>Météo locale</CardTitle>
              </CardHeader>
              <CardContent>
                <WeatherWidget weather={stats.weather} />
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" onClick={() => setAlertsOpen(true)}>Configurer mes alertes</Button>
                  <Button variant="ghost" onClick={() => (window.location.href = '/articles')}>Voir conseils</Button>
                </div>
              </CardContent>
            </Card> */}

            {/* Messages preview */}
            {/* <Card>
              <CardHeader>
                <CardTitle>Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <MessagesPanel threads={threads} onOpen={() => setMessagesOpen(true)} />
              </CardContent>
            </Card> */}

            {/* Advice */}
            {/* <Card>
              <CardHeader>
                <CardTitle>Conseils & bonnes pratiques</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {articles.slice(0, 3).map((a) => (
                    <div key={a.id} className="p-2 rounded hover:bg-muted/50">
                      <div className="font-medium">{a.title}</div>
                      <div className="text-sm text-muted-foreground">{a.excerpt}</div>
                      <div className="mt-2"><Button variant="link" size="sm" onClick={() => (window.location.href = `/articles/${a.id}`)}>Lire</Button></div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card> */}

            {/* Quick actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={() => (window.location.href = '/catalog')}>🔍 Explorer le catalogue</Button>
                  <Button onClick={() => setCartOpen(true)}>🛒 Mon panier</Button>
                  {/* <Button onClick={() => setMessagesOpen(true)}>💬 Messagerie</Button> */}
                  <Button onClick={() => setAlertsOpen(true)}>⚠️ Mes alertes</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals / Drawers */}
      <Dialog open={!!selectedOrderForProof} onOpenChange={() => setSelectedOrderForProof(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Uploader preuve de paiement</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <PaymentProofUploader
              order={selectedOrderForProof}
              onUpload={(file) => {
                if (!selectedOrderForProof) return;
                uploadProofMutation.mutate({ orderId: selectedOrderForProof.id, file });
              }}
              onClose={() => setSelectedOrderForProof(null)}
              isLoading={uploadProofMutation.isLoading}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isAlertsOpen} onOpenChange={setAlertsOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Configurer mes alertes météo</DialogTitle></DialogHeader>
          <div className="p-4">
            <AlertsConfigurator onClose={() => setAlertsOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isMessagesOpen} onOpenChange={setMessagesOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>Messagerie</DialogTitle></DialogHeader>
          <div className="p-4">
            <p className="text-sm text-muted-foreground">Chat (MVP polling toutes les 10s). À remplacer par WebSocket en V2.</p>
            <div className="mt-4">
              <Button onClick={() => setMessagesOpen(false)}>Fermer</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <CartDrawer open={isCartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}

/* ---------------------- Child components (typed) ---------------------- */

function WeatherWidget({ weather }: { weather?: Weather }) {
  const temp = weather?.temp ?? '--';
  const rain = weather?.rain7d ?? '--';
  const condition = weather?.condition ?? '—';
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <div className="text-2xl font-bold">{temp}°C</div>
        <div className="text-sm text-muted-foreground">{condition}</div>
        <div className="text-xs mt-2">Pluie cumulée 7j: {rain} mm</div>
      </div>
      <div className="text-xs text-muted-foreground">
        Alerte: {(weather?.alerts && weather.alerts.length > 0) ? `${weather.alerts.length} active(s)` : 'Aucune'}
      </div>
    </div>
  );
}

function OrdersTable({ orders, onUploadProof }: { orders: Order[]; onUploadProof: (order: Order) => void; }) {
  return (
    <div className="space-y-2">
      {orders.map((o) => (
        <div key={o.id} className="flex items-center justify-between p-3 rounded border">
          <div>
            <div className="font-medium">{o.orderNumber} <span className="text-sm text-muted-foreground">— {o.supplier}</span></div>
            <div className="text-sm text-muted-foreground">Montant: {(o.total ?? 0).toLocaleString('fr-FR')} XOF</div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={o.status} />
            {o.status === 'PENDING' && <Button size="sm" onClick={() => onUploadProof(o)}>Uploader preuve</Button>}
            <Button variant="ghost" size="sm" onClick={() => (window.location.href = `/orders/${o.id}`)}>Détails</Button>
          </div>
        </div>
      ))}
      {orders.length === 0 && <div className="text-sm text-muted-foreground">Aucune commande récente.</div>}
    </div>
  );
}

function StatusBadge({ status }: { status: string; }) {
  const map: Record<string, { text: string; color: string }> = {
    PENDING: { text: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
    CONFIRMED: { text: 'Confirmée', color: 'bg-blue-100 text-blue-800' },
    PREPARING: { text: 'Préparation', color: 'bg-indigo-100 text-indigo-800' },
    SHIPPED: { text: 'Expédiée', color: 'bg-purple-100 text-purple-800' },
    DELIVERED: { text: 'Livrée', color: 'bg-green-100 text-green-800' },
    CANCELLED: { text: 'Annulée', color: 'bg-red-100 text-red-800' },
  };
  const s = map[status] ?? { text: status, color: 'bg-muted/20 text-muted-foreground' };
  return <span className={`px-2 py-1 text-xs rounded-full ${s.color}`}>{s.text}</span>;
}

function MessagesPanel({ threads, onOpen }: { threads: Thread[]; onOpen: () => void; }) {
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
            <div className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(t.lastAt), { addSuffix: true, locale: fr })}</div>
            <div className="mt-2"><Button size="sm" onClick={onOpen}>Ouvrir</Button></div>
          </div>
        </div>
      ))}
      {threads.length === 0 && <div className="text-sm text-muted-foreground">Aucune discussion.</div>}
    </div>
  );
}

function PaymentProofUploader({ order, onUpload, onClose, isLoading }: {
  order: Order | null;
  onUpload: (file: File) => void;
  onClose: () => void;
  isLoading?: boolean;
}) {
  const [file, setFile] = useState<File | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
  };

  return (
    <div>
      <p className="mb-2">Uploader la preuve de paiement pour la commande <strong>{order?.orderNumber}</strong></p>
      <input type="file" accept="image/*,application/pdf" onChange={handleChange} />
      <div className="mt-4 flex gap-2">
        <Button onClick={() => {
          if (!file) return toast({ title: 'Sélectionnez un fichier' } as any);
          onUpload(file);
        }} disabled={isLoading}>{isLoading ? 'Upload...' : 'Envoyer'}</Button>
        <Button variant="ghost" onClick={onClose}>Annuler</Button>
      </div>
    </div>
  );
}

function AlertsConfigurator({ onClose }: { onClose: () => void; }) {
  const [channel, setChannel] = useState<'EMAIL'|'SMS'|'BOTH'>('EMAIL');
  const [droughtThreshold, setDroughtThreshold] = useState<number>(10); // mm/7j
  const [heavyRainThreshold, setHeavyRainThreshold] = useState<number>(30);

  const save = async () => {
    // TODO: call POST /alerts/ or PATCH current alerts
    toast({ title: 'Alertes sauvegardées' } as any);
    onClose();
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium">Canal de notification</label>
        <select value={channel} onChange={(e) => setChannel(e.target.value as any)} className="mt-1 w-full">
          <option value="EMAIL">E-mail</option>
          <option value="SMS">SMS</option>
          <option value="BOTH">E-mail + SMS</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium">Seuil sécheresse (pluie cumulée 7j en mm)</label>
        <Input type="number" value={droughtThreshold} onChange={(e) => setDroughtThreshold(Number(e.target.value))} />
      </div>

      <div>
        <label className="block text-sm font-medium">Seuil pluie forte (mm/jour)</label>
        <Input type="number" value={heavyRainThreshold} onChange={(e) => setHeavyRainThreshold(Number(e.target.value))} />
      </div>

      <div className="flex gap-2 mt-3">
        <Button onClick={save}>Sauvegarder</Button>
        <Button variant="ghost" onClick={onClose}>Fermer</Button>
      </div>
    </div>
  );
}

function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void; }) {
  // TODO: replace with Zustand cart store
  const mockItems = [
    { id: 1, title: 'Tomate Roma F1', qty: 20, price: 250 },
    { id: 2, title: 'Maïs Hybride', qty: 10, price: 150 },
  ];
  const total = mockItems.reduce((s, it) => s + it.qty * it.price, 0);

  if (!open) return null;

  return (
    <div className="fixed right-4 top-16 w-80 bg-background border p-4 shadow-lg z-50">
      <div className="flex justify-between items-center mb-3">
        <div className="font-medium">Panier</div>
        <Button variant="ghost" size="sm" onClick={onClose}>Fermer</Button>
      </div>

      <div className="space-y-2">
        {mockItems.map(it => (
          <div key={it.id} className="flex justify-between">
            <div>
              <div className="font-medium">{it.title}</div>
              <div className="text-xs text-muted-foreground">{it.qty} x {it.price.toLocaleString('fr-FR')} XOF</div>
            </div>
            <div className="text-sm font-medium">{(it.qty * it.price).toLocaleString('fr-FR')} XOF</div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-between items-center">
        <div className="font-semibold">Total</div>
        <div className="font-semibold">{total.toLocaleString('fr-FR')} XOF</div>
      </div>

      <div className="mt-4">
        <Button onClick={() => (window.location.href = '/checkout')}>Passer commande</Button>
      </div>
    </div>
  );
}
