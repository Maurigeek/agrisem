import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Edit, Trash2, Eye, CheckCircle, XCircle } from "lucide-react";
import { useUpdateProduct, useDeleteProduct } from "@/hooks/useSupplier";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";

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

const API_BASE = import.meta.env.VITE_API_BASE;
const MEDIA_BASE = import.meta.env.VITE_MEDIA_BASE || "http://localhost:5001";

export function SupplierProductCard({ product, onEdit }: SupplierProductCardProps) {
  const { toast } = useToast();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();
  const qc = useQueryClient();

  const [isPreviewOpen, setPreviewOpen] = useState(false);
  const [isActive, setIsActive] = useState(product.status === "ACTIVE");

  /* -----------------------------------------
     🔄 ACTIVER/DÉSACTIVER LE PRODUIT
  ----------------------------------------- */
  const handleToggleActive = async (checked: boolean) => {
    try {
      setIsActive(checked);
      await updateMutation.mutateAsync({
        id: product.id,
        payload: { status: checked ? "ACTIVE" : "INACTIVE" },
      });

      toast({
        title: checked ? "Produit activé" : "Produit désactivé",
        description: `${product.title} est mis à jour.`,
      });

      qc.invalidateQueries(["supplier-products"]);
    } catch {
      setIsActive(!checked);
      toast({
        title: "Erreur",
        description: "Impossible de modifier l'état",
        variant: "destructive",
      });
    }
  };

  /* -----------------------------------------
     🗑 SUPPRIMER LE PRODUIT
  ----------------------------------------- */
  const handleDelete = async () => {
    if (!confirm("Voulez-vous vraiment supprimer ce produit ?")) return;

    await deleteMutation.mutateAsync(product.id);
    toast({ title: "Produit supprimé 🗑️" });
    qc.invalidateQueries(["supplier-products"]);
  };

  /* -----------------------------------------
     🗑 SUPPRIMER UNE IMAGE
  ----------------------------------------- */
  const handleRemoveImage = async (imgUrl: string) => {
    try {
      const token = localStorage.getItem("accessToken");

      await axios.delete(`${API_BASE}/supplier/products/${product.id}/images`, {
        data: { imageUrl: imgUrl },
        headers: { Authorization: `Bearer ${token}` },
      });

      toast({ title: "Image supprimée" });
      qc.invalidateQueries(["supplier-products"]);
    } catch {
      toast({
        title: "Erreur suppression",
        description: "Impossible de supprimer l'image",
        variant: "destructive",
      });
    }
  };

  /* -----------------------------------------
     📸 IMAGE PRINCIPALE
  ----------------------------------------- */
  const imageUrl =
    product.images && product.images.length > 0
      ? `${MEDIA_BASE}${product.images[0]}`
      : "https://via.placeholder.com/400x300";

  const formattedPrice = (product.priceCents / 100).toLocaleString("fr-FR");

  /* -----------------------------------------
     🖼️ RENDER
  ----------------------------------------- */
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
                  <CheckCircle className="h-3 w-3 text-green-500" /> Actif
                </>
              ) : (
                <>
                  <XCircle className="h-3 w-3 text-red-500" /> Inactif
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
            <span className="text-xl font-bold">
              {formattedPrice} {product.currency}
            </span>
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
          <Button variant="outline" size="sm" onClick={() => onEdit(product)}>
            <Edit className="h-4 w-4 mr-1" /> Modifier
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

      {/* -----------------------------------------
          🔍 MODAL DE PRÉVISUALISATION COMPLETTE
      ----------------------------------------- */}
      <Dialog open={isPreviewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Images & détails du produit</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            {/* 🔥 Galerie complète */}
            <div className="grid grid-cols-3 gap-2">
              {product.images?.map((img, idx) => (
                <div key={idx} className="relative">
                  <img
                    src={`${MEDIA_BASE}${img}`}
                    className="w-full h-24 object-cover rounded-md border"
                  />

                  {/* ❌ bouton suppression */}
                  <button
                    onClick={() => handleRemoveImage(img)}
                    className="absolute top-1 right-1 bg-red-600 text-white text-xs rounded-full px-1"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <h3 className="font-semibold text-lg mt-4">{product.title}</h3>
            <p className="text-sm text-muted-foreground">SKU : {product.sku}</p>

            <p className="text-base font-semibold">
              {formattedPrice} {product.currency}
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
