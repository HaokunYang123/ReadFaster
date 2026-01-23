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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError('');

    try {
      const text = await readFile(file);
      if (text && text.trim()) {
        onFileLoad(text);
      } else {
        setError('No readable text found in file');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to read file');
    } finally {
      setIsLoading(false);
      // Reset input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const readFile = async (file: File): Promise<string> => {
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (extension === 'txt' || extension === 'md') {
      return readTextFile(file);
    }

    if (extension === 'pdf') {
      return readPdfFile(file);
    }

    if (extension === 'epub') {
      return readEpubFile(file);
    }

    throw new Error(`Unsupported file type: .${extension}`);
  };

  const readTextFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
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
          // TextItem has str property, TextMarkedContent doesn't
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
    // Simple ePub reader using JSZip
    const JSZip = (await import('jszip')).default;

    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);

    // Find content files (typically XHTML)
    const contentFiles: string[] = [];

    // Try to read the container.xml to find the content
    const containerXml = await zip.file('META-INF/container.xml')?.async('string');

    if (containerXml) {
      // Extract rootfile path
      const rootfileMatch = containerXml.match(/full-path="([^"]+)"/);
      if (rootfileMatch) {
        const opfPath = rootfileMatch[1];
        const opfContent = await zip.file(opfPath)?.async('string');

        if (opfContent) {
          // Extract href values from manifest items that are text content
          const hrefPattern =
            /<item[^>]+href="([^"]+)"[^>]*media-type="application\/xhtml\+xml"[^>]*>/g;
          const basePath = opfPath.substring(0, opfPath.lastIndexOf('/') + 1);

          let match;
          while ((match = hrefPattern.exec(opfContent)) !== null) {
            const href = match[1];
            const fullPath = basePath + href;
            contentFiles.push(fullPath);
          }
        }
      }
    }

    // If we couldn't parse the structure, just find all XHTML files
    if (contentFiles.length === 0) {
      zip.forEach((relativePath) => {
        if (relativePath.endsWith('.xhtml') || relativePath.endsWith('.html')) {
          contentFiles.push(relativePath);
        }
      });
    }

    // Read and extract text from content files
    const textParts: string[] = [];

    for (const filePath of contentFiles) {
      const content = await zip.file(filePath)?.async('string');
      if (content) {
        // Strip HTML tags
        const text = content
          .replace(/<[^>]+>/g, ' ')
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/\s+/g, ' ')
          .trim();

        if (text) {
          textParts.push(text);
        }
      }
    }

    return textParts.join('\n\n');
  };

  return (
    <div className="mb-4">
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.md,.pdf,.epub"
        onChange={handleFileSelect}
        disabled={disabled || isLoading}
        className="hidden"
        id="file-input"
      />
      <label
        htmlFor="file-input"
        className={`inline-flex items-center gap-2 px-4 py-2 border-2 border-dashed border-primary/50 rounded-lg text-sm cursor-pointer transition-colors ${
          disabled || isLoading
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:border-primary hover:bg-primary/10'
        }`}
      >
        {isLoading ? (
          <>
            <span className="inline-block animate-spin">&#8635;</span>
            <span>Loading...</span>
          </>
        ) : (
          <>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <span>Upload File (.txt, .pdf, .epub)</span>
          </>
        )}
      </label>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  );
}
