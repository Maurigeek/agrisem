import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Edit, Trash2, Eye, Package, CheckCircle, XCircle } from "lucide-react";
import { useUpdateProduct, useDeleteProduct } from "@/hooks/useSupplier";
import { useToast } from "@/hooks/use-toast";

type SupplierProduct = {
  id: number;
  title: string;
  sku: string;
  priceCents: number;
  stock: number;
  currency: string;
  status: "ACTIVE" | "INACTIVE";
  images?: string[];
};

interface SupplierProductCardProps {
  product: SupplierProduct;
  onEdit: (product: SupplierProduct) => void;
}

export function SupplierProductCard({ product, onEdit }: SupplierProductCardProps) {
  const { toast } = useToast();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  const [isPreviewOpen, setPreviewOpen] = useState(false);
  const [isActive, setIsActive] = useState(product.status === "ACTIVE");

  const handleToggleActive = async (checked: boolean) => {
    try {
      setIsActive(checked);
      await updateMutation.mutateAsync({
        id: product.id,
        payload: { status: checked ? "ACTIVE" : "INACTIVE" },
      });
      toast({
        title: checked ? "Produit activé ✅" : "Produit désactivé ❌",
        description: checked
          ? `${product.title} est maintenant disponible dans le catalogue.`
          : `${product.title} est maintenant en rupture.`,
      });
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier l’état du produit.",
        variant: "destructive",
      });
      setIsActive(!checked); // revert in case of failure
    }
  };

  const handleDelete = async () => {
    if (!confirm("Voulez-vous vraiment supprimer ce produit ?")) return;
    await deleteMutation.mutateAsync(product.id);
    toast({ title: "Produit supprimé 🗑️" });
  };

  const imageUrl =
    product.images?.[0]
      ? `${import.meta.env.VITE_API_BASE || "http://localhost:8000"}${product.images[0]}`
      : "https://via.placeholder.com/400x300";

  const formattedPrice = (product.priceCents / 100).toLocaleString("fr-FR");

  return (
    <>
      <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300">
        <div className="aspect-[4/3] relative overflow-hidden bg-muted">
          <img
            src={imageUrl}
            alt={product.title}
            className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
          />

          <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
            <Badge
              variant={isActive ? "default" : "secondary"}
              className="text-xs flex items-center gap-1"
            >
              {isActive ? (
                <>
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  Actif
                </>
              ) : (
                <>
                  <XCircle className="h-3 w-3 text-red-500" />
                  Inactif
                </>
              )}
            </Badge>
          </div>
        </div>

        <CardHeader>
          <CardTitle className="text-lg font-semibold">{product.title}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold">{formattedPrice} {product.currency}</span>
          </div>
          <Badge variant={product.stock > 0 ? "default" : "destructive"}>
            {product.stock > 0 ? `Stock: ${product.stock}` : "Rupture"}
          </Badge>

          <div className="flex items-center justify-between pt-3 border-t mt-3">
            <div className="flex items-center gap-2">
              <Switch checked={isActive} onCheckedChange={handleToggleActive} />
              <span className="text-xs text-muted-foreground">
                {isActive ? "Disponible" : "Indisponible"}
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={() => setPreviewOpen(true)}>
              <Eye className="h-4 w-4 mr-1" /> Voir
            </Button>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(product)}
            className="flex items-center gap-1"
          >
            <Edit className="h-4 w-4" /> Modifier
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            className="flex items-center gap-1"
          >
            <Trash2 className="h-4 w-4" /> Supprimer
          </Button>
        </CardFooter>
      </Card>

      {/* Dialog de prévisualisation */}
      <Dialog open={isPreviewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Détails du produit</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <img
              src={imageUrl}
              alt={product.title}
              className="w-full h-64 object-cover rounded-md"
            />
            <h3 className="font-semibold text-lg">{product.title}</h3>
            <p className="text-sm text-muted-foreground">SKU : {product.sku}</p>
            <p className="text-base font-semibold">
              {(product.priceCents / 100).toLocaleString("fr-FR")} {product.currency}
            </p>
            <p className="text-sm text-muted-foreground">
              {product.stock > 0 ? `${product.stock} en stock` : "Rupture de stock"}
            </p>
            <Badge variant={isActive ? "default" : "secondary"}>
              {isActive ? "Actif" : "Inactif"}
            </Badge>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
