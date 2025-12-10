// 📦 Required Libraries & Packages

// Use Next.js with the App Router (Server Components are built-in):

// npm install next@14.2.11 react@18.3.1 react-dom@18.3.1


// Optional (if you want Typescript):

// npm install -D typescript@5.5.4 @types/react@18.3.3 @types/node@20.14.10

// This is a React Server Component by default in Next.js App Router

type Product = {
  id: number;
  title: string;
  price: number;
};

async function getProducts(): Promise<Product[]> {
  const res = await fetch("https://fakestoreapi.com/products", {
    // Ensure the data is always fresh
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch products");
  }

  return res.json();
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <main style={{ padding: "24px" }}>
      <h1>Products</h1>

      <ul style={{ marginTop: "16px" }}>
        {products.map((product) => (
          <li key={product.id} style={{ marginBottom: "12px" }}>
            <strong>{product.title}</strong>
            <div>${product.price}</div>
          </li>
        ))}
      </ul>
    </main>
  );
}
