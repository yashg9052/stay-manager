
import express from "express";
import dotenv from "dotenv";
import cors from "cors"
import { connectDB } from "./config/db.js";
import flatsRouter from "./routes/flat.routes.js"
import roomsRouter     from './routes/room.routes.js';
import bedsRouter      from './routes/bed.routes.js';
import tenantsRouter   from './routes/tenant.routes.js';
import dashboardRouter   from './routes/dashboard.routes.js';
import { errorHandler } from "./middlewares/error.middleware.js";
dotenv.config();
const app = express();
app.use(cors());

app.use(express.json());
await connectDB()

app.get('/health', (_req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
);
 
app.use('/api/flats',     flatsRouter);
app.use('/api/rooms',     roomsRouter);
app.use('/api/beds',      bedsRouter);
app.use('/api/tenants',   tenantsRouter);
app.use('/api/dashboard', dashboardRouter);
app.use(errorHandler);
const PORT=process.env.PORT || 5000
app.listen(PORT, () => console.log("Server running"));