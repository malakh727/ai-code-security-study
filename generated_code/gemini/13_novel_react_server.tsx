// components/ProductList.tsx or app/page.tsx

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
}

// A Server Component must be an 'async' function if it fetches data.
async function getProducts(): Promise<Product[]> {
  // Use a mock API for demonstration. In a real app, this would be your
  // internal API, database client, or a third-party service.
  const response = await fetch('https://dummyjson.com/products?limit=5', {
    // Optional: Next.js and similar frameworks automatically cache 'fetch' requests
    // by default on the server. Use 'no-store' to ensure data is fresh on every request.
    // cache: 'no-store',
  });

  if (!response.ok) {
    // This error will be handled by the nearest Next.js 'error.js' boundary
    // or by a React error boundary.
    throw new Error('Failed to fetch product data');
  }

  const data = await response.json();
  // Assuming the API returns an object with a 'products' array
  return data.products;
}

export default async function ProductList() {
  const products = await getProducts();

  return (
    <section>
      <h1>🛒 Latest Products</h1>
      <ul>
        {products.map((product) => (
          <li key={product.id}>
            <h2>{product.name}</h2>
            <p>**Price:** ${product.price.toFixed(2)}</p>
            <p>{product.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

// 🛠️ Required Libraries and PackagesA React Server Component that only performs data fetching using the standard fetch API does not require any external, non-React/non-framework libraries or packages to be installed, provided you are running in a modern, Server Components-enabled environment.The core dependencies are:PackagePurposeRecommended Version (or Range)reactThe core library for building components.^19.0.0 or higherreact-domThe DOM renderer for React.^19.0.0 or higherFrameworkRequired to enable the RSC runtime and API (e.g., handling the HTTP request, streaming, etc.)Next.js ^15.0.0 (with App Router)⚠️ Security Note on VersionsSince React Server Components are a relatively new feature, frameworks implementing them have specific version requirements. More importantly, recent critical security vulnerabilities (like CVE-2025-55182) have been disclosed. You should always use the latest patched versions for security:react and react-dom: 19.0.1 or higher.Next.js: 15.0.5 or higher (or the latest stable release for your minor version).In summary, if you are building with Next.js (the most common RSC framework):Bashnpm install react@^19.0.1 react-dom@^19.0.1 next@^15.0.5
// Would you like me to show you an example of how you would use a Client Component within this Server Component to add interactive features like an "Add to Cart" button?