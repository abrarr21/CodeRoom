import dotenv from "dotenv";

dotenv.config();

const env = {
  port: Number(process.env.PORT || 3000),
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/coderoom",
  JWT_SECRET: process.env.JWT_SECRET
};

export default env;