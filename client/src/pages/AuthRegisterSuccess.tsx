import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { Link } from "wouter";

export default function AuthRegisterSuccess() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
          <CardTitle>Inscription réussie </CardTitle>
          <CardDescription>
            Votre compte a été créé avec succès.
            <br />
            {/* Consultez votre boîte mail pour confirmer votre inscription avant de vous connecter. */}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/auth/login">
            <Button className="w-full mt-4">Aller à la connexion</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
