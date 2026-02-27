import { FullConfig } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const API_URL = process.env.API_URL ?? 'https://acme.localhost:5000';
const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000';
const AUTH_DIR = path.resolve(__dirname, '.auth');

interface LoginResponse {
  accessToken: string;
  user: object;
}

async function loginAndSave(
  email: string,
  password: string,
  outputPath: string,
): Promise<void> {
  const res = await fetch(`${API_URL}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // Self-signed cert: Node 18+ supports this via env NODE_TLS_REJECT_UNAUTHORIZED
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `global-setup: Login failed for ${email} (${res.status}): ${body}`,
    );
  }

  const data = (await res.json()) as LoginResponse;

  const storageState = {
    cookies: [],
    origins: [
      {
        origin: BASE_URL,
        localStorage: [
          { name: 'apex_token', value: data.accessToken },
          { name: 'apex_user', value: JSON.stringify(data.user) },
        ],
      },
    ],
  };

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(storageState, null, 2));
  console.log(`  ✓ Auth state saved: ${path.relative(__dirname, outputPath)}`);
}

export default async function globalSetup(_config: FullConfig): Promise<void> {
  // Skip TLS verification for local self-signed cert
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

  fs.mkdirSync(AUTH_DIR, { recursive: true });

  console.log('\nglobal-setup: Authenticating test users...');

  // Admin — always required
  const adminEmail = process.env.TEST_ADMIN_EMAIL;
  const adminPassword = process.env.TEST_ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) {
    throw new Error(
      'global-setup: TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD must be set in .env',
    );
  }
  await loginAndSave(adminEmail, adminPassword, path.join(AUTH_DIR, 'admin.json'));

  // Manager — optional (create user manually or via admin first)
  const managerEmail = process.env.TEST_MANAGER_EMAIL;
  const managerPassword = process.env.TEST_MANAGER_PASSWORD;
  if (managerEmail && managerPassword) {
    await loginAndSave(
      managerEmail,
      managerPassword,
      path.join(AUTH_DIR, 'manager.json'),
    );
  } else {
    // Fallback: copy admin state so manager-scoped projects don't fail on missing file
    fs.copyFileSync(
      path.join(AUTH_DIR, 'admin.json'),
      path.join(AUTH_DIR, 'manager.json'),
    );
    console.log('  ℹ  Manager credentials not set — using admin state for manager project');
  }

  // User — optional
  const userEmail = process.env.TEST_USER_EMAIL;
  const userPassword = process.env.TEST_USER_PASSWORD;
  if (userEmail && userPassword) {
    await loginAndSave(userEmail, userPassword, path.join(AUTH_DIR, 'user.json'));
  } else {
    fs.copyFileSync(
      path.join(AUTH_DIR, 'admin.json'),
      path.join(AUTH_DIR, 'user.json'),
    );
    console.log('  ℹ  User credentials not set — using admin state for user project');
  }

  console.log('global-setup: Done.\n');
}
