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

      if (data.text) {
        onFetch(data.text);
        setUrl('');
      } else {
        throw new Error('No text content found');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch URL');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1">
      <div className="flex gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste article URL..."
          disabled={disabled || isLoading}
          className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm disabled:opacity-50"
          onKeyDown={(e) => e.key === 'Enter' && handleFetch()}
        />
        <button
          onClick={handleFetch}
          disabled={disabled || isLoading || !url.trim()}
          className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary-light disabled:opacity-50"
        >
          {isLoading ? 'Fetching...' : 'Fetch'}
        </button>
      </div>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}
