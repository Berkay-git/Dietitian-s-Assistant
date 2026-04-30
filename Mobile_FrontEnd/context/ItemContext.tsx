import { API_URL } from '../config/ipconfig'; // API_URL imported from config/ipconfig.ts
export interface AvailableItem {
  itemID: string;
  itemName: string;
}

interface ItemContextType {
  items: AvailableItem[];
  loading: boolean;
  fetchItems: () => Promise<void>;
  ensureItems: () => Promise<void>;
}

import React, { createContext, useContext, useEffect, useState } from "react";

const ItemContext = createContext<ItemContextType | undefined>(undefined);

export const ItemProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<AvailableItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_URL}/dropdown_items`
      );

      const data = await response.json();

      const mapped: AvailableItem[] = data.map((item: any) => ({
        itemID: item.ItemID.toString(),
        itemName: item.ItemName,
      }));

      setItems(mapped);
    } catch (err) {
      console.error("Failed to fetch items", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount, and expose fetchItems so consumers can retry
  useEffect(() => {
    fetchItems();
  }, []);

  // Also expose a way to ensure items are loaded (re-fetches if empty)
  const ensureItems = async () => {
    if (items.length === 0 && !loading) {
      await fetchItems();
    }
  };

  return (
    <ItemContext.Provider value={{ items, loading, fetchItems, ensureItems }}>
      {children}
    </ItemContext.Provider>
  );
};

export const useItems = () => {
  const ctx = useContext(ItemContext);
  if (!ctx) {
    throw new Error("useItems must be used within ItemProvider");
  }
  return ctx;
};
