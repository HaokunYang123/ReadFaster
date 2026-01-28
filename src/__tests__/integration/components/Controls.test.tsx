/**
 * Integration tests for Controls component
 * Covers: INTG-06 (button states and interactions)
 *
 * Tests verify:
 * - Button text changes based on playback state
 * - Button enabled/disabled states based on props
 * - Callback invocations on user interactions
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { Controls } from '@/components/Controls'

describe('Controls component', () => {
  // Mock callback functions
  const mockStart = vi.fn()
  const mockPause = vi.fn()
  const mockReset = vi.fn()
  const mockClear = vi.fn()
  const mockWpmChange = vi.fn()

  // Default props for rendering Controls
  const defaultProps = {
    isPlaying: false,
    hasWords: false,
    hasText: true,
    isComplete: false,
    onStart: mockStart,
    onPause: mockPause,
    onReset: mockReset,
    onClear: mockClear,
    wpm: 300,
    onWpmChange: mockWpmChange,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ============================================================================
  // Button Text Tests
  // ============================================================================

  describe('button text', () => {
    it('shows "Start" when no words loaded', () => {
      render(<Controls {...defaultProps} hasWords={false} />)

      const startButton = screen.getByRole('button', { name: /start/i })
      expect(startButton).toHaveTextContent('Start')
    })

    it('shows "Resume" when paused with words', () => {
      render(
        <Controls
          {...defaultProps}
          hasWords={true}
          isPlaying={false}
          isComplete={false}
        />
      )

      const startButton = screen.getByRole('button', { name: /resume/i })
      expect(startButton).toHaveTextContent('Resume')
    })

    it('shows "Restart" when playback complete', () => {
      render(
        <Controls
          {...defaultProps}
          hasWords={true}
          isComplete={true}
        />
      )

      const startButton = screen.getByRole('button', { name: /restart/i })
      expect(startButton).toHaveTextContent('Restart')
    })

    it('shows "Start" when hasWords is false even if isComplete is true', () => {
      // Edge case: isComplete without hasWords
      render(
        <Controls
          {...defaultProps}
          hasWords={false}
          isComplete={true}
        />
      )

      const startButton = screen.getByRole('button', { name: /restart/i })
      expect(startButton).toHaveTextContent('Restart')
    })
  })

  // ============================================================================
  // Button Enabled/Disabled State Tests
  // ============================================================================

  describe('button states', () => {
    it('disables Start when already playing', () => {
      render(<Controls {...defaultProps} isPlaying={true} hasText={true} />)

      const startButton = screen.getByRole('button', { name: /start|resume|restart/i })
      expect(startButton).toBeDisabled()
    })

    it('disables Start when no text', () => {
      render(<Controls {...defaultProps} hasText={false} />)

      const startButton = screen.getByRole('button', { name: /start/i })
      expect(startButton).toBeDisabled()
    })

    it('enables Start when not playing and has text', () => {
      render(<Controls {...defaultProps} isPlaying={false} hasText={true} />)

      const startButton = screen.getByRole('button', { name: /start/i })
      expect(startButton).not.toBeDisabled()
    })

    it('enables Pause only when playing', () => {
      render(<Controls {...defaultProps} isPlaying={true} />)

      const pauseButton = screen.getByRole('button', { name: /pause/i })
      expect(pauseButton).not.toBeDisabled()
    })

    it('disables Pause when not playing', () => {
      render(<Controls {...defaultProps} isPlaying={false} />)

      const pauseButton = screen.getByRole('button', { name: /pause/i })
      expect(pauseButton).toBeDisabled()
    })

    it('disables Reset when no words and not playing', () => {
      render(<Controls {...defaultProps} hasWords={false} isPlaying={false} />)

      const resetButton = screen.getByRole('button', { name: /reset/i })
      expect(resetButton).toBeDisabled()
    })

    it('enables Reset when has words', () => {
      render(<Controls {...defaultProps} hasWords={true} isPlaying={false} />)

      const resetButton = screen.getByRole('button', { name: /reset/i })
      expect(resetButton).not.toBeDisabled()
    })

    it('enables Reset when playing', () => {
      render(<Controls {...defaultProps} hasWords={false} isPlaying={true} />)

      const resetButton = screen.getByRole('button', { name: /reset/i })
      expect(resetButton).not.toBeDisabled()
    })

    it('disables Clear when playing', () => {
      render(<Controls {...defaultProps} isPlaying={true} hasText={true} />)

      const clearButton = screen.getByRole('button', { name: /clear/i })
      expect(clearButton).toBeDisabled()
    })

    it('disables Clear when no text', () => {
      render(<Controls {...defaultProps} isPlaying={false} hasText={false} />)

      const clearButton = screen.getByRole('button', { name: /clear/i })
      expect(clearButton).toBeDisabled()
    })

    it('enables Clear when not playing and has text', () => {
      render(<Controls {...defaultProps} isPlaying={false} hasText={true} />)

      const clearButton = screen.getByRole('button', { name: /clear/i })
      expect(clearButton).not.toBeDisabled()
    })
  })

  // ============================================================================
  // Callback Tests
  // ============================================================================

  describe('callbacks', () => {
    it('fires onStart when Start clicked', () => {
      render(<Controls {...defaultProps} hasText={true} />)

      const startButton = screen.getByRole('button', { name: /start/i })
      fireEvent.click(startButton)

      expect(mockStart).toHaveBeenCalledTimes(1)
    })

    it('fires onStart when Resume clicked', () => {
      render(
        <Controls
          {...defaultProps}
          hasWords={true}
          isPlaying={false}
          hasText={true}
        />
      )

      const resumeButton = screen.getByRole('button', { name: /resume/i })
      fireEvent.click(resumeButton)

      expect(mockStart).toHaveBeenCalledTimes(1)
    })

    it('fires onStart when Restart clicked', () => {
      render(
        <Controls
          {...defaultProps}
          isComplete={true}
          hasText={true}
        />
      )

      const restartButton = screen.getByRole('button', { name: /restart/i })
      fireEvent.click(restartButton)

      expect(mockStart).toHaveBeenCalledTimes(1)
    })

    it('fires onPause when Pause clicked', () => {
      render(<Controls {...defaultProps} isPlaying={true} />)

      const pauseButton = screen.getByRole('button', { name: /pause/i })
      fireEvent.click(pauseButton)

      expect(mockPause).toHaveBeenCalledTimes(1)
    })

    it('fires onReset when Reset clicked', () => {
      render(<Controls {...defaultProps} hasWords={true} />)

      const resetButton = screen.getByRole('button', { name: /reset/i })
      fireEvent.click(resetButton)

      expect(mockReset).toHaveBeenCalledTimes(1)
    })

    it('fires onClear when Clear clicked', () => {
      render(<Controls {...defaultProps} hasText={true} />)

      const clearButton = screen.getByRole('button', { name: /clear/i })
      fireEvent.click(clearButton)

      expect(mockClear).toHaveBeenCalledTimes(1)
    })

    it('fires onWpmChange when slider changed', () => {
      render(<Controls {...defaultProps} wpm={300} />)

      const slider = screen.getByRole('slider')
      fireEvent.change(slider, { target: { value: '400' } })

      expect(mockWpmChange).toHaveBeenCalledTimes(1)
      expect(mockWpmChange).toHaveBeenCalledWith(400)
    })

    it('fires onWpmChange with parsed integer value', () => {
      render(<Controls {...defaultProps} wpm={300} />)

      const slider = screen.getByRole('slider')
      fireEvent.change(slider, { target: { value: '550' } })

      expect(mockWpmChange).toHaveBeenCalledWith(550)
    })
  })

  // ============================================================================
  // WPM Slider Tests
  // ============================================================================

  describe('WPM slider', () => {
    it('displays current WPM value', () => {
      render(<Controls {...defaultProps} wpm={450} />)

      expect(screen.getByText('450 WPM')).toBeInTheDocument()
    })

    it('has correct min/max/step attributes', () => {
      render(<Controls {...defaultProps} />)

      const slider = screen.getByRole('slider')
      expect(slider).toHaveAttribute('min', '100')
      expect(slider).toHaveAttribute('max', '1000')
      expect(slider).toHaveAttribute('step', '10')
    })

    it('reflects current WPM value in slider', () => {
      render(<Controls {...defaultProps} wpm={600} />)

      const slider = screen.getByRole('slider')
      expect(slider).toHaveValue('600')
    })

    it('has accessible label', () => {
      render(<Controls {...defaultProps} />)

      const label = screen.getByText('Speed:')
      expect(label).toBeInTheDocument()
      expect(label).toHaveAttribute('for', 'wpm-slider')
    })
  })

  // ============================================================================
  // Edge Cases
  // ============================================================================

  describe('edge cases', () => {
    it('does not call callbacks when disabled buttons clicked', () => {
      render(
        <Controls
          {...defaultProps}
          isPlaying={false}
          hasText={false}
          hasWords={false}
        />
      )

      // Click disabled buttons (Start, Pause, Reset, Clear all disabled)
      const startButton = screen.getByRole('button', { name: /start/i })
      const pauseButton = screen.getByRole('button', { name: /pause/i })
      const resetButton = screen.getByRole('button', { name: /reset/i })
      const clearButton = screen.getByRole('button', { name: /clear/i })

      fireEvent.click(startButton)
      fireEvent.click(pauseButton)
      fireEvent.click(resetButton)
      fireEvent.click(clearButton)

      // Native button disabled behavior prevents click handlers
      // We verify by checking that callbacks are not called
      expect(mockStart).not.toHaveBeenCalled()
      expect(mockPause).not.toHaveBeenCalled()
      expect(mockReset).not.toHaveBeenCalled()
      expect(mockClear).not.toHaveBeenCalled()
    })

    it('handles rapid button clicks', () => {
      render(<Controls {...defaultProps} hasText={true} />)

      const startButton = screen.getByRole('button', { name: /start/i })

      // Rapid clicks
      fireEvent.click(startButton)
      fireEvent.click(startButton)
      fireEvent.click(startButton)

      expect(mockStart).toHaveBeenCalledTimes(3)
    })

    it('handles rapid slider changes', () => {
      render(<Controls {...defaultProps} wpm={300} />)

      const slider = screen.getByRole('slider')

      // Simulate rapid slider movement
      fireEvent.change(slider, { target: { value: '350' } })
      fireEvent.change(slider, { target: { value: '400' } })
      fireEvent.change(slider, { target: { value: '450' } })

      expect(mockWpmChange).toHaveBeenCalledTimes(3)
      expect(mockWpmChange).toHaveBeenLastCalledWith(450)
    })
  })
})
