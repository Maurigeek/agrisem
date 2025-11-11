import { useState } from 'react';
import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Calendar, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function Articles() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Mock articles - will be replaced with API calls in Task 3
  const articles = [
    {
      id: 1,
      title: 'Préparation du Sol pour la Saison des Pluies',
      slug: 'preparation-sol-saison-pluies',
      bodyMd: 'Guide complet sur la préparation optimale du sol...',
      tags: ['sol', 'préparation', 'saison-pluies'],
      authorId: 1,
      publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'PUBLISHED' as const,
      excerpt: 'Découvrez les meilleures pratiques pour préparer votre sol avant les semis. Un bon travail du sol garantit une germination optimale.',
    },
    {
      id: 2,
      title: 'Gestion Intégrée des Ravageurs du Maïs',
      slug: 'gestion-ravageurs-mais',
      bodyMd: 'Stratégies de lutte contre les ravageurs...',
      tags: ['maïs', 'ravageurs', 'protection'],
      authorId: 1,
      publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'PUBLISHED' as const,
      excerpt: 'Apprenez à identifier et contrôler les principaux ravageurs du maïs de manière écologique et efficace.',
    },
    {
      id: 3,
      title: 'Optimisation de l\'Irrigation pour le Riz',
      slug: 'optimisation-irrigation-riz',
      bodyMd: 'Techniques d\'irrigation efficaces...',
      tags: ['riz', 'irrigation', 'eau'],
      authorId: 1,
      publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'PUBLISHED' as const,
      excerpt: 'Maximisez votre rendement en riz grâce à des techniques d\'irrigation adaptées aux différentes phases de croissance.',
    },
    {
      id: 4,
      title: 'Culture de Tomates en Saison Sèche',
      slug: 'culture-tomates-saison-seche',
      bodyMd: 'Guide pour la culture de tomates...',
      tags: ['tomate', 'saison-sèche', 'maraîchage'],
      authorId: 1,
      publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'PUBLISHED' as const,
      excerpt: 'Réussissez votre culture de tomates même pendant la saison sèche avec ces conseils pratiques et éprouvés.',
    },
    {
      id: 5,
      title: 'Rotation des Cultures : Guide Pratique',
      slug: 'rotation-cultures-guide',
      bodyMd: 'Importance de la rotation des cultures...',
      tags: ['rotation', 'fertilité', 'planification'],
      authorId: 1,
      publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'PUBLISHED' as const,
      excerpt: 'Améliorez la fertilité de votre sol et réduisez les maladies grâce à une rotation des cultures bien planifiée.',
    },
  ];

  // Get all unique tags
  const allTags = Array.from(
    new Set(articles.flatMap(article => article.tags))
  );

  // Filter articles
  const filteredArticles = articles.filter(article => {
    const matchesSearch = !searchQuery ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTag = !selectedTag || article.tags.includes(selectedTag);

    return matchesSearch && matchesTag;
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-muted/30 border-b">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4" data-testid="text-articles-title">
            Conseils Agricoles
          </h1>
          <p className="text-muted-foreground">
            Guides pratiques et conseils d'experts pour optimiser vos cultures
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Tags */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher des articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-articles"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge
              variant={selectedTag === null ? 'default' : 'secondary'}
              className="cursor-pointer"
              onClick={() => setSelectedTag(null)}
              data-testid="badge-tag-all"
            >
              Tous
            </Badge>
            {allTags.map(tag => (
              <Badge
                key={tag}
                variant={selectedTag === tag ? 'default' : 'secondary'}
                className="cursor-pointer"
                onClick={() => setSelectedTag(tag)}
                data-testid={`badge-tag-${tag}`}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map(article => (
            <Link key={article.id} href={`/articles/${article.slug}`}>
              <Card className="h-full hover-elevate transition-all cursor-pointer" data-testid={`card-article-${article.id}`}>
                <div className="aspect-video bg-gradient-to-br from-primary to-primary/60 relative overflow-hidden">
                  <img
                    src={`https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&h=400&fit=crop&q=80&crop=entropy&seed=${article.id}`}
                    alt={article.title}
                    className="w-full h-full object-cover opacity-80"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-3 line-clamp-2" data-testid={`text-article-title-${article.id}`}>
                    {article.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {article.excerpt}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {article.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {formatDistanceToNow(new Date(article.publishedAt), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {filteredArticles.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">Aucun article trouvé</p>
          </div>
        )}
      </div>
    </div>
  );
}
