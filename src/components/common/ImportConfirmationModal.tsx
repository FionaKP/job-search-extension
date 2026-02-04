import { ParsedBackupFile, ImportResult } from '@/utils/backup';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-gray-500 bg-opacity-75"
        onClick={!isImporting ? onCancel : undefined}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          {importResult ? 'Import Complete' : 'Import Backup'}
        </h2>

        {/* Parse error state */}
        {parsedFile && !parsedFile.success && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
            <p className="font-medium">Failed to parse file</p>
            <p>{parsedFile.error}</p>
          </div>
        )}

        {/* Pre-import preview */}
        {parsedFile?.success && parsedFile.data && !importResult && (
          <div className="space-y-3">
            <div className="rounded-md bg-gray-50 p-3">
              <p className="text-sm text-gray-600">
                <span className="font-medium">File:</span> {parsedFile.fileName}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Exported:</span>{' '}
                {formatDate(parsedFile.data.exportDate)}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Found:</p>
              <ul className="ml-4 list-disc text-sm text-gray-600">
                <li>{parsedFile.data.postings.length} postings</li>
                <li>{parsedFile.data.connections?.length || 0} connections</li>
              </ul>
            </div>

            <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-700">
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
                importResult.success ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
              }`}
            >
              <p className="font-medium">
                {importResult.success ? 'Import successful!' : 'Import completed with warnings'}
              </p>
            </div>

            <ul className="ml-4 list-disc text-sm text-gray-600">
              <li>{importResult.postings} postings imported</li>
              <li>{importResult.connections} connections imported</li>
              {importResult.skipped > 0 && (
                <li className="text-yellow-600">{importResult.skipped} items skipped</li>
              )}
            </ul>

            {importResult.errors.length > 0 && (
              <div className="rounded-md bg-yellow-50 p-3">
                <p className="text-sm font-medium text-yellow-700">Warnings:</p>
                <ul className="mt-1 list-disc pl-4 text-sm text-yellow-600">
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

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3">
          {!importResult ? (
            <>
              <button
                onClick={onCancel}
                disabled={isImporting}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={isImporting || !parsedFile?.success}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isImporting ? 'Importing...' : 'Import'}
              </button>
            </>
          ) : (
            <button
              onClick={onCancel}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
