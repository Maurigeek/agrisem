import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardTiles } from '@/components/dashboard/DashboardTiles';
import { Package, DollarSign, ShoppingCart, Users } from 'lucide-react';
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

export default function Dashboard() {
  const { user } = useAuthStore();

  // Mock data - will be replaced with API calls in Task 3
  const salesData = [
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

  const activities = [
    {
      id: 1,
      type: 'order',
      message: 'Nouvelle commande #1234 reçue',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 2,
      type: 'message',
      message: 'Nouveau message de Amadou Diallo',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 3,
      type: 'stock',
      message: 'Stock faible: Maïs Hybride FBC6',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 4,
      type: 'order',
      message: 'Commande #1230 livrée',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const kpiTiles = [
    {
      title: 'Commandes',
      value: '24',
      icon: ShoppingCart,
      trend: { value: 12, isPositive: true },
    },
    {
      title: 'Revenu',
      value: '820,000 XOF',
      icon: DollarSign,
      trend: { value: 8, isPositive: true },
    },
    {
      title: 'Produits',
      value: user?.role === 'SUPPLIER' ? '12' : '156',
      icon: Package,
      trend: { value: 3, isPositive: true },
    },
    {
      title: 'Clients',
      value: '48',
      icon: Users,
      trend: { value: 5, isPositive: false },
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-muted/30 border-b">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-2" data-testid="text-dashboard-title">
            Tableau de bord
          </h1>
          <p className="text-muted-foreground">
            Bienvenue, {user?.firstName} {user?.lastName}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* KPI Tiles */}
        <DashboardTiles tiles={kpiTiles} />

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
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value: number) => [
                      `${value.toLocaleString('fr-FR')} XOF`,
                      'Revenu',
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card>
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
                      {formatDistanceToNow(new Date(activity.timestamp), {
                        addSuffix: true,
                        locale: fr,
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
