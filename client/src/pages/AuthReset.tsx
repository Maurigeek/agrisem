import { useState } from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Sprout, CheckCircle } from 'lucide-react';

// ✅ Import du service
import { requestPasswordReset } from '@/services/authService';

export default function AuthReset() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await requestPasswordReset(email);
      setSent(true);
      toast({
        title: "Email envoyé",
        description: res?.message || "Vérifiez votre boîte de réception",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description:
          error?.response?.data?.message ||
          error?.message ||
          "Erreur lors de l'envoi de l'email",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 to-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Email envoyé</h1>
            <p className="text-muted-foreground mb-6">
              Si un compte existe avec cette adresse email, vous recevrez un lien de réinitialisation.
            </p>
            <Link href="/auth/login">
              <Button className="w-full">Retour à la connexion</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-2">
              <Sprout className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-primary">AGRI-SEM</span>
            </div>
          </div>
          <CardTitle className="text-2xl">Mot de passe oublié</CardTitle>
          <CardDescription>
            Entrez votre email pour recevoir un lien de réinitialisation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                data-testid="input-reset-email"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              data-testid="button-reset"
            >
              {isLoading ? 'Envoi...' : 'Envoyer le lien'}
            </Button>

            <div className="text-center text-sm">
              <Link href="/auth/login">
                <a className="text-primary hover:underline" data-testid="link-back-to-login">
                  Retour à la connexion
                </a>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
