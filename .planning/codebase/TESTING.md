# Testing Patterns

**Analysis Date:** 2026-01-26

## Test Framework

**Runner:**
- Not configured - No test framework installed
- Project has no dev dependencies for testing (Jest, Vitest, etc.)
- Config file: Not present

**Assertion Library:**
- None installed

**Run Commands:**
- No test command defined in package.json
- Currently: `npm run lint` for code quality

## Test File Organization

**Location:**
- No test files present in codebase
- No `__tests__` or `tests` directories
- Convention pattern would be: co-located tests or `tests/` directory

**Naming Convention (If Implemented):**
- Recommended: `{Component}.test.tsx` or `{Component}.spec.tsx`
- Hook tests: `{hook}.test.ts` or `{hook}.spec.ts`
- Utility tests: `{utility}.test.ts` or `{utility}.spec.ts`

**Recommended Structure (If Implemented):**
```
src/
├── components/
│   ├── Controls.tsx
│   ├── Controls.test.tsx          # Co-located tests
│   ├── FileInput.tsx
│   └── FileInput.test.tsx
├── hooks/
│   ├── useRSVP.ts
│   └── useRSVP.test.ts
├── utils/
│   ├── rsvp.ts
│   └── rsvp.test.ts
└── __tests__/                      # Or separate test directory
    ├── integration/
    └── e2e/
```

## Test Structure (Recommended Pattern)

**Recommended Suite Organization:**

For utilities (deterministic, pure functions):
```typescript
describe('rsvp utilities', () => {
  describe('tokenize', () => {
    it('should split text into individual words', () => {
      const result = tokenize('hello world');
      expect(result).toEqual(['hello', 'world']);
    });

    it('should filter empty strings', () => {
      const result = tokenize('hello  world');
      expect(result).toEqual(['hello', 'world']);
    });

    it('should handle multiple spaces and newlines', () => {
      const result = tokenize('hello\n\n  world  \t test');
      expect(result).toEqual(['hello', 'world', 'test']);
    });

    it('should return empty array for empty string', () => {
      const result = tokenize('   ');
      expect(result).toEqual([]);
    });
  });

  describe('calculatePivotIndex', () => {
    it('should return 0 for empty string', () => {
      expect(calculatePivotIndex('')).toBe(0);
    });

    it('should return 0 for 1-2 char words', () => {
      expect(calculatePivotIndex('a')).toBe(0);
      expect(calculatePivotIndex('ab')).toBe(0);
    });

    it('should return 1 for 3-char word', () => {
      expect(calculatePivotIndex('abc')).toBe(1);
    });

    it('should calculate approximately 35% position for longer words', () => {
      const word = 'excellent'; // 9 chars, 35% = ~3.15
      expect(calculatePivotIndex(word)).toBe(3);
    });
  });
});
```

For React Components (with hooks and state):
```typescript
describe('Controls Component', () => {
  it('should render start button when not playing', () => {
    const mockOnStart = jest.fn();
    render(
      <Controls
        isPlaying={false}
        hasWords={true}
        hasText={true}
        isComplete={false}
        onStart={mockOnStart}
        onPause={jest.fn()}
        onReset={jest.fn()}
        onClear={jest.fn()}
        wpm={300}
        onWpmChange={jest.fn()}
      />
    );
    expect(screen.getByText('Start')).toBeInTheDocument();
  });

  it('should show resume button when paused with words', () => {
    render(
      <Controls
        isPlaying={false}
        hasWords={true}
        hasText={true}
        isComplete={false}
        onStart={jest.fn()}
        onPause={jest.fn()}
        onReset={jest.fn()}
        onClear={jest.fn()}
        wpm={300}
        onWpmChange={jest.fn()}
      />
    );
    expect(screen.getByText('Resume')).toBeInTheDocument();
  });

  it('should call onStart when start button clicked', () => {
    const mockOnStart = jest.fn();
    render(
      <Controls
        isPlaying={false}
        hasWords={false}
        hasText={true}
        isComplete={false}
        onStart={mockOnStart}
        onPause={jest.fn()}
        onReset={jest.fn()}
        onClear={jest.fn()}
        wpm={300}
        onWpmChange={jest.fn()}
      />
    );
    fireEvent.click(screen.getByText('Start'));
    expect(mockOnStart).toHaveBeenCalled();
  });
});
```

