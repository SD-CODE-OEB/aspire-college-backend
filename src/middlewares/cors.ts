import cors from "cors";

interface CorsOriginCallback {
  (err: Error | null, allow?: boolean): void;
}

interface CorsOptions {
  origin: (origin: string | undefined, callback: CorsOriginCallback) => void;
  credentials: boolean;
  methods: string[];
  allowedHeaders: string[];
  exposedHeaders: string[];
}

const corsOptions: CorsOptions = {
  origin: function (origin: string | undefined, callback: CorsOriginCallback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins: string[] = [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:5173", // Vite dev server
      "http://127.0.0.1:3000",
      "http://127.0.0.1:5173",
      "https://aspire-college-frontend.vercel.app",
      // Add your production frontend URL here
      // 'https://your-frontend-domain.com'
    ];

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // Enable credentials (cookies)
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-requested-with"],
  exposedHeaders: ["set-cookie"],
};

export const corsMiddleware = cors(corsOptions);
