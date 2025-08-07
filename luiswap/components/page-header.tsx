"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { DynamicConnectionManager } from "@/components/web3/dynamic-connection-manager"
import { Menu } from "lucide-react"

export function PageHeader() {
  const pathname = usePathname()

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Deposit", href: "/deposit" },
    { name: "Swap", href: "/swap" },
    { name: "Bridge", href: "/bridge" },
    { name: "Explore", href: "/explore" },
    { name: "Live Events", href: "/live-events" },
  ]

  return (
    <header
      className="w-full py-3 sm:py-4 px-4 sm:px-6 border-b border-white/10"
      style={{ backgroundColor: "#141621" }}
    >
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

        {/* Desktop Button - Hidden below 1200px */}
        <div className="hidden xl:flex items-center gap-4">
          <DynamicConnectionManager 
            className="px-4 lg:px-6 py-2 rounded-full font-medium shadow-sm text-sm lg:text-base"
            variant="outline"
          />
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
              <DynamicConnectionManager 
                className="px-6 py-2 rounded-full font-medium shadow-sm w-full"
                variant="outline"
              />
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
