import { Link, useLocation } from 'wouter';
import { ShoppingCart, User, Menu, Sprout } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuthStore, useCartStore } from '@/lib/store';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';

export function Header() {
  const [, navigate] = useLocation();
  const { user, clearAuth } = useAuthStore();
  const itemCount = useCartStore((state) => state.getItemCount());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    clearAuth();
    navigate('/');
  };

  /** Détermine dynamiquement le dashboard selon le rôle */
  const getDashboardPath = () => {
    switch (user?.role) {
      case 'SUPPLIER':
        return '/dashboard/supplier';
      case 'ADMIN':
        return '/dashboard/admin';
      case 'PRODUCER':
      default:
        return '/dashboard/producer';
    }
  };

  const navLinks = [
    { href: '/', label: 'Accueil' },
    { href: '/catalog', label: 'Catalogue' },
    { href: '/articles', label: 'Conseils' },
    ...(user?.role === 'SUPPLIER'
      ? [
          { href: '/supplier/products', label: 'Mes Produits' },
          { href: '/supplier/orders', label: 'Commandes' },
        ]
      : []),
    ...(user?.role === 'ADMIN' ? [{ href: '/admin', label: 'Administration' }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 hover-elevate rounded-md px-2 py-1 -ml-2"
            data-testid="link-home"
          >
            <Sprout className="h-6 w-6 text-primary" data-testid="icon-logo" />
            <span className="text-xl font-bold text-primary">AGRI-SEM</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                data-testid={`link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/checkout')}
              className="relative"
              data-testid="button-cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <Badge
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  data-testid="badge-cart-count"
                >
                  {itemCount}
                </Badge>
              )}
            </Button>

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" data-testid="button-user-menu">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-2">
                    <p className="text-sm font-medium" data-testid="text-user-name">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground" data-testid="text-user-email">
                      {user.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator />

                  {/* Accès dynamique au bon dashboard */}
                  <DropdownMenuItem onClick={() => navigate(getDashboardPath())}>
                    Tableau de bord
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => navigate('/messaging')}>
                    Messages
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>Déconnexion</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="ghost"
                data-testid="button-login"
                onClick={() => {
                  const path = window.location.pathname;
                  if (path === '/checkout') {
                    navigate('/auth/login?redirect='+encodeURIComponent('/checkout?step=address'));
                  } else {
                    navigate('/auth/login');
                  }
                }}
              >
                Connexion
              </Button>


            )}

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  data-testid="button-mobile-menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <nav className="flex flex-col gap-4 mt-8">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-lg font-medium hover:text-primary transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}

                  {/* Dashboard link also visible on mobile */}
                  {user && (
                    <>
                      <hr className="my-2" />
                      <Button
                        variant="outline"
                        onClick={() => {
                          navigate(getDashboardPath());
                          setMobileMenuOpen(false);
                        }}
                      >
                        Mon Tableau de bord
                      </Button>
                    </>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
