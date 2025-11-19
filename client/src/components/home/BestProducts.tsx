import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "@/components/product/ProductCard";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { Package2 } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE;


export function BestProducts() {
  const { data, isLoading } = useQuery({
    queryKey: ["/api/v1/products/best"],
        queryFn: async () => {
        const res = await fetch(`${API_BASE}/products/best`);
        return res.json();
        }

  });

  if (isLoading) {
    return (
      <div className="w-full flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (!Array.isArray(data)) {
    console.warn("API Best Products returned invalid data:", data);
    return <EmptyState 
      icon={Package2} 
      title="Pas de produits" 
      description="Aucun produit disponible pour le moment." 
    />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {data.map((product: any) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
