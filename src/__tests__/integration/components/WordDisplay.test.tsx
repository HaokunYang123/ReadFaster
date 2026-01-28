/**
 * Integration tests for WordDisplay component
 * Covers: INTG-05 (pivot rendering), INTG-08 (multi-language)
 *
 * Tests verify:
 * - Pivot letter rendering with correct highlighting
 * - Click-to-pause and keyboard interactions
 * - Multi-language text rendering (CJK, RTL, emoji)
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { WordDisplay } from '@/components/WordDisplay'
import { CJK_WORDS, RTL_WORDS, EMOJI_WORDS } from '@/test-utils/fixtures'

// Mock useSettings hook
vi.mock('@/hooks/useSettings', () => ({
  useSettings: vi.fn(() => ({
    settings: {
      fontFamily: 'monospace',
      fontWeight: 'medium',
      fontSize: 'medium',
      pivotColor: '#FF0000',
      showPivotHighlight: true,
    },
    updateSettings: vi.fn(),
    resetSettings: vi.fn(),
    isLoading: false,
  })),
}))

// Import after mocking so we can control the mock
import { useSettings } from '@/hooks/useSettings'

describe('WordDisplay component', () => {
  // Create mock containerRef that simulates DOM element
  const createMockContainerRef = (width = 800) => ({
    current: {
      offsetWidth: width,
    },
  }) as React.RefObject<HTMLDivElement>

  const mockOnPause = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset the useSettings mock to default
    vi.mocked(useSettings).mockReturnValue({
      settings: {
        fontFamily: 'monospace',
        fontWeight: 'medium',
        fontSize: 'medium',
        pivotColor: '#FF0000',
        showPivotHighlight: true,
      },
      updateSettings: vi.fn(),
      resetSettings: vi.fn(),
      isLoading: false,
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  // ============================================================================
  // INTG-05: Pivot Rendering Tests
  // ============================================================================

  describe('pivot rendering (INTG-05)', () => {
    it('renders word with before/pivot/after structure', () => {
      const containerRef = createMockContainerRef()

      render(
        <WordDisplay
          word="hello"
          containerRef={containerRef}
          onPause={mockOnPause}
        />
      )

      // Verify all three parts exist
      const beforeElement = document.querySelector('.before-pivot')
      const pivotElement = document.querySelector('.pivot')
      const afterElement = document.querySelector('.after-pivot')

      expect(beforeElement).toBeInTheDocument()
      expect(pivotElement).toBeInTheDocument()
      expect(afterElement).toBeInTheDocument()
    })

    it('renders pivot character at correct position', () => {
      const containerRef = createMockContainerRef()

      // "Reading" (7 chars) - pivot index should be 2, pivot is "a"
      render(
        <WordDisplay
          word="Reading"
          containerRef={containerRef}
          onPause={mockOnPause}
        />
      )

      const pivotElement = document.querySelector('.pivot')
      expect(pivotElement).toHaveTextContent('a')
    })

    it('displays "Ready to read" when word is empty', () => {
      const containerRef = createMockContainerRef()

      render(
        <WordDisplay
          word=""
          containerRef={containerRef}
          onPause={mockOnPause}
        />
      )

      expect(screen.getByText('Ready to read')).toBeInTheDocument()
    })

    it('renders complete word parts correctly', () => {
      const containerRef = createMockContainerRef()

      // "hello" (5 chars) - pivot at index 1, so before="h", pivot="e", after="llo"
      render(
        <WordDisplay
          word="hello"
          containerRef={containerRef}
          onPause={mockOnPause}
        />
      )

      const beforeElement = document.querySelector('.before-pivot')
      const pivotElement = document.querySelector('.pivot')
      const afterElement = document.querySelector('.after-pivot')

      expect(beforeElement).toHaveTextContent('h')
      expect(pivotElement).toHaveTextContent('e')
      expect(afterElement).toHaveTextContent('llo')
    })

    it('applies no-highlight class when showPivotHighlight is false', () => {
      vi.mocked(useSettings).mockReturnValue({
        settings: {
          fontFamily: 'monospace',
          fontWeight: 'medium',
          fontSize: 'medium',
          pivotColor: '#FF0000',
          showPivotHighlight: false, // Disabled
        },
        updateSettings: vi.fn(),
        resetSettings: vi.fn(),
        isLoading: false,
      })

      const containerRef = createMockContainerRef()

      render(
        <WordDisplay
          word="hello"
          containerRef={containerRef}
          onPause={mockOnPause}
        />
      )

      const wordDisplay = document.querySelector('.word-display')
      expect(wordDisplay).toHaveClass('no-highlight')
    })

    it('does not apply no-highlight class when showPivotHighlight is true', () => {
      const containerRef = createMockContainerRef()

      render(
        <WordDisplay
          word="hello"
          containerRef={containerRef}
          onPause={mockOnPause}
        />
      )

      const wordDisplay = document.querySelector('.word-display')
      expect(wordDisplay).not.toHaveClass('no-highlight')
    })
  })

  // ============================================================================
  // Interaction Tests
  // ============================================================================

  describe('user interactions', () => {
    it('calls onPause when word display clicked', () => {
      const containerRef = createMockContainerRef()

      render(
        <WordDisplay
          word="hello"
          containerRef={containerRef}
          onPause={mockOnPause}
        />
      )

      const wordDisplay = document.querySelector('.word-display')
      fireEvent.click(wordDisplay!)

      expect(mockOnPause).toHaveBeenCalledTimes(1)
    })

    it('calls onPause when Enter pressed', () => {
      const containerRef = createMockContainerRef()

      render(
        <WordDisplay
          word="hello"
          containerRef={containerRef}
          onPause={mockOnPause}
        />
      )

      const wordDisplay = document.querySelector('.word-display')
      fireEvent.keyDown(wordDisplay!, { key: 'Enter' })

      expect(mockOnPause).toHaveBeenCalledTimes(1)
    })

    it('calls onPause when Space pressed', () => {
      const containerRef = createMockContainerRef()

      render(
        <WordDisplay
          word="hello"
          containerRef={containerRef}
          onPause={mockOnPause}
        />
      )

      const wordDisplay = document.querySelector('.word-display')
      fireEvent.keyDown(wordDisplay!, { key: ' ' })

      expect(mockOnPause).toHaveBeenCalledTimes(1)
    })

    it('calls onPause when empty state clicked', () => {
      const containerRef = createMockContainerRef()

      render(
        <WordDisplay
          word=""
          containerRef={containerRef}
          onPause={mockOnPause}
        />
      )

      const wordDisplay = screen.getByText('Ready to read')
      fireEvent.click(wordDisplay)

      expect(mockOnPause).toHaveBeenCalledTimes(1)
    })

    it('does not call onPause when other keys pressed', () => {
      const containerRef = createMockContainerRef()

      render(
        <WordDisplay
          word="hello"
          containerRef={containerRef}
          onPause={mockOnPause}
        />
      )

      const wordDisplay = document.querySelector('.word-display')
      fireEvent.keyDown(wordDisplay!, { key: 'Escape' })
      fireEvent.keyDown(wordDisplay!, { key: 'Tab' })
      fireEvent.keyDown(wordDisplay!, { key: 'a' })

      expect(mockOnPause).not.toHaveBeenCalled()
    })

    it('has proper accessibility attributes', () => {
      const containerRef = createMockContainerRef()

      render(
        <WordDisplay
          word="hello"
          containerRef={containerRef}
          onPause={mockOnPause}
        />
      )

      const wordDisplay = document.querySelector('.word-display')
      expect(wordDisplay).toHaveAttribute('role', 'button')
      expect(wordDisplay).toHaveAttribute('tabIndex', '0')
    })
  })

  // ============================================================================
  // INTG-08: Multi-Language Rendering Tests (Smoke Tests)
  // ============================================================================

  describe('multi-language rendering (INTG-08)', () => {
    it('renders CJK text without error', () => {
      const containerRef = createMockContainerRef()

      // Japanese word: '日本語'
      expect(() => {
        render(
          <WordDisplay
            word={CJK_WORDS[0]}
            containerRef={containerRef}
            onPause={mockOnPause}
          />
        )
      }).not.toThrow()

      // Verify pivot element exists (render successful)
      const pivotElement = document.querySelector('.pivot')
      expect(pivotElement).toBeInTheDocument()
    })

    it('renders RTL text without error', () => {
      const containerRef = createMockContainerRef()

      // Arabic word: 'مرحبا'
      expect(() => {
        render(
          <WordDisplay
            word={RTL_WORDS[0]}
            containerRef={containerRef}
            onPause={mockOnPause}
          />
        )
      }).not.toThrow()

      // Verify pivot element exists
      const pivotElement = document.querySelector('.pivot')
      expect(pivotElement).toBeInTheDocument()
    })

    it('renders emoji without error', () => {
      const containerRef = createMockContainerRef()

      // Waving hand emoji: '👋'
      expect(() => {
        render(
          <WordDisplay
            word={EMOJI_WORDS[0]}
            containerRef={containerRef}
            onPause={mockOnPause}
          />
        )
      }).not.toThrow()

      // Verify component mounted (word-display exists)
      const wordDisplay = document.querySelector('.word-display')
      expect(wordDisplay).toBeInTheDocument()
    })

    it('renders Korean text without error', () => {
      const containerRef = createMockContainerRef()

      // Korean word: '한국어'
      render(
        <WordDisplay
          word={CJK_WORDS[1]}
          containerRef={containerRef}
          onPause={mockOnPause}
        />
      )

      const pivotElement = document.querySelector('.pivot')
      expect(pivotElement).toBeInTheDocument()
    })

    it('renders Hebrew text without error', () => {
      const containerRef = createMockContainerRef()

      // Hebrew word: 'שלום'
      render(
        <WordDisplay
          word={RTL_WORDS[1]}
          containerRef={containerRef}
          onPause={mockOnPause}
        />
      )

      const pivotElement = document.querySelector('.pivot')
      expect(pivotElement).toBeInTheDocument()
    })

    it('renders complex emoji without error', () => {
      const containerRef = createMockContainerRef()

      // Party popper emoji: '🎉'
      render(
        <WordDisplay
          word={EMOJI_WORDS[2]}
          containerRef={containerRef}
          onPause={mockOnPause}
        />
      )

      const wordDisplay = document.querySelector('.word-display')
      expect(wordDisplay).toBeInTheDocument()
    })
  })

  // ============================================================================
  // CSS Variable Tests
  // ============================================================================

  describe('CSS custom properties', () => {
    it('sets pivot color CSS variable from settings', () => {
      vi.mocked(useSettings).mockReturnValue({
        settings: {
          fontFamily: 'monospace',
          fontWeight: 'medium',
          fontSize: 'medium',
          pivotColor: '#00FF00', // Green
          showPivotHighlight: true,
        },
        updateSettings: vi.fn(),
        resetSettings: vi.fn(),
        isLoading: false,
      })

      const containerRef = createMockContainerRef()

      render(
        <WordDisplay
          word="hello"
          containerRef={containerRef}
          onPause={mockOnPause}
        />
      )

      const wordDisplay = document.querySelector('.word-display') as HTMLElement
      expect(wordDisplay.style.getPropertyValue('--pivot-color')).toBe('#00FF00')
    })
  })
})
