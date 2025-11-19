import { useState, useEffect, ChangeEvent } from "react";
import {
  useSupplierProducts,
  useCreateProduct,
  useUpdateProduct,
} from "@/hooks/useSupplier";

import { Button } from "@/components/ui/button";
import { Plus, ImagePlus, X } from "lucide-react";

import { useAuthStore } from "@/lib/store";
import { EmptyState } from "@/components/ui/empty-state";
import { Package2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

import { SupplierProductCard } from "@/components/supplier/SupplierProductCard";

import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE;
const MEDIA_BASE = import.meta.env.VITE_MEDIA_BASE || "http://localhost:5001";

export default function SupplierProducts() {
  const { user } = useAuthStore();
  const { toast } = useToast();

  const { data, isLoading } = useSupplierProducts();
  const products = data || [];

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

  // Images existantes venant de la BD
  const [existingImages, setExistingImages] = useState<string[]>([]);

  // Nouvelles images uploadées
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  // ----------------- PREVIEW DES NOUVELLES IMAGES -----------------
  useEffect(() => {
    if (files.length > 0) {
      const urls = files.map((f) => URL.createObjectURL(f));
      setPreviews(urls);
      return () => urls.forEach((u) => URL.revokeObjectURL(u));
    } else {
      setPreviews([]);
    }
  }, [files]);

  // ----------------- AJOUTER DES IMAGES -----------------
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const newFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...newFiles]);

    const newPreviews = newFiles.map((f) => URL.createObjectURL(f));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  // ----------------- SUPPRIMER UNE IMAGE EXISTANTE -----------------
  const handleDeleteExistingImage = async (img: string) => {
    if (!editingProduct) return;
    const token = localStorage.getItem("accessToken");

    await axios.delete(
      `${API_BASE}/supplier/products/${editingProduct.id}/images`,
      {
        data: { imageUrl: img },
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    setExistingImages((prev) => prev.filter((i) => i !== img));
    toast({ title: "Image supprimée" });
  };

  // ----------------- SUPPRIMER UNE NOUVELLE IMAGE -----------------
  const handleRemoveNewImage = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // ----------------- SUBMIT FORMULAIRE -----------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingProduct) {
        // ------- 1. UPDATE TEXT -------
        await updateMutation.mutateAsync({
          id: editingProduct.id,
          payload: formData,
        });

        // ------- 2. UPLOAD NEW IMAGES -------
        if (files.length > 0) {
          const token = localStorage.getItem("accessToken");
          const fd = new FormData();
          files.forEach((file) => fd.append("images", file));

          await axios.post(
            `${API_BASE}/supplier/products/${editingProduct.id}/images`,
            fd,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
              },
            }
          );
        }

        toast({ title: "Produit mis à jour" });
      } else {
        // ------- CREATION (texte + images) -------
        await createMutation.mutateAsync({
          payload: formData,
          images: files,
        });

        toast({ title: "Produit créé" });
      }

      // ------- RESET UI -------
      resetForm();

    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setExistingImages([]);
    setFiles([]);
    setPreviews([]);
    setEditingProduct(null);
    setFormData({
      title: "",
      sku: "",
      priceCents: 0,
      stock: 0,
      currency: "XOF",
    });
    setOpenForm(false);
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
        <div className="container mx-auto px-4 py-8 flex justify-between">
          <div>
            <h1 className="text-3xl font-bold">Mes Produits</h1>
            <p className="text-muted-foreground">Gérez votre catalogue</p>
          </div>

          <Button
            onClick={() => {
              resetForm();
              setOpenForm(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" /> Nouveau produit
          </Button>
        </div>
      </div>

      {/* LISTE DES PRODUITS */}
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <p>Chargement...</p>
        ) : products.length === 0 ? (
          <EmptyState
            icon={Package2}
            title="Aucun produit"
            description="Ajoutez votre premier produit"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product: any) => (
              <SupplierProductCard
                key={product.id}
                product={{
                  ...product,
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
                  setExistingImages(prod.images || []);
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

            {/* -------- TITRE -------- */}
            <div>
              <Label>Titre</Label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>

            {/* -------- SKU -------- */}
            <div>
              <Label>SKU</Label>
              <Input
                value={formData.sku}
                onChange={(e) =>
                  setFormData({ ...formData, sku: e.target.value })
                }
              />
            </div>

            {/* -------- PRIX + STOCK -------- */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Prix (XOF)</Label>
                <Input
                  type="number"
                  value={formData.priceCents}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      priceCents: Number(e.target.value),
                    })
                  }
                />
              </div>

              <div>
                <Label>Stock</Label>
                <Input
                  type="number"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      stock: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            {/* -------- IMAGES EXISTANTES -------- */}
            {existingImages.length > 0 && (
              <div>
                <Label>Images existantes</Label>
                <div className="flex flex-wrap gap-3 mt-2">
                  {existingImages.map((img, idx) => (
                    <div key={idx} className="relative">
                      <img
                        src={`${MEDIA_BASE}${img}`}
                        className="w-20 h-20 rounded-md border object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteExistingImage(img)}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* -------- AJOUTER IMAGES -------- */}
            <div>
              <Label>Ajouter des images</Label>
              <div className="flex items-center gap-2 mt-2">
                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <ImagePlus className="h-5 w-5 text-muted-foreground" />
              </div>

              {previews.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-3">
                  {previews.map((url, idx) => (
                    <div key={idx} className="relative">
                      <img
                        src={url}
                        className="w-20 h-20 rounded-md border object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveNewImage(idx)}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1"
                      >
                        <X size={14} />
                      </button>
                    </div>
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
