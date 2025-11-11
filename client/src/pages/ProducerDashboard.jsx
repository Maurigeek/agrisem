import React, { useState } from "react";
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
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/components/ui/toast'; // placeholder; adapt à ton système de notifications
import axios from 'axios';

// ---------------------------
// Helpers / Mock endpoints
// ---------------------------
// Replace base URL / functions with your actual API client
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE ?? '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

// ---------------------------
// Producer Dashboard Page
// ---------------------------
export default function ProducerDashboard() {
  const { user } = useAuthStore();
  const qc = useQueryClient();

  // UI state
  const [isCartOpen, setCartOpen] = useState(false);
  const [selectedOrderForProof, setSelectedOrderForProof] = useState(null);
  const [isAlertsOpen, setAlertsOpen] = useState(false);
  const [isMessagesOpen, setMessagesOpen] = useState(false);

  // ---------------------------
  // Fetchers (replace TODOs)
  // ---------------------------

  // Dashboard stats (commands count, expenses, pending, weather summary)
  const { data: stats = {}, isLoading: statsLoading } = useQuery(
    ['dashboard-stats', user?.id],
    async () => {
      // TODO: call your API: GET /orders?as=buyer&... and /advice/weather?lat&lng
      // Example combined response:
      // return await api.get('/dashboard/stats'); 
      return {
        ordersCount: 24,
        expenses: 820000,
        pendingOrders: 3,
        weather: { temp: 32, rain7d: 5, condition: 'Ensoleillé', alerts: [] },
      };
    },
    { enabled: !!user }
  );

  // Sales data (for chart) — monthly revenue (mock)
  const { data: salesData = [] } = useQuery(['sales-data', user?.id], async () => {
    // TODO: GET /orders/summary?as=buyer&period=10mo
    return [
      { month: 'Jan', revenue: 45000 },
      { month: 'Fév', revenue: 52000 },
      { month: 'Mar', revenue: 48000 },
      { month: 'Avr', revenue: 61000 },
      { month: 'Mai', revenue: 58000 },
      { month: 'Juin', revenue: 65000 },
      { month: 'Juil', revenue: 72000 },
      { month: 'Août', revenue: 68000 },
      { month: 'Sep', revenue: 75000 },
      { month: 'Oct', revenue: 82000 },
    ];
  }, { enabled: !!user });

  // Recent orders
  const { data: recentOrders = [] } = useQuery(['orders-recent', user?.id], async () => {
    // TODO: GET /orders/?as=buyer&page=1&page_size=5
    return [
      { id: 901, orderNumber: 'AG-2025-000901', status: 'DELIVERED', supplier: 'Semences Bénin SARL', total: 125000, createdAt: new Date().toISOString() },
      { id: 902, orderNumber: 'AG-2025-000902', status: 'PENDING', supplier: 'AgriTogo', total: 45000, createdAt: new Date(Date.now()-3*3600*1000).toISOString() },
    ];
  }, { enabled: !!user });

  // Recent message threads
  const { data: threads = [] } = useQuery(['threads', user?.id], async () => {
    // TODO: GET /threads?as=buyer
    return [
      { id: 11, partner: 'Semences Bénin SARL', lastMessage: 'Bonjour, le colis est en route', unreadCount: 1, lastAt: new Date().toISOString() },
      { id: 12, partner: 'AgriTogo', lastMessage: 'Pouvez-vous confirmer la réception ?', unreadCount: 0, lastAt: new Date(Date.now()-6*3600*1000).toISOString() },
    ];
  }, { enabled: !!user });

  // Advice articles
  const { data: articles = [] } = useQuery(['articles', 'advice'], async () => {
    // TODO: GET /articles?tag=...&limit=3
    return [
      { id: 1, title: "Protéger vos plants avant la pluie", excerpt: "Découvrez comment éviter la pourriture des racines..." },
      { id: 2, title: "Rotation de culture pour améliorer le sol", excerpt: "Alternatives et calendrier simple pour le maïs..." },
    ];
  }, { enabled: !!user });


  // Activities feed (events)
  const activities = [
    { id: 1, type: 'order', message: 'Nouvelle commande #AG-2025-000903 reçue', timestamp: new Date(Date.now()-2*3600*1000).toISOString() },
    { id: 2, type: 'message', message: 'Nouveau message de Amadou Diallo', timestamp: new Date(Date.now()-5*3600*1000).toISOString() },
    { id: 3, type: 'alert', message: 'Seuil sécheresse franchi (votre village)', timestamp: new Date(Date.now()-12*3600*1000).toISOString() },
  ];

  // ---------------------------
  // Mutations (upload proof example)
  // ---------------------------
  const uploadProofMutation = useMutation(
    async ({ orderId, file }) => {
      // TODO: POST /orders/{id}/upload-proof (multipart/form-data)
      // Example:
      // const form = new FormData(); form.append('paymentProof', file);
      // return api.post(`/orders/${orderId}/upload-proof/`, form, { headers: { 'Content-Type': 'multipart/form-data' }});
      await new Promise(r => setTimeout(r, 700));
      return { success: true };
    },
    {
      onSuccess: () => {
        qc.invalidateQueries(['orders-recent', user?.id]);
        toast({ title: "Preuve uploadée", description: "La preuve de paiement a été envoyée au fournisseur." });
      },
    }
  );

  // ---------------------------
  // KPI tiles config (use DashboardTiles component)
  // ---------------------------
  const kpiTiles = [
    { title: 'Commandes', value: String(stats.ordersCount ?? 0), icon: ShoppingCart, trend: { value: 12, isPositive: true } },
    { title: 'Dépenses', value: `${(stats.expenses ?? 0).toLocaleString('fr-FR')} XOF`, icon: DollarSign, trend: { value: 8, isPositive: true } },
    { title: 'Produits', value: '156', icon: Package, trend: { value: 3, isPositive: true } },
    { title: 'Alertes météo', value: (stats.weather?.alerts?.length ?? 0) > 0 ? `${stats.weather.alerts.length}` : '0', icon: Bell, trend: { value: 0, isPositive: false } },
  ];

  // ---------------------------
  // Render
  // ---------------------------
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-muted/30 border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Tableau de bord Producteur</h1>
          <p className="text-sm text-muted-foreground">Bienvenue, {user?.firstName} {user?.lastName}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">

        {/* KPI Tiles */}
        <DashboardTiles tiles={kpiTiles} />

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left column: Sales chart + activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Sales Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Évolution des dépenses / 10 mois</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} tickLine={false} />
                      <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} tickLine={false} />
                      <Tooltip formatter={(value) => [`${Number(value).toLocaleString('fr-FR')} XOF`, 'Montant']} />
                      <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
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
                  onUploadProof={(order) => { setSelectedOrderForProof(order); }}
                />
                <div className="mt-4 text-right">
                  <Button variant="ghost" onClick={() => window.location.href = '/orders'}>Voir toutes les commandes</Button>
                </div>
              </CardContent>
            </Card>

            {/* Activity feed */}
            <Card>
              <CardHeader>
                <CardTitle>Activité récente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activities.map(a => (
                    <div key={a.id} className="flex gap-3 p-3 rounded bg-muted/50">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{a.message}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(a.timestamp), { addSuffix: true, locale: fr })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right column: Weather, messages, advice */}
          <div className="space-y-6">
            {/* Weather widget */}
            <Card>
              <CardHeader>
                <CardTitle>Météo locale</CardTitle>
              </CardHeader>
              <CardContent>
                <WeatherWidget weather={stats.weather} />
                <div className="mt-3 flex gap-2">
                  <Button variant="outline" onClick={() => setAlertsOpen(true)}>Configurer mes alertes</Button>
                  <Button variant="ghost" onClick={() => window.location.href = '/advice'}>Voir conseils</Button>
                </div>
              </CardContent>
            </Card>

            {/* Messages preview */}
            <Card>
              <CardHeader>
                <CardTitle>Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <MessagesPanel threads={threads} onOpen={() => setMessagesOpen(true)} />
              </CardContent>
            </Card>

            {/* Advice articles */}
            <Card>
              <CardHeader>
                <CardTitle>Conseils & bonnes pratiques</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {articles.slice(0,3).map(a => (
                    <div key={a.id} className="p-2 rounded hover:bg-muted/50">
                      <div className="font-medium">{a.title}</div>
                      <div className="text-sm text-muted-foreground">{a.excerpt}</div>
                      <div className="mt-2"><Button variant="link" size="sm" onClick={() => window.location.href = `/articles/${a.id}`}>Lire</Button></div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={() => window.location.href = '/catalogue'}>🔍 Explorer le catalogue</Button>
                  <Button onClick={() => setCartOpen(true)}>🛒 Mon panier</Button>
                  <Button onClick={() => setMessagesOpen(true)}>💬 Messagerie</Button>
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
          <PaymentProofUploader
            order={selectedOrderForProof}
            onUpload={(file) => uploadProofMutation.mutate({ orderId: selectedOrderForProof.id, file })}
            onClose={() => setSelectedOrderForProof(null)}
            isLoading={uploadProofMutation.isLoading}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isAlertsOpen} onOpenChange={setAlertsOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Configurer mes alertes météo</DialogTitle></DialogHeader>
          <AlertsConfigurator onClose={() => setAlertsOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={isMessagesOpen} onOpenChange={setMessagesOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>Messagerie</DialogTitle></DialogHeader>
          <div className="p-4">
            {/* TODO: Replace with full chat UI (WebSocket / polling) */}
            <p className="text-sm text-muted-foreground">Interface de chat — à implémenter (polling 10s / V2 WebSocket)</p>
            <div className="mt-4"><Button onClick={() => setMessagesOpen(false)}>Fermer</Button></div>
          </div>
        </DialogContent>
      </Dialog>

      <CartDrawer open={isCartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}

// ---------------------------
// Child components (placeholders)
// ---------------------------

function WeatherWidget({ weather }) {
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
        {/* simple sparkline or icon could go here */}
        Alerte: {(weather?.alerts && weather.alerts.length > 0) ? `${weather.alerts.length} active(s)` : 'Aucune'}
      </div>
    </div>
  );
}

function OrdersTable({ orders = [], onUploadProof }) {
  return (
    <div className="space-y-2">
      {orders.map(o => (
        <div key={o.id} className="flex items-center justify-between p-3 rounded border">
          <div>
            <div className="font-medium">{o.orderNumber} <span className="text-sm text-muted-foreground">— {o.supplier}</span></div>
            <div className="text-sm text-muted-foreground">Montant: {(o.total ?? 0).toLocaleString('fr-FR')} XOF</div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={o.status} />
            {o.status === 'PENDING' && <Button size="sm" onClick={() => onUploadProof(o)}>Uploader preuve</Button>}
            <Button variant="ghost" size="sm" onClick={() => window.location.href = `/orders/${o.id}`}>Détails</Button>
          </div>
        </div>
      ))}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
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

function MessagesPanel({ threads = [], onOpen }) {
  return (
    <div className="space-y-2">
      {threads.map(t => (
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

function PaymentProofUploader({ order, onUpload, onClose, isLoading }) {
  const [file, setFile] = useState(null);
  return (
    <div>
      <p className="mb-2">Uploader la preuve de paiement pour la commande <strong>{order?.orderNumber}</strong></p>
      <input type="file" accept="image/*,application/pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      <div className="mt-4 flex gap-2">
        <Button onClick={() => { if (!file) return toast({ title: 'Sélectionnez un fichier' }); onUpload(file); }} disabled={isLoading}>{isLoading ? 'Upload...' : 'Envoyer'}</Button>
        <Button variant="ghost" onClick={onClose}>Annuler</Button>
      </div>
    </div>
  );
}

function AlertsConfigurator({ onClose }) {
  const [channel, setChannel] = useState('EMAIL');
  const [droughtThreshold, setDroughtThreshold] = useState(10); // mm/7j
  const [heavyRainThreshold, setHeavyRainThreshold] = useState(30);
  // TODO: load/save via API (GET /alerts/ ; POST /alerts/)
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium">Canal de notification</label>
        <select value={channel} onChange={(e) => setChannel(e.target.value)} className="mt-1 w-full">
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
        <Button onClick={() => { /* TODO: call API to save */ toast({ title: 'Alertes sauvegardées' }); onClose(); }}>Sauvegarder</Button>
        <Button variant="ghost" onClick={onClose}>Fermer</Button>
      </div>
    </div>
  );
}

function CartDrawer({ open, onClose }) {
  // TODO: hook to Zustand cart store
  const mockItems = [
    { id: 1, title: 'Tomate Roma F1', qty: 20, price: 250 },
    { id: 2, title: 'Maïs Hybride', qty: 10, price: 150 },
  ];
  const total = mockItems.reduce((s, it) => s + it.qty * it.price, 0);
  return open ? (
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
        <Button onClick={() => window.location.href = '/checkout'}>Passer commande</Button>
      </div>
    </div>
  ) : null;
}
