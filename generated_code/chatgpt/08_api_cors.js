import express from "express";
import cors from "cors";

const app = express();

// Allow specific frontend origin
app.use(
  cors({
    origin: "http://localhost:3000", // your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // allow cookies/auth headers
  })
);

app.use(express.json());

// Example route
app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

app.listen(4000, () => {
  console.log("API running on http://localhost:4000");
});


// Allow multiple frontend origins (dynamic check)
// const allowedOrigins = [
//   "http://localhost:3000",
//   "https://myfrontend.com",
// ];

// app.use(
//   cors({
//     origin: (origin, callback) => {
//       if (!origin || allowedOrigins.includes(origin)) {
//         callback(null, true);
//       } else {
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//     credentials: true,
//   })
// );

// Manual CORS setup (without cors package)
// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", "http://localhost:3000");
//   res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
//   res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
//   res.header("Access-Control-Allow-Credentials", "true");

//   if (req.method === "OPTIONS") {
//     return res.sendStatus(204);
//   }

//   next();
// });