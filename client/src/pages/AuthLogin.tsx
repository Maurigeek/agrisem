import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { Sprout } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginSchema, type LoginInput } from "@/schemas/user.schema";
import { login as loginUser } from '@/services/authService';

export default function AuthLogin() {
  const [, navigate] = useLocation();
  const { setAuth } = useAuthStore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema as any),
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    try {
      const res = await loginUser(data);

      if (!res?.accessToken) {
        throw new Error(res?.message || "Identifiants invalides");
      }

      const { accessToken, refreshToken, user } = res;

      // ✅ Sauvegarde des tokens
      localStorage.setItem("accessToken", accessToken);
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);

      setAuth(user, accessToken);
      toast({ title: "Connexion réussie", description: `Bienvenue, ${user.firstName || 'utilisateur'} 👋` });

      // ✅ Redirection selon le rôle utilisateur
      switch (user.role) {
        case "SUPPLIER":
          navigate("/dashboard/supplier");
          break;
        case "ADMIN":
          navigate("/dashboard/admin");
          break;
        case "PRODUCER":
        default:
          navigate("/dashboard/producer");
          break;
      }

    } catch (error: any) {
      toast({
        title: "Erreur de connexion",
        description:
          error?.response?.data?.message ||
          error?.message ||
          "Veuillez vérifier vos identifiants",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
          <CardTitle className="text-2xl">Connexion</CardTitle>
          <CardDescription>
            Connectez-vous à votre compte pour continuer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                {...register('email')}
                data-testid="input-email"
              />
              {errors.email && (
                <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="mot de passe"
                {...register('password')}
                data-testid="input-password"
              />
              {errors.password && (
                <p className="text-sm text-destructive mt-1">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              data-testid="button-login"
            >
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </Button>

            <div className="text-center space-y-2 text-sm">
              <Link href="/auth/reset">
                <a className="text-primary hover:underline" data-testid="link-reset-password">
                  Mot de passe oublié ?
                </a>
              </Link>
              <div>
                <span className="text-muted-foreground">Pas encore de compte ? </span>
                <Link href="/auth/register">
                  <a className="text-primary hover:underline" data-testid="link-register">
                    S'inscrire
                  </a>
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
