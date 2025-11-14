"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.MockDatabase = void 0;
// In-memory database
class MockDatabase {
    constructor() {
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
        // ID counters
        this.nextUserId = 1;
        this.nextAddressId = 1;
        this.nextCultureId = 1;
        this.nextVarietyId = 1;
        this.nextProductId = 1;
        this.nextCartId = 1;
        this.nextCartItemId = 1;
        this.nextOrderId = 1;
        this.nextOrderItemId = 1;
        this.nextThreadId = 1;
        this.nextMessageId = 1;
        this.nextArticleId = 1;
        this.nextAlertId = 1;
    }
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
    findUserByEmail(email) {
        return this.users.find(u => u.email === email);
    }
    findProductById(id) {
        return this.products.find(p => p.id === id);
    }
    findVarietyById(id) {
        return this.varieties.find(v => v.id === id);
    }
    findCultureById(id) {
        return this.cultures.find(c => c.id === id);
    }
    findCartByUserId(userId) {
        return this.carts.find(c => c.userId === userId && c.status === 'ACTIVE');
    }
    findThreadById(id) {
        return this.threads.find(t => t.id === id);
    }
    findArticleBySlug(slug) {
        return this.articles.find(a => a.slug === slug);
    }
    // Get cart items with product details
    getCartItemsWithProducts(cartId) {
        const items = this.cartItems.filter(item => item.cartId === cartId);
        return items.map(item => ({
            ...item,
            product: this.findProductById(item.productId),
        }));
    }
    // Get order items
    getOrderItems(orderId) {
        return this.orderItems.filter(item => item.orderId === orderId);
    }
    // Get messages for thread
    getThreadMessages(threadId) {
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
exports.MockDatabase = MockDatabase;
exports.db = new MockDatabase();
