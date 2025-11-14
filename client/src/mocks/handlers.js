"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlers = void 0;
const msw_1 = require("msw");
const db_1 = require("./db");
const API_DELAY = 300; // latence simulée
// -----------------------------
// Utils
// -----------------------------
function paginate(items, page = 1, pageSize = 20) {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return { count: items.length, page, page_size: pageSize, results: items.slice(start, end) };
}
function makeAccess(userId) {
    return `mock-user-${userId}`;
}
function parseUserIdFromAuth(req) {
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
exports.handlers = [
    // ============================================
    // AUTH & USERS
    // ============================================
    // Login (email obligatoire; mot de passe non vérifié en mock)
    msw_1.http.post('/api/v1/auth/jwt/create', async ({ request }) => {
        await (0, msw_1.delay)(API_DELAY);
        const body = (await request.json());
        const user = db_1.db.findUserByEmail(body.email);
        if (!user)
            return msw_1.HttpResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        return msw_1.HttpResponse.json({
            access: makeAccess(user.id),
            refresh: 'mock-refresh-token',
            user,
        });
    }),
    // Refresh: si on reçoit un Authorization valide, on renvoie un nouveau access pour le même user
    msw_1.http.post('/api/v1/auth/jwt/refresh', async ({ request }) => {
        await (0, msw_1.delay)(API_DELAY);
        const uid = parseUserIdFromAuth(request);
        if (!uid)
            return msw_1.HttpResponse.json({ error: 'Invalid refresh' }, { status: 401 });
        return msw_1.HttpResponse.json({ access: makeAccess(uid) });
    }),
    // Register
    msw_1.http.post('/api/v1/auth/users', async ({ request }) => {
        await (0, msw_1.delay)(API_DELAY);
        const body = (await request.json());
        const existingUser = db_1.db.findUserByEmail(body.email);
        if (existingUser)
            return msw_1.HttpResponse.json({ error: 'Email already exists' }, { status: 400 });
        const newUser = {
            id: db_1.db.getNextUserId(),
            ...body,
            isVerified: true,
            isSupplierVerified: body.role === 'SUPPLIER' ? false : undefined,
        };
        db_1.db.users.push(newUser);
        return msw_1.HttpResponse.json({
            access: makeAccess(newUser.id),
            refresh: 'mock-refresh-token',
            user: newUser,
        }, { status: 201 });
    }),
    // /me
    msw_1.http.get('/api/v1/auth/users/me', async ({ request }) => {
        await (0, msw_1.delay)(API_DELAY);
        const userId = parseUserIdFromAuth(request);
        if (!userId)
            return msw_1.HttpResponse.json({ error: 'Not authenticated' }, { status: 401 });
        const user = db_1.db.users.find((u) => u.id === userId);
        if (!user)
            return msw_1.HttpResponse.json({ error: 'Not authenticated' }, { status: 401 });
        return msw_1.HttpResponse.json(user);
    }),
    // ============================================
    // CULTURES & VARIETIES
    // ============================================
    msw_1.http.get('/api/v1/cultures', async () => {
        await (0, msw_1.delay)(API_DELAY);
        return msw_1.HttpResponse.json(db_1.db.cultures);
    }),
    msw_1.http.get('/api/v1/cultures/:id/varieties', async ({ params }) => {
        await (0, msw_1.delay)(API_DELAY);
        const cultureId = parseInt(params.id, 10);
        const varieties = db_1.db.varieties.filter((v) => v.cultureId === cultureId);
        return msw_1.HttpResponse.json(varieties);
    }),
    msw_1.http.get('/api/v1/varieties', async () => {
        await (0, msw_1.delay)(API_DELAY);
        return msw_1.HttpResponse.json(db_1.db.varieties);
    }),
    // ============================================
    // PRODUCTS
    // ============================================
    msw_1.http.get('/api/v1/products', async ({ request }) => {
        await (0, msw_1.delay)(API_DELAY);
        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get('page') || '1', 10);
        const pageSize = parseInt(url.searchParams.get('page_size') || '20', 10);
        const cultureId = url.searchParams.get('cultureId');
        const varietyId = url.searchParams.get('varietyId');
        const q = url.searchParams.get('q');
        const minPrice = url.searchParams.get('minPrice');
        const maxPrice = url.searchParams.get('maxPrice');
        const ordering = url.searchParams.get('ordering');
        let filtered = db_1.db.products.filter((p) => p.status === 'ACTIVE');
        if (varietyId)
            filtered = filtered.filter((p) => p.varietyId === parseInt(varietyId, 10));
        if (cultureId) {
            const ids = db_1.db.varieties.filter((v) => v.cultureId === parseInt(cultureId, 10)).map((v) => v.id);
            filtered = filtered.filter((p) => ids.includes(p.varietyId));
        }
        if (q) {
            const ql = q.toLowerCase();
            filtered = filtered.filter((p) => p.title.toLowerCase().includes(ql) || p.sku.toLowerCase().includes(ql));
        }
        if (minPrice)
            filtered = filtered.filter((p) => p.priceCents >= parseInt(minPrice, 10));
        if (maxPrice)
            filtered = filtered.filter((p) => p.priceCents <= parseInt(maxPrice, 10));
        if (ordering) {
            if (ordering === 'price' || ordering === 'price-asc')
                filtered.sort((a, b) => a.priceCents - b.priceCents);
            else if (ordering === 'price-desc')
                filtered.sort((a, b) => b.priceCents - a.priceCents);
            else if (ordering === 'name')
                filtered.sort((a, b) => a.title.localeCompare(b.title));
            else if (ordering === 'newest')
                filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
        return msw_1.HttpResponse.json(paginate(filtered, page, pageSize));
    }),
    msw_1.http.get('/api/v1/products/:id', async ({ params }) => {
        await (0, msw_1.delay)(API_DELAY);
        const productId = parseInt(params.id, 10);
        const product = db_1.db.findProductById(productId);
        if (!product)
            return msw_1.HttpResponse.json({ error: 'Product not found' }, { status: 404 });
        return msw_1.HttpResponse.json(product);
    }),
    // Create product (supplier = user courant)
    msw_1.http.post('/api/v1/products', async ({ request }) => {
        await (0, msw_1.delay)(API_DELAY);
        const body = (await request.json());
        const userId = parseUserIdFromAuth(request);
        if (!userId)
            return msw_1.HttpResponse.json({ error: 'Not authenticated' }, { status: 401 });
        const newProduct = {
            id: db_1.db.getNextProductId(),
            supplierId: userId,
            ...body,
            createdAt: nowIso(),
        };
        db_1.db.products.push(newProduct);
        return msw_1.HttpResponse.json(newProduct, { status: 201 });
    }),
    // Update product
    msw_1.http.patch('/api/v1/products/:id', async ({ params, request }) => {
        await (0, msw_1.delay)(API_DELAY);
        const productId = parseInt(params.id, 10);
        const body = (await request.json());
        const userId = parseUserIdFromAuth(request);
        if (!userId)
            return msw_1.HttpResponse.json({ error: 'Not authenticated' }, { status: 401 });
        const product = db_1.db.findProductById(productId);
        if (!product)
            return msw_1.HttpResponse.json({ error: 'Product not found' }, { status: 404 });
        // (Optionnel) vérifier product.supplierId === userId
        Object.assign(product, body);
        return msw_1.HttpResponse.json(product);
    }),
    // Update product status
    msw_1.http.patch('/api/v1/products/:id/status', async ({ params, request }) => {
        await (0, msw_1.delay)(API_DELAY);
        const productId = parseInt(params.id, 10);
        const body = (await request.json());
        const userId = parseUserIdFromAuth(request);
        if (!userId)
            return msw_1.HttpResponse.json({ error: 'Not authenticated' }, { status: 401 });
        const product = db_1.db.findProductById(productId);
        if (!product)
            return msw_1.HttpResponse.json({ error: 'Product not found' }, { status: 404 });
        // (Optionnel) vérifier product.supplierId === userId
        product.status = body.status;
        return msw_1.HttpResponse.json(product);
    }),
    // ============================================
    // CART (par utilisateur)
    // ============================================
    msw_1.http.get('/api/v1/cart', async ({ request }) => {
        await (0, msw_1.delay)(API_DELAY);
        const userId = parseUserIdFromAuth(request);
        if (!userId)
            return msw_1.HttpResponse.json({ error: 'Not authenticated' }, { status: 401 });
        let cart = db_1.db.findCartByUserId(userId);
        if (!cart) {
            cart = { id: db_1.db.getNextCartId(), userId, status: 'ACTIVE' };
            db_1.db.carts.push(cart);
        }
        const items = db_1.db.getCartItemsWithProducts(cart.id);
        return msw_1.HttpResponse.json({ cart, items });
    }),
    msw_1.http.post('/api/v1/cart/items', async ({ request }) => {
        await (0, msw_1.delay)(API_DELAY);
        const body = (await request.json());
        const userId = parseUserIdFromAuth(request);
        if (!userId)
            return msw_1.HttpResponse.json({ error: 'Not authenticated' }, { status: 401 });
        let cart = db_1.db.findCartByUserId(userId);
        if (!cart) {
            cart = { id: db_1.db.getNextCartId(), userId, status: 'ACTIVE' };
            db_1.db.carts.push(cart);
        }
        const existing = db_1.db.cartItems.find((i) => i.cartId === cart.id && i.productId === body.productId);
        if (existing) {
            existing.qty += body.qty;
            const product = db_1.db.findProductById(existing.productId);
            return msw_1.HttpResponse.json({ ...existing, product });
        }
        const newItem = { id: db_1.db.getNextCartItemId(), cartId: cart.id, productId: body.productId, qty: body.qty };
        db_1.db.cartItems.push(newItem);
        const product = db_1.db.findProductById(newItem.productId);
        return msw_1.HttpResponse.json({ ...newItem, product }, { status: 201 });
    }),
    msw_1.http.put('/api/v1/cart/items/:id', async ({ params, request }) => {
        await (0, msw_1.delay)(API_DELAY);
        const itemId = parseInt(params.id, 10);
        const body = (await request.json());
        const userId = parseUserIdFromAuth(request);
        if (!userId)
            return msw_1.HttpResponse.json({ error: 'Not authenticated' }, { status: 401 });
        const item = db_1.db.cartItems.find((i) => i.id === itemId);
        if (!item)
            return msw_1.HttpResponse.json({ error: 'Cart item not found' }, { status: 404 });
        // (Optionnel) vérifier que l'item appartient au cart du user
        const cart = db_1.db.carts.find((c) => c.id === item.cartId);
        if (!cart || cart.userId !== userId)
            return msw_1.HttpResponse.json({ error: 'Forbidden' }, { status: 403 });
        item.qty = body.qty;
        const product = db_1.db.findProductById(item.productId);
        return msw_1.HttpResponse.json({ ...item, product });
    }),
    msw_1.http.delete('/api/v1/cart/items/:id', async ({ params, request }) => {
        await (0, msw_1.delay)(API_DELAY);
        const itemId = parseInt(params.id, 10);
        const userId = parseUserIdFromAuth(request);
        if (!userId)
            return msw_1.HttpResponse.json({ error: 'Not authenticated' }, { status: 401 });
        const idx = db_1.db.cartItems.findIndex((i) => i.id === itemId);
        if (idx === -1)
            return msw_1.HttpResponse.json({ error: 'Cart item not found' }, { status: 404 });
        // (Optionnel) vérifier ownership
        const item = db_1.db.cartItems[idx];
        const cart = db_1.db.carts.find((c) => c.id === item.cartId);
        if (!cart || cart.userId !== userId)
            return msw_1.HttpResponse.json({ error: 'Forbidden' }, { status: 403 });
        db_1.db.cartItems.splice(idx, 1);
        return new msw_1.HttpResponse(null, { status: 204 });
    }),
    // ============================================
    // ORDERS
    // ============================================
    msw_1.http.post('/api/v1/orders', async ({ request }) => {
        await (0, msw_1.delay)(API_DELAY);
        const body = (await request.json());
        const userId = parseUserIdFromAuth(request);
        if (!userId)
            return msw_1.HttpResponse.json({ error: 'Not authenticated' }, { status: 401 });
        const cart = db_1.db.findCartByUserId(userId);
        if (!cart)
            return msw_1.HttpResponse.json({ error: 'Cart is empty' }, { status: 400 });
        const cartItems = db_1.db.cartItems.filter((i) => i.cartId === cart.id);
        if (cartItems.length === 0)
            return msw_1.HttpResponse.json({ error: 'Cart is empty' }, { status: 400 });
        // total + supplier (premier fournisseur trouvé dans le panier)
        let supplierId = null;
        const total = cartItems.reduce((sum, i) => {
            const p = db_1.db.findProductById(i.productId);
            if (p && supplierId == null)
                supplierId = p.supplierId;
            return sum + ((p?.priceCents || 0) * i.qty);
        }, 0);
        const newOrder = {
            id: db_1.db.getNextOrderId(),
            buyerId: userId,
            supplierId: supplierId ?? 1,
            orderNumber: `AG-${Date.now().toString().slice(-6)}`,
            totalCents: total,
            currency: 'XOF',
            ...body,
            status: 'PENDING',
            createdAt: nowIso(),
            updatedAt: nowIso(),
        };
        db_1.db.orders.push(newOrder);
        // items
        for (const cartItem of cartItems) {
            const product = db_1.db.findProductById(cartItem.productId);
            if (!product)
                continue;
            db_1.db.orderItems.push({
                id: db_1.db.getNextOrderItemId(),
                orderId: newOrder.id,
                productId: product.id,
                title: product.title,
                priceCents: product.priceCents,
                qty: cartItem.qty,
            });
        }
        // vider le panier
        db_1.db.cartItems = db_1.db.cartItems.filter((i) => i.cartId !== cart.id);
        cart.status = 'ORDERED';
        return msw_1.HttpResponse.json(newOrder, { status: 201 });
    }),
    // Liste commandes (filtrage as=buyer|supplier & status)
    msw_1.http.get('/api/v1/orders', async ({ request }) => {
        await (0, msw_1.delay)(API_DELAY);
        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get('page') || '1', 10);
        const pageSize = parseInt(url.searchParams.get('page_size') || '20', 10);
        const as = url.searchParams.get('as');
        const status = url.searchParams.get('status') || undefined;
        const userId = parseUserIdFromAuth(request);
        if (!userId)
            return msw_1.HttpResponse.json({ error: 'Not authenticated' }, { status: 401 });
        let list = db_1.db.orders.slice();
        if (as === 'buyer')
            list = list.filter((o) => o.buyerId === userId);
        else if (as === 'supplier')
            list = list.filter((o) => o.supplierId === userId);
        else
            list = list.filter((o) => o.buyerId === userId || o.supplierId === userId);
        if (status)
            list = list.filter((o) => o.status === status);
        return msw_1.HttpResponse.json(paginate(list, page, pageSize));
    }),
    msw_1.http.get('/api/v1/orders/:id', async ({ params, request }) => {
        await (0, msw_1.delay)(API_DELAY);
        const orderId = parseInt(params.id, 10);
        const userId = parseUserIdFromAuth(request);
        if (!userId)
            return msw_1.HttpResponse.json({ error: 'Not authenticated' }, { status: 401 });
        const order = db_1.db.orders.find((o) => o.id === orderId);
        if (!order)
            return msw_1.HttpResponse.json({ error: 'Order not found' }, { status: 404 });
        // Ownership basique
        if (order.buyerId !== userId && order.supplierId !== userId)
            return msw_1.HttpResponse.json({ error: 'Forbidden' }, { status: 403 });
        const items = db_1.db.getOrderItems(orderId);
        return msw_1.HttpResponse.json({ ...order, items });
    }),
    msw_1.http.patch('/api/v1/orders/:id/status', async ({ params, request }) => {
        await (0, msw_1.delay)(API_DELAY);
        const orderId = parseInt(params.id, 10);
        const body = (await request.json());
        const userId = parseUserIdFromAuth(request);
        if (!userId)
            return msw_1.HttpResponse.json({ error: 'Not authenticated' }, { status: 401 });
        const order = db_1.db.orders.find((o) => o.id === orderId);
        if (!order)
            return msw_1.HttpResponse.json({ error: 'Order not found' }, { status: 404 });
        // Autoriser seulement le supplier (mock simple)
        if (order.supplierId !== userId)
            return msw_1.HttpResponse.json({ error: 'Forbidden' }, { status: 403 });
        order.status = body.status;
        order.updatedAt = nowIso();
        return msw_1.HttpResponse.json(order);
    }),
    // ============================================
    // MESSAGING
    // ============================================
    // Create thread (buyer = user courant; supplier: déduit du produit si topic=PRODUCT)
    msw_1.http.post('/api/v1/threads', async ({ request }) => {
        await (0, msw_1.delay)(API_DELAY);
        const body = (await request.json());
        const userId = parseUserIdFromAuth(request);
        if (!userId)
            return msw_1.HttpResponse.json({ error: 'Not authenticated' }, { status: 401 });
        let supplierId = body.supplierId;
        if (!supplierId && body.topicType === 'PRODUCT') {
            const p = db_1.db.findProductById(body.topicId);
            supplierId = p?.supplierId;
        }
        const newThread = {
            id: db_1.db.getNextThreadId(),
            ...body,
            buyerId: userId,
            supplierId: supplierId ?? 1,
            lastMessageAt: nowIso(),
        };
        db_1.db.threads.push(newThread);
        return msw_1.HttpResponse.json(newThread, { status: 201 });
    }),
    // Get threads (filtrage par appartenance + ?as=buyer|supplier)
    msw_1.http.get('/api/v1/threads', async ({ request }) => {
        await (0, msw_1.delay)(API_DELAY);
        const url = new URL(request.url);
        const as = url.searchParams.get('as') || undefined;
        const userId = parseUserIdFromAuth(request);
        if (!userId)
            return msw_1.HttpResponse.json({ error: 'Not authenticated' }, { status: 401 });
        let threads = db_1.db.threads.filter((t) => t.buyerId === userId || t.supplierId === userId);
        if (as === 'buyer')
            threads = threads.filter((t) => t.buyerId === userId);
        if (as === 'supplier')
            threads = threads.filter((t) => t.supplierId === userId);
        // tri récent
        threads.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
        return msw_1.HttpResponse.json(threads);
    }),
    // Get thread messages (vérifie que l'user est participant)
    msw_1.http.get('/api/v1/threads/:id/messages', async ({ params, request }) => {
        await (0, msw_1.delay)(API_DELAY);
        const threadId = parseInt(params.id, 10);
        const userId = parseUserIdFromAuth(request);
        if (!userId)
            return msw_1.HttpResponse.json({ error: 'Not authenticated' }, { status: 401 });
        const thread = db_1.db.findThreadById(threadId);
        if (!thread)
            return msw_1.HttpResponse.json({ error: 'Thread not found' }, { status: 404 });
        if (thread.buyerId !== userId && thread.supplierId !== userId)
            return msw_1.HttpResponse.json({ error: 'Forbidden' }, { status: 403 });
        const messages = db_1.db.getThreadMessages(threadId);
        return msw_1.HttpResponse.json(messages);
    }),
    // Send message
    msw_1.http.post('/api/v1/threads/:id/messages', async ({ params, request }) => {
        await (0, msw_1.delay)(API_DELAY);
        const threadId = parseInt(params.id, 10);
        const body = (await request.json());
        const userId = parseUserIdFromAuth(request);
        if (!userId)
            return msw_1.HttpResponse.json({ error: 'Not authenticated' }, { status: 401 });
        const thread = db_1.db.findThreadById(threadId);
        if (!thread)
            return msw_1.HttpResponse.json({ error: 'Thread not found' }, { status: 404 });
        if (thread.buyerId !== userId && thread.supplierId !== userId)
            return msw_1.HttpResponse.json({ error: 'Forbidden' }, { status: 403 });
        const newMessage = {
            id: db_1.db.getNextMessageId(),
            threadId,
            senderId: userId,
            ...body,
            createdAt: nowIso(),
        };
        db_1.db.messages.push(newMessage);
        thread.lastMessageAt = newMessage.createdAt;
        return msw_1.HttpResponse.json(newMessage, { status: 201 });
    }),
    // ============================================
    // WEATHER & ALERTS
    // ============================================
    msw_1.http.get('/api/v1/advice/weather', async () => {
        await (0, msw_1.delay)(API_DELAY);
        const forecast = Array.from({ length: 7 }, (_, i) => ({
            date: new Date(Date.now() + i * 86400000).toISOString(),
            tempMin: 22 + Math.floor(Math.random() * 3),
            tempMax: 32 + Math.floor(Math.random() * 5),
            condition: i % 3 === 0 ? 'Ensoleillé' : i % 3 === 1 ? 'Nuageux' : 'Pluie',
            rainfallMm: i % 3 === 2 ? 5 + Math.random() * 15 : 0,
            humidity: 60 + Math.floor(Math.random() * 20),
        }));
        const cumulativeRainfall = forecast.reduce((sum, d) => sum + d.rainfallMm, 0);
        return msw_1.HttpResponse.json({ forecast, cumulativeRainfall, advice: 'Conditions favorables pour les semis cette semaine.' });
    }),
    msw_1.http.post('/api/v1/alerts', async ({ request }) => {
        await (0, msw_1.delay)(API_DELAY);
        const body = (await request.json());
        const userId = parseUserIdFromAuth(request);
        if (!userId)
            return msw_1.HttpResponse.json({ error: 'Not authenticated' }, { status: 401 });
        const newAlert = { id: db_1.db.getNextAlertId(), userId, ...body };
        db_1.db.weatherAlerts.push(newAlert);
        return msw_1.HttpResponse.json(newAlert, { status: 201 });
    }),
    msw_1.http.get('/api/v1/alerts', async ({ request }) => {
        await (0, msw_1.delay)(API_DELAY);
        const userId = parseUserIdFromAuth(request);
        if (!userId)
            return msw_1.HttpResponse.json({ error: 'Not authenticated' }, { status: 401 });
        const alerts = db_1.db.weatherAlerts.filter((a) => a.userId === userId);
        return msw_1.HttpResponse.json(alerts);
    }),
    msw_1.http.patch('/api/v1/alerts/:id', async ({ params, request }) => {
        await (0, msw_1.delay)(API_DELAY);
        const alertId = parseInt(params.id, 10);
        const body = (await request.json());
        const userId = parseUserIdFromAuth(request);
        if (!userId)
            return msw_1.HttpResponse.json({ error: 'Not authenticated' }, { status: 401 });
        const alert = db_1.db.weatherAlerts.find((a) => a.id === alertId);
        if (!alert)
            return msw_1.HttpResponse.json({ error: 'Alert not found' }, { status: 404 });
        if (alert.userId !== userId)
            return msw_1.HttpResponse.json({ error: 'Forbidden' }, { status: 403 });
        Object.assign(alert, body);
        return msw_1.HttpResponse.json(alert);
    }),
    // ============================================
    // ARTICLES
    // ============================================
    msw_1.http.get('/api/v1/articles', async ({ request }) => {
        await (0, msw_1.delay)(API_DELAY);
        const url = new URL(request.url);
        const tag = url.searchParams.get('tag');
        const q = url.searchParams.get('q');
        const page = parseInt(url.searchParams.get('page') || '1', 10);
        const pageSize = parseInt(url.searchParams.get('page_size') || '20', 10);
        let filtered = db_1.db.articles.filter((a) => a.status === 'PUBLISHED');
        if (tag)
            filtered = filtered.filter((a) => a.tags.includes(tag));
        if (q) {
            const ql = q.toLowerCase();
            filtered = filtered.filter((a) => a.title.toLowerCase().includes(ql) || a.bodyMd.toLowerCase().includes(ql));
        }
        return msw_1.HttpResponse.json(paginate(filtered, page, pageSize));
    }),
    msw_1.http.get('/api/v1/articles/:slug', async ({ params }) => {
        await (0, msw_1.delay)(API_DELAY);
        const article = db_1.db.findArticleBySlug(params.slug);
        if (!article)
            return msw_1.HttpResponse.json({ error: 'Article not found' }, { status: 404 });
        return msw_1.HttpResponse.json(article);
    }),
    // Create article (author = user courant; sinon admin mock #6)
    msw_1.http.post('/api/v1/articles', async ({ request }) => {
        await (0, msw_1.delay)(API_DELAY);
        const body = (await request.json());
        const uid = parseUserIdFromAuth(request);
        const authorId = uid ?? 6;
        const newArticle = {
            id: db_1.db.getNextArticleId(),
            ...body,
            authorId,
            publishedAt: body.status === 'PUBLISHED' ? nowIso() : undefined,
        };
        db_1.db.articles.push(newArticle);
        return msw_1.HttpResponse.json(newArticle, { status: 201 });
    }),
    // ============================================
    // ADMIN
    // ============================================
    msw_1.http.get('/api/v1/admin/suppliers/pending', async () => {
        await (0, msw_1.delay)(API_DELAY);
        const pending = db_1.db.users.filter((u) => u.role === 'SUPPLIER' && !u.isSupplierVerified);
        return msw_1.HttpResponse.json(pending);
    }),
    msw_1.http.patch('/api/v1/admin/suppliers/:id/verify', async ({ params }) => {
        await (0, msw_1.delay)(API_DELAY);
        const supplierId = parseInt(params.id, 10);
        const supplier = db_1.db.users.find((u) => u.id === supplierId);
        if (!supplier)
            return msw_1.HttpResponse.json({ error: 'Supplier not found' }, { status: 404 });
        supplier.isSupplierVerified = true;
        return msw_1.HttpResponse.json(supplier);
    }),
    msw_1.http.patch('/api/v1/admin/products/:id/block', async ({ params }) => {
        await (0, msw_1.delay)(API_DELAY);
        const productId = parseInt(params.id, 10);
        const product = db_1.db.findProductById(productId);
        if (!product)
            return msw_1.HttpResponse.json({ error: 'Product not found' }, { status: 404 });
        product.status = 'BLOCKED';
        return msw_1.HttpResponse.json(product);
    }),
    msw_1.http.get('/api/v1/admin/stats', async () => {
        await (0, msw_1.delay)(API_DELAY);
        const totalSuppliers = db_1.db.users.filter((u) => u.role === 'SUPPLIER').length;
        const pendingSuppliers = db_1.db.users.filter((u) => u.role === 'SUPPLIER' && !u.isSupplierVerified).length;
        const totalProducts = db_1.db.products.length;
        const activeProducts = db_1.db.products.filter((p) => p.status === 'ACTIVE').length;
        const totalOrders = db_1.db.orders.length;
        const totalRevenueCents = db_1.db.orders.reduce((sum, o) => sum + o.totalCents, 0);
        return msw_1.HttpResponse.json({
            totalSuppliers,
            pendingSuppliers,
            totalProducts,
            activeProducts,
            totalOrders,
            totalRevenueCents,
        });
    }),
];
