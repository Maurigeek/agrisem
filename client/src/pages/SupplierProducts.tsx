import { useState, useEffect, ChangeEvent } from "react";
import {
  useSupplierProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from "@/hooks/useSupplier";
import { Button } from "@/components/ui/button";
import { Plus, ImagePlus } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { EmptyState } from "@/components/ui/empty-state";
import { Package2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { SupplierProductCard } from "@/components/supplier/SupplierProductCard"; 

export default function SupplierProducts() {
  const { user } = useAuthStore();
  const { toast } = useToast();

  const { data, isLoading } = useSupplierProducts();
  const products = data || []; // <- on accède à "data" selon ton retour d’API

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  const [openForm, setOpenForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    sku: "",
    priceCents: 0,
    stock: 0,
    currency: "XOF",
  });
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  // 🔄 Génération des previews d’images
  useEffect(() => {
    if (files.length > 0) {
      const urls = files.map((f) => URL.createObjectURL(f));
      setPreviews(urls);
      return () => urls.forEach((u) => URL.revokeObjectURL(u));
    } else {
      setPreviews([]);
    }
  }, [files]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingProduct) {
        await updateMutation.mutateAsync({
          id: editingProduct.id,
          payload: formData,
          images: files,
        });
        toast({ title: "Produit mis à jour ✅" });
      } else {
        await createMutation.mutateAsync({ payload: formData, images: files });
        toast({ title: "Produit ajouté ✅" });
      }

      setFiles([]);
      setPreviews([]);
      setOpenForm(false);
      setFormData({
        title: "",
        sku: "",
        priceCents: 0,
        stock: 0,
        currency: "XOF",
      });
    } catch (err) {
      toast({
        title: "Erreur d’enregistrement ❌",
        description: "Impossible de sauvegarder le produit",
        variant: "destructive",
      });
    }
  };

  if (user?.role !== "SUPPLIER") {
    return (
      <EmptyState
        icon={Package2}
        title="Accès restreint"
        description="Cette page est réservée aux fournisseurs"
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* HEADER */}
      <div className="bg-muted/30 border-b">
        <div className="container mx-auto px-4 py-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Mes Produits</h1>
            <p className="text-muted-foreground">Gérez votre catalogue de semences</p>
          </div>
          <Button onClick={() => { setEditingProduct(null); setOpenForm(true); }}>
            <Plus className="h-4 w-4 mr-2" /> Nouveau produit
          </Button>
        </div>
      </div>

      {/* PRODUITS */}
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <p>Chargement...</p>
        ) : products.length === 0 ? (
          <EmptyState
            icon={Package2}
            title="Aucun produit"
            description="Ajoutez votre premier produit au catalogue."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product: any) => (
              <SupplierProductCard
                key={product.id}
                product={{
                  id: product.id,
                  title: product.title,
                  sku: product.sku,
                  priceCents: product.priceCents,
                  stock: product.stock,
                  currency: product.currency,
                  status: product.status,
                  images: product.images || [],
                }}
                onEdit={(prod) => {
                  setEditingProduct(prod);
                  setFormData({
                    title: prod.title,
                    sku: prod.sku,
                    priceCents: prod.priceCents,
                    stock: prod.stock,
                    currency: prod.currency,
                  });
                  setOpenForm(true);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* FORMULAIRE PRODUIT */}
      <Dialog open={openForm} onOpenChange={setOpenForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Modifier le produit" : "Nouveau produit"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Titre</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div>
              <Label>SKU</Label>
              <Input
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Prix (en XOF)</Label>
                <Input
                  type="number"
                  value={formData.priceCents}
                  onChange={(e) => setFormData({ ...formData, priceCents: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Stock</Label>
                <Input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                />
              </div>
            </div>

            {/* Upload images */}
            <div>
              <Label>Images du produit</Label>
              <div className="flex items-center gap-2 mt-2">
                <Input type="file" multiple accept="image/*" onChange={handleFileChange} />
                <ImagePlus className="h-5 w-5 text-muted-foreground" />
              </div>

              {previews.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {previews.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      className="w-20 h-20 object-cover rounded-md border"
                    />
                  ))}
                </div>
              )}
            </div>

            <Button type="submit" className="w-full mt-4">
              {editingProduct ? "Mettre à jour" : "Créer"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
