import { PageHeader } from "@/components/page-header"
import { PageFooter } from "@/components/page-footer"
import { DynamicPortfolioOverview } from "@/components/web3"

export default function ExplorePage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#141621" }}>
      <PageHeader />
      <main className="flex-1" style={{ backgroundColor: "#151826" }}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <DynamicPortfolioOverview />
          </div>
        </div>
      </main>
      <PageFooter />
    </div>
  )
}
