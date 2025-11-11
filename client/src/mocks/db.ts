import type {
  User,
  Culture,
  Variety,
  Product,
  Cart,
  CartItem,
  Order,
  OrderItem,
  Thread,
  Message,
  Article,
  WeatherAlert,
  Address,
} from '@/shared/schema';

// In-memory database
export class MockDatabase {
  users: User[] = [];
  addresses: Address[] = [];
  cultures: Culture[] = [];
  varieties: Variety[] = [];
  products: Product[] = [];
  carts: Cart[] = [];
  cartItems: CartItem[] = [];
  orders: Order[] = [];
  orderItems: OrderItem[] = [];
  threads: Thread[] = [];
  messages: Message[] = [];
  articles: Article[] = [];
  weatherAlerts: WeatherAlert[] = [];

  // ID counters
  private nextUserId = 1;
  private nextAddressId = 1;
  private nextCultureId = 1;
  private nextVarietyId = 1;
  private nextProductId = 1;
  private nextCartId = 1;
  private nextCartItemId = 1;
  private nextOrderId = 1;
  private nextOrderItemId = 1;
  private nextThreadId = 1;
  private nextMessageId = 1;
  private nextArticleId = 1;
  private nextAlertId = 1;

  // Helper methods to get next IDs
  getNextUserId() { return this.nextUserId++; }
  getNextAddressId() { return this.nextAddressId++; }
  getNextCultureId() { return this.nextCultureId++; }
  getNextVarietyId() { return this.nextVarietyId++; }
  getNextProductId() { return this.nextProductId++; }
  getNextCartId() { return this.nextCartId++; }
  getNextCartItemId() { return this.nextCartItemId++; }
  getNextOrderId() { return this.nextOrderId++; }
  getNextOrderItemId() { return this.nextOrderItemId++; }
  getNextThreadId() { return this.nextThreadId++; }
  getNextMessageId() { return this.nextMessageId++; }
  getNextArticleId() { return this.nextArticleId++; }
  getNextAlertId() { return this.nextAlertId++; }

  // Find methods
  findUserByEmail(email: string) {
    return this.users.find(u => u.email === email);
  }

  findProductById(id: number) {
    return this.products.find(p => p.id === id);
  }

  findVarietyById(id: number) {
    return this.varieties.find(v => v.id === id);
  }

  findCultureById(id: number) {
    return this.cultures.find(c => c.id === id);
  }

  findCartByUserId(userId: number) {
    return this.carts.find(c => c.userId === userId && c.status === 'ACTIVE');
  }

  findThreadById(id: number) {
    return this.threads.find(t => t.id === id);
  }

  findArticleBySlug(slug: string) {
    return this.articles.find(a => a.slug === slug);
  }

  // Get cart items with product details
  getCartItemsWithProducts(cartId: number) {
    const items = this.cartItems.filter(item => item.cartId === cartId);
    return items.map(item => ({
      ...item,
      product: this.findProductById(item.productId),
    }));
  }

  // Get order items
  getOrderItems(orderId: number) {
    return this.orderItems.filter(item => item.orderId === orderId);
  }

  // Get messages for thread
  getThreadMessages(threadId: number) {
    return this.messages.filter(m => m.threadId === threadId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  // Reset database (for testing)
  reset() {
    this.users = [];
    this.addresses = [];
    this.cultures = [];
    this.varieties = [];
    this.products = [];
    this.carts = [];
    this.cartItems = [];
    this.orders = [];
    this.orderItems = [];
    this.threads = [];
    this.messages = [];
    this.articles = [];
    this.weatherAlerts = [];
  }
}

export const db = new MockDatabase();
