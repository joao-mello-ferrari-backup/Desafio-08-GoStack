import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const fetchedProducts = await AsyncStorage.getItem('@GoMarketplace:products')

      if(fetchedProducts){
        setProducts(JSON.parse(fetchedProducts));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(async product => {
    const productExists = products.find((newProduct)=>{
      return newProduct.id === product.id
    });

    if(productExists){
      setProducts(
        products.map((product)=>{
          if(productExists.id === product.id){
            product.quantity += 1
          } 
          return product
        })
      );
    } else{
      setProducts([...products, {...product, quantity: 1}])
    }

    await AsyncStorage.setItem('@GoMarketplace:products',JSON.stringify(products));

  }, [products]);

  const increment = useCallback(async id => {
    const incrementedProducts = products.map(product=>product.id === id?{...product, quantity: product.quantity + 1 }:product)
    
    setProducts(incrementedProducts)

    await AsyncStorage.setItem('@GoMarketplace:products', JSON.stringify(products))
  
  }, [products]);

  const decrement = useCallback(async id => {
    const decrementedProducts = products.map(product=>product.id === id?{...product, quantity: product.quantity - 1 }:product)
    
    setProducts(decrementedProducts)

    await AsyncStorage.setItem('@GoMarketplace:products', JSON.stringify(products))
  }, [products]);

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
