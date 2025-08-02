"use client"

import { useState } from "react"
import { Github, Linkedin, X } from "lucide-react"

export function FooterSection() {
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")

  const showComingSoonAlert = (section: string) => {
    setAlertMessage(`${section} section will be developed in the future`)
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
    <>
      <footer className="w-full max-w-[1320px] mx-auto px-5 flex flex-col md:flex-row justify-between items-start gap-8 md:gap-0 py-10 md:py-[70px]">
        {/* Left Section: Logo, Description, Social Links */}
        <div className="flex flex-col justify-start items-start gap-8 p-4 md:p-8">
          <div className="flex gap-3 items-stretch justify-center">
            <div className="text-center text-foreground text-xl font-semibold leading-4">LuiSwap</div>
          </div>
          <p className="text-foreground/90 text-sm font-medium leading-[18px] text-left">
            Seamless multichain stablecoin trading
          </p>
          <div className="flex justify-start items-start gap-3">
            <a href="#" aria-label="GitHub" className="w-4 h-4 flex items-center justify-center">
              <Github className="w-full h-full text-muted-foreground" />
            </a>
            <a href="#" aria-label="LinkedIn" className="w-4 h-4 flex items-center justify-center">
              <Linkedin className="w-full h-full text-muted-foreground" />
            </a>
          </div>
        </div>

        {/* Right Section: Footer Links */}
        <div className="flex flex-col md:flex-row gap-8 md:gap-16 p-4 md:p-8 w-full md:w-auto">
          {/* Product */}
          <div className="flex flex-col justify-start items-start gap-3">
            <h3 className="text-muted-foreground text-sm font-medium leading-5">Product</h3>
            <div className="flex flex-col justify-end items-start gap-2">
              <a href="/" className="text-foreground text-sm font-normal leading-5 hover:underline">
                Home
              </a>
              <a href="/swap" className="text-foreground text-sm font-normal leading-5 hover:underline">
                Swap
              </a>
              <a href="/bridge" className="text-foreground text-sm font-normal leading-5 hover:underline">
                Bridge
              </a>
              <a href="/explore" className="text-foreground text-sm font-normal leading-5 hover:underline">
                Explore
              </a>
              <a href="/live-events" className="text-foreground text-sm font-normal leading-5 hover:underline">
                Live Events
              </a>
            </div>
          </div>

          {/* Company */}
          <div className="flex flex-col justify-start items-start gap-3">
            <h3 className="text-muted-foreground text-sm font-medium leading-5">Company</h3>
            <div className="flex flex-col justify-end items-start gap-2">
              <button
                onClick={() => showComingSoonAlert("About")}
                className="text-foreground text-sm font-normal leading-5 hover:underline text-left"
              >
                About
              </button>
              <button
                onClick={() => showComingSoonAlert("Careers")}
                className="text-foreground text-sm font-normal leading-5 hover:underline text-left"
              >
                Careers
              </button>
              <button
                onClick={() => showComingSoonAlert("Blog")}
                className="text-foreground text-sm font-normal leading-5 hover:underline text-left"
              >
                Blog
              </button>
            </div>
          </div>

          {/* Resources */}
          <div className="flex flex-col justify-start items-start gap-3">
            <h3 className="text-muted-foreground text-sm font-medium leading-5">Resources</h3>
            <div className="flex flex-col justify-end items-start gap-2">
              <button
                onClick={() => showComingSoonAlert("Documentation")}
                className="text-foreground text-sm font-normal leading-5 hover:underline text-left"
              >
                Documentation
              </button>
              <button
                onClick={() => showComingSoonAlert("API")}
                className="text-foreground text-sm font-normal leading-5 hover:underline text-left"
              >
                API
              </button>
              <button
                onClick={() => showComingSoonAlert("Support")}
                className="text-foreground text-sm font-normal leading-5 hover:underline text-left"
              >
                Support
              </button>
              <button
                onClick={() => showComingSoonAlert("Community")}
                className="text-foreground text-sm font-normal leading-5 hover:underline text-left"
              >
                Community
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Custom Alert */}
      {showAlert && (
        <div className="fixed bottom-4 left-4 z-50 animate-in slide-in-from-left-5 duration-300">
          <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-4 pr-12 max-w-sm">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
              <div>
                <p className="text-foreground text-sm font-medium">Coming Soon</p>
                <p className="text-muted-foreground text-xs mt-1">{alertMessage}</p>
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
    </>
  )
}
