"use client"

import { useState } from "react"
import { Search, Phone, MessageSquare, Home, UserCheck, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"

export function HowItWorks() {
  const [activeTab, setActiveTab] = useState<"renters" | "owners">("renters")

  return (
    <section className="py-32 bg-background relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-secondary/40 blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
          <h2 className="text-4xl md:text-5xl font-serif text-foreground leading-tight">
            Simple steps to your next <span className="italic text-primary">story.</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            We've stripped away the complexity to bring you closer to what matters—authentic connections and beautiful
            spaces.
          </p>

          <div className="inline-flex bg-secondary/50 p-1.5 rounded-full shadow-inner">
            <button
              onClick={() => setActiveTab("renters")}
              className={cn(
                "px-8 py-3 rounded-full text-sm font-medium transition-all duration-300",
                activeTab === "renters"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              For Renters
            </button>
            <button
              onClick={() => setActiveTab("owners")}
              className={cn(
                "px-8 py-3 rounded-full text-sm font-medium transition-all duration-300",
                activeTab === "owners"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              For Owners
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

          {activeTab === "renters" ? (
            <>
              {[
                { icon: Search, title: "Discover", desc: "Browse curated homes with local character." },
                { icon: MessageSquare, title: "Connect", desc: "Chat directly with owners for the inside scoop." },
                { icon: Phone, title: "Journey", desc: "Call to finalize and start your adventure." },
              ].map((step, i) => (
                <div key={i} className="relative flex flex-col items-center text-center space-y-4 group">
                  <div className="w-24 h-24 rounded-full bg-white border-4 border-background shadow-lg flex items-center justify-center relative z-10 group-hover:scale-110 transition-transform duration-500">
                    <step.icon className="w-8 h-8 text-primary" strokeWidth={1.5} />
                    <div className="absolute inset-0 rounded-full border border-primary/10 scale-110 group-hover:scale-125 transition-transform duration-500" />
                  </div>
                  <div className="space-y-2 px-4">
                    <h3 className="text-2xl font-serif font-medium text-foreground">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed text-sm">{step.desc}</p>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <>
              {[
                { icon: Home, title: "Share", desc: "List your unique space for travelers." },
                { icon: UserCheck, title: "Verify", desc: "In-person visit to ensure quality & safety." },
                { icon: ShieldCheck, title: "Welcome", desc: "Open your doors to verified guests." },
              ].map((step, i) => (
                <div key={i} className="relative flex flex-col items-center text-center space-y-4 group">
                  <div className="w-24 h-24 rounded-full bg-white border-4 border-background shadow-lg flex items-center justify-center relative z-10 group-hover:scale-110 transition-transform duration-500">
                    <step.icon className="w-8 h-8 text-primary" strokeWidth={1.5} />
                    <div className="absolute inset-0 rounded-full border border-primary/10 scale-110 group-hover:scale-125 transition-transform duration-500" />
                  </div>
                  <div className="space-y-2 px-4">
                    <h3 className="text-2xl font-serif font-medium text-foreground">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed text-sm">{step.desc}</p>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </section>
  )
}
