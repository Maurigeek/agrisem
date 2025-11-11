import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";

export default function DashboardAdmin() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-background p-6">
      <div className="max-w-5xl mx-auto">
        <Card className="border-primary/30">
          <CardHeader className="flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-primary" />
            <CardTitle className="text-2xl">Tableau de bord Administrateur</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-3">
              Espace de supervision et de modération ⚙️.
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Validez les fournisseurs et modérez les produits</li>
              <li>Gérez les utilisateurs et leurs rôles</li>
              <li>Consultez les statistiques globales de la plateforme</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
