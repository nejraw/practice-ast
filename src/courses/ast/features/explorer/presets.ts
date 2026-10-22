export interface Preset {
  name: string;
  code: string;
}

export const presets: Preset[] = [
  {
    name: "Variables",
    code: `const price = 12.5;
let quantity = 3;
const total = price * quantity + 2;`,
  },
  {
    name: "Functions",
    code: `function greet(name, greeting = "Hello") {
  return \`\${greeting}, \${name}!\`;
}

const shout = (text) => text.toUpperCase();
greet(shout("world"));`,
  },
  {
    name: "Conditions",
    code: `if (user && user.isAdmin) {
  showDashboard();
} else if (user) {
  showProfile(user.name ?? "anonymous");
} else {
  redirect("/login");
}`,
  },
  {
    name: "Loops",
    code: `let sum = 0;
for (let i = 0; i < items.length; i++) {
  sum += items[i].price;
}

for (const { name } of users) {
  console.log(name);
}`,
  },
  {
    name: "Classes",
    code: `class Cart extends Collection {
  #items = [];
  static currency = "EUR";

  add(item) {
    this.#items.push(item);
  }

  get size() {
    return this.#items.length;
  }
}`,
  },
  {
    name: "Async & modules",
    code: `import { fetchUser } from "./api.js";

export async function loadProfile(id) {
  try {
    const user = await fetchUser(id);
    return { ...user, loadedAt: Date.now() };
  } catch (error) {
    console.error(error);
    return null;
  }
}`,
  },
];
