// Environment Configuration
export const config = {
  // API Endpoints
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
    uyap: {
      baseUrl: process.env.UYAP_API_URL || 'https://uyap.gov.tr/api',
      timeout: parseInt(process.env.UYAP_TIMEOUT || '30000'),
    },
    buyapar: {
      baseUrl: process.env.BUYAPAR_API_URL || 'https://buyapar.com/api',
      timeout: parseInt(process.env.BUYAPAR_TIMEOUT || '30000'),
    },
  },

  // Database Configuration (SQL Server)
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '1433'),
    database: process.env.DB_NAME || 'IcraMatik',
    user: process.env.DB_USER || '',
    password: process.env.DB_PASSWORD || '',
    options: {
      encrypt: process.env.DB_ENCRYPT === 'true',
      trustServerCertificate: process.env.DB_TRUST_CERT === 'true',
    },
  },

  // Cache Configuration
  cache: {
    ttl: parseInt(process.env.CACHE_TTL || '300'), // 5 minutes default
    maxSize: parseInt(process.env.CACHE_MAX_SIZE || '1000'),
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '60000'), // 1 minute
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  },

  // Feature Flags
  features: {
    uyapIntegration: process.env.FEATURE_UYAP === 'true',
    buyaparIntegration: process.env.FEATURE_BUYAPAR === 'true',
    smsIntegration: process.env.FEATURE_SMS === 'true',
    realtimeSync: process.env.FEATURE_REALTIME === 'true',
  },
};

export type Config = typeof config;
