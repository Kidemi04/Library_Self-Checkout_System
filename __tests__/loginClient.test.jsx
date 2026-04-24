import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import LoginClient from '@/app/login/loginClient'

const mockSignIn = jest.fn(() => Promise.resolve({}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ priority, ...props }) => {
    return <img {...props} />;
  },
}));

jest.mock('next-auth/react', () => ({
  signIn: (...args) => mockSignIn(...args),
}));

jest.mock('@/app/ui/magicUi/blurFade', () => ({
  __esModule: true,
  default: ({ children }) => <div>{children}</div>,
}));

jest.mock('@/app/ui/magicUi/glassCard', () => ({
  __esModule: true,
  default: ({ children, className }) => <div className={className}>{children}</div>,
}));

describe('Login Page', () => {
	it('Render Title', () => {
		render(<LoginClient callbackUrl="/" />)
		
		const heading = screen.getByRole('heading', { name: /Swinburne Sarawak Library/i });
		expect(heading).toBeInTheDocument();
	})

	it('Render Logo', () => {
		render(<LoginClient callbackUrl="/" />)

		const logo = screen.getByAltText(/Swinburne logo/i);
		expect(logo).toBeInTheDocument();
	})

	it('Render Login Button', () => {
		render(<LoginClient callbackUrl="/" />)

		const button = screen.getByRole('button');
		expect(button).toHaveTextContent(/Sign in with Microsoft/i);
	})

	it('Triggle handleSignin logic when click the sign in button', async () => {
    render(<LoginClient callbackUrl='/dashboard'/>);

		const loginButton = screen.getByRole('button', { name: /Sign in with Microsoft/i });
		fireEvent.click(loginButton);

		await waitFor(() => {
			expect(mockSignIn).toHaveBeenCalledWith(
				'azure-ad',
				expect.objectContaining({
					callbackUrl: '/dashboard'
				}),
				expect.any(Object)
			);    });
	})
})