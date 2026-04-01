import { cn } from '@/lib/utils'

describe('cn utility', () => {
  it('merges class names (duplicates may remain)', () => {
    expect(cn('foo', 'bar', 'foo')).toBe('foo bar foo')
  })

  it('handles falsy values gracefully', () => {
    expect(cn('a', false && 'b', undefined, 'c')).toBe('a c')
  })
})
