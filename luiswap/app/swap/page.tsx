import { PageHeader } from "@/components/page-header"
import { PageFooter } from "@/components/page-footer"
import { DynamicSwapInterface } from "@/components/web3"

export default function SwapPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#141621" }}>
      <PageHeader />
      <main className="flex-1" style={{ backgroundColor: "#151826" }}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <DynamicSwapInterface />
        </div>
      </main>
      <PageFooter />
    </div>
  )
}
