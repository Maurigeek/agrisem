import { db } from './db';
import type { Role, ProductStatus, ArticleStatus, OrderStatus, Product } from '@/shared/schema';

// Mapping images basé sur les cultures
export const productImages: Record<number, string> = {
  1: '/images/products/aubergine.jpg',
  2: '/images/products/carotte.jpeg',
  3: '/images/products/tomate.jpg',
  4: '/images/products/oignon.jpeg',
  5: '/images/products/gombo.jpeg',
  6: '/images/products/piment.jpeg',
  7: '/images/products/laitue.jpeg',
  8: '/images/products/concombre.jpeg',
  9: '/images/products/chou.jpeg',
  10: '/images/products/betterave.jpeg',
  11: '/images/products/riz.jpeg',
  12: '/images/products/mais.jpeg',
};

export function seedDatabase() {
  console.log('🌱 Seeding database...');

  // Reset database
  db.reset();

  // ====================
  // USERS
  // ====================
  const users = [
    {
      id: db.getNextUserId(),
      email: 'producer1@test.com',
      phone: '+226 70 12 34 56',
      role: 'PRODUCER' as Role,
      firstName: 'Jean',
      lastName: 'Dupont',
      isVerified: true,
    },
    {
      id: db.getNextUserId(),
      email: 'producer2@test.com',
      phone: '+226 70 23 45 67',
      role: 'PRODUCER' as Role,
      firstName: 'Marie',
      lastName: 'Ouédraogo',
      isVerified: true,
    },
    {
      id: db.getNextUserId(),
      email: 'supplier1@test.com',
      phone: '+226 70 34 56 78',
      role: 'SUPPLIER' as Role,
      firstName: 'Amadou',
      lastName: 'Diallo',
      orgName: 'Semences du Sahel',
      isVerified: true,
      isSupplierVerified: true,
    },
    {
      id: db.getNextUserId(),
      email: 'supplier2@test.com',
      phone: '+226 70 45 67 89',
      role: 'SUPPLIER' as Role,
      firstName: 'Fatou',
      lastName: 'Koné',
      orgName: 'Africa Seeds',
      isVerified: true,
      isSupplierVerified: true,
    },
    {
      id: db.getNextUserId(),
      email: 'supplier3@test.com',
      phone: '+226 70 56 78 90',
      role: 'SUPPLIER' as Role,
      firstName: 'Ibrahim',
      lastName: 'Sawadogo',
      orgName: 'Bio Semences SARL',
      isVerified: true,
      isSupplierVerified: false,
    },
    {
      id: db.getNextUserId(),
      email: 'admin@test.com',
      role: 'ADMIN' as Role,
      firstName: 'Admin',
      lastName: 'System',
      isVerified: true,
    },
  ];

  db.users = users;

  // ====================
  // CULTURES (12 CULTURES)
  // ID = index + 1 pour correspondre au productImages
  // ====================
  const cultures = [
    { id: db.getNextCultureId(), name: 'Aubergine africaine', code: 'AUBERGINE' },
    { id: db.getNextCultureId(), name: 'Carotte', code: 'CAROTTE' },
    { id: db.getNextCultureId(), name: 'Tomate', code: 'TOMATE' },
    { id: db.getNextCultureId(), name: 'Oignon', code: 'OIGNON' },
    { id: db.getNextCultureId(), name: 'Gombo', code: 'GOMBO' },
    { id: db.getNextCultureId(), name: 'Piment', code: 'PIMENT' },
    { id: db.getNextCultureId(), name: 'Laitue', code: 'LAITUE' },
    { id: db.getNextCultureId(), name: 'Concombre', code: 'CONCOMBRE' },
    { id: db.getNextCultureId(), name: 'Chou', code: 'CHOU' },
    { id: db.getNextCultureId(), name: 'Betterave', code: 'BETTERAVE' },
    { id: db.getNextCultureId(), name: 'Riz', code: 'RIZ' },
    { id: db.getNextCultureId(), name: 'Maïs', code: 'MAIS' },
  ];

  db.cultures = cultures;

  // ====================
  // VARIETIES (1–2 PAR CULTURE)
  // ====================
  const varieties = [
    // Aubergine africaine (1)
    {
      id: db.getNextVarietyId(),
      cultureId: 1,
      name: 'Aubergine Africaine Gbagba',
      description: 'Variété locale très résistante, bien adaptée aux climats chauds.',
      climateSuitability: { temperature: '22-35°C', rainfall: 'Modéré', zones: ['Savane', 'Sahel'] },
      maturityDays: 70,
    },
    {
      id: db.getNextVarietyId(),
      cultureId: 1,
      name: 'Aubergine Yantoto',
      description: 'Variété productive, très utilisée dans la cuisine ouest-africaine.',
      climateSuitability: { temperature: '22-32°C', rainfall: 'Modéré', zones: ['Toutes zones'] },
      maturityDays: 65,
    },

    // Carotte (2)
    {
      id: db.getNextVarietyId(),
      cultureId: 2,
      name: 'Carotte Nantes',
      description: 'Variété sucrée, très populaire pour la consommation fraîche.',
      climateSuitability: { temperature: '15-28°C', rainfall: 'Modéré', zones: ['Toutes zones'] },
      maturityDays: 80,
    },

    // Tomate (3)
    {
      id: db.getNextVarietyId(),
      cultureId: 3,
      name: 'Tomate Roma',
      description: 'Utilisée pour purées et sauces, très productive.',
      climateSuitability: { temperature: '18-30°C', rainfall: 'Modéré', zones: ['Toutes zones'] },
      maturityDays: 70,
    },
    {
      id: db.getNextVarietyId(),
      cultureId: 3,
      name: 'Tomate Cherry',
      description: 'Tomate sucrée, idéale pour les salades.',
      climateSuitability: { temperature: '20-30°C', rainfall: 'Modéré', zones: ['Toutes zones'] },
      maturityDays: 65,
    },

    // Oignon (4)
    {
      id: db.getNextVarietyId(),
      cultureId: 4,
      name: 'Oignon Violet de Galmi',
      description: 'Variété phare d’Afrique de l’Ouest, goût doux.',
      climateSuitability: { temperature: '18-30°C', rainfall: 'Faible à modéré', zones: ['Sahel', 'Savane'] },
      maturityDays: 120,
    },

    // Gombo (5)
    {
      id: db.getNextVarietyId(),
      cultureId: 5,
      name: 'Gombo Vert Classique',
      description: 'Très apprécié pour les sauces traditionnelles.',
      climateSuitability: { temperature: '25-35°C', rainfall: 'Modéré', zones: ['Savane', 'Sahel'] },
      maturityDays: 60,
    },

    // Piment (6)
    {
      id: db.getNextVarietyId(),
      cultureId: 6,
      name: 'Piment Fort Rouge',
      description: 'Variété très piquante, forte demande au marché.',
      climateSuitability: { temperature: '20-32°C', rainfall: 'Modéré', zones: ['Toutes zones'] },
      maturityDays: 90,
    },

    // Laitue (7)
    {
      id: db.getNextVarietyId(),
      cultureId: 7,
      name: 'Laitue Batavia',
      description: 'Très croquante, adaptée aux climats tropicaux.',
      climateSuitability: { temperature: '15-28°C', rainfall: 'Modéré', zones: ['Toutes zones'] },
      maturityDays: 55,
    },

    // Concombre (8)
    {
      id: db.getNextVarietyId(),
      cultureId: 8,
      name: 'Concombre Long Green',
      description: 'Variété longue, très productive.',
      climateSuitability: { temperature: '20-30°C', rainfall: 'Modéré', zones: ['Toutes zones'] },
      maturityDays: 55,
    },

    // Chou (9)
    {
      id: db.getNextVarietyId(),
      cultureId: 9,
      name: 'Chou Cœur de Bœuf',
      description: 'Variété ferme, idéale pour la cuisson.',
      climateSuitability: { temperature: '15-25°C', rainfall: 'Modéré', zones: ['Savane'] },
      maturityDays: 85,
    },

    // Betterave (10)
    {
      id: db.getNextVarietyId(),
      cultureId: 10,
      name: 'Betterave Rouge Africaine',
      description: 'Très riche en nutriments, adaptée aux sols tropicaux.',
      climateSuitability: { temperature: '15-28°C', rainfall: 'Modéré', zones: ['Toutes zones'] },
      maturityDays: 90,
    },

    // Riz (11)
    {
      id: db.getNextVarietyId(),
      cultureId: 11,
      name: 'Riz NERICA',
      description: 'Variété très productive et résistante.',
      climateSuitability: { temperature: '20-30°C', rainfall: 'Élevé', zones: ['Toutes zones'] },
      maturityDays: 110,
    },

    // Maïs (12)
    {
      id: db.getNextVarietyId(),
      cultureId: 12,
      name: 'Maïs Jaune Tropical',
      description: 'Très haut rendement, climat chaud.',
      climateSuitability: { temperature: '22-35°C', rainfall: 'Modéré', zones: ['Savane', 'Sahel'] },
      maturityDays: 95,
    },
  ];

  db.varieties = varieties;


  // ====================
// PRODUCTS
// ====================
const products: Product[] = [];
const suppliers = users.filter(u => u.role === 'SUPPLIER' && u.isSupplierVerified);

// Génération automatique de +40 produits
varieties.forEach((variety, vIndex) => {
  const supplier = suppliers[vIndex % suppliers.length];
  const basePrice = 10000 + (vIndex * 1000);

  // Entre 2 et 4 produits par variété
  const productsPerVariety = 2 + (vIndex % 3);

  for (let i = 0; i < productsPerVariety; i++) {
    const productId = db.getNextProductId();

    const packages = [
      'Sac 25kg',
      'Sac 20kg',
      'Sac 10kg',
      'Paquet 500g',
      'Paquet 1kg',
    ];

    const pkg = packages[i % packages.length];

    // Récupérer l'image correspondant à la cultureId
    const image = productImages[variety.cultureId] || '/images/products/default.jpg';

    products.push({
      id: productId,
      supplierId: supplier.id,
      varietyId: variety.id,
      title: `Semences ${variety.name} - ${pkg}`,
      sku: `SKU-${1000 + productId}`,
      priceCents: basePrice + (i * 2000),
      currency: 'XOF',
      stock: i === 0 ? 0 : 20 + (productId % 50),
      minOrderQty: 1,
      images: [image],
      specs: {
        germination: `${90 + (productId % 10)}%`,
        origin: 'Burkina Faso',
        certification: i % 2 === 0 ? 'Certifié Bio' : 'Certifié Standard',
        purity: `${95 + (productId % 5)}%`,
      },
      status: (i === 0 && vIndex % 5 === 0 ? 'DRAFT' : 'ACTIVE') as ProductStatus,
      createdAt: new Date(Date.now() - productId * 24 * 60 * 60 * 1000).toISOString(),
    });
  }
});

db.products = products;


  // ====================
  // ARTICLES
  // ====================
  const articles = [
    {
      id: db.getNextArticleId(),
      title: 'Préparation du Sol pour la Saison des Pluies',
      slug: 'preparation-sol-saison-pluies',
      bodyMd: `# Introduction\n\nLa préparation du sol est une étape cruciale...\n\n## Les étapes clés\n\n### 1. Labour\n\nLe labour permet de retourner la terre...`,
      tags: ['sol', 'préparation', 'saison-pluies'],
      authorId: 6,
      publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'PUBLISHED' as ArticleStatus,
    },
    {
      id: db.getNextArticleId(),
      title: 'Gestion Intégrée des Ravageurs du Maïs',
      slug: 'gestion-ravageurs-mais',
      bodyMd: `# Stratégies de lutte contre les ravageurs\n\nLe maïs est sujet à plusieurs types de ravageurs...`,
      tags: ['maïs', 'ravageurs', 'protection'],
      authorId: 6,
      publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'PUBLISHED' as ArticleStatus,
    },
    {
      id: db.getNextArticleId(),
      title: 'Optimisation de l\'Irrigation pour le Riz',
      slug: 'optimisation-irrigation-riz',
      bodyMd: `# Techniques d'irrigation efficaces\n\nLe riz nécessite une gestion précise de l'eau...`,
      tags: ['riz', 'irrigation', 'eau'],
      authorId: 6,
      publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'PUBLISHED' as ArticleStatus,
    },
    {
      id: db.getNextArticleId(),
      title: 'Culture de Tomates en Saison Sèche',
      slug: 'culture-tomates-saison-seche',
      bodyMd: `# Guide pour la culture de tomates\n\nCultiver des tomates en saison sèche nécessite...`,
      tags: ['tomate', 'saison-sèche', 'maraîchage'],
      authorId: 6,
      publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'PUBLISHED' as ArticleStatus,
    },
    {
      id: db.getNextArticleId(),
      title: 'Rotation des Cultures : Guide Pratique',
      slug: 'rotation-cultures-guide',
      bodyMd: `# Importance de la rotation des cultures\n\nLa rotation permet de maintenir la fertilité du sol...`,
      tags: ['rotation', 'fertilité', 'planification'],
      authorId: 6,
      publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'PUBLISHED' as ArticleStatus,
    },
  ];

  db.articles = articles;

  // ====================
// SAMPLE ORDERS
// ====================
const sampleOrders = [
  {
    id: db.getNextOrderId(),
    buyerId: 1,
    supplierId: 3,
    orderNumber: `ORD-${Date.now().toString().slice(-6)}`,
    totalCents: 45000,
    currency: 'XOF',
    paymentMethod: 'MOBILE_MONEY' as const,
    status: 'PENDING' as OrderStatus,
    shippingAddressId: 1,
    notes: 'Livraison rapide si possible',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: db.getNextOrderId(),
    buyerId: 2,
    supplierId: 3,
    orderNumber: `ORD-${(Date.now() + 1).toString().slice(-6)}`,
    totalCents: 36000,
    currency: 'XOF',
    paymentMethod: 'CASH' as const,
    status: 'CONFIRMED' as OrderStatus,
    shippingAddressId: 2,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: db.getNextOrderId(),
    buyerId: 1,
    supplierId: 4,
    orderNumber: `ORD-${(Date.now() + 2).toString().slice(-6)}`,
    totalCents: 18000,
    currency: 'XOF',
    paymentMethod: 'BANK_TRANSFER' as const,
    status: 'SHIPPED' as OrderStatus,
    shippingAddressId: 1,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: db.getNextOrderId(),
    buyerId: 2,
    supplierId: 4,
    orderNumber: `ORD-${(Date.now() + 3).toString().slice(-6)}`,
    totalCents: 25000,
    currency: 'XOF',
    paymentMethod: 'MOBILE_MONEY' as const,
    status: 'DELIVERED' as OrderStatus,
    shippingAddressId: 2,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

db.orders = sampleOrders;

// ====================
// ORDER ITEMS FOR SAMPLE ORDERS
// ====================
db.orderItems = [
  // Items for order 1
  {
    id: db.getNextOrderItemId(),
    orderId: sampleOrders[0].id,
    productId: products[0].id,
    title: products[0].title,
    priceCents: products[0].priceCents,
    qty: 3,
  },

  // Items for order 2
  {
    id: db.getNextOrderItemId(),
    orderId: sampleOrders[1].id,
    productId: products[2].id,
    title: products[2].title,
    priceCents: products[2].priceCents,
    qty: 2,
  },

  // Items for order 3
  {
    id: db.getNextOrderItemId(),
    orderId: sampleOrders[2].id,
    productId: products[4].id,
    title: products[4].title,
    priceCents: products[4].priceCents,
    qty: 1,
  },

  // Items for order 4
  {
    id: db.getNextOrderItemId(),
    orderId: sampleOrders[3].id,
    productId: products[6].id,
    title: products[6].title,
    priceCents: products[6].priceCents,
    qty: 2,
  },
];


  // ====================
  // SAMPLE THREADS & MESSAGES
  // ====================
  const sampleThreads = [
    {
      id: db.getNextThreadId(),
      topicType: 'PRODUCT' as const,
      topicId: 1,
      buyerId: 1,
      supplierId: 3,
      lastMessageAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: db.getNextThreadId(),
      topicType: 'ORDER' as const,
      topicId: 1,
      buyerId: 1,
      supplierId: 3,
      lastMessageAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    },
  ];

  db.threads = sampleThreads;

  db.messages = [
    {
      id: db.getNextMessageId(),
      threadId: 1,
      senderId: 3,
      body: 'Bonjour, merci pour votre intérêt dans nos semences.',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: db.getNextMessageId(),
      threadId: 1,
      senderId: 1,
      body: 'Avez-vous du stock disponible pour une livraison cette semaine ?',
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: db.getNextMessageId(),
      threadId: 1,
      senderId: 3,
      body: 'Oui, nous avons du stock. La livraison peut être faite sous 3 jours.',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: db.getNextMessageId(),
      threadId: 2,
      senderId: 1,
      body: 'Bonjour, j\'ai une question sur ma commande #ORD-001234',
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    },
  ];

  console.log('✅ Database seeded successfully!');
  console.log(`   - ${db.users.length} users`);
  console.log(`   - ${db.cultures.length} cultures`);
  console.log(`   - ${db.varieties.length} varieties`);
  console.log(`   - ${db.products.length} products`);
  console.log(`   - ${db.articles.length} articles`);
  console.log(`   - ${db.orders.length} orders`);
  console.log(`   - ${db.threads.length} threads`);
  console.log(`   - ${db.messages.length} messages`);
}
