import React from 'react';
import { CheckCircle, ErrorOutline, WarningAmber } from '@mui/icons-material';

const normalizeItems = (result) => {
  if (!result) return [];
  if (Array.isArray(result)) return result;
  return result.errors || result.validationErrors || result.issues || result.warnings || result.messages || [];
};

const TripValidationResult = ({ result }) => {
  if (!result) return null;
  const items = normalizeItems(result);
  const valid = result.isValid ?? result.valid ?? (items.length === 0);

  return (
    <section className={`rounded-xl border p-5 ${valid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
      <div className="flex items-start gap-3">
        {valid ? <CheckCircle className="mt-0.5 text-green-600" /> : <ErrorOutline className="mt-0.5 text-red-600" />}
        <div className="min-w-0 flex-1">
          <h3 className={`font-semibold ${valid ? 'text-green-800' : 'text-red-800'}`}>{valid ? 'Trip validation passed' : 'Trip validation found issues'}</h3>
          {result.summary && <p className="mt-1 text-sm text-slate-600">{result.summary}</p>}
          {items.length > 0 && (
            <ul className="mt-3 space-y-2">
              {items.map((item, index) => {
                const text = typeof item === 'string' ? item : item.message || item.description || JSON.stringify(item);
                const severity = typeof item === 'object' ? item.severity : undefined;
                return (
                  <li key={index} className="flex gap-2 rounded-lg bg-white/70 px-3 py-2 text-sm text-slate-700">
                    {String(severity).toLowerCase() === 'warning' ? <WarningAmber fontSize="small" className="text-amber-600" /> : <ErrorOutline fontSize="small" className="text-red-500" />}
                    <span>{text}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
};

export default TripValidationResult;
