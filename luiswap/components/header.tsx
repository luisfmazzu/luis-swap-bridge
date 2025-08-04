"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Menu, X } from "lucide-react"

export function Header() {
  const pathname = usePathname()
  const isHomePage = pathname === "/"
  const [showAlert, setShowAlert] = useState(false)

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Swap", href: "/swap" },
    { name: "Bridge", href: "/bridge" },
    { name: "Explore", href: "/explore" },
    { name: "Live Events", href: "/live-events" },
  ]

  const showComingSoonAlert = () => {
    setShowAlert(true)
    // Auto-hide after 3 seconds
    setTimeout(() => {
      setShowAlert(false)
    }, 3000)
  }

  const hideAlert = () => {
    setShowAlert(false)
  }

  return (
    <header className="w-full py-3 sm:py-4 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4 xl:gap-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-foreground text-lg sm:text-xl font-semibold">
              LuiSwap
            </Link>
          </div>
          {/* Desktop Navigation - Hidden below 1200px */}
          <nav className="hidden xl:flex items-center gap-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`px-3 lg:px-4 py-2 rounded-full font-medium transition-colors text-sm lg:text-base ${
                  pathname === item.href ? "text-foreground bg-accent" : "text-[#888888] hover:text-foreground"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Desktop Buttons - Hidden below 1200px */}
        <div className="hidden xl:flex items-center gap-3 lg:gap-4">
          {isHomePage && (
            <Link href="/swap">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 lg:px-6 py-2 rounded-full font-medium text-sm lg:text-base">
                Launch App
              </Button>
            </Link>
          )}
          <Button 
            onClick={showComingSoonAlert}
            className="bg-secondary text-secondary-foreground hover:bg-secondary/90 px-4 lg:px-6 py-2 rounded-full font-medium shadow-sm text-sm lg:text-base"
          >
            Connect Wallet
          </Button>
        </div>

        {/* Mobile Menu - Shown below 1200px */}
        <Sheet>
          <SheetTrigger asChild className="xl:hidden">
            <Button variant="ghost" size="icon" className="text-foreground">
              <Menu className="h-6 w-6 sm:h-7 sm:w-7" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="bg-background border-t border-border text-foreground">
            <SheetHeader>
              <SheetTitle className="text-left text-xl font-semibold text-foreground">Navigation</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-4 mt-6">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`justify-start text-lg py-2 ${
                    pathname === item.href ? "text-foreground font-semibold" : "text-[#888888] hover:text-foreground"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              {isHomePage && (
                <Link href="/swap" className="w-full mt-4">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2 rounded-full font-medium shadow-sm w-full">
                    Launch App
                  </Button>
                </Link>
              )}
              <Button 
                onClick={showComingSoonAlert}
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90 px-6 py-2 rounded-full font-medium shadow-sm w-full"
              >
                Connect Wallet
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>

      {/* Custom Alert */}
      {showAlert && (
        <div className="fixed bottom-4 left-4 z-50 animate-in slide-in-from-left-5 duration-300">
          <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-4 pr-12 max-w-sm">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
              <div>
                <p className="text-foreground text-sm font-medium">Coming Soon</p>
                <p className="text-muted-foreground text-xs mt-1">Wallet connection will be available soon</p>
              </div>
              <button
                onClick={hideAlert}
                className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close alert"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
