import { useRoute, Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, ChevronLeft, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import ReactMarkdown from 'react-markdown';

export default function ArticleDetail() {
  const [, params] = useRoute('/articles/:slug');
  const slug = params?.slug;

  // Mock article - will be replaced with API call in Task 3
  const article = {
    id: 1,
    title: 'Préparation du Sol pour la Saison des Pluies',
    slug: 'preparation-sol-saison-pluies',
    bodyMd: `# Introduction

La préparation du sol est une étape cruciale pour garantir une bonne germination et une croissance optimale de vos cultures. Un sol bien préparé permet aux racines de se développer facilement et aux plantes d'accéder aux nutriments essentiels.

## Pourquoi préparer le sol ?

Un sol bien préparé offre plusieurs avantages :

- **Meilleure aération** : Les racines peuvent respirer et se développer
- **Drainage amélioré** : L'eau ne stagne pas, évitant le pourrissement des racines
- **Élimination des mauvaises herbes** : Réduction de la concurrence pour les nutriments
- **Incorporation de matière organique** : Enrichissement du sol en nutriments

## Les étapes clés

### 1. Labour

Le labour permet de retourner la terre et d'enfouir les résidus de culture. Il doit être effectué :

- À une profondeur de 20-25 cm pour la plupart des cultures
- Lorsque le sol n'est ni trop sec ni trop humide
- Au moins 3-4 semaines avant les semis

### 2. Amendement du sol

Apportez de la matière organique pour améliorer la structure du sol :

- Compost bien décomposé (2-3 tonnes par hectare)
- Fumier animal (selon la culture)
- Engrais verts si possible

### 3. Nivelage

Un sol bien nivelé assure :

- Une distribution uniforme de l'eau
- Une germination homogène
- Un travail du sol plus facile

### 4. Formation de billons ou planches

Selon la culture et le type de sol :

- Billons pour les cultures de tubercules
- Planches pour les cultures maraîchères
- Lignes pour les céréales

## Timing optimal

Le moment idéal pour la préparation du sol dépend de plusieurs facteurs :

- **Type de sol** : Les sols argileux nécessitent un labour plus précoce
- **Culture prévue** : Chaque culture a ses exigences spécifiques
- **Climat local** : Tenez compte des prévisions météorologiques

## Conclusion

Une bonne préparation du sol est un investissement qui se traduit par de meilleurs rendements. Prenez le temps nécessaire pour bien préparer votre terrain avant chaque saison culturale.`,
    tags: ['sol', 'préparation', 'saison-pluies'],
    authorId: 1,
    publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'PUBLISHED' as const,
  };

  const author = {
    firstName: 'Dr. Fatou',
    lastName: 'Konaté',
  };

  if (!article) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Article non trouvé</h1>
        <Link href="/articles">
          <Button>Retour aux articles</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Image */}
      <div className="aspect-[21/9] bg-gradient-to-br from-primary to-primary/60 relative overflow-hidden">
        <img
          src={`https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1920&h=800&fit=crop&q=80`}
          alt={article.title}
          className="w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4">
            <Link href="/articles">
              <a className="inline-flex items-center text-white/90 hover:text-white mb-4">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Retour aux articles
              </a>
            </Link>
            <h1 className="text-3xl md:text-5xl font-bold text-white max-w-4xl" data-testid="text-article-title">
              {article.title}
            </h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Meta Info */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {author.firstName} {author.lastName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(article.publishedAt), {
                      addSuffix: true,
                      locale: fr,
                    })}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map(tag => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Article Content */}
          <Card>
            <CardContent className="p-8 md:p-12">
              <div className="prose prose-lg max-w-none" data-testid="article-content">
                <ReactMarkdown>{article.bodyMd}</ReactMarkdown>
              </div>
            </CardContent>
          </Card>

          {/* Related Articles */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Articles connexes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link href="/articles/gestion-ravageurs-mais">
                <Card className="hover-elevate transition-all cursor-pointer">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-2">
                      Gestion Intégrée des Ravageurs du Maïs
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Apprenez à identifier et contrôler les principaux ravageurs du maïs...
                    </p>
                    <div className="flex items-center text-primary text-sm font-medium">
                      Lire l'article
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/articles/rotation-cultures-guide">
                <Card className="hover-elevate transition-all cursor-pointer">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-2">
                      Rotation des Cultures : Guide Pratique
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Améliorez la fertilité de votre sol et réduisez les maladies...
                    </p>
                    <div className="flex items-center text-primary text-sm font-medium">
                      Lire l'article
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
