/**
 * Integration tests for useLibrary hook with localStorage
 * Tests INTG-03: useLibrary persists and loads from localStorage
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useLibrary } from '@/hooks/useLibrary';
import { SavedText } from '@/types';

// Test component that exercises the useLibrary hook
function TestComponent({ textToSave }: { textToSave?: { title: string; content: string } }) {
  const { library, saveText, deleteText, refreshLibrary } = useLibrary();

  return (
    <div>
      <span data-testid="library-count">{library.length}</span>
      <span data-testid="first-title">{library[0]?.title || 'none'}</span>
      <span data-testid="first-id">{library[0]?.id || 'none'}</span>
      {textToSave && (
        <button
          data-testid="save-btn"
          onClick={() => saveText(textToSave.title, textToSave.content)}
        >
          Save
        </button>
      )}
      <button data-testid="delete-btn" onClick={() => library[0] && deleteText(library[0].id)}>
        Delete First
      </button>
      <button data-testid="refresh-btn" onClick={refreshLibrary}>
        Refresh
      </button>
      <ul data-testid="library-list">
        {library.map((item) => (
          <li key={item.id} data-testid={`item-${item.id}`}>
            {item.title}
          </li>
        ))}
      </ul>
    </div>
  );
}

describe('useLibrary integration with localStorage', () => {
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

  it('loads library from localStorage on mount', () => {
    const savedLibrary: SavedText[] = [
      {
        id: 'test-1',
        title: 'First Text',
        content: 'Content one',
        savedAt: Date.now(),
        lastPosition: 0,
        wordCount: 2,
      },
      {
        id: 'test-2',
        title: 'Second Text',
        content: 'Content two',
        savedAt: Date.now(),
        lastPosition: 0,
        wordCount: 2,
      },
    ];

    getItemSpy.mockImplementation((key) => {
      if (key === 'readfaster_library') {
        return JSON.stringify(savedLibrary);
      }
      return null;
    });

    render(<TestComponent />);

    expect(screen.getByTestId('library-count').textContent).toBe('2');
    expect(screen.getByTestId('first-title').textContent).toBe('First Text');
    expect(getItemSpy).toHaveBeenCalledWith('readfaster_library');
  });

  it('renders empty library when localStorage empty', () => {
    getItemSpy.mockReturnValue(null);

    render(<TestComponent />);

    expect(screen.getByTestId('library-count').textContent).toBe('0');
    expect(screen.getByTestId('first-title').textContent).toBe('none');
  });

  it('saves new text to library and localStorage', () => {
    getItemSpy.mockReturnValue(null);

    render(<TestComponent textToSave={{ title: 'New Text', content: 'Hello world test' }} />);

    fireEvent.click(screen.getByTestId('save-btn'));

    // Verify setItem was called with the new text
    expect(setItemSpy).toHaveBeenCalled();
    const lastSetItemCall = setItemSpy.mock.calls.find(
      (call) => call[0] === 'readfaster_library'
    );
    expect(lastSetItemCall).toBeDefined();

    const savedData = JSON.parse(lastSetItemCall![1] as string) as SavedText[];
    expect(savedData.length).toBe(1);
    expect(savedData[0].title).toBe('New Text');
    expect(savedData[0].content).toBe('Hello world test');
    expect(savedData[0].wordCount).toBe(3);
  });

  it('adds saved text to beginning of library', () => {
    const existingLibrary: SavedText[] = [
      {
        id: 'existing-1',
        title: 'Existing Text',
        content: 'Old content',
        savedAt: Date.now() - 1000,
        lastPosition: 0,
        wordCount: 2,
      },
    ];

    getItemSpy.mockImplementation((key) => {
      if (key === 'readfaster_library') {
        return JSON.stringify(existingLibrary);
      }
      return null;
    });

    render(<TestComponent textToSave={{ title: 'New Text', content: 'Fresh content' }} />);

    // Initial state shows existing text
    expect(screen.getByTestId('first-title').textContent).toBe('Existing Text');

    fireEvent.click(screen.getByTestId('save-btn'));

    // After save, new text is first
    expect(screen.getByTestId('first-title').textContent).toBe('New Text');
    expect(screen.getByTestId('library-count').textContent).toBe('2');
  });

  it('deletes text from library and localStorage', () => {
    const savedLibrary: SavedText[] = [
      {
        id: 'to-delete',
        title: 'Delete Me',
        content: 'Goodbye content',
        savedAt: Date.now(),
        lastPosition: 0,
        wordCount: 2,
      },
      {
        id: 'keep-me',
        title: 'Keep This',
        content: 'Stay content',
        savedAt: Date.now(),
        lastPosition: 0,
        wordCount: 2,
      },
    ];

    getItemSpy.mockImplementation((key) => {
      if (key === 'readfaster_library') {
        return JSON.stringify(savedLibrary);
      }
      return null;
    });

    render(<TestComponent />);

    expect(screen.getByTestId('library-count').textContent).toBe('2');
    expect(screen.getByTestId('first-title').textContent).toBe('Delete Me');

    fireEvent.click(screen.getByTestId('delete-btn'));

    // UI updates
    expect(screen.getByTestId('library-count').textContent).toBe('1');
    expect(screen.getByTestId('first-title').textContent).toBe('Keep This');

    // localStorage was updated
    const lastSetItemCall = setItemSpy.mock.calls.find(
      (call) => call[0] === 'readfaster_library'
    );
    expect(lastSetItemCall).toBeDefined();

    const savedData = JSON.parse(lastSetItemCall![1] as string) as SavedText[];
    expect(savedData.length).toBe(1);
    expect(savedData[0].title).toBe('Keep This');
  });

  it('refreshLibrary() reloads from localStorage', () => {
    // Start with empty library
    getItemSpy.mockReturnValue(null);

    render(<TestComponent />);
    expect(screen.getByTestId('library-count').textContent).toBe('0');

    // Simulate external update to localStorage
    const newLibrary: SavedText[] = [
      {
        id: 'externally-added',
        title: 'External Text',
        content: 'Added from another tab',
        savedAt: Date.now(),
        lastPosition: 0,
        wordCount: 4,
      },
    ];

    getItemSpy.mockImplementation((key) => {
      if (key === 'readfaster_library') {
        return JSON.stringify(newLibrary);
      }
      return null;
    });

    // Refresh to pick up external changes
    fireEvent.click(screen.getByTestId('refresh-btn'));

    expect(screen.getByTestId('library-count').textContent).toBe('1');
    expect(screen.getByTestId('first-title').textContent).toBe('External Text');
  });

  it('handles malformed localStorage data gracefully', () => {
    getItemSpy.mockImplementation((key) => {
      if (key === 'readfaster_library') {
        return 'not-valid-json{';
      }
      return null;
    });

    // Should not throw, should render with empty library
    render(<TestComponent />);

    expect(screen.getByTestId('library-count').textContent).toBe('0');
  });
});
