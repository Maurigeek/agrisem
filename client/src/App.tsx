import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Catalog from "@/pages/Catalog";
import Product from "@/pages/Product";
import Checkout from "@/pages/Checkout";
import Messaging from "@/pages/Messaging";
import Dashboard from "@/pages/Dashboard";
import Articles from "@/pages/Articles";
import ArticleDetail from "@/pages/ArticleDetail";
import AuthLogin from "@/pages/AuthLogin";
import AuthRegister from "@/pages/AuthRegister";
import AuthReset from "@/pages/AuthReset";
import AuthRegisterSuccess from "./pages/AuthRegisterSuccess";
import SupplierProducts from "@/pages/SupplierProducts";
import SupplierOrders from "@/pages/SupplierOrders";
import Admin from "@/pages/Admin";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardProducer from "@/pages/DashboardProducer";
import DashboardSupplier from "@/pages/DashboardSupplier";
import DashboardAdmin from "@/pages/DashboardAdmin";

function Router() {
  return (
    <Switch>
      {/* Public Pages */}
      <Route path="/" component={Home} />
      <Route path="/catalog" component={Catalog} />
      <Route path="/products/:id" component={Product} />
      <Route path="/articles" component={Articles} />
      <Route path="/articles/:slug" component={ArticleDetail} />
      
      {/* Auth Pages */}
      <Route path="/auth/login" component={AuthLogin} />
      <Route path="/auth/register" component={AuthRegister} />
      <Route path="/auth/reset" component={AuthReset} />
      <Route path="/auth/register/success" component={AuthRegisterSuccess} />
      
      {/* Protected Pages */}
      <Route path="/checkout" component={Checkout} />
      <Route path="/messaging" component={Messaging} />
      <Route path="/dashboard" component={Dashboard} />

      <Route
        path="/dashboard/producer"
        component={() => (
          <ProtectedRoute>
            <DashboardProducer />
          </ProtectedRoute>
        )}
      />

      <Route
        path="/dashboard/supplier"
        component={() => (
          <ProtectedRoute>
            <DashboardSupplier />
          </ProtectedRoute>
        )}
      />

      <Route
        path="/dashboard/admin"
        component={() => (
          <ProtectedRoute>
            <DashboardAdmin />
          </ProtectedRoute>
        )}
      />
      
      {/* Supplier Pages */}
      <Route path="/supplier/products" component={SupplierProducts} />
      <Route path="/supplier/orders" component={SupplierOrders} />
      
      {/* Admin Pages */}
      <Route path="/admin" component={Admin} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1">
            <Router />
          </main>
          <Footer />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