For React Hooks:
```typescript
describe('useRSVP hook', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(() => useRSVP());

    expect(result.current.words).toEqual([]);
    expect(result.current.currentIndex).toBe(0);
    expect(result.current.isPlaying).toBe(false);
    expect(result.current.wpm).toBe(300);
  });

  it('should start playback with tokenized text', () => {
    const { result } = renderHook(() => useRSVP());

    act(() => {
      result.current.start('hello world test');
    });

    expect(result.current.words).toEqual(['hello', 'world', 'test']);
    expect(result.current.isPlaying).toBe(true);
  });

  it('should advance word on interval', async () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => useRSVP());

    act(() => {
      result.current.start('one two three');
    });

    act(() => {
      jest.advanceTimersByTime(200); // 300 WPM default = 200ms per word
    });

    expect(result.current.currentIndex).toBe(1);

    jest.useRealTimers();
  });
});
```

**Patterns:**

- **Setup pattern:** Render component/hook with props or call hook directly with `renderHook()`
- **Teardown pattern:** Auto-cleanup with modern testing libraries; manual cleanup in edge cases
- **Assertion pattern:** Direct equality checks for values, `toHaveBeenCalled()` for mocks
- **Async pattern:** Use `async`/`await` with `waitFor()` for async operations

## Mocking

**Recommended Framework:** Jest (for testing Next.js projects)

**Patterns:**

Mock external modules:
```typescript
jest.mock('tesseract.js', () => ({
  recognize: jest.fn().mockResolvedValue({
    data: { text: 'mocked ocr text' }
  })
}));
```

Mock React hooks:
```typescript
jest.mock('@/hooks/useRSVP', () => ({
  useRSVP: jest.fn(() => ({
    words: ['test', 'words'],
    currentIndex: 0,
    isPlaying: false,
    wpm: 300,
    currentWord: 'test',
    pivotIndex: 1,
    totalWords: 2,
    progress: 0,
    isComplete: false,
    start: jest.fn(),
    pause: jest.fn(),
    reset: jest.fn(),
    setWpm: jest.fn(),
    skipForward: jest.fn(),
    skipBackward: jest.fn(),
  }))
}));
```

Mock Next.js API routes:
```typescript
jest.mock('next/server', () => ({
  NextRequest: class {},
  NextResponse: {
    json: jest.fn((data, opts) => ({ data, ...opts }))
  }
}));
```

