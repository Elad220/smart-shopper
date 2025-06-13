
export enum StandardCategory {
  PRODUCE = "Produce",
  DAIRY = "Dairy",
  FRIDGE = "Fridge",
  FREEZER = "Freezer",
  BAKERY = "Bakery",
  PANTRY = "Pantry",
  DISPOSABLE = "Disposable",
  HYGIENE = "Hygiene",
  OTHER = "Other", // Represents the option to add a custom category
}

export type Category = StandardCategory | string; // Allows for custom category strings

export interface ShoppingItem {
  id: string;
  name: string;
  category: Category;
  customCategoryName?: string; // Stores the name if StandardCategory.OTHER is chosen
  units: string;
  amount: number;
  imageUrl?: string;
  isCompleted: boolean;
}
