// app/products/page.tsx

interface Product {
  id: number;
  title: string;
  price: number;
  category: string;
  image: string;
}

async function getProducts(): Promise<Product[]> {
  const res = await fetch('https://fakestoreapi.com/products', {
    cache: 'no-store', // or 'force-cache' for static data
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch products');
  }
  
  return res.json();
}

export default async function ProductsPage() {
  const products = await getProducts();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Products</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div 
            key={product.id} 
            className="border rounded-lg p-4 shadow-sm hover:shadow-md transition"
          >
            <img 
              src={product.image} 
              alt={product.title}
              className="w-full h-48 object-contain mb-4"
            />
            <h2 className="font-semibold text-lg mb-2 line-clamp-2">
              {product.title}
            </h2>
            <p className="text-gray-600 mb-2">{product.category}</p>
            <p className="text-xl font-bold">${product.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}


// Required Packages and Versions
// To use this React Server Component, you'll need the following packages:
// json{
//   "dependencies": {
//     "react": "^18.3.1",
//     "react-dom": "^18.3.1",
//     "next": "^14.2.0"
//   },
//   "devDependencies": {
//     "typescript": "^5.5.0",
//     "@types/react": "^18.3.0",
//     "@types/react-dom": "^18.3.0",
//     "@types/node": "^20.14.0"
//   }
// }
// Setup Instructions

// Create a Next.js project (if you don't have one):

// bashnpx create-next-app@latest my-app --typescript
// ```

// 2. **Project structure**:
// ```
// my-app/
// ├── app/
// │   └── products/
// │       └── page.tsx  (the Server Component above)
// ├── package.json
// └── ...

// Run the development server:

// bashnpm run dev
// Key Points

// React Server Components are only available in Next.js 13+ with the App Router
// The component uses async/await to fetch data at build time or request time
// No additional state management libraries needed - Server Components fetch data directly
// The cache option controls whether data is cached or fetched fresh on each request
// Tailwind CSS classes are used for styling (included by default in Next.js)