/**
 * api-helpers.ts
 *
 * Direct Node.js fetch calls to the Apex API for test data lifecycle.
 * Use in beforeAll/afterAll to create and clean up test data without going through the browser.
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const API_URL = process.env.API_URL ?? 'https://acme.localhost:5000';

// Ignore self-signed cert in Node
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function getToken(email: string, password: string): Promise<string> {
  const res = await fetch(`${API_URL}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(`getToken: login failed for ${email} (${res.status})`);
  const data = await res.json() as { accessToken: string };
  return data.accessToken;
}

export async function getAdminToken(): Promise<string> {
  return getToken(
    process.env.TEST_ADMIN_EMAIL ?? 'admin@acme.com',
    process.env.TEST_ADMIN_PASSWORD ?? 'SecureAdminPass123!',
  );
}

// ── Generic helpers ───────────────────────────────────────────────────────────

function authHeaders(token: string): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function deleteEntity(token: string, relativeUrl: string): Promise<void> {
  const res = await fetch(`${API_URL}${relativeUrl}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  if (!res.ok && res.status !== 404) {
    throw new Error(`deleteEntity ${relativeUrl} failed: ${res.status}`);
  }
}

// ── Change Requests ───────────────────────────────────────────────────────────

export interface CreateChangeRequestData {
  title: string;
  description: string;
  changeType?: 'Standard' | 'Normal' | 'Emergency';
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  riskLevel?: 'Low' | 'Medium' | 'High' | 'Critical';
  impactAssessment?: string;
  rollbackPlan?: string;
  affectedSystems?: string;
}

export async function createChangeRequest(
  token: string,
  data: CreateChangeRequestData,
): Promise<string> {
  const body = {
    changeType: 'Standard',
    priority: 'Medium',
    riskLevel: 'Low',
    impactAssessment: 'Test impact assessment',
    rollbackPlan: 'Revert to previous version',
    affectedSystems: 'Test system',
    ...data,
  };

  const res = await fetch(`${API_URL}/api/change-requests`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`createChangeRequest failed: ${res.status} ${await res.text()}`);
  const result = await res.json() as { changeRequestId: string };
  return result.changeRequestId;
}

export async function deleteChangeRequest(token: string, id: string): Promise<void> {
  await deleteEntity(token, `/api/change-requests/${id}`);
}

export async function submitChangeRequest(token: string, id: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/change-requests/${id}/submit`, {
    method: 'POST',
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(`submitChangeRequest failed: ${res.status}`);
}

// ── Deployment Requests ───────────────────────────────────────────────────────

export interface CreateDeploymentRequestData {
  title: string;
  description: string;
  environment?: 'Development' | 'Staging' | 'UAT' | 'Production';
  priority?: 'Low' | 'Medium' | 'High' | 'Urgent';
  riskLevel?: 'Low' | 'Medium' | 'High' | 'Critical';
  affectedSystems?: string;
  rollbackPlan?: string;
}

export async function createDeploymentRequest(
  token: string,
  data: CreateDeploymentRequestData,
): Promise<string> {
  const body = {
    environment: 'Development',
    priority: 'Low',
    riskLevel: 'Low',
    affectedSystems: 'Test system',
    rollbackPlan: 'Revert to previous version',
    ...data,
  };

  const res = await fetch(`${API_URL}/api/deployment-requests`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`createDeploymentRequest failed: ${res.status} ${await res.text()}`);
  const result = await res.json() as { deploymentRequestId?: string; id?: string };
  return result.deploymentRequestId ?? result.id ?? '';
}

export async function deleteDeploymentRequest(token: string, id: string): Promise<void> {
  await deleteEntity(token, `/api/deployment-requests/${id}`);
}

// ── Users ─────────────────────────────────────────────────────────────────────

export interface CreateUserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  roles?: string[];
}

export async function createTestUser(token: string, data: CreateUserData): Promise<string> {
  const res = await fetch(`${API_URL}/api/admin/users`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`createTestUser failed: ${res.status} ${await res.text()}`);
  const result = await res.json() as { userId?: string; id?: string };
  return result.userId ?? result.id ?? '';
}

export async function deleteTestUser(token: string, id: string): Promise<void> {
  await deleteEntity(token, `/api/admin/users/${id}`);
}

// ── Departments ───────────────────────────────────────────────────────────────

export async function createDepartment(
  token: string,
  name: string,
  description = 'Test department',
): Promise<string> {
  const res = await fetch(`${API_URL}/api/departments`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ name, description }),
  });
  if (!res.ok) throw new Error(`createDepartment failed: ${res.status} ${await res.text()}`);
  const result = await res.json() as { departmentId?: string; id?: string };
  return result.departmentId ?? result.id ?? '';
}

export async function deleteDepartment(token: string, id: string): Promise<void> {
  await deleteEntity(token, `/api/departments/${id}`);
}
