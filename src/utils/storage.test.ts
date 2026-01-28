/**
 * Unit tests for storage utilities with localStorage mocking
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  saveSession,
  loadSession,
  clearSession,
  saveToLibrary,
  loadLibrary,
  removeFromLibrary,
  saveSettings,
  loadSettings,
  generateId,
} from './storage'
import type { SavedSession, SavedText, RSVPSettings } from '@/types'
import { DEFAULT_SETTINGS } from '@/types'

describe('storage utilities', () => {
  let getItemSpy: ReturnType<typeof vi.spyOn>
  let setItemSpy: ReturnType<typeof vi.spyOn>
  let removeItemSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    // Spy on Storage.prototype (not localStorage directly - jsdom limitation)
    getItemSpy = vi.spyOn(Storage.prototype, 'getItem')
    setItemSpy = vi.spyOn(Storage.prototype, 'setItem')
    removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem')
  })

  afterEach(() => {
    getItemSpy.mockRestore()
    setItemSpy.mockRestore()
    removeItemSpy.mockRestore()
    localStorage.clear()
  })

  describe('session persistence', () => {
    describe('saveSession', () => {
      it('saves session to localStorage with correct key', () => {
        const session: SavedSession = {
          text: 'hello world',
          currentIndex: 5,
          wpm: 300,
          savedAt: Date.now(),
        }

        saveSession(session)

        expect(setItemSpy).toHaveBeenCalledWith(
          'readfaster_session',
          JSON.stringify(session)
        )
      })

      it('serializes session object to JSON', () => {
        const session: SavedSession = {
          text: 'test content',
          currentIndex: 10,
          wpm: 400,
          savedAt: Date.now(),
        }

        saveSession(session)

        // Find the call with 'readfaster_session' key (isStorageAvailable adds test calls)
        const sessionCall = setItemSpy.mock.calls.find(
          (call) => call[0] === 'readfaster_session'
        )
        expect(sessionCall).toBeDefined()
        const callArg = sessionCall![1] as string
        const parsed = JSON.parse(callArg)
        expect(parsed).toEqual(session)
      })
    })

    describe('loadSession', () => {
      it('returns null when no session exists', () => {
        getItemSpy.mockReturnValue(null)

        const result = loadSession()

        expect(result).toBeNull()
      })

      it('returns parsed session when valid data exists', () => {
        const session: SavedSession = {
          text: 'stored text',
          currentIndex: 3,
          wpm: 350,
          savedAt: Date.now(),
        }
        getItemSpy.mockReturnValue(JSON.stringify(session))

        const result = loadSession()

        expect(result).toEqual(session)
      })

      it('returns null for expired sessions (7+ days old)', () => {
        const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000
        const expiredSession: SavedSession = {
          text: 'old text',
          currentIndex: 0,
          wpm: 300,
          savedAt: Date.now() - SEVEN_DAYS_MS - 1000, // 7 days + 1 second ago
        }
        getItemSpy.mockReturnValue(JSON.stringify(expiredSession))

        const result = loadSession()

        expect(result).toBeNull()
      })

      it('clears expired sessions from storage', () => {
        const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000
        const expiredSession: SavedSession = {
          text: 'old text',
          currentIndex: 0,
          wpm: 300,
          savedAt: Date.now() - SEVEN_DAYS_MS - 1000,
        }
        getItemSpy.mockReturnValue(JSON.stringify(expiredSession))

        loadSession()

        expect(removeItemSpy).toHaveBeenCalledWith('readfaster_session')
      })

      it('returns null when JSON parsing fails', () => {
        getItemSpy.mockReturnValue('invalid json{')

        const result = loadSession()

        expect(result).toBeNull()
      })
    })

    describe('clearSession', () => {
      it('removes session from localStorage', () => {
        clearSession()

        expect(removeItemSpy).toHaveBeenCalledWith('readfaster_session')
      })
    })
  })

  describe('library management', () => {
    const createMockText = (overrides?: Partial<SavedText>): SavedText => ({
      id: 'test-123',
      title: 'Test Title',
      content: 'Test content here',
      savedAt: Date.now(),
      lastPosition: 0,
      wordCount: 3,
      ...overrides,
    })

    describe('loadLibrary', () => {
      it('returns empty array when no library exists', () => {
        getItemSpy.mockReturnValue(null)

        const result = loadLibrary()

        expect(result).toEqual([])
      })

      it('returns parsed library when data exists', () => {
        const library: SavedText[] = [
          createMockText({ id: '1', title: 'First' }),
          createMockText({ id: '2', title: 'Second' }),
        ]
        getItemSpy.mockReturnValue(JSON.stringify(library))

        const result = loadLibrary()

        expect(result).toEqual(library)
      })

      it('returns empty array when JSON parsing fails', () => {
        getItemSpy.mockReturnValue('invalid json{')

        const result = loadLibrary()

        expect(result).toEqual([])
      })
    })

    describe('saveToLibrary', () => {
      it('adds new text to beginning of library', () => {
        const existingLibrary: SavedText[] = [
          createMockText({ id: '1', title: 'First' }),
        ]
        getItemSpy.mockReturnValue(JSON.stringify(existingLibrary))

        const newText = createMockText({ id: '2', title: 'New' })
        saveToLibrary(newText)

        // Find the library save call
        const libraryCall = setItemSpy.mock.calls.find(
          (call) => call[0] === 'readfaster_library'
        )
        expect(libraryCall).toBeDefined()
        const saved = JSON.parse(libraryCall![1] as string) as SavedText[]
        expect(saved[0]).toEqual(newText)
        expect(saved.length).toBe(2)
      })

      it('updates existing text by id', () => {
        const existingText = createMockText({ id: 'update-me', title: 'Old' })
        getItemSpy.mockReturnValue(JSON.stringify([existingText]))

        const updatedText = createMockText({ id: 'update-me', title: 'New' })
        saveToLibrary(updatedText)

        const libraryCall = setItemSpy.mock.calls.find(
          (call) => call[0] === 'readfaster_library'
        )
        const saved = JSON.parse(libraryCall![1] as string) as SavedText[]
        expect(saved.length).toBe(1)
        expect(saved[0].title).toBe('New')
      })

      it('limits library to 50 items', () => {
        const fiftyItems: SavedText[] = Array.from({ length: 50 }, (_, i) =>
          createMockText({ id: `item-${i}`, title: `Item ${i}` })
        )
        getItemSpy.mockReturnValue(JSON.stringify(fiftyItems))

        const newText = createMockText({ id: 'new', title: 'New' })
        saveToLibrary(newText)

        const libraryCall = setItemSpy.mock.calls.find(
          (call) => call[0] === 'readfaster_library'
        )
        const saved = JSON.parse(libraryCall![1] as string) as SavedText[]
        expect(saved.length).toBe(50)
        expect(saved[0]).toEqual(newText)
      })

      it('preserves other items when adding new', () => {
        const existingLibrary: SavedText[] = [
          createMockText({ id: '1', title: 'First' }),
          createMockText({ id: '2', title: 'Second' }),
        ]
        getItemSpy.mockReturnValue(JSON.stringify(existingLibrary))

        const newText = createMockText({ id: '3', title: 'Third' })
        saveToLibrary(newText)

        const libraryCall = setItemSpy.mock.calls.find(
          (call) => call[0] === 'readfaster_library'
        )
        const saved = JSON.parse(libraryCall![1] as string) as SavedText[]
        expect(saved.length).toBe(3)
        expect(saved[1].id).toBe('1')
        expect(saved[2].id).toBe('2')
      })
    })

    describe('removeFromLibrary', () => {
      it('removes text with matching id', () => {
        const library: SavedText[] = [
          createMockText({ id: 'remove-me', title: 'Remove' }),
          createMockText({ id: 'keep-me', title: 'Keep' }),
        ]
        getItemSpy.mockReturnValue(JSON.stringify(library))

        removeFromLibrary('remove-me')

        const libraryCall = setItemSpy.mock.calls.find(
          (call) => call[0] === 'readfaster_library'
        )
        const saved = JSON.parse(libraryCall![1] as string) as SavedText[]
        expect(saved.length).toBe(1)
        expect(saved[0].id).toBe('keep-me')
      })

      it('preserves other items when removing', () => {
        const library: SavedText[] = [
          createMockText({ id: '1', title: 'First' }),
          createMockText({ id: '2', title: 'Second' }),
          createMockText({ id: '3', title: 'Third' }),
        ]
        getItemSpy.mockReturnValue(JSON.stringify(library))

        removeFromLibrary('2')

        const libraryCall = setItemSpy.mock.calls.find(
          (call) => call[0] === 'readfaster_library'
        )
        const saved = JSON.parse(libraryCall![1] as string) as SavedText[]
        expect(saved.length).toBe(2)
        expect(saved.find((t) => t.id === '1')).toBeDefined()
        expect(saved.find((t) => t.id === '3')).toBeDefined()
      })

      it('handles removing non-existent id gracefully', () => {
        const library: SavedText[] = [createMockText({ id: '1' })]
        getItemSpy.mockReturnValue(JSON.stringify(library))

        // Should not throw error
        expect(() => removeFromLibrary('non-existent')).not.toThrow()

        const libraryCall = setItemSpy.mock.calls.find(
          (call) => call[0] === 'readfaster_library'
        )
        const saved = JSON.parse(libraryCall![1] as string) as SavedText[]
        expect(saved.length).toBe(1)
      })
    })
  })

  describe('settings persistence', () => {
    describe('saveSettings', () => {
      it('saves settings to localStorage with correct key', () => {
        const settings: RSVPSettings = {
          fontFamily: 'serif',
          fontWeight: 'bold',
          fontSize: 'large',
          pivotColor: '#00FF00',
          showPivotHighlight: false,
        }

        saveSettings(settings)

        expect(setItemSpy).toHaveBeenCalledWith(
          'readfaster_settings',
          JSON.stringify(settings)
        )
      })

      it('serializes RSVPSettings object', () => {
        const settings: RSVPSettings = {
          fontFamily: 'sans',
          fontWeight: 'medium',
          fontSize: 'small',
          pivotColor: '#FF00FF',
          showPivotHighlight: true,
        }

        saveSettings(settings)

        const settingsCall = setItemSpy.mock.calls.find(
          (call) => call[0] === 'readfaster_settings'
        )
        expect(settingsCall).toBeDefined()
        const saved = JSON.parse(settingsCall![1] as string)
        expect(saved).toEqual(settings)
      })
    })

    describe('loadSettings', () => {
      it('returns DEFAULT_SETTINGS when no settings exist', () => {
        getItemSpy.mockReturnValue(null)

        const result = loadSettings()

        expect(result).toEqual(DEFAULT_SETTINGS)
      })

      it('merges stored settings with defaults', () => {
        const partialSettings = {
          fontFamily: 'serif',
          pivotColor: '#0000FF',
        }
        getItemSpy.mockReturnValue(JSON.stringify(partialSettings))

        const result = loadSettings()

        expect(result.fontFamily).toBe('serif')
        expect(result.pivotColor).toBe('#0000FF')
        expect(result.fontWeight).toBe(DEFAULT_SETTINGS.fontWeight)
        expect(result.fontSize).toBe(DEFAULT_SETTINGS.fontSize)
        expect(result.showPivotHighlight).toBe(DEFAULT_SETTINGS.showPivotHighlight)
      })

      it('returns defaults when JSON parsing fails', () => {
        getItemSpy.mockReturnValue('invalid json{')

        const result = loadSettings()

        expect(result).toEqual(DEFAULT_SETTINGS)
      })

      it('handles missing properties by using defaults', () => {
        const incompleteSettings = {
          fontFamily: 'monospace',
          // Missing other properties
        }
        getItemSpy.mockReturnValue(JSON.stringify(incompleteSettings))

        const result = loadSettings()

        expect(result.fontFamily).toBe('monospace')
        expect(result.fontWeight).toBe(DEFAULT_SETTINGS.fontWeight)
        expect(result.fontSize).toBe(DEFAULT_SETTINGS.fontSize)
        expect(result.pivotColor).toBe(DEFAULT_SETTINGS.pivotColor)
        expect(result.showPivotHighlight).toBe(DEFAULT_SETTINGS.showPivotHighlight)
      })
    })
  })

  describe('generateId', () => {
    it('returns string in expected format', () => {
      const id = generateId()

      expect(typeof id).toBe('string')
      expect(id).toMatch(/^\d+-[a-z0-9]+$/) // timestamp-random format
    })

    it('generates unique ids on consecutive calls', () => {
      const id1 = generateId()
      const id2 = generateId()

      expect(id1).not.toBe(id2)
    })

    it('includes timestamp component', () => {
      const beforeTime = Date.now()
      const id = generateId()
      const afterTime = Date.now()

      const timestamp = parseInt(id.split('-')[0])
      expect(timestamp).toBeGreaterThanOrEqual(beforeTime)
      expect(timestamp).toBeLessThanOrEqual(afterTime)
    })
  })

  describe('storage unavailability', () => {
    it('saveSession does not throw when setItem fails', () => {
      setItemSpy.mockImplementation(() => {
        throw new Error('Storage unavailable')
      })

      const session: SavedSession = {
        text: 'test',
        currentIndex: 0,
        wpm: 300,
        savedAt: Date.now(),
      }

      expect(() => saveSession(session)).not.toThrow()
    })

    it('loadSession returns null when getItem fails', () => {
      getItemSpy.mockImplementation(() => {
        throw new Error('Storage unavailable')
      })

      const result = loadSession()

      expect(result).toBeNull()
    })

    it('loadLibrary returns empty array when storage fails', () => {
      getItemSpy.mockImplementation(() => {
        throw new Error('Storage unavailable')
      })

      const result = loadLibrary()

      expect(result).toEqual([])
    })

    it('loadSettings returns DEFAULT_SETTINGS when storage fails', () => {
      getItemSpy.mockImplementation(() => {
        throw new Error('Storage unavailable')
      })

      const result = loadSettings()

      expect(result).toEqual(DEFAULT_SETTINGS)
    })
  })
})
