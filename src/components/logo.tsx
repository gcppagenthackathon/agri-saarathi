import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 22c-5.523 0-10-4.477-10-10S6.477 2 12 2s10 4.477 10 10c0 2.45-.88 4.69-2.34 6.36" />
      <path d="M12 12c-3.314 0-6-2.686-6-6" />
      <path d="M14.66 15.64A5.987 5.987 0 0 0 18 10h-6c-3.314 0-6 2.686-6 6a5.987 5.987 0 0 0 3.36 5.64" />
    </svg>
  );
}
