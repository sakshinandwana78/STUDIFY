import 'dotenv/config';

// Use dynamic config purely to load .env at build time.
// We return the base config (from app.json) unchanged.
export default ({ config }: { config: any }) => {
  return config;
};