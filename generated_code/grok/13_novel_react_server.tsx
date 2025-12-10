// app/products/page.tsx
async function fetchProducts(): Promise<Product[]> {
  const res = await fetch('https://fakestoreapi.com/products', {
    cache: 'force-cache', // Optional: cache the response
  });

  if (!res.ok) {
    throw new Error('Failed to fetch products');
  }

  return res.json();
}

export default async function ProductsPage() {
  const products = await fetchProducts();

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Products</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="border rounded-lg p-4 shadow-sm">
            <h2 className="text-xl font-semibold">{product.title}</h2>
            <p className="text-gray-600 mt-2">${product.price}</p>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
              {product.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}







// Required TypeScript Interface (optional but recommended)
export type Product = {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
};

// Required Packages & Versions (as of December 2025)
// Bashnpm install next@15.0.0 react@19.0.0 react-dom@19.0.0
// Note: Next.js 15+ uses React 19 by default.
// Optional (for TypeScript & Tailwind):
// Bashnpm install --save-dev typescript @types/react @types/node
// npm install tailwindcss postcss autoprefixer
// npx tailwindcss init -p

// package.json (minimal dependencies)
// JSON{
//   "name": "next-products-app",
//   "version": "1.0.0",
//   "private": true,
//   "scripts": {
//     "dev": "next dev",
//     "build": "next build",
//     "start": "next start"
//   },
//   "dependencies": {
//     "next": "15.0.0",
//     "react": "19.0.0",
//     "react-dom": "19.0.0"
//   },
//   "devDependencies": {
//     "typescript": "^5.5.0",
//     "@types/react": "^19.0.0",
//     "@types/node": "^20.0.0",
//     "tailwindcss": "^3.4.0",
//     "postcss": "^8.4.0",
//     "autoprefixer": "^10.4.0"
//   }
// }

// Project Setup Steps

// Create a new Next.js app:Bashnpx create-next-app@latest my-products-app --typescript --tailwind --eslint --app --src-dir
// Replace app/page.tsx with the code above or create app/products/page.tsx.
// Run:Bashnpm run dev
// Visit: http://localhost:3000/products


// Summary of Required Packages:
// PackageVersionPurposenext15.0.0Framework (SSR, RSC)react19.0.0React 19 (Server Components)react-dom19.0.0DOM rendering
// No additional fetch libraries needed — fetch is built into Node.js 18+ and works natively in Server Components.
// Let me know if you want a client-side version or loading/error states!