import { useId } from 'react';
import { ParsedBackupFile, ImportResult } from '@/utils/backup';
import { useFocusTrap } from '@/hooks/useFocusTrap';

interface ImportConfirmationModalProps {
  isOpen: boolean;
  parsedFile: ParsedBackupFile | null;
  onConfirm: () => void;
  onCancel: () => void;
  isImporting: boolean;
  importResult: ImportResult | null;
}

export function ImportConfirmationModal({
  isOpen,
  parsedFile,
  onConfirm,
  onCancel,
  isImporting,
  importResult,
}: ImportConfirmationModalProps) {
  const titleId = useId();
  const modalRef = useFocusTrap<HTMLDivElement>(isOpen);

  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="modal-backdrop"
        onClick={!isImporting ? onCancel : undefined}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="modal-container"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="modal modal-sm" ref={modalRef}>
          <div className="modal-header">
            <h2 id={titleId} className="modal-title">
              {importResult ? 'Import Complete' : 'Import Backup'}
            </h2>
            {!isImporting && (
              <button
                onClick={onCancel}
                aria-label="Close import dialog"
                className="modal-close focus-visible:ring-2 focus-visible:ring-wine"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <div className="modal-body">

        {/* Parse error state */}
        {parsedFile && !parsedFile.success && (
          <div className="mb-4 rounded-md bg-flatred-50 p-3 text-sm text-flatred">
            <p className="font-medium">Failed to parse file</p>
            <p>{parsedFile.error}</p>
          </div>
        )}

        {/* Pre-import preview */}
        {parsedFile?.success && parsedFile.data && !importResult && (
          <div className="space-y-3">
            <div className="rounded-md bg-champagne-50 p-3">
              <p className="text-sm text-wine/70">
                <span className="font-medium text-wine">File:</span> {parsedFile.fileName}
              </p>
              <p className="text-sm text-wine/70">
                <span className="font-medium text-wine">Exported:</span>{' '}
                {formatDate(parsedFile.data.exportDate)}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-wine">Found:</p>
              <ul className="ml-4 list-disc text-sm text-wine/70">
                <li>{parsedFile.data.postings.length} postings</li>
                <li>{parsedFile.data.connections?.length || 0} connections</li>
              </ul>
            </div>

            <div className="rounded-md bg-teal-50 p-3 text-sm text-teal-600">
              <p>
                Import will merge with existing data. Newer entries will overwrite older ones.
              </p>
            </div>
          </div>
        )}

        {/* Post-import result */}
        {importResult && (
          <div className="space-y-3">
            <div
              className={`rounded-md p-3 text-sm ${
                importResult.success ? 'bg-teal-50 text-teal-600' : 'bg-pandora-50 text-pandora'
              }`}
            >
              <p className="font-medium">
                {importResult.success ? 'Import successful!' : 'Import completed with warnings'}
              </p>
            </div>

            <ul className="ml-4 list-disc text-sm text-wine/70">
              <li>{importResult.postings} postings imported</li>
              <li>{importResult.connections} connections imported</li>
              {importResult.skipped > 0 && (
                <li className="text-pandora">{importResult.skipped} items skipped</li>
              )}
            </ul>

            {importResult.errors.length > 0 && (
              <div className="rounded-md bg-pandora-50 p-3">
                <p className="text-sm font-medium text-pandora">Warnings:</p>
                <ul className="mt-1 list-disc pl-4 text-sm text-pandora/80">
                  {importResult.errors.slice(0, 5).map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                  {importResult.errors.length > 5 && (
                    <li>...and {importResult.errors.length - 5} more</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}
          </div>

          {/* Footer */}
          <div className="modal-footer">
            {!importResult ? (
              <>
                <button
                  onClick={onCancel}
                  disabled={isImporting}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isImporting || !parsedFile?.success}
                  className="btn btn-primary"
                >
                  {isImporting ? 'Importing...' : 'Import'}
                </button>
              </>
            ) : (
              <button
                onClick={onCancel}
                className="btn btn-primary"
              >
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
