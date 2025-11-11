import { http, HttpResponse, delay } from 'msw';
import { db } from './db';
import type {
  InsertUser,
  LoginCredentials,
  InsertProduct,
  InsertOrder,
  InsertThread,
  InsertMessage,
  InsertArticle,
  PaginatedResponse,
} from '@/shared/schema';

const API_DELAY = 300; // latence simulée

// -----------------------------
// Utils
// -----------------------------
function paginate<T>(items: T[], page: number = 1, pageSize: number = 20): PaginatedResponse<T> {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return { count: items.length, page, page_size: pageSize, results: items.slice(start, end) };
}

function makeAccess(userId: number) {
  return `mock-user-${userId}`;
}

function parseUserIdFromAuth(req: Request): number | null {
  const auth = req.headers.get('authorization') || '';
  const m = auth.match(/Bearer\s+mock-user-(\d+)/i);
  return m ? Number(m[1]) : null;
}

function nowIso() {
  return new Date().toISOString();
}

// -----------------------------
// Handlers
// -----------------------------
export const handlers = [
  // ============================================
  // AUTH & USERS
  // ============================================

  // Login (email obligatoire; mot de passe non vérifié en mock)
  http.post('/api/v1/auth/jwt/create', async ({ request }) => {
    await delay(API_DELAY);
    const body = (await request.json()) as LoginCredentials;
    const user = db.findUserByEmail(body.email);
    if (!user) return HttpResponse.json({ error: 'Invalid credentials' }, { status: 401 });

    return HttpResponse.json({
      access: makeAccess(user.id),
      refresh: 'mock-refresh-token',
      user,
    });
  }),

  // Refresh: si on reçoit un Authorization valide, on renvoie un nouveau access pour le même user
  http.post('/api/v1/auth/jwt/refresh', async ({ request }) => {
    await delay(API_DELAY);
    const uid = parseUserIdFromAuth(request);
    if (!uid) return HttpResponse.json({ error: 'Invalid refresh' }, { status: 401 });
    return HttpResponse.json({ access: makeAccess(uid) });
  }),

  // Register
  http.post('/api/v1/auth/users', async ({ request }) => {
    await delay(API_DELAY);
    const body = (await request.json()) as InsertUser;

    const existingUser = db.findUserByEmail(body.email);
    if (existingUser) return HttpResponse.json({ error: 'Email already exists' }, { status: 400 });

    const newUser = {
      id: db.getNextUserId(),
      ...body,
      isVerified: true,
      isSupplierVerified: body.role === 'SUPPLIER' ? false : undefined,
    };
    db.users.push(newUser);

    return HttpResponse.json(
      {
        access: makeAccess(newUser.id),
        refresh: 'mock-refresh-token',
        user: newUser,
      },
      { status: 201 },
    );
  }),

  // /me
  http.get('/api/v1/auth/users/me', async ({ request }) => {
    await delay(API_DELAY);
    const userId = parseUserIdFromAuth(request);
    if (!userId) return HttpResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const user = db.users.find((u) => u.id === userId);
    if (!user) return HttpResponse.json({ error: 'Not authenticated' }, { status: 401 });
    return HttpResponse.json(user);
  }),

  // ============================================
  // CULTURES & VARIETIES
  // ============================================
  http.get('/api/v1/cultures', async () => {
    await delay(API_DELAY);
    return HttpResponse.json(db.cultures);
  }),

  http.get('/api/v1/cultures/:id/varieties', async ({ params }) => {
    await delay(API_DELAY);
    const cultureId = parseInt(params.id as string, 10);
    const varieties = db.varieties.filter((v) => v.cultureId === cultureId);
    return HttpResponse.json(varieties);
  }),

  http.get('/api/v1/varieties', async () => {
    await delay(API_DELAY);
    return HttpResponse.json(db.varieties);
  }),

  // ============================================
  // PRODUCTS
  // ============================================
  http.get('/api/v1/products', async ({ request }) => {
    await delay(API_DELAY);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(url.searchParams.get('page_size') || '20', 10);
    const cultureId = url.searchParams.get('cultureId');
    const varietyId = url.searchParams.get('varietyId');
    const q = url.searchParams.get('q');
    const minPrice = url.searchParams.get('minPrice');
    const maxPrice = url.searchParams.get('maxPrice');
    const ordering = url.searchParams.get('ordering');

    let filtered = db.products.filter((p) => p.status === 'ACTIVE');

    if (varietyId) filtered = filtered.filter((p) => p.varietyId === parseInt(varietyId, 10));

    if (cultureId) {
      const ids = db.varieties.filter((v) => v.cultureId === parseInt(cultureId, 10)).map((v) => v.id);
      filtered = filtered.filter((p) => ids.includes(p.varietyId));
    }

    if (q) {
      const ql = q.toLowerCase();
      filtered = filtered.filter((p) => p.title.toLowerCase().includes(ql) || p.sku.toLowerCase().includes(ql));
    }

    if (minPrice) filtered = filtered.filter((p) => p.priceCents >= parseInt(minPrice, 10));
    if (maxPrice) filtered = filtered.filter((p) => p.priceCents <= parseInt(maxPrice, 10));

    if (ordering) {
      if (ordering === 'price' || ordering === 'price-asc') filtered.sort((a, b) => a.priceCents - b.priceCents);
      else if (ordering === 'price-desc') filtered.sort((a, b) => b.priceCents - a.priceCents);
      else if (ordering === 'name') filtered.sort((a, b) => a.title.localeCompare(b.title));
      else if (ordering === 'newest')
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return HttpResponse.json(paginate(filtered, page, pageSize));
  }),

  http.get('/api/v1/products/:id', async ({ params }) => {
    await delay(API_DELAY);
    const productId = parseInt(params.id as string, 10);
    const product = db.findProductById(productId);
    if (!product) return HttpResponse.json({ error: 'Product not found' }, { status: 404 });
    return HttpResponse.json(product);
  }),

  // Create product (supplier = user courant)
  http.post('/api/v1/products', async ({ request }) => {
    await delay(API_DELAY);
    const body = (await request.json()) as InsertProduct;

    const userId = parseUserIdFromAuth(request);
    if (!userId) return HttpResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const newProduct = {
      id: db.getNextProductId(),
      supplierId: userId,
      ...body,
      createdAt: nowIso(),
    };
    db.products.push(newProduct);
    return HttpResponse.json(newProduct, { status: 201 });
  }),

  // Update product
  http.patch('/api/v1/products/:id', async ({ params, request }) => {
    await delay(API_DELAY);
    const productId = parseInt(params.id as string, 10);
    const body = (await request.json()) as Partial<InsertProduct>;
    const userId = parseUserIdFromAuth(request);
    if (!userId) return HttpResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const product = db.findProductById(productId);
    if (!product) return HttpResponse.json({ error: 'Product not found' }, { status: 404 });
    // (Optionnel) vérifier product.supplierId === userId

    Object.assign(product, body);
    return HttpResponse.json(product);
  }),

  // Update product status
  http.patch('/api/v1/products/:id/status', async ({ params, request }) => {
    await delay(API_DELAY);
    const productId = parseInt(params.id as string, 10);
    const body = (await request.json()) as { status: string };
    const userId = parseUserIdFromAuth(request);
    if (!userId) return HttpResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const product = db.findProductById(productId);
    if (!product) return HttpResponse.json({ error: 'Product not found' }, { status: 404 });
    // (Optionnel) vérifier product.supplierId === userId

    product.status = body.status as any;
    return HttpResponse.json(product);
  }),

  // ============================================
  // CART (par utilisateur)
  // ============================================
  http.get('/api/v1/cart', async ({ request }) => {
    await delay(API_DELAY);
    const userId = parseUserIdFromAuth(request);
    if (!userId) return HttpResponse.json({ error: 'Not authenticated' }, { status: 401 });

    let cart = db.findCartByUserId(userId);
    if (!cart) {
      cart = { id: db.getNextCartId(), userId, status: 'ACTIVE' as const };
      db.carts.push(cart);
    }
    const items = db.getCartItemsWithProducts(cart.id);
    return HttpResponse.json({ cart, items });
  }),

  http.post('/api/v1/cart/items', async ({ request }) => {
    await delay(API_DELAY);
    const body = (await request.json()) as { productId: number; qty: number };
    const userId = parseUserIdFromAuth(request);
    if (!userId) return HttpResponse.json({ error: 'Not authenticated' }, { status: 401 });

    let cart = db.findCartByUserId(userId);
    if (!cart) {
      cart = { id: db.getNextCartId(), userId, status: 'ACTIVE' as const };
      db.carts.push(cart);
    }

    const existing = db.cartItems.find((i) => i.cartId === cart!.id && i.productId === body.productId);
    if (existing) {
      existing.qty += body.qty;
      const product = db.findProductById(existing.productId);
      return HttpResponse.json({ ...existing, product });
    }

    const newItem = { id: db.getNextCartItemId(), cartId: cart.id, productId: body.productId, qty: body.qty };
    db.cartItems.push(newItem);
    const product = db.findProductById(newItem.productId);
    return HttpResponse.json({ ...newItem, product }, { status: 201 });
  }),

  http.put('/api/v1/cart/items/:id', async ({ params, request }) => {
    await delay(API_DELAY);
    const itemId = parseInt(params.id as string, 10);
    const body = (await request.json()) as { qty: number };
    const userId = parseUserIdFromAuth(request);
    if (!userId) return HttpResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const item = db.cartItems.find((i) => i.id === itemId);
    if (!item) return HttpResponse.json({ error: 'Cart item not found' }, { status: 404 });

    // (Optionnel) vérifier que l'item appartient au cart du user
    const cart = db.carts.find((c) => c.id === item.cartId);
    if (!cart || cart.userId !== userId) return HttpResponse.json({ error: 'Forbidden' }, { status: 403 });

    item.qty = body.qty;
    const product = db.findProductById(item.productId);
    return HttpResponse.json({ ...item, product });
  }),

  http.delete('/api/v1/cart/items/:id', async ({ params, request }) => {
    await delay(API_DELAY);
    const itemId = parseInt(params.id as string, 10);
    const userId = parseUserIdFromAuth(request);
    if (!userId) return HttpResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const idx = db.cartItems.findIndex((i) => i.id === itemId);
    if (idx === -1) return HttpResponse.json({ error: 'Cart item not found' }, { status: 404 });

    // (Optionnel) vérifier ownership
    const item = db.cartItems[idx];
    const cart = db.carts.find((c) => c.id === item.cartId);
    if (!cart || cart.userId !== userId) return HttpResponse.json({ error: 'Forbidden' }, { status: 403 });

    db.cartItems.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  // ============================================
  // ORDERS
  // ============================================
  http.post('/api/v1/orders', async ({ request }) => {
    await delay(API_DELAY);
    const body = (await request.json()) as InsertOrder;
    const userId = parseUserIdFromAuth(request);
    if (!userId) return HttpResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const cart = db.findCartByUserId(userId);
    if (!cart) return HttpResponse.json({ error: 'Cart is empty' }, { status: 400 });

    const cartItems = db.cartItems.filter((i) => i.cartId === cart.id);
    if (cartItems.length === 0) return HttpResponse.json({ error: 'Cart is empty' }, { status: 400 });

    // total + supplier (premier fournisseur trouvé dans le panier)
    let supplierId: number | null = null;
    const total = cartItems.reduce((sum, i) => {
      const p = db.findProductById(i.productId);
      if (p && supplierId == null) supplierId = p.supplierId;
      return sum + ((p?.priceCents || 0) * i.qty);
    }, 0);

    const newOrder = {
      id: db.getNextOrderId(),
      buyerId: userId,
      supplierId: supplierId ?? 1,
      orderNumber: `AG-${Date.now().toString().slice(-6)}`,
      totalCents: total,
      currency: 'XOF',
      ...body,
      status: 'PENDING' as const,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    db.orders.push(newOrder);

    // items
    for (const cartItem of cartItems) {
      const product = db.findProductById(cartItem.productId);
      if (!product) continue;
      db.orderItems.push({
        id: db.getNextOrderItemId(),
        orderId: newOrder.id,
        productId: product.id,
        title: product.title,
        priceCents: product.priceCents,
        qty: cartItem.qty,
      });
    }

    // vider le panier
    db.cartItems = db.cartItems.filter((i) => i.cartId !== cart.id);
    cart.status = 'ORDERED';

    return HttpResponse.json(newOrder, { status: 201 });
  }),

  // Liste commandes (filtrage as=buyer|supplier & status)
  http.get('/api/v1/orders', async ({ request }) => {
    await delay(API_DELAY);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(url.searchParams.get('page_size') || '20', 10);
    const as = url.searchParams.get('as');
    const status = url.searchParams.get('status') || undefined;

    const userId = parseUserIdFromAuth(request);
    if (!userId) return HttpResponse.json({ error: 'Not authenticated' }, { status: 401 });

    let list = db.orders.slice();
    if (as === 'buyer') list = list.filter((o) => o.buyerId === userId);
    else if (as === 'supplier') list = list.filter((o) => o.supplierId === userId);
    else list = list.filter((o) => o.buyerId === userId || o.supplierId === userId);

    if (status) list = list.filter((o) => o.status === status);

    return HttpResponse.json(paginate(list, page, pageSize));
  }),

  http.get('/api/v1/orders/:id', async ({ params, request }) => {
    await delay(API_DELAY);
    const orderId = parseInt(params.id as string, 10);
    const userId = parseUserIdFromAuth(request);
    if (!userId) return HttpResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const order = db.orders.find((o) => o.id === orderId);
    if (!order) return HttpResponse.json({ error: 'Order not found' }, { status: 404 });

    // Ownership basique
    if (order.buyerId !== userId && order.supplierId !== userId)
      return HttpResponse.json({ error: 'Forbidden' }, { status: 403 });

    const items = db.getOrderItems(orderId);
    return HttpResponse.json({ ...order, items });
  }),

  http.patch('/api/v1/orders/:id/status', async ({ params, request }) => {
    await delay(API_DELAY);
    const orderId = parseInt(params.id as string, 10);
    const body = (await request.json()) as { status: string };
    const userId = parseUserIdFromAuth(request);
    if (!userId) return HttpResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const order = db.orders.find((o) => o.id === orderId);
    if (!order) return HttpResponse.json({ error: 'Order not found' }, { status: 404 });

    // Autoriser seulement le supplier (mock simple)
    if (order.supplierId !== userId) return HttpResponse.json({ error: 'Forbidden' }, { status: 403 });

    order.status = body.status as any;
    order.updatedAt = nowIso();
    return HttpResponse.json(order);
  }),

  // ============================================
  // MESSAGING
  // ============================================
  // Create thread (buyer = user courant; supplier: déduit du produit si topic=PRODUCT)
  http.post('/api/v1/threads', async ({ request }) => {
    await delay(API_DELAY);
    const body = (await request.json()) as InsertThread;
    const userId = parseUserIdFromAuth(request);
    if (!userId) return HttpResponse.json({ error: 'Not authenticated' }, { status: 401 });

    let supplierId = (body as any).supplierId as number | undefined;
    if (!supplierId && body.topicType === 'PRODUCT') {
      const p = db.findProductById((body as any).topicId);
      supplierId = p?.supplierId;
    }

    const newThread = {
      id: db.getNextThreadId(),
      ...body,
      buyerId: userId,
      supplierId: supplierId ?? 1,
      lastMessageAt: nowIso(),
    };
    db.threads.push(newThread);
    return HttpResponse.json(newThread, { status: 201 });
  }),

  // Get threads (filtrage par appartenance + ?as=buyer|supplier)
  http.get('/api/v1/threads', async ({ request }) => {
    await delay(API_DELAY);
    const url = new URL(request.url);
    const as = url.searchParams.get('as') || undefined;

    const userId = parseUserIdFromAuth(request);
    if (!userId) return HttpResponse.json({ error: 'Not authenticated' }, { status: 401 });

    let threads = db.threads.filter((t) => t.buyerId === userId || t.supplierId === userId);
    if (as === 'buyer') threads = threads.filter((t) => t.buyerId === userId);
    if (as === 'supplier') threads = threads.filter((t) => t.supplierId === userId);

    // tri récent
    threads.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
    return HttpResponse.json(threads);
  }),

  // Get thread messages (vérifie que l'user est participant)
  http.get('/api/v1/threads/:id/messages', async ({ params, request }) => {
    await delay(API_DELAY);
    const threadId = parseInt(params.id as string, 10);
    const userId = parseUserIdFromAuth(request);
    if (!userId) return HttpResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const thread = db.findThreadById(threadId);
    if (!thread) return HttpResponse.json({ error: 'Thread not found' }, { status: 404 });
    if (thread.buyerId !== userId && thread.supplierId !== userId)
      return HttpResponse.json({ error: 'Forbidden' }, { status: 403 });

    const messages = db.getThreadMessages(threadId);
    return HttpResponse.json(messages);
  }),

  // Send message
  http.post('/api/v1/threads/:id/messages', async ({ params, request }) => {
    await delay(API_DELAY);
    const threadId = parseInt(params.id as string, 10);
    const body = (await request.json()) as InsertMessage;
    const userId = parseUserIdFromAuth(request);
    if (!userId) return HttpResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const thread = db.findThreadById(threadId);
    if (!thread) return HttpResponse.json({ error: 'Thread not found' }, { status: 404 });
    if (thread.buyerId !== userId && thread.supplierId !== userId)
      return HttpResponse.json({ error: 'Forbidden' }, { status: 403 });

    const newMessage = {
      id: db.getNextMessageId(),
      threadId,
      senderId: userId,
      ...body,
      createdAt: nowIso(),
    };
    db.messages.push(newMessage);
    thread.lastMessageAt = newMessage.createdAt;

    return HttpResponse.json(newMessage, { status: 201 });
  }),

  // ============================================
  // WEATHER & ALERTS
  // ============================================
  http.get('/api/v1/advice/weather', async () => {
    await delay(API_DELAY);
    const forecast = Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() + i * 86400000).toISOString(),
      tempMin: 22 + Math.floor(Math.random() * 3),
      tempMax: 32 + Math.floor(Math.random() * 5),
      condition: i % 3 === 0 ? 'Ensoleillé' : i % 3 === 1 ? 'Nuageux' : 'Pluie',
      rainfallMm: i % 3 === 2 ? 5 + Math.random() * 15 : 0,
      humidity: 60 + Math.floor(Math.random() * 20),
    }));
    const cumulativeRainfall = forecast.reduce((sum, d) => sum + d.rainfallMm, 0);
    return HttpResponse.json({ forecast, cumulativeRainfall, advice: 'Conditions favorables pour les semis cette semaine.' });
  }),

  http.post('/api/v1/alerts', async ({ request }) => {
    await delay(API_DELAY);
    const body = (await request.json()) as any;
    const userId = parseUserIdFromAuth(request);
    if (!userId) return HttpResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const newAlert = { id: db.getNextAlertId(), userId, ...body };
    db.weatherAlerts.push(newAlert);
    return HttpResponse.json(newAlert, { status: 201 });
  }),

  http.get('/api/v1/alerts', async ({ request }) => {
    await delay(API_DELAY);
    const userId = parseUserIdFromAuth(request);
    if (!userId) return HttpResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const alerts = db.weatherAlerts.filter((a) => a.userId === userId);
    return HttpResponse.json(alerts);
  }),

  http.patch('/api/v1/alerts/:id', async ({ params, request }) => {
    await delay(API_DELAY);
    const alertId = parseInt(params.id as string, 10);
    const body = (await request.json()) as any;
    const userId = parseUserIdFromAuth(request);
    if (!userId) return HttpResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const alert = db.weatherAlerts.find((a) => a.id === alertId);
    if (!alert) return HttpResponse.json({ error: 'Alert not found' }, { status: 404 });
    if (alert.userId !== userId) return HttpResponse.json({ error: 'Forbidden' }, { status: 403 });

    Object.assign(alert, body);
    return HttpResponse.json(alert);
  }),

  // ============================================
  // ARTICLES
  // ============================================
  http.get('/api/v1/articles', async ({ request }) => {
    await delay(API_DELAY);
    const url = new URL(request.url);
    const tag = url.searchParams.get('tag');
    const q = url.searchParams.get('q');
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(url.searchParams.get('page_size') || '20', 10);

    let filtered = db.articles.filter((a) => a.status === 'PUBLISHED');
    if (tag) filtered = filtered.filter((a) => a.tags.includes(tag));
    if (q) {
      const ql = q.toLowerCase();
      filtered = filtered.filter((a) => a.title.toLowerCase().includes(ql) || a.bodyMd.toLowerCase().includes(ql));
    }

    return HttpResponse.json(paginate(filtered, page, pageSize));
  }),

  http.get('/api/v1/articles/:slug', async ({ params }) => {
    await delay(API_DELAY);
    const article = db.findArticleBySlug(params.slug as string);
    if (!article) return HttpResponse.json({ error: 'Article not found' }, { status: 404 });
    return HttpResponse.json(article);
  }),

  // Create article (author = user courant; sinon admin mock #6)
  http.post('/api/v1/articles', async ({ request }) => {
    await delay(API_DELAY);
    const body = (await request.json()) as InsertArticle;
    const uid = parseUserIdFromAuth(request);
    const authorId = uid ?? 6;

    const newArticle = {
      id: db.getNextArticleId(),
      ...body,
      authorId,
      publishedAt: body.status === 'PUBLISHED' ? nowIso() : undefined,
    };
    db.articles.push(newArticle);
    return HttpResponse.json(newArticle, { status: 201 });
  }),

  // ============================================
  // ADMIN
  // ============================================
  http.get('/api/v1/admin/suppliers/pending', async () => {
    await delay(API_DELAY);
    const pending = db.users.filter((u) => u.role === 'SUPPLIER' && !u.isSupplierVerified);
    return HttpResponse.json(pending);
  }),

  http.patch('/api/v1/admin/suppliers/:id/verify', async ({ params }) => {
    await delay(API_DELAY);
    const supplierId = parseInt(params.id as string, 10);
    const supplier = db.users.find((u) => u.id === supplierId);
    if (!supplier) return HttpResponse.json({ error: 'Supplier not found' }, { status: 404 });
    supplier.isSupplierVerified = true;
    return HttpResponse.json(supplier);
  }),

  http.patch('/api/v1/admin/products/:id/block', async ({ params }) => {
    await delay(API_DELAY);
    const productId = parseInt(params.id as string, 10);
    const product = db.findProductById(productId);
    if (!product) return HttpResponse.json({ error: 'Product not found' }, { status: 404 });
    product.status = 'BLOCKED';
    return HttpResponse.json(product);
  }),

  http.get('/api/v1/admin/stats', async () => {
    await delay(API_DELAY);
    const totalSuppliers = db.users.filter((u) => u.role === 'SUPPLIER').length;
    const pendingSuppliers = db.users.filter((u) => u.role === 'SUPPLIER' && !u.isSupplierVerified).length;
    const totalProducts = db.products.length;
    const activeProducts = db.products.filter((p) => p.status === 'ACTIVE').length;
    const totalOrders = db.orders.length;
    const totalRevenueCents = db.orders.reduce((sum, o) => sum + o.totalCents, 0);

    return HttpResponse.json({
      totalSuppliers,
      pendingSuppliers,
      totalProducts,
      activeProducts,
      totalOrders,
      totalRevenueCents,
    });
  }),
];
