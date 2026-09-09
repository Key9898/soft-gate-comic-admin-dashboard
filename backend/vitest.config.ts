import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    env: {
      DATABASE_URL: '',
      JWT_SECRET: 'change-me-not-a-real-secret',
      R2_ACCOUNT_ID: '',
      R2_ACCESS_KEY_ID: 'fake',
      R2_SECRET_ACCESS_KEY: 'fake',
      R2_BUCKET: '',
      R2_ENDPOINT: '',
      R2_PUBLIC_BASE_URL: '',
      R2_KEY_PREFIX: 'admin',
      MEDIA_PUBLIC_BASE_URL: 'http://localhost:3000',
      CORS_ORIGINS: 'http://localhost:5173',
      BREVO_API_KEY: 'fake',
      BREVO_SENDER_EMAIL: '',
      BREVO_SENDER_NAME: 'SoftGate Comic',
      ADMIN_APP_URL: 'http://localhost:5173',
      BOOTSTRAP_ADMIN_EMAIL: '',
      BOOTSTRAP_ADMIN_PASSWORD: '',
      OIDC_ISSUER: '',
      OIDC_CLIENT_ID: 'fake',
      OIDC_CLIENT_SECRET: 'fake',
    },
  },
});
