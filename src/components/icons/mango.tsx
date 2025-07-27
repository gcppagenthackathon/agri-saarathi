
import type { SVGProps } from 'react';

export function MangoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path d="M12 2C6.5 2 2 6.5 2 12c0 5.5 4.5 10 10 10s10-4.5 10-10C22 6.5 17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z" />
      <path d="M15 9.5c0 1.9-1.3 3.5-3 3.5s-3-1.6-3-3.5 1.3-3.5 3-3.5 3 1.6 3 3.5z" />
    </svg>
  );
}
