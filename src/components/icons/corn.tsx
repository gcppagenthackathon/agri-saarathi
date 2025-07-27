
import type { SVGProps } from 'react';

export function CornIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path d="M12 2C9.2 2 7 4.2 7 7v10c0 2.8 2.2 5 5 5s5-2.2 5-5V7c0-2.8-2.2-5-5-5zm-3 5c0-1.7 1.3-3 3-3s3 1.3 3 3v10c0 1.7-1.3 3-3 3s-3-1.3-3-3V7z" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="12" cy="8" r="1.5" />
      <circle cx="12" cy="16" r="1.5" />
    </svg>
  );
}
