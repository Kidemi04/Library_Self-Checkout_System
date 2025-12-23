import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import HomePage from '@/app/page'

jest.mock('next/cache', () => ({
  unstable_noStore: jest.fn(),
}));

jest.mock('next/image', () => ({
	__esModule: true,
  default: ({ src, alt }) => <img src={src} alt={alt} />,
}))

jest.mock('framer-motion', () => ({
  ...jest.requireActual('framer-motion'),
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }) => <p {...props}>{children}</p>,
    span: ({ children, ...props }) => <span {...props}>{children}</span>,
    section: ({ children, ...props }) => <section {...props}>{children}</section>,
    footer: ({ children, ...props }) => <footer {...props}>{children}</footer>,
    header: ({ children, ...props }) => <header {...props}>{children}</header>,
  },
  useInView: () => true,
  AnimatePresence: ({ children }) => children,
}));

describe('Home Page', () => {
  it('Render the Heading 1', () => {
    render(<HomePage/>);

    const heading = screen.getByRole('heading', {
      name: /swinburne library/i,
    })

    expect(heading).toBeInTheDocument();
  })
})