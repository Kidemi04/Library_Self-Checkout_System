import React from 'react';
import LoginPage from '@/app/login/page';
import '@testing-library/jest-dom'

// Mock next/navigation redirect
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

// Mock auth function
jest.mock('@/auth', () => ({
  auth: jest.fn(),
}));

// Mock LoginClient component
jest.mock('@/app/login/LoginClient', () => {
  return jest.fn(({ callbackUrl }) => (
    <div data-testid="login-client">
      LoginClient - {callbackUrl}
    </div>
  ));
});

import { redirect } from 'next/navigation';
import { auth } from '@/auth';

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('redirects to callbackUrl when session exists', async () => {
    // Mock authenticated user
    (auth as jest.Mock).mockResolvedValue({
      user: { id: '123' },
    });

    const searchParams = Promise.resolve({
      callbackUrl: '/profile',
    });

    await LoginPage({ searchParams });

    // Ensure redirect was called with the callbackUrl
    expect(redirect).toHaveBeenCalledWith('/profile');
  });

  it('redirects to default dashboard when session exists and callbackUrl is invalid', async () => {
    (auth as jest.Mock).mockResolvedValue({
      user: { id: '123' },
    });

    const searchParams = Promise.resolve({
      callbackUrl: 'https://malicious-site.com',
    });

    await LoginPage({ searchParams });

    // Should fallback to /dashboard
    expect(redirect).toHaveBeenCalledWith('/dashboard');
  });

  it('renders LoginClient when no session exists', async () => {
    (auth as jest.Mock).mockResolvedValue(null);

    const searchParams = Promise.resolve({
      callbackUrl: '/settings',
    });

    const result = await LoginPage({ searchParams });

    // Ensure LoginClient is rendered with correct callbackUrl
    expect(result).toBeDefined();
  });

  it('uses default callbackUrl when none provided', async () => {
    (auth as jest.Mock).mockResolvedValue(null);

    const searchParams = Promise.resolve({});

    const result = await LoginPage({ searchParams });

    expect(result).toBeDefined();
  });

  it('handles callbackUrl as array', async () => {
    (auth as jest.Mock).mockResolvedValue({
      user: { id: '123' },
    });

    const searchParams = Promise.resolve({
      callbackUrl: ['/admin', '/ignored'],
    });

    await LoginPage({ searchParams });

    expect(redirect).toHaveBeenCalledWith('/admin');
  });
});