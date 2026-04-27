export type FoodType = "dry" | "treat" | "home";

export interface Feeding {
  id: string;
  fed_at: string;
  amount_grams: number;
  food_type: FoodType;
  created_at: string;
}

export interface Settings {
  id: number;
  dry_limit_grams: number;
  updated_at: string;
}

export const FOOD_TYPE_LABELS: Record<FoodType, string> = {
  dry: "Сухой корм",
  treat: "Вкусняшка",
  home: "Домашняя еда",
};
