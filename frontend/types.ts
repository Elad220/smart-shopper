export enum StandardCategory {
  PRODUCE = "Produce",
  DAIRY = "Dairy",
  FRIDGE = "Fridge",
  FREEZER = "Freezer",
  BAKERY = "Bakery",
  PANTRY = "Pantry",
  DISPOSABLE = "Disposable",
  HYGIENE = "Hygiene",
  CANNED_GOODS = "Canned Goods",
  ORGANICS = "Organics",
  DELI = "Deli",
  OTHER = "Other",
}

export type Category = StandardCategory | string; // Allows for custom category strings

export interface ShoppingItem {
  id: string;
  name: string;
  category: Category;
  units: string;
  amount: number;
  priority: 'Low' | 'Medium' | 'High';
  notes: string;
  imageUrl?: string;
  completed: boolean;
}