import { useState } from 'react';
import { LogIn, ShieldCheck } from 'lucide-react';
import { isConfigComplete } from '../firebase';
import Button from './ui/Button';

interface LoginScreenProps {
  onLogin: () => Promise<unknown>;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin() {
    setError(null);
    setIsLoading(true);
    try {
      await onLogin();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Sign in failed.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-4">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-ink text-white">
            <ShieldCheck size={22} aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-ink">BlogGenerator</h1>
            <p className="text-sm text-slate-500">Optional private workspace</p>
          </div>
        </div>

        {!isConfigComplete && (
          <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            Firebase Auth is enabled but the browser config is incomplete.
          </div>
        )}

        {error && <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <Button className="w-full" icon={<LogIn size={18} />} isLoading={isLoading} disabled={!isConfigComplete} onClick={handleLogin}>
          Sign In With Google
        </Button>
      </section>
    </main>
  );
}
