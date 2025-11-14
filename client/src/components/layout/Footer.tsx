import { Link } from 'wouter';
import { Sprout, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sprout className="h-6 w-6" />
              <span className="text-xl font-bold">AGRI-SEM</span>
            </div>
            <p className="text-sm text-primary-foreground/80">
              Marketplace de semences agricoles certifiées pour une agriculture moderne et durable.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold mb-4">Liens Utiles</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/catalog"
                  className="hover:text-brand-accent transition-colors"
                >
                  Catalogue
                </Link>
              </li>
              <li>
                <Link
                  href="/articles"
                  className="hover:text-brand-accent transition-colors"
                >
                  Conseils Agricoles
                </Link>
              </li>
              <li>
                <Link
                  href="/auth/register"
                  className="hover:text-brand-accent transition-colors"
                >
                  Devenir Fournisseur
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>contact@agrisem.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+229 0168778998</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Bénin, Parakou</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-sm text-primary-foreground/60">
          <p>&copy; {new Date().getFullYear()} AGRI-SEM. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
