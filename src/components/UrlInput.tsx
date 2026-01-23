'use client';

import { useState } from 'react';

interface UrlInputProps {
  onFetch: (text: string) => void;
  disabled: boolean;
}

export function UrlInput({ onFetch, disabled }: UrlInputProps) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFetch = async () => {
    if (!url.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/fetch-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch URL');
      }

      if (data.content) {
        onFetch(data.content);
        setUrl('');
      } else {
        throw new Error('No content extracted from URL');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch URL');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mb-4">
      <label className="block mb-2 text-sm font-medium text-white/70">
        Or fetch from URL:
      </label>
      <div className="flex gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setError('');
          }}
          placeholder="https://example.com/article"
          disabled={disabled || isLoading}
          className="flex-1 px-4 py-2 border-2 border-primary/50 rounded-lg bg-white/5 text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-primary disabled:opacity-50"
          onKeyDown={(e) => e.key === 'Enter' && handleFetch()}
        />
        <button
          onClick={handleFetch}
          disabled={disabled || isLoading || !url.trim()}
          className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[80px]"
        >
          {isLoading ? (
            <span className="inline-block animate-spin">&#8635;</span>
          ) : (
            'Fetch'
          )}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  );
}
