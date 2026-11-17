import AuthComponent from './auth.component';

export default function AuthPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-3xl font-bold">Auth</h1>
      <AuthComponent />
    </main>
  );
}
