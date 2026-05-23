import { create } from 'zustand';

export interface CartItem {
  product_id: number;
  product_name: string;
  unit_price: number;
  quantity: number;
  category_name: string;
  units_in_stock: number;
}

interface CartState {
  items: CartItem[];
  addToCart: (product: any) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => {
  // Load initial cart from localStorage safely on client side
  const getInitialCart = (): CartItem[] => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('northwind_cart');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const saveCart = (items: CartItem[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('northwind_cart', JSON.stringify(items));
    }
  };

  return {
    items: getInitialCart(),
    addToCart: (product) => set((state) => {
      const existing = state.items.find(item => item.product_id === product.product_id);
      let updated;
      if (existing) {
        updated = state.items.map(item =>
          item.product_id === product.product_id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        updated = [...state.items, { 
          product_id: product.product_id,
          product_name: product.product_name,
          unit_price: product.unit_price,
          category_name: product.category_name,
          units_in_stock: product.units_in_stock,
          quantity: 1 
        }];
      }
      saveCart(updated);
      return { items: updated };
    }),
    removeFromCart: (productId) => set((state) => {
      const updated = state.items.filter(item => item.product_id !== productId);
      saveCart(updated);
      return { items: updated };
    }),
    updateQuantity: (productId, quantity) => set((state) => {
      const updated = state.items.map(item =>
        item.product_id === productId
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      );
      saveCart(updated);
      return { items: updated };
    }),
    clearCart: () => set(() => {
      saveCart([]);
      return { items: [] };
    }),
  };
});
