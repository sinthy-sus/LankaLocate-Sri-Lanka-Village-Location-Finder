import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'lankalocate_jwt_secret_key_2026_super_secure',
  dbType: process.env.DB_TYPE || (process.env.DATABASE_URL ? 'postgres' : 'sqlite'),
  databaseUrl: process.env.DATABASE_URL || '',
  sqlitePath: process.env.SQLITE_PATH || './lankalocate.db',
  adminDefaultUsername: process.env.ADMIN_USERNAME || 'admin',
  adminDefaultEmail: process.env.ADMIN_EMAIL || 'admin@lankalocate.lk',
  adminDefaultPassword: process.env.ADMIN_PASSWORD || 'Admin@123',
};
