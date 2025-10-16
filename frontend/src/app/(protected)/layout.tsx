import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = cookies().get('ttt_token')?.value;

  if (!token) {
    const next = encodeURIComponent('/dashboard');
    redirect(`/login?next=${next}`);
  }

  return <>{children}</>;
}
