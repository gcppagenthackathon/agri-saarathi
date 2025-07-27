
import type { SVGProps } from 'react';

export function FingerMilletIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="12" cy="7" r="1" />
      <circle cx="17" cy="12" r="1" />
      <circle cx="12" cy="17" r="1" />
      <circle cx="7" cy="12" r="1" />
    </svg>
  );
}
