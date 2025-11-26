import { SignInButton, useAuth } from "@clerk/clerk-react";

export function LandingPage() {
  const { isSignedIn, isLoaded } = useAuth();

  // Don't render SignIn button if user is already signed in
  // This prevents the Clerk error about single session mode
  if (isLoaded && isSignedIn) {
    return null; // Will be replaced by Dashboard via App.tsx routing
  }

  return (
    <div className="h-screen w-screen bg-drone-bg flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-20" />
      <div className="scanline" />

      <div className="z-10 flex flex-col items-center gap-8 p-12 border border-hud-primary/30 bg-drone-panel/80 backdrop-blur-md rounded-lg shadow-[0_0_50px_rgba(0,240,255,0.1)]">
        <h1 className="text-6xl font-bold tracking-tighter text-white drop-shadow-[0_0_10px_rgba(0,240,255,0.8)]">
          3PV <span className="text-hud-primary text-2xl align-top opacity-80">SYSTEM</span>
        </h1>
        <p className="text-hud-primary/80 text-xl font-hud tracking-widest text-center max-w-md">
          DRONE INTELLIGENCE & LIFE GAMIFICATION INTERFACE
        </p>

        {isLoaded && !isSignedIn && (
          <SignInButton mode="modal">
            <button className="mt-8 px-8 py-3 bg-hud-primary/10 border border-hud-primary text-hud-primary hover:bg-hud-primary hover:text-black transition-all duration-300 uppercase tracking-widest font-bold text-lg clip-path-button">
              Initialize System
            </button>
          </SignInButton>
        )}

        {!isLoaded && (
          <div className="mt-8 text-hud-primary/50 text-sm">Loading...</div>
        )}
      </div>
    </div>
  );
}

