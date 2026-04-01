import { LoginForm } from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* Logo / Brand */}
      <div className="mb-10 text-center">
        <div className="w-16 h-16 bg-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-200 dark:shadow-violet-950">
          <span className="text-3xl">⚡</span>
        </div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Life OS</h1>
        <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-1">Sua vida, organizada.</p>
      </div>

      <LoginForm />
    </div>
  )
}
