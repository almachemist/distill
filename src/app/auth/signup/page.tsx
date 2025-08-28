import { SignUpForm } from '@/modules/auth/components/SignUpForm'

export default function SignUpPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Distil</h1>
          <p className="text-gray-600">Create your distillery account</p>
        </div>
        <SignUpForm />
      </div>
    </main>
  )
}