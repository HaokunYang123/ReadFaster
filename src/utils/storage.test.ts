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
})
