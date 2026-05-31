import { readFileSync } from "node:fs";
import { join } from "node:path";
import { initializeApp } from "firebase/app";
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

function loadEnvLocal() {
  const envPath = join(process.cwd(), ".env.local");
  const envText = readFileSync(envPath, "utf8");

  for (const line of envText.split(/\r?\n/)) {
    if (!line || line.trim().startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();

    process.env[key] = value;
  }
}

function getFirebaseConfig() {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
}

const categories = [
  {
    id: "steak",
    name: "牛排",
    slug: "steak",
    sortOrder: 1,
    isVisible: true,
  },
  {
    id: "main",
    name: "主食",
    slug: "main",
    sortOrder: 2,
    isVisible: true,
  },
  {
    id: "soup",
    name: "汤品",
    slug: "soup",
    sortOrder: 3,
    isVisible: true,
  },
  {
    id: "salad",
    name: "沙拉",
    slug: "salad",
    sortOrder: 4,
    isVisible: true,
  },
  {
    id: "drink",
    name: "饮料",
    slug: "drink",
    sortOrder: 5,
    isVisible: true,
  },
];

const products = [
  {
    id: "classic-sirloin-steak",
    name: "经典沙朗牛排",
    category: "牛排",
    categoryId: "steak",
    price: 320,
    description: "油花均匀、肉香浓郁，搭配经典牛排酱汁。",
    imageUrl:
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80",
    isAvailable: true,
    isRecommended: true,
    sortOrder: 1,
  },
  {
    id: "filet-steak",
    name: "菲力牛排",
    category: "牛排",
    categoryId: "steak",
    price: 450,
    description: "口感细嫩、低脂清爽，适合喜欢柔软肉质的顾客。",
    imageUrl:
      "https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=900&q=80",
    isAvailable: true,
    isRecommended: true,
    sortOrder: 2,
  },
  {
    id: "black-pepper-steak",
    name: "黑胡椒牛排",
    category: "牛排",
    categoryId: "steak",
    price: 360,
    description: "浓郁黑胡椒香气，经典台式牛排风味。",
    imageUrl:
      "https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=900&q=80",
    isAvailable: true,
    isRecommended: false,
    sortOrder: 3,
  },
  {
    id: "thick-cut-short-rib",
    name: "厚切牛小排",
    category: "牛排",
    categoryId: "steak",
    price: 520,
    description: "厚切多汁、肉香饱满，是招牌推荐餐点。",
    imageUrl:
      "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=900&q=80",
    isAvailable: true,
    isRecommended: true,
    sortOrder: 4,
  },
  {
    id: "black-pepper-teppan-noodles",
    name: "黑胡椒铁板面",
    category: "主食",
    categoryId: "main",
    price: 120,
    description: "热腾腾铁板面，黑胡椒香气十足。",
    imageUrl:
      "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=900&q=80",
    isAvailable: true,
    isRecommended: false,
    sortOrder: 5,
  },
  {
    id: "creamy-bacon-baked-rice",
    name: "奶油培根焗饭",
    category: "主食",
    categoryId: "main",
    price: 180,
    description: "奶香浓郁，搭配培根与焗烤起司。",
    imageUrl:
      "https://images.unsplash.com/photo-1604909052743-94e838986d24?auto=format&fit=crop&w=900&q=80",
    isAvailable: true,
    isRecommended: false,
    sortOrder: 6,
  },
  {
    id: "cream-corn-soup",
    name: "奶油玉米浓汤",
    category: "汤品",
    categoryId: "soup",
    price: 80,
    description: "香甜玉米与奶油汤底，温暖开胃。",
    imageUrl:
      "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=900&q=80",
    isAvailable: true,
    isRecommended: false,
    sortOrder: 7,
  },
  {
    id: "caesar-salad",
    name: "凯撒沙拉",
    category: "沙拉",
    categoryId: "salad",
    price: 130,
    description: "清爽生菜、面包丁与凯撒酱，平衡牛排餐点。",
    imageUrl:
      "https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&w=900&q=80",
    isAvailable: true,
    isRecommended: false,
    sortOrder: 8,
  },
  {
    id: "cola",
    name: "可乐",
    category: "饮料",
    categoryId: "drink",
    price: 30,
    description: "冰凉畅快，适合搭配牛排与主食。",
    imageUrl:
      "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=900&q=80",
    isAvailable: true,
    isRecommended: false,
    sortOrder: 9,
  },
  {
    id: "black-tea",
    name: "红茶",
    category: "饮料",
    categoryId: "drink",
    price: 35,
    description: "清爽茶香，甜度固定。",
    imageUrl:
      "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=900&q=80",
    isAvailable: true,
    isRecommended: false,
    sortOrder: 10,
  },
];

async function seedMenuData() {
  loadEnvLocal();

  const app = initializeApp(getFirebaseConfig());
  const db = getFirestore(app);
  const now = serverTimestamp();

  for (const category of categories) {
    await setDoc(
      doc(db, "categories", category.id),
      {
        name: category.name,
        slug: category.slug,
        sortOrder: category.sortOrder,
        isVisible: category.isVisible,
        createdAt: now,
        updatedAt: now,
      },
      { merge: true },
    );
  }

  for (const product of products) {
    await setDoc(
      doc(db, "products", product.id),
      {
        name: product.name,
        category: product.category,
        categoryId: product.categoryId,
        price: product.price,
        description: product.description,
        imageUrl: product.imageUrl,
        isAvailable: product.isAvailable,
        isRecommended: product.isRecommended,
        sortOrder: product.sortOrder,
        createdAt: now,
        updatedAt: now,
      },
      { merge: true },
    );
  }

  const categoriesSnapshot = await getDocs(query(collection(db, "categories")));
  const productsSnapshot = await getDocs(query(collection(db, "products")));

  console.log("Seed menu data completed.");
  console.log(`categories count: ${categoriesSnapshot.size}`);
  console.log(`products count: ${productsSnapshot.size}`);
  console.log("Fixed document ids were used with setDoc(..., { merge: true }).");
}

seedMenuData().catch((error) => {
  console.error("Seed menu data failed.");
  console.error(error);
  process.exit(1);
});
