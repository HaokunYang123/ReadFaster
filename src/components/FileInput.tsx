'use client';

import { useRef, useState } from 'react';

interface FileInputProps {
  onFileLoad: (text: string) => void;
  disabled: boolean;
}

export function FileInput({ onFileLoad, disabled }: FileInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError('');

    try {
      const text = await readFile(file);
      if (text.trim()) {
        onFileLoad(text);
      } else {
        throw new Error('No text content found in file');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to read file');
    } finally {
      setIsLoading(false);
      // Reset input so same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const readFile = async (file: File): Promise<string> => {
    const extension = file.name.split('.').pop()?.toLowerCase();

    switch (extension) {
      case 'txt':
      case 'md':
        return readTextFile(file);
      case 'pdf':
        return readPdfFile(file);
      case 'epub':
        return readEpubFile(file);
      default:
        throw new Error(`Unsupported file type: .${extension}`);
    }
  };

  const readTextFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read text file'));
      reader.readAsText(file);
    });
  };

  const readPdfFile = async (file: File): Promise<string> => {
    // Dynamic import of pdf.js
    const pdfjsLib = await import('pdfjs-dist');

    // Set worker source
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    const textParts: string[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item) => {
          if ('str' in item && typeof item.str === 'string') {
            return item.str;
          }
          return '';
        })
        .join(' ');
      textParts.push(pageText);
    }

    return textParts.join('\n\n');
  };

  const readEpubFile = async (file: File): Promise<string> => {
    const JSZip = (await import('jszip')).default;

    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);

    // Find content files (usually in OEBPS or similar)
    const textParts: string[] = [];

    for (const [filename, zipEntry] of Object.entries(zip.files)) {
      if (
        (filename.endsWith('.xhtml') || filename.endsWith('.html')) &&
        !filename.includes('toc')
      ) {
        const content = await zipEntry.async('string');
        // Strip HTML tags and decode entities
        const text = content
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num)))
          .replace(/\s+/g, ' ')
          .trim();

        if (text.length > 100) {
          textParts.push(text);
        }
      }
    }

    return textParts.join('\n\n');
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.md,.pdf,.epub"
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        onClick={handleClick}
        disabled={disabled || isLoading}
        className="px-4 py-2 bg-white/10 text-white rounded-lg text-sm hover:bg-white/20 disabled:opacity-50"
      >
        {isLoading ? 'Loading...' : 'Upload File'}
      </button>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}
