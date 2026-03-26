import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

const port = process.env.PORT?.trim() || '3000';
const envLocalPath = path.join(process.cwd(), '.env.local');

const isPrivateIpv4 = (value) => {
  if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(value)) return false;

  const [first, second] = value.split('.').map((segment) => Number(segment));
  if ([first, second].some((segment) => Number.isNaN(segment))) return false;

  return (
    first === 10 ||
    first === 127 ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168)
  );
};

const collectLanIpv4Addresses = () => {
  const values = new Set();

  Object.values(os.networkInterfaces()).forEach((networkInterface) => {
    networkInterface?.forEach((address) => {
      if (!address || address.internal || address.family !== 'IPv4') return;
      const normalized = address.address.replace(/^::ffff:/, '').split('%')[0] ?? '';
      if (!normalized || !isPrivateIpv4(normalized)) return;
      values.add(normalized);
    });
  });

  return Array.from(values).sort();
};

const rawArgs = process.argv.slice(2);
const nextArgs = [];
let useLanAuth = false;

for (let index = 0; index < rawArgs.length; index += 1) {
  const arg = rawArgs[index];

  if (arg === '--lan-auth') {
    useLanAuth = true;
    continue;
  }

  nextArgs.push(arg);
}

const lanIps = collectLanIpv4Addresses();
const lanUrls = lanIps.map((ip) => `http://${ip}:${port}`);
const primaryLanIp = lanIps[0] ?? null;

const childEnv = { ...process.env };
let originalEnvLocal = null;
let envLocalPatched = false;

const upsertEnvValue = (content, key, value) => {
  const line = `${key}=${value}`;
  const pattern = new RegExp(`^${key}=.*$`, 'm');
  if (pattern.test(content)) {
    return content.replace(pattern, line);
  }
  const suffix = content.endsWith('\n') ? '' : '\n';
  return `${content}${suffix}${line}\n`;
};

const restoreEnvLocal = () => {
  if (!envLocalPatched || originalEnvLocal == null) return;
  fs.writeFileSync(envLocalPath, originalEnvLocal, 'utf8');
  envLocalPatched = false;
};

if (useLanAuth) {
  if (!primaryLanIp) {
    console.error('No private LAN IPv4 address detected. Cannot enable LAN auth mode.');
    process.exit(1);
  }

  originalEnvLocal = fs.readFileSync(envLocalPath, 'utf8');

  const baseUrl = `http://${primaryLanIp}:${port}`;
  const authUrl = `${baseUrl}/api/auth`;

  let nextEnvLocal = upsertEnvValue(originalEnvLocal, 'NEXTAUTH_URL', baseUrl);
  nextEnvLocal = upsertEnvValue(nextEnvLocal, 'AUTH_URL', authUrl);

  fs.writeFileSync(envLocalPath, nextEnvLocal, 'utf8');
  envLocalPatched = true;

  childEnv.NEXTAUTH_URL = baseUrl;
  childEnv.AUTH_URL = authUrl;
}

console.log('');
console.log('LAN URLs:');
if (lanUrls.length > 0) {
  lanUrls.forEach((url) => console.log(`  ${url} (Use this URL on phone)`));
} else {
  console.log('  No private IPv4 address detected.');
}

console.log('');

if (useLanAuth && primaryLanIp) {
  console.log(`Temporarily set NEXTAUTH_URL to http://${primaryLanIp}:${port}`);
  console.log('This will be restored to your original .env.local values when the dev server stops.');
  console.log('');
}

const nextBinary = path.join(
  process.cwd(),
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'next.cmd' : 'next',
);

const child = spawn(
  nextBinary,
  ['dev', '--turbopack', '-H', '0.0.0.0', ...nextArgs],
  {
    stdio: 'inherit',
    env: childEnv,
    shell: process.platform === 'win32',
  },
);

const shutdownChild = (signal) => {
  if (!child.killed) {
    child.kill(signal);
  }
};

['SIGINT', 'SIGTERM', 'SIGHUP'].forEach((signal) => {
  process.on(signal, () => {
    shutdownChild(signal);
  });
});

child.on('exit', (code, signal) => {
  restoreEnvLocal();
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});

child.on('error', (error) => {
  restoreEnvLocal();
  console.error('Failed to start Next.js dev server:', error);
  process.exit(1);
});
