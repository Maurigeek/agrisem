import { useCartStore } from '@/lib/store';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useLocation } from 'wouter';
import { EmptyState } from '@/components/ui/empty-state';

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const [, navigate] = useLocation();
  const { items, updateItem, removeItem, getTotal, clearCart } = useCartStore();

  const handleCheckout = () => {
    onOpenChange(false);
    navigate('/checkout');
  };

  const total = getTotal();

  if (items.length === 0) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Panier</SheetTitle>
          </SheetHeader>
          <EmptyState
            icon={ShoppingBag}
            title="Votre panier est vide"
            description="Parcourez notre catalogue pour ajouter des produits"
            action={{
              label: 'Voir le catalogue',
              onClick: () => {
                onOpenChange(false);
                navigate('/catalog');
              },
            }}
          />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col" data-testid="drawer-cart">
        <SheetHeader>
          <SheetTitle>Panier ({items.length})</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4">
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 p-4 rounded-lg border"
                data-testid={`cart-item-${item.id}`}
              >
                {item.product?.images?.[0] && (
                  <img
                    src={item.product.images[0]}
                    alt={item.product.title}
                    className="w-20 h-20 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <h4 className="font-medium line-clamp-1" data-testid={`text-cart-item-title-${item.id}`}>
                    {item.product?.title || 'Produit'}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {((item.product?.priceCents || 0) / 100).toLocaleString('fr-FR')} XOF
                  </p>

                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateItem(item.id, Math.max(1, item.qty - 1))}
                      data-testid={`button-decrease-${item.id}`}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center" data-testid={`text-qty-${item.id}`}>
                      {item.qty}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateItem(item.id, item.qty + 1)}
                      data-testid={`button-increase-${item.id}`}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 ml-auto text-destructive"
                      onClick={() => removeItem(item.id)}
                      data-testid={`button-remove-${item.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <SheetFooter className="flex flex-col gap-4">
          <div className="flex items-center justify-between text-lg font-semibold border-t pt-4">
            <span>Total</span>
            <span data-testid="text-cart-total">
              {(total / 100).toLocaleString('fr-FR')} XOF
            </span>
          </div>
          <Button onClick={handleCheckout} className="w-full" size="lg" data-testid="button-checkout">
            Passer la commande
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
