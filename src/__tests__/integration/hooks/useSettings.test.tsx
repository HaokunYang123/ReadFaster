/**
 * Integration tests for useSettings hook with localStorage
 * Tests INTG-04: useSettings handles defaults and updates correctly
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useSettings } from '@/hooks/useSettings';
import { RSVPSettings, DEFAULT_SETTINGS } from '@/types';

// Test component that exercises the useSettings hook
function TestComponent() {
  const { settings, updateSettings, resetSettings } = useSettings();

  return (
    <div>
      <span data-testid="font-family">{settings.fontFamily}</span>
      <span data-testid="font-weight">{settings.fontWeight}</span>
      <span data-testid="font-size">{settings.fontSize}</span>
      <span data-testid="pivot-color">{settings.pivotColor}</span>
      <span data-testid="show-highlight">{settings.showPivotHighlight.toString()}</span>

      <button
        data-testid="update-font-family"
        onClick={() => updateSettings({ fontFamily: 'serif' })}
      >
        Set Serif
      </button>
      <button
        data-testid="update-pivot-color"
        onClick={() => updateSettings({ pivotColor: '#00FF00' })}
      >
        Set Green
      </button>
      <button
        data-testid="update-multiple"
        onClick={() => updateSettings({ fontWeight: 'bold', fontSize: 'large' })}
      >
        Set Bold Large
      </button>
      <button data-testid="toggle-highlight" onClick={() => updateSettings({ showPivotHighlight: false })}>
        Disable Highlight
      </button>
      <button data-testid="reset-btn" onClick={resetSettings}>
        Reset
      </button>
    </div>
  );
}

describe('useSettings integration with localStorage', () => {
  let getItemSpy: ReturnType<typeof vi.spyOn>;
  let setItemSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    getItemSpy = vi.spyOn(Storage.prototype, 'getItem');
    setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
  });

  afterEach(() => {
    getItemSpy.mockRestore();
    setItemSpy.mockRestore();
    localStorage.clear();
  });

  describe('Default values', () => {
    it('applies DEFAULT_SETTINGS when localStorage empty', () => {
      getItemSpy.mockReturnValue(null);

      render(<TestComponent />);

      expect(screen.getByTestId('font-family').textContent).toBe('monospace');
      expect(screen.getByTestId('font-weight').textContent).toBe('medium');
      expect(screen.getByTestId('font-size').textContent).toBe('medium');
      expect(screen.getByTestId('pivot-color').textContent).toBe('#FF0000');
      expect(screen.getByTestId('show-highlight').textContent).toBe('true');
    });

    it('loads saved settings from localStorage on mount', () => {
      const customSettings: RSVPSettings = {
        fontFamily: 'serif',
        fontWeight: 'bold',
        fontSize: 'large',
        pivotColor: '#0000FF',
        showPivotHighlight: false,
      };

      getItemSpy.mockImplementation((key) => {
        if (key === 'readfaster_settings') {
          return JSON.stringify(customSettings);
        }
        return null;
      });

      render(<TestComponent />);

      expect(screen.getByTestId('font-family').textContent).toBe('serif');
      expect(screen.getByTestId('font-weight').textContent).toBe('bold');
      expect(screen.getByTestId('font-size').textContent).toBe('large');
      expect(screen.getByTestId('pivot-color').textContent).toBe('#0000FF');
      expect(screen.getByTestId('show-highlight').textContent).toBe('false');
      expect(getItemSpy).toHaveBeenCalledWith('readfaster_settings');
    });
  });

  describe('Updates', () => {
    it('updateSettings() merges partial settings', () => {
      getItemSpy.mockReturnValue(null);

      render(<TestComponent />);

      // Initial state
      expect(screen.getByTestId('font-family').textContent).toBe('monospace');
      expect(screen.getByTestId('pivot-color').textContent).toBe('#FF0000');

      // Update only fontFamily
      fireEvent.click(screen.getByTestId('update-font-family'));

      // fontFamily changed, pivotColor unchanged
      expect(screen.getByTestId('font-family').textContent).toBe('serif');
      expect(screen.getByTestId('pivot-color').textContent).toBe('#FF0000');
      expect(screen.getByTestId('font-weight').textContent).toBe('medium');
    });

    it('updateSettings() persists to localStorage', () => {
      getItemSpy.mockReturnValue(null);

      render(<TestComponent />);

      fireEvent.click(screen.getByTestId('update-pivot-color'));

      // Verify setItem was called
      expect(setItemSpy).toHaveBeenCalledWith('readfaster_settings', expect.any(String));

      const lastSetItemCall = setItemSpy.mock.calls.find(
        (call) => call[0] === 'readfaster_settings'
      );
      expect(lastSetItemCall).toBeDefined();

      const savedData = JSON.parse(lastSetItemCall![1] as string) as RSVPSettings;
      expect(savedData.pivotColor).toBe('#00FF00');
      // Other settings preserved
      expect(savedData.fontFamily).toBe('monospace');
    });

    it('updateSettings() immediately reflects in rendered output', () => {
      getItemSpy.mockReturnValue(null);

      render(<TestComponent />);

      expect(screen.getByTestId('font-weight').textContent).toBe('medium');
      expect(screen.getByTestId('font-size').textContent).toBe('medium');

      fireEvent.click(screen.getByTestId('update-multiple'));

      // Immediately updated in DOM
      expect(screen.getByTestId('font-weight').textContent).toBe('bold');
      expect(screen.getByTestId('font-size').textContent).toBe('large');
    });

    it('updateSettings() handles boolean settings correctly', () => {
      getItemSpy.mockReturnValue(null);

      render(<TestComponent />);

      expect(screen.getByTestId('show-highlight').textContent).toBe('true');

      fireEvent.click(screen.getByTestId('toggle-highlight'));

      expect(screen.getByTestId('show-highlight').textContent).toBe('false');

      // Verify localStorage
      const lastSetItemCall = setItemSpy.mock.calls.find(
        (call) => call[0] === 'readfaster_settings'
      );
      const savedData = JSON.parse(lastSetItemCall![1] as string) as RSVPSettings;
      expect(savedData.showPivotHighlight).toBe(false);
    });
  });

  describe('Reset', () => {
    it('resetSettings() restores DEFAULT_SETTINGS', () => {
      const customSettings: RSVPSettings = {
        fontFamily: 'serif',
        fontWeight: 'bold',
        fontSize: 'large',
        pivotColor: '#0000FF',
        showPivotHighlight: false,
      };

      getItemSpy.mockImplementation((key) => {
        if (key === 'readfaster_settings') {
          return JSON.stringify(customSettings);
        }
        return null;
      });

      render(<TestComponent />);

      // Starts with custom settings
      expect(screen.getByTestId('font-family').textContent).toBe('serif');
      expect(screen.getByTestId('pivot-color').textContent).toBe('#0000FF');

      fireEvent.click(screen.getByTestId('reset-btn'));

      // Now shows defaults
      expect(screen.getByTestId('font-family').textContent).toBe('monospace');
      expect(screen.getByTestId('font-weight').textContent).toBe('medium');
      expect(screen.getByTestId('font-size').textContent).toBe('medium');
      expect(screen.getByTestId('pivot-color').textContent).toBe('#FF0000');
      expect(screen.getByTestId('show-highlight').textContent).toBe('true');
    });

    it('resetSettings() persists defaults to localStorage', () => {
      const customSettings: RSVPSettings = {
        fontFamily: 'serif',
        fontWeight: 'bold',
        fontSize: 'large',
        pivotColor: '#0000FF',
        showPivotHighlight: false,
      };

      getItemSpy.mockImplementation((key) => {
        if (key === 'readfaster_settings') {
          return JSON.stringify(customSettings);
        }
        return null;
      });

      render(<TestComponent />);

      fireEvent.click(screen.getByTestId('reset-btn'));

      // Verify setItem called with DEFAULT_SETTINGS
      const lastSetItemCall = setItemSpy.mock.calls.find(
        (call) => call[0] === 'readfaster_settings'
      );
      expect(lastSetItemCall).toBeDefined();

      const savedData = JSON.parse(lastSetItemCall![1] as string) as RSVPSettings;
      expect(savedData).toEqual(DEFAULT_SETTINGS);
    });
  });

  describe('Edge cases', () => {
    it('handles partial settings in localStorage by merging with defaults', () => {
      // Only fontFamily saved, missing other fields
      const partialSettings = { fontFamily: 'sans' };

      getItemSpy.mockImplementation((key) => {
        if (key === 'readfaster_settings') {
          return JSON.stringify(partialSettings);
        }
        return null;
      });

      render(<TestComponent />);

      // Custom value loaded
      expect(screen.getByTestId('font-family').textContent).toBe('sans');
      // Defaults applied for missing values
      expect(screen.getByTestId('pivot-color').textContent).toBe('#FF0000');
      expect(screen.getByTestId('show-highlight').textContent).toBe('true');
    });

    it('handles malformed localStorage data gracefully', () => {
      getItemSpy.mockImplementation((key) => {
        if (key === 'readfaster_settings') {
          return 'invalid-json{{{';
        }
        return null;
      });

      // Should not throw, should use defaults
      render(<TestComponent />);

      expect(screen.getByTestId('font-family').textContent).toBe('monospace');
      expect(screen.getByTestId('pivot-color').textContent).toBe('#FF0000');
    });
  });
});
