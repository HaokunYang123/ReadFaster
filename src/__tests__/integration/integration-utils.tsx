/**
 * Integration test utilities for useRSVP hook testing
 *
 * Provides:
 * - Custom render wrapper with provider support
 * - TestComponent exposing hook state via data-testid
 * - Fake timer lifecycle helpers
 * - RTL utility re-exports
 */

import React from 'react'
import { render, screen, fireEvent, act, RenderOptions } from '@testing-library/react'
import { vi } from 'vitest'
import { useRSVP } from '@/hooks/useRSVP'

// Re-export commonly used RTL utilities
export { render, screen, fireEvent, act }

/**
 * Custom render wrapper that accepts optional providers
 * Extensible for future context providers (theme, settings, etc.)
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  providers?: React.ComponentType<{ children: React.ReactNode }>[]
}

export function customRender(
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) {
  const { providers = [], ...renderOptions } = options

  // Compose providers from outside-in
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return providers.reduceRight(
      (acc, Provider) => React.createElement(Provider, null, acc),
      children as React.ReactElement
    )
  }

  return render(ui, { wrapper: providers.length > 0 ? Wrapper : undefined, ...renderOptions })
}

/**
 * Test component that uses useRSVP hook and exposes state via data-testid attributes
 * All hook state is accessible through DOM queries for integration testing
 */
interface TestComponentProps {
  initialWpm?: number
}

export function TestComponent({ initialWpm = 300 }: TestComponentProps) {
  const {
    words,
    currentIndex,
    isPlaying,
    wpm,
    currentWord,
    progress,
    isComplete,
    start,
    pause,
    reset,
    setWpm,
    skipForward,
    skipBackward,
  } = useRSVP()

  // Initialize WPM if different from default
  React.useEffect(() => {
    if (initialWpm !== 300) {
      setWpm(initialWpm)
    }
  }, [initialWpm, setWpm])

  // Derive status string for display
  const getStatus = () => {
    if (isComplete) return 'complete'
    if (isPlaying) return 'playing'
    return 'paused'
  }

  return (
    <div>
      {/* State display via data-testid */}
      <div data-testid="status">{getStatus()}</div>
      <div data-testid="word">{currentWord}</div>
      <div data-testid="index">{currentIndex}</div>
      <div data-testid="progress">{progress}</div>
      <div data-testid="wpm">{wpm}</div>
      <div data-testid="total-words">{words.length}</div>

      {/* Text input for start */}
      <input
        data-testid="text-input"
        type="text"
        defaultValue=""
      />

      {/* Control buttons */}
      <button
        data-testid="start-button"
        onClick={() => {
          const input = document.querySelector('[data-testid="text-input"]') as HTMLInputElement
          start(input?.value || '')
        }}
      >
        Start
      </button>
      <button
        data-testid="start-with-text-button"
        onClick={() => {
          // Hidden button that allows passing text directly via dataset
          const btn = document.querySelector('[data-testid="start-with-text-button"]') as HTMLButtonElement
          const text = btn?.dataset.text || ''
          start(text)
        }}
      >
        Start With Text
      </button>
      <button data-testid="pause-button" onClick={pause}>
        Pause
      </button>
      <button data-testid="reset-button" onClick={reset}>
        Reset
      </button>
      <button data-testid="skip-forward-button" onClick={skipForward}>
        Skip Forward
      </button>
      <button data-testid="skip-backward-button" onClick={skipBackward}>
        Skip Backward
      </button>
      <button
        data-testid="set-wpm-button"
        onClick={() => {
          const btn = document.querySelector('[data-testid="set-wpm-button"]') as HTMLButtonElement
          const newWpm = parseInt(btn?.dataset.wpm || '300', 10)
          setWpm(newWpm)
        }}
      >
        Set WPM
      </button>
    </div>
  )
}

/**
 * Helper to create TestComponent and start playback with given text
 * Returns render result for further assertions
 */
export function createTestComponent(options: TestComponentProps = {}) {
  return customRender(<TestComponent {...options} />)
}

/**
 * Start playback with specific text by setting data attribute and clicking button
 */
export function startWithText(text: string) {
  const btn = screen.getByTestId('start-with-text-button')
  btn.dataset.text = text
  fireEvent.click(btn)
}

/**
 * Set WPM by setting data attribute and clicking button
 */
export function setWpmValue(wpm: number) {
  const btn = screen.getByTestId('set-wpm-button')
  btn.dataset.wpm = String(wpm)
  fireEvent.click(btn)
}

// ============================================================================
// Timer Lifecycle Helpers
// ============================================================================

/**
 * Setup fake timers for integration tests
 * Call in beforeEach
 */
export function setupFakeTimers() {
  vi.useFakeTimers()
}

/**
 * Teardown fake timers after tests
 * Runs pending timers then restores real timers
 * Call in afterEach
 */
export function teardownFakeTimers() {
  vi.runOnlyPendingTimers()
  vi.useRealTimers()
}

/**
 * Advance fake timers by specified milliseconds
 * Wraps advancement in act() for React state updates
 */
export async function advanceTimers(ms: number) {
  await act(async () => {
    vi.advanceTimersByTime(ms)
  })
}

/**
 * Advance timers and flush all pending promises
 * Useful when timer callbacks trigger async state updates
 */
export async function advanceTimersAndFlush(ms: number) {
  await act(async () => {
    vi.advanceTimersByTime(ms)
    await Promise.resolve()
  })
}

// ============================================================================
// Assertion Helpers
// ============================================================================

/**
 * Get current status from TestComponent
 */
export function getStatus(): string {
  return screen.getByTestId('status').textContent || ''
}

/**
 * Get current word from TestComponent
 */
export function getCurrentWord(): string {
  return screen.getByTestId('word').textContent || ''
}

/**
 * Get current index from TestComponent
 */
export function getCurrentIndex(): number {
  return parseInt(screen.getByTestId('index').textContent || '0', 10)
}

/**
 * Get progress percentage from TestComponent
 */
export function getProgress(): number {
  return parseInt(screen.getByTestId('progress').textContent || '0', 10)
}

/**
 * Get total words count from TestComponent
 */
export function getTotalWords(): number {
  return parseInt(screen.getByTestId('total-words').textContent || '0', 10)
}

/**
 * Get WPM from TestComponent
 */
export function getWpm(): number {
  return parseInt(screen.getByTestId('wpm').textContent || '300', 10)
}
