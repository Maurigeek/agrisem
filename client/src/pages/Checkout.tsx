import { useState } from 'react';
import { useCartStore, useAuthStore } from '@/lib/store';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { EmptyState } from '@/components/ui/empty-state';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ShoppingBag,
  MapPin,
  CreditCard,
  CheckCircle,
  Upload,
  Trash2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const checkoutSchema = z.object({
  country: z.string().min(1, 'Pays requis'),
  region: z.string().min(1, 'Région requise'),
  city: z.string().min(1, 'Ville requise'),
  label: z.string().min(1, 'Libellé requis'),
  paymentMethod: z.enum(['CASH', 'MOBILE_MONEY', 'BANK_TRANSFER']),
  notes: z.string().optional(),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const [, navigate] = useLocation();
  const { items, getTotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [step, setStep] = useState<'cart' | 'address' | 'payment' | 'confirmation'>('cart');
  const [paymentProof, setPaymentProof] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: 'CASH',
      country: 'Burkina Faso',
    },
  });

  const paymentMethod = watch('paymentMethod');
  const total = getTotal();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPaymentProof(e.target.files[0]);
    }
  };

  const onSubmit = (data: CheckoutForm) => {
    if (!user) {
      navigate('/auth/login');
      return;
    }

    // Simulate order creation
    toast({
      title: 'Commande créée avec succès',
      description: `Numéro de commande: #${Date.now().toString().slice(-6)}`,
    });

    clearCart();
    setStep('confirmation');
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16">
        <EmptyState
          icon={ShoppingBag}
          title="Connexion requise"
          description="Veuillez vous connecter pour passer une commande"
          action={{
            label: 'Se connecter',
            onClick: () => navigate('/auth/login'),
          }}
        />
      </div>
    );
  }

  if (items.length === 0 && step !== 'confirmation') {
    return (
      <div className="container mx-auto px-4 py-16">
        <EmptyState
          icon={ShoppingBag}
          title="Votre panier est vide"
          description="Parcourez notre catalogue pour ajouter des produits"
          action={{
            label: 'Voir le catalogue',
            onClick: () => navigate('/catalog'),
          }}
        />
      </div>
    );
  }

  if (step === 'confirmation') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="pt-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2" data-testid="text-order-confirmed">
              Commande confirmée !
            </h1>
            <p className="text-muted-foreground mb-6">
              Votre commande a été enregistrée avec succès. Vous recevrez une confirmation par email.
            </p>
            <div className="flex flex-col gap-3">
              <Button onClick={() => navigate('/dashboard')} data-testid="button-view-orders">
                Voir mes commandes
              </Button>
              <Button variant="outline" onClick={() => navigate('/catalog')}>
                Continuer mes achats
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-muted/30 border-b">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-4">Finaliser la commande</h1>

          {/* Stepper */}
          <div className="flex items-center gap-2 md:gap-4">
            {[
              { key: 'cart', label: 'Panier', icon: ShoppingBag },
              { key: 'address', label: 'Adresse', icon: MapPin },
              { key: 'payment', label: 'Paiement', icon: CreditCard },
            ].map((s, index) => {
              const isActive = s.key === step;
              const isCompleted = ['cart', 'address', 'payment'].indexOf(step) > index;

              return (
                <div key={s.key} className="flex items-center gap-2">
                  <div
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : isCompleted
                        ? 'bg-green-100 text-green-800'
                        : 'bg-muted'
                    }`}
                  >
                    <s.icon className="h-4 w-4" />
                    <span className="hidden md:inline text-sm font-medium">{s.label}</span>
                  </div>
                  {index < 2 && (
                    <div className="h-0.5 w-8 md:w-16 bg-border" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Cart Review */}
              {step === 'cart' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Votre panier ({items.length})</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-4 p-4 rounded-lg border" data-testid={`checkout-item-${item.id}`}>
                        {item.product?.images?.[0] && (
                          <img
                            src={item.product.images[0]}
                            alt={item.product.title}
                            className="w-20 h-20 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium">{item.product?.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {((item.product?.priceCents || 0) / 100).toLocaleString('fr-FR')} XOF
                          </p>
                          <p className="text-sm mt-1">Quantité: {item.qty}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            {(((item.product?.priceCents || 0) * item.qty) / 100).toLocaleString('fr-FR')} XOF
                          </p>
                        </div>
                      </div>
                    ))}
                    <Button
                      type="button"
                      onClick={() => setStep('address')}
                      className="w-full"
                      data-testid="button-continue-to-address"
                    >
                      Continuer vers l'adresse
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Address Form */}
              {step === 'address' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Adresse de livraison</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="label">Libellé de l'adresse</Label>
                      <Input
                        id="label"
                        placeholder="Ex: Maison, Bureau..."
                        {...register('label')}
                        data-testid="input-address-label"
                      />
                      {errors.label && (
                        <p className="text-sm text-destructive mt-1">{errors.label.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="country">Pays</Label>
                      <Input
                        id="country"
                        {...register('country')}
                        data-testid="input-country"
                      />
                      {errors.country && (
                        <p className="text-sm text-destructive mt-1">{errors.country.message}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="region">Région</Label>
                        <Input
                          id="region"
                          placeholder="Ex: Centre"
                          {...register('region')}
                          data-testid="input-region"
                        />
                        {errors.region && (
                          <p className="text-sm text-destructive mt-1">{errors.region.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="city">Ville</Label>
                        <Input
                          id="city"
                          placeholder="Ex: Ouagadougou"
                          {...register('city')}
                          data-testid="input-city"
                        />
                        {errors.city && (
                          <p className="text-sm text-destructive mt-1">{errors.city.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStep('cart')}
                        data-testid="button-back-to-cart"
                      >
                        Retour
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setStep('payment')}
                        className="flex-1"
                        data-testid="button-continue-to-payment"
                      >
                        Continuer vers le paiement
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Payment */}
              {step === 'payment' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Mode de paiement</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <RadioGroup
                      defaultValue="CASH"
                      onValueChange={(value) => {
                        // Update form value
                      }}
                    >
                      <Card className="cursor-pointer hover-elevate">
                        <CardContent className="flex items-center gap-4 p-4">
                          <RadioGroupItem value="CASH" id="cash" data-testid="radio-cash" />
                          <Label htmlFor="cash" className="flex-1 cursor-pointer">
                            <p className="font-medium">Paiement à la livraison</p>
                            <p className="text-sm text-muted-foreground">
                              Payez en espèces lors de la réception
                            </p>
                          </Label>
                        </CardContent>
                      </Card>

                      <Card className="cursor-pointer hover-elevate">
                        <CardContent className="flex items-center gap-4 p-4">
                          <RadioGroupItem value="MOBILE_MONEY" id="mobile" data-testid="radio-mobile-money" />
                          <Label htmlFor="mobile" className="flex-1 cursor-pointer">
                            <p className="font-medium">Mobile Money</p>
                            <p className="text-sm text-muted-foreground">
                              Orange Money, Moov Money, etc.
                            </p>
                          </Label>
                        </CardContent>
                      </Card>

                      <Card className="cursor-pointer hover-elevate">
                        <CardContent className="flex items-center gap-4 p-4">
                          <RadioGroupItem value="BANK_TRANSFER" id="bank" data-testid="radio-bank-transfer" />
                          <Label htmlFor="bank" className="flex-1 cursor-pointer">
                            <p className="font-medium">Virement bancaire</p>
                            <p className="text-sm text-muted-foreground">
                              Transfert bancaire direct
                            </p>
                          </Label>
                        </CardContent>
                      </Card>
                    </RadioGroup>

                    {/* Payment Proof Upload */}
                    {(paymentMethod === 'MOBILE_MONEY' || paymentMethod === 'BANK_TRANSFER') && (
                      <div>
                        <Label>Preuve de paiement (optionnel)</Label>
                        <div className="mt-2 border-2 border-dashed rounded-lg p-8 text-center">
                          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground mb-2">
                            Glissez-déposez votre reçu ou cliquez pour sélectionner
                          </p>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={handleFileChange}
                            className="hidden"
                            id="payment-proof"
                            data-testid="input-payment-proof"
                          />
                          <Label htmlFor="payment-proof">
                            <Button type="button" variant="outline" asChild>
                              <span>Sélectionner un fichier</span>
                            </Button>
                          </Label>
                          {paymentProof && (
                            <p className="text-sm text-primary mt-2">{paymentProof.name}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    <div>
                      <Label htmlFor="notes">Notes (optionnel)</Label>
                      <Textarea
                        id="notes"
                        placeholder="Instructions de livraison ou commentaires..."
                        {...register('notes')}
                        data-testid="textarea-notes"
                      />
                    </div>

                    <div className="flex gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStep('address')}
                        data-testid="button-back-to-address"
                      >
                        Retour
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1"
                        data-testid="button-confirm-order"
                      >
                        Confirmer la commande
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Récapitulatif</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sous-total</span>
                    <span>{(total / 100).toLocaleString('fr-FR')} XOF</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Livraison</span>
                    <span className="text-green-600">Gratuite</span>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span data-testid="text-total-amount">
                      {(total / 100).toLocaleString('fr-FR')} XOF
                    </span>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  En passant votre commande, vous acceptez nos conditions générales de vente.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
