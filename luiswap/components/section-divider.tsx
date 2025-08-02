"use client"

export function SectionDivider() {
  return (
    <div className="relative w-full h-5 overflow-hidden">
      {/* Enhanced metallic border at the top */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5"
        style={{
          background:
            "linear-gradient(to right, transparent 0%, rgba(255,255,255,0.2) 10%, rgba(255,255,255,0.8) 30%, rgba(255,255,255,1) 50%, rgba(255,255,255,0.8) 70%, rgba(255,255,255,0.2) 90%, transparent 100%)",
          boxShadow: "0 1px 2px rgba(255,255,255,0.3)",
        }}
      />

      {/* Smoother gradient transition with intermediate steps ending at #22273d */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          background: "linear-gradient(to bottom, #4f74c3 0%, #3d5ba8 25%, #2d4487 50%, #243666 75%, #22273d 100%)",
        }}
      />
    </div>
  )
}
