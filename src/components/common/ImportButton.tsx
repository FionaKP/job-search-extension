import { useState } from 'react';
import { promptForFile, parseBackupFile, importData, ParsedBackupFile, ImportResult } from '@/utils/backup';
import { ImportConfirmationModal } from './ImportConfirmationModal';

interface ImportButtonProps {
  className?: string;
  onImportComplete?: () => void;
}

export function ImportButton({ className = '', onImportComplete }: ImportButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [parsedFile, setParsedFile] = useState<ParsedBackupFile | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const handleClick = async () => {
    const file = await promptForFile();
    if (!file) return;

    const parsed = await parseBackupFile(file);
    setParsedFile(parsed);
    setImportResult(null);
    setIsModalOpen(true);
  };

  const handleConfirm = async () => {
    if (!parsedFile?.success || !parsedFile.data) return;

    setIsImporting(true);
    try {
      const result = await importData(parsedFile.data);
      setImportResult(result);
      onImportComplete?.();
    } catch (err) {
      console.error('Import failed:', err);
      setImportResult({
        success: false,
        postings: 0,
        connections: 0,
        errors: [err instanceof Error ? err.message : 'Unknown error occurred'],
        skipped: 0,
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setParsedFile(null);
    setImportResult(null);
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={`inline-flex items-center gap-2 ${className}`}
        title="Import data from JSON file"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
          />
        </svg>
        Import Data
      </button>

      <ImportConfirmationModal
        isOpen={isModalOpen}
        parsedFile={parsedFile}
        onConfirm={handleConfirm}
        onCancel={handleClose}
        isImporting={isImporting}
        importResult={importResult}
      />
    </>
  );
}