**What to Mock:**
- External SDKs: `tesseract.js`, `pdfjs-dist`, `jszip`
- Browser APIs: `localStorage` (check with `isStorageAvailable()`)
- File operations: `FileReader`, `fetch`
- Time-based operations: `setInterval`, `setTimeout` (use `jest.useFakeTimers()`)
- Child components: In unit tests (render only what you're testing)

**What NOT to Mock:**
- Utility functions with pure logic: `tokenize()`, `calculatePivotIndex()`, `splitWordByPivot()`
- React itself and DOM APIs
- Type definitions and interfaces

## Fixtures and Factories

**Recommended Test Data (If Implemented):**

Create `src/__tests__/fixtures.ts`:
```typescript
export const mockText = {
  short: 'hello world',
  medium: 'The quick brown fox jumps over the lazy dog',
  long: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
};

export const mockSavedText = {
  valid: {
    id: 'test-1',
    title: 'Test Document',
    content: 'Sample content here',
    savedAt: Date.now(),
    lastPosition: 0,
    wordCount: 3,
  },
  empty: {
    id: 'test-2',
    title: 'Empty',
    content: '',
    savedAt: Date.now(),
    lastPosition: 0,
    wordCount: 0,
  },
};

export const mockSettings = {
  default: {
    fontFamily: 'monospace' as const,
    fontWeight: 'medium' as const,
    fontSize: 'medium' as const,
    focusModeEnabled: false,
  },
  custom: {
    fontFamily: 'serif' as const,
    fontWeight: 'bold' as const,
    fontSize: 'large' as const,
    focusModeEnabled: true,
  },
};

// Factory for creating test data
export function createSavedText(overrides?: Partial<SavedText>): SavedText {
  return {
    ...mockSavedText.valid,
    ...overrides,
  };
}
```

**Location (If Implemented):**
- `src/__tests__/fixtures.ts` - Shared test data
- `src/__tests__/mocks/` - Mock implementations
- `src/__tests__/helpers.ts` - Test utility functions

## Coverage

**Requirements:**
- Currently: No coverage requirements enforced
- Recommended minimum: 80% overall, 100% for critical utility functions

**View Coverage (If Implemented):**
```bash
npm test -- --coverage
# or
jest --coverage
```

**Coverage commands to add to package.json:**
```json
{
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage"
}
```

## Test Types

**Unit Tests:**
- Scope: Individual functions and components in isolation
- Approach: Test pure functions directly; test components with mocked dependencies
- Examples:
  - `rsvp.ts` utilities: Pure function tests
  - `storage.ts` utilities: Mock localStorage, test logic
  - Individual components: Render with mocked hooks/children

**Integration Tests:**
- Scope: Multiple modules/components working together
- Approach: Render actual components with real hooks, mock only external APIs
- Examples:
  - `useRSVP` hook with `tokenize()` function
  - Page component with multiple child components and hooks
  - File upload with `FileInput` component and `readFile()` function

**E2E Tests:**
- Framework: Not detected - Could use Cypress or Playwright
- Current status: Not implemented
- Recommended scope: Full user workflows (upload file → read → pause → resume)

## Common Patterns

**Async Testing:**

For functions that return Promises:
```typescript
describe('readFile', () => {
  it('should read text file correctly', async () => {
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const result = await readFile(file);
    expect(result).toBe('test content');
  });

  it('should throw on unsupported file type', async () => {
    const file = new File(['data'], 'test.xyz', { type: 'application/octet-stream' });
    await expect(readFile(file)).rejects.toThrow('Unsupported file type');
  });
});
```

For hooks that use intervals:
```typescript
describe('useRSVP - async advancement', () => {
  it('should advance words with correct timing', async () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => useRSVP());

    act(() => {
      result.current.start('one two three');
    });

    act(() => {
      jest.advanceTimersByTime(200); // 300 WPM = ~200ms per word
    });

    expect(result.current.currentIndex).toBe(1);
    jest.useRealTimers();
  });
});
```

**Error Testing:**

For functions that throw:
```typescript
describe('error handling', () => {
  it('should handle missing localStorage gracefully', () => {
    const originalLocalStorage = global.localStorage;
    delete (global as any).localStorage;

    expect(() => saveSession(mockSession)).not.toThrow();
    expect(result).toBeNull();

    global.localStorage = originalLocalStorage;
  });

  it('should catch and log storage errors', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Quota exceeded');
    });

    saveSession(mockSession);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to save session:', expect.any(Error));

    consoleErrorSpy.mockRestore();
  });
});
```

For components with error states:
```typescript
describe('FileInput error handling', () => {
  it('should display error when file is unsupported', async () => {
    const { getByText } = render(
      <FileInput onFileLoad={jest.fn()} disabled={false} />
    );

    const invalidFile = new File(['data'], 'test.xyz', { type: 'application/octet-stream' });

    fireEvent.change(screen.getByDisplayValue(''), {
      target: { files: [invalidFile] }
    });

    await waitFor(() => {
      expect(getByText(/Unsupported file type/)).toBeInTheDocument();
    });
  });
});
```

## Recommended Testing Setup (If Implemented)

Install dependencies:
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom @types/jest
```

Add to `jest.config.js`:
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/app/layout.tsx',
  ],
};
```

Add to `package.json`:
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.1.5",
    "@testing-library/react": "^14.1.2",
    "@types/jest": "^29.5.11",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",
    "ts-jest": "^29.1.1"
  }
}
```

---

*Testing analysis: 2026-01-26*
