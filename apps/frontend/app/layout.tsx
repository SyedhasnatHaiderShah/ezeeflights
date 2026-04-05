import '@/styles/globals.css';
import { ReactNode } from 'react';
import { Providers } from '@/components/shared/providers';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
