export type ProductOptionType =
  | "steak"
  | "main"
  | "drink"
  | "soup"
  | "salad"
  | "dessert"
  | "other";

export type OptionAddon = {
  name: string;
  price: number;
};

export type OrderItemOptionSummary = {
  optionType?: string;
  selectedDoneness?: string;
  selectedSauce?: string;
  temperature?: string;
  addons?: OptionAddon[];
};

export const productOptionTypes: Array<{
  label: string;
  value: ProductOptionType;
}> = [
  { label: "牛排", value: "steak" },
  { label: "主食", value: "main" },
  { label: "饮料", value: "drink" },
  { label: "汤品", value: "soup" },
  { label: "沙拉", value: "salad" },
  { label: "甜点", value: "dessert" },
  { label: "其他", value: "other" },
];

export const productOptionTypeLabels: Record<ProductOptionType, string> = {
  steak: "牛排",
  main: "主食",
  drink: "饮料",
  soup: "汤品",
  salad: "沙拉",
  dessert: "甜点",
  other: "其他",
};

export const validProductOptionTypes = productOptionTypes.map(
  (option) => option.value,
);

export const steakDonenessOptions = ["三分", "五分", "七分", "全熟"];
export const steakSauceOptions = ["黑胡椒", "蘑菇", "综合"];
export const steakAddons: OptionAddon[] = [
  { name: "加蛋", price: 20 },
  { name: "加起司", price: 30 },
];
export const mainAddons: OptionAddon[] = [
  { name: "加蛋", price: 20 },
  { name: "加饭", price: 20 },
  { name: "加面", price: 20 },
];
export const drinkTemperatureOptions = ["冰", "温"];

export function getProductOptionType(
  value: string | null | undefined,
): ProductOptionType {
  return validProductOptionTypes.includes(value as ProductOptionType)
    ? (value as ProductOptionType)
    : "other";
}

export function getAddonsForOptionType(optionType: ProductOptionType) {
  if (optionType === "steak") {
    return steakAddons;
  }

  if (optionType === "main") {
    return mainAddons;
  }

  return [];
}

export function getOrderItemOptionLines(item: OrderItemOptionSummary) {
  const lines: string[] = [];

  if (item.selectedDoneness) {
    lines.push(`熟度：${item.selectedDoneness}`);
  }

  if (item.selectedSauce) {
    lines.push(`酱料：${item.selectedSauce}`);
  }

  if (item.temperature) {
    lines.push(`温度：${item.temperature}`);
  }

  if (item.addons && item.addons.length > 0) {
    lines.push(
      `加购：${item.addons
        .map((addon) => `${addon.name} +$${addon.price}`)
        .join("、")}`,
    );
  }

  return lines;
}
