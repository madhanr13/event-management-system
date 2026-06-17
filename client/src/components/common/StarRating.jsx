/**
 * StarRating — interactive 1-5 star input.
 *
 * Props:
 *  - value     : number (current rating)
 *  - onChange   : (rating: number) => void
 *  - readonly   : boolean (default false)
 *  - size       : 'sm' | 'md' | 'lg' (default 'md')
 */

import { useState } from 'react';
import { HiStar } from 'react-icons/hi2';

const SIZE_MAP = {
  sm: 'w-5 h-5',
  md: 'w-7 h-7',
  lg: 'w-9 h-9',
};

export default function StarRating({ value = 0, onChange, readonly = false, size = 'md' }) {
  const [hovered, setHovered] = useState(0);

  const stars = [1, 2, 3, 4, 5];
  const displayValue = hovered || value;

  return (
    <div className="inline-flex items-center gap-0.5">
      {stars.map((star) => {
        const filled = star <= displayValue;

        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => onChange?.(star)}
            onMouseEnter={() => !readonly && setHovered(star)}
            onMouseLeave={() => !readonly && setHovered(0)}
            className={`
              transition-all duration-200 focus:outline-none
              ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110 active:scale-95'}
            `}
          >
            <HiStar
              className={`
                ${SIZE_MAP[size]}
                transition-colors duration-200
                ${
                  filled
                    ? 'text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.4)]'
                    : 'text-surface-300 dark:text-surface-600'
                }
              `}
            />
          </button>
        );
      })}
    </div>
  );
}
