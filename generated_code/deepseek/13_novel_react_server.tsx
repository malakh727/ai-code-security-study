// Here's a simple React Server Component that fetches a list of products, along with the required packages:

// Required Packages
// json
// {
//   "dependencies": {
//     "react": "^18.2.0",
//     "react-dom": "^18.2.0",
//     "next": "^14.0.0"
//   }
// }
// Note: React Server Components are officially supported in Next.js 13+ and require the app router.

// Product List Server Component

// app/products/page.js
async function getProducts() {
  // In a real app, this would be a database query or API call
  // Simulating a delay for demo purposes
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return [
    { id: 1, name: 'Laptop', price: 999.99, category: 'Electronics' },
    { id: 2, name: 'Coffee Mug', price: 19.99, category: 'Home' },
    { id: 3, name: 'Running Shoes', price: 89.99, category: 'Sports' },
    { id: 4, name: 'Desk Lamp', price: 49.99, category: 'Home' },
    { id: 5, name: 'Wireless Headphones', price: 199.99, category: 'Electronics' },
  ];
}

export default async function ProductsPage() {
  const products = await getProducts();
  
  return (
    <div className="container">
      <h1>Products</h1>
      <p className="description">
        This is a React Server Component that fetches data on the server.
      </p>
      
      <div className="products-grid">
        {products.map(product => (
          <div key={product.id} className="product-card">
            <h2>{product.name}</h2>
            <p className="price">${product.price.toFixed(2)}</p>
            <p className="category">{product.category}</p>
            <button className="add-to-cart">Add to Cart</button>
          </div>
        ))}
      </div>
    </div>
  );
}
// With Real API Fetch (Alternative)
// app/products/page.js
export default async function ProductsPage() {
  // Fetch data from an external API
  const response = await fetch('https://api.example.com/products', {
    cache: 'no-store' // or 'force-cache' for static data
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }
  
  const products = await response.json();
  
  return (
    <div>
      <h1>Products</h1>
      <ul>
        {products.map(product => (
          <li key={product.id}>
            <h2>{product.title}</h2>
            <p>${product.price}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
// Additional Package for Styling (Optional)
// If you want to add CSS styling:

// json
// {
//   "devDependencies": {
//     "autoprefixer": "^10.0.0",
//     "postcss": "^8.0.0",
//     "tailwindcss": "^3.0.0"
//   }
// }
// Project Structure
// text
// my-app/
// ├── app/
// │   ├── layout.js
// │   └── products/
// │       └── page.js
// ├── package.json
// └── next.config.js
// Key Points:
// React Server Components (RSCs) are async by default and can directly use await

// No useEffect or useState needed - data fetching happens on the server

// No client-side JavaScript is sent to the browser for RSCs

// Next.js 13+ with App Router is required

// Data fetching happens at build time or request time depending on your caching strategy

// To Run:
// bash
// # Create new Next.js app
// npx create-next-app@latest my-app

// # Navigate to project
// cd my-app

// # Run development server
// npm run dev
// The server component will render on the server, and only the HTML will be sent to the client, making it very efficient for data fetching scenarios.