import { TestTurnkey } from '@/components/test-turnkey'

export default function TestTurnkeyPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Turnkey Integration Test</h1>
        <TestTurnkey />
      </div>
    </div>
  )
}