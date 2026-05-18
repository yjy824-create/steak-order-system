export type MenuItem = {
  id: number;
  name: string;
  category: "牛排" | "主食" | "汤品" | "饮料";
  description: string;
  price: number;
};

export const menuItems: MenuItem[] = [
  {
    id: 1,
    name: "经典沙朗牛排",
    category: "牛排",
    description: "鲜嫩多汁，经典酱汁",
    price: 320,
  },
  {
    id: 2,
    name: "菲力牛排",
    category: "牛排",
    description: "七分熟，黑胡椒酱",
    price: 450,
  },
  {
    id: 3,
    name: "丁骨牛排",
    category: "牛排",
    description: "双重享受，肉香满满",
    price: 520,
  },
  {
    id: 4,
    name: "奶油玉米浓汤",
    category: "汤品",
    description: "香浓顺口，暖心暖胃",
    price: 80,
  },
  {
    id: 5,
    name: "番茄肉酱意面",
    category: "主食",
    description: "酸甜番茄，搭配牛肉酱",
    price: 160,
  },
  {
    id: 6,
    name: "可乐",
    category: "饮料",
    description: "冰凉畅快，去冰可选",
    price: 30,
  },
];

export const cartItems = [
  { ...menuItems[1], quantity: 1 },
  { ...menuItems[3], quantity: 1 },
  { ...menuItems[5], quantity: 1 },
];
