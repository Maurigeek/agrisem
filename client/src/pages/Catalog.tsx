import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductFilters } from '@/components/product/ProductFilters';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Package2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Catalog() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCultures, setSelectedCultures] = useState<number[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [sortBy, setSortBy] = useState('name');
  const [page, setPage] = useState(1);

  // Fetch cultures
  const { data: cultures = [] } = useQuery({
  queryKey: ['/api/v1/cultures'],
    queryFn: async () => {
      const res = await fetch('/api/v1/cultures');
      if (!res.ok) throw new Error('Failed to fetch cultures');
      return res.json();
    },
  });

  // Fetch varieties (fetch all, not filtered by culture)
  const { data: allVarieties = [] } = useQuery({
    queryKey: ['/api/v1/varieties'],
    queryFn: async () => {
      const res = await fetch('/api/v1/varieties');
      if (!res.ok) throw new Error('Erreur de chargement des variétés');
      return res.json();
    },
  });

  // Filter varieties by selected cultures
  const varieties = selectedCultures.length > 0
    ? allVarieties.filter((v: any) => selectedCultures.includes(v.cultureId))
    : allVarieties;

  // Fetch products with filters - build params inside queryFn to capture latest state
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['/api/v1/products', page, selectedCultures, priceRange, searchQuery, sortBy],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('page_size', '20');
      if (selectedCultures.length > 0) {
        params.set('cultureId', selectedCultures[0].toString());
      }
      if (priceRange[0] > 0) {
        params.set('minPrice', priceRange[0].toString());
      }
      if (priceRange[1] < 100000) {
        params.set('maxPrice', priceRange[1].toString());
      }
      if (searchQuery) {
        params.set('q', searchQuery);
      }
      if (sortBy) {
        params.set('ordering', sortBy);
      }
      
      const res = await fetch(`/api/v1/products?${params.toString()}`);
      return res.json();
    },
  });

  const products = productsData?.results || [];

  const handleResetFilters = () => {
    setSelectedCultures([]);
    setPriceRange([0, 100000]);
    setSearchQuery('');
  };

  // Filter products based on criteria
  const filteredProducts = products.filter((product) => {
    // const variety = varieties.find(v => v.id === product.varietyId);
    // if (!variety) return false;

    // Culture filter
    // if (selectedCultures.length > 0 && !selectedCultures.includes(variety.cultureId)) {
    //   return false;
    // }

    // Price filter
    if (product.priceCents < priceRange[0] || product.priceCents > priceRange[1]) {
      return false;
    }

    // Search filter
    if (searchQuery && !product.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-muted/30 border-b">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4" data-testid="text-page-title">
            Catalogue de Semences
          </h1>
          <p className="text-muted-foreground">
            Parcourez notre sélection de semences certifiées de haute qualité
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="sticky top-20">
              <ProductFilters
                cultures={cultures}
                selectedCultures={selectedCultures}
                onCultureChange={setSelectedCultures}
                priceRange={priceRange}
                onPriceChange={setPriceRange}
                onReset={handleResetFilters}
              />
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Search and Sort */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher des semences..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search"
                />
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-48" data-testid="select-sort">
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Nom</SelectItem>
                  <SelectItem value="price-asc">Prix croissant</SelectItem>
                  <SelectItem value="price-desc">Prix décroissant</SelectItem>
                  <SelectItem value="newest">Plus récent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Results Count */}
            <p className="text-sm text-muted-foreground mb-4" data-testid="text-results-count">
              {filteredProducts.length} produit{filteredProducts.length !== 1 ? 's' : ''} trouvé{filteredProducts.length !== 1 ? 's' : ''}
            </p>

            {/* Products */}
            {filteredProducts.length === 0 ? (
              <EmptyState
                icon={Package2}
                title="Aucun produit trouvé"
                description="Essayez d'ajuster vos filtres pour voir plus de résultats"
                action={{
                  label: 'Réinitialiser les filtres',
                  onClick: handleResetFilters,
                }}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => {
                  const variety = varieties.find(v => v.id === product.varietyId);
                  return (
                    <ProductCard
                      key={product.id}
                      product={product}
                      variety={variety}
                    />
                  );
                })}
              </div>
            )}

            {/* Pagination - Simple for now */}
            {filteredProducts.length > 0 && (
              <div className="flex justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  data-testid="button-prev-page"
                >
                  Précédent
                </Button>
                <Button variant="outline" disabled data-testid="text-current-page">
                  Page {page}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPage(p => p + 1)}
                  data-testid="button-next-page"
                >
                  Suivant
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
