import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuthStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { Sprout } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RegisterSchema, type RegisterInput } from "@/schemas/user.schema";


// ✅ On importe le service d'inscription depuis authService
import { register as registerUser } from '@/services/authService';

export default function AuthRegister() {
  const [, navigate] = useLocation();
  const { setAuth } = useAuthStore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema as any),
    defaultValues: {
      role: 'PRODUCER',
    },
  });

  const role = watch('role');

  // ✅ On remplace api.post() par registerUser()
  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    try {
      const res = await registerUser(data);

      if (res?.message) {
        toast({
          title: "Inscription réussie",
          description: res.message,
        });
      } else {
        toast({
          title: "Inscription réussie",
          description: "Vérifiez votre e-mail pour confirmer votre compte",
        });
      }

      navigate("/auth/register/success");
    } catch (error: any) {
      toast({
        title: "Erreur d'inscription",
        description:
          error?.response?.data?.message ||
          error?.message ||
          "Erreur serveur",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-2">
              <Sprout className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-primary">AGRI-SEM</span>
            </div>
          </div>
          <CardTitle className="text-2xl">Créer un compte</CardTitle>
          <CardDescription>
            Rejoignez notre marketplace de semences agricoles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Role Selection */}
            <div>
              <Label className="mb-3 block">Type de compte</Label>
              <RadioGroup value={role} onValueChange={(value) => setValue('role', value as any)}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="cursor-pointer hover-elevate">
                    <CardContent className="flex items-center gap-4 p-4">
                      <RadioGroupItem value="PRODUCER" id="producer" data-testid="radio-producer" />
                      <Label htmlFor="producer" className="flex-1 cursor-pointer">
                        <p className="font-medium">Producteur</p>
                        <p className="text-sm text-muted-foreground">
                          Acheter des semences
                        </p>
                      </Label>
                    </CardContent>
                  </Card>

                  <Card className="cursor-pointer hover-elevate">
                    <CardContent className="flex items-center gap-4 p-4">
                      <RadioGroupItem value="SUPPLIER" id="supplier" data-testid="radio-supplier" />
                      <Label htmlFor="supplier" className="flex-1 cursor-pointer">
                        <p className="font-medium">Fournisseur</p>
                        <p className="text-sm text-muted-foreground">
                          Vendre des semences
                        </p>
                      </Label>
                    </CardContent>
                  </Card>
                </div>
              </RadioGroup>
            </div>

            {/* Personal Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Prénom</Label>
                <Input
                  id="firstName"
                  placeholder="Jean"
                  {...register('firstName')}
                  data-testid="input-first-name"
                />
                {errors.firstName && (
                  <p className="text-sm text-destructive mt-1">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="lastName">Nom</Label>
                <Input
                  id="lastName"
                  placeholder="Dupont"
                  {...register('lastName')}
                  data-testid="input-last-name"
                />
                {errors.lastName && (
                  <p className="text-sm text-destructive mt-1">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            {/* Organization (for suppliers) */}
            {role === 'SUPPLIER' && (
              <div>
                <Label htmlFor="orgName">Nom de l'organisation</Label>
                <Input
                  id="orgName"
                  placeholder="Semences du Sahel"
                  {...register('orgName')}
                  data-testid="input-org-name"
                />
                {errors.orgName && (
                  <p className="text-sm text-destructive mt-1">{errors.orgName.message}</p>
                )}
              </div>
            )}

            {/* Contact */}
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
              <Label htmlFor="phone">Téléphone (optionnel)</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+226 XX XX XX XX"
                {...register('phone')}
                data-testid="input-phone"
              />
              {errors.phone && (
                <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
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
              data-testid="button-register"
            >
              {isLoading ? 'Inscription...' : "S'inscrire"}
            </Button>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Déjà un compte ? </span>
              <Link href="/auth/login">
                <a className="text-primary hover:underline" data-testid="link-login">
                  Se connecter
                </a>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
