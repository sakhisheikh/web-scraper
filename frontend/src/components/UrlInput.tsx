import { useState } from 'react';

export default function UrlInput({ onAdd }: { onAdd: (url: string) => void }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  function validateUrl(url: string) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  const handleAdd = async () => {
    if (!value) return;
    if (!validateUrl(value)) {
      setError('Please enter a valid URL (e.g., https://example.com)');
      return;
    }
    try {
      await onAdd(value);
      setValue('');
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to add URL');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  return (
    <div className="flex flex-col gap-2 my-4">
      <div className="flex gap-2">
        <input
          className="input input-bordered flex-1 px-3 py-2 border rounded"
          placeholder="Enter website URL"
          value={value}
          onChange={e => {
            setValue(e.target.value);
            setError('');
          }}
          onKeyDown={handleKeyDown}
        />
        <button
          className="btn btn-primary px-4 py-2 rounded bg-blue-600 text-white"
          onClick={handleAdd}
        >
          Add
        </button>
      </div>
      {error && <div className="text-red-500 text-sm">{error}</div>}
    </div>
  );
} 