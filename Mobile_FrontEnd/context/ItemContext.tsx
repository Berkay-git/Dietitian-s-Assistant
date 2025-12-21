export interface AvailableItem {
  itemID: string;
  itemName: string;
}

interface ItemContextType {
  items: AvailableItem[];
  loading: boolean;
  fetchItems: () => Promise<void>;
}

import React, { createContext, useContext, useEffect, useState } from "react";

const ItemContext = createContext<ItemContextType | undefined>(undefined);

export const ItemProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<AvailableItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchItems = async () => {
    try {
      setLoading(true);
      console.log("Feedback Dropdown items fetching started..."); 
      const response = await fetch(
        "http://10.0.2.2:5000/api/dietitian/dropdown_items"
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

  //  App açıldığında 1 kere çek
  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <ItemContext.Provider value={{ items, loading, fetchItems }}>
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
