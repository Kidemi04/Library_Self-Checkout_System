import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import ShimmerButton from "@/app/ui/magic-ui/shimmer-button";
 
describe('Shimmer Button', () => {
  // Render the Button
  it('renders the button', () => {
    render(<ShimmerButton>Button1</ShimmerButton>)
  
    expect(
      screen.getByRole('button', { name: /button1/i })
    ).toBeInTheDocument()
  })

  // Button Children will show
  it('renders children content', () =>{
    render(<ShimmerButton>Button2</ShimmerButton>)

    expect(screen.getByText('Button2')).toBeInTheDocument()
  })
})