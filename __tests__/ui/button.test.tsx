import * as React from 'react'
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button component', () => {
  it('renders with default text and base styles', () => {
    render(<Button>Click me</Button>)
    const btn = screen.getByRole('button', { name: /click me/i })
    expect(btn).toBeInTheDocument()
    expect(btn).toHaveClass('inline-flex')
  })

  it('applies variant and size classes correctly', () => {
    render(
      <Button variant="destructive" size="lg">
        Delete
      </Button>
    )
    const btn = screen.getByRole('button', { name: /delete/i })
    expect(btn).toHaveClass('bg-destructive')
    expect(btn).toHaveClass('h-10')
  })
})
