import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StockBadgeProps {
  stock: number;
  className?: string;
}

export function StockBadge({ stock, className }: StockBadgeProps) {
  const getStockStatus = () => {
    if (stock === 0) {
      return {
        label: 'Rupture de stock',
        variant: 'destructive' as const,
        className: 'bg-red-100 text-red-800 hover:bg-red-100',
      };
    }
    if (stock < 10) {
      return {
        label: 'Stock limité',
        variant: 'secondary' as const,
        className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
      };
    }
    return {
      label: 'En stock',
      variant: 'secondary' as const,
      className: 'bg-green-100 text-green-800 hover:bg-green-100',
    };
  };

  const status = getStockStatus();

  return (
    <Badge 
      variant={status.variant} 
      className={cn(status.className, className)}
      data-testid="badge-stock"
    >
      {status.label}
    </Badge>
  );
}
