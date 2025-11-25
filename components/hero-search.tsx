"use client"

import { Search } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { useState } from "react"

export function HeroSearch() {
  const [location, setLocation] = useState("")

  return (
    <div className="bg-white rounded-full shadow-xl shadow-black/5 p-2 flex flex-col md:flex-row items-center max-w-4xl mx-auto border border-border/50">
      <div className="flex-1 grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr_1fr] gap-0 w-full divide-y md:divide-y-0 md:divide-x divide-gray-100">
        {/* Location Input */}
        <div className="px-6 py-3 hover:bg-secondary/30 rounded-full transition cursor-pointer group relative">
          <label className="block text-xs font-bold text-primary/80 mb-0.5 uppercase tracking-wider">Where to?</label>
          <input
            type="text"
            placeholder="Search destinations"
            className="w-full bg-transparent border-none p-0 text-base font-serif text-gray-800 placeholder:text-gray-400 focus:ring-0 focus:outline-none truncate"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        {/* Check in */}
        <div className="px-6 py-3 hover:bg-secondary/30 rounded-full transition cursor-pointer">
          <label className="block text-xs font-bold text-primary/80 mb-0.5 uppercase tracking-wider">Dates</label>
          <div className="text-sm text-gray-500 truncate font-medium">Add dates</div>
        </div>

        {/* Check out */}
        <div className="px-6 py-3 hover:bg-secondary/30 rounded-full transition cursor-pointer hidden md:block">
          <label className="block text-xs font-bold text-primary/80 mb-0.5 uppercase tracking-wider">Until</label>
          <div className="text-sm text-gray-500 truncate font-medium">Add dates</div>
        </div>

        {/* Guests */}
        <div className="px-6 py-3 hover:bg-secondary/30 rounded-full transition cursor-pointer relative flex items-center justify-between pl-8">
          <div>
            <label className="block text-xs font-bold text-primary/80 mb-0.5 uppercase tracking-wider">Who</label>
            <div className="text-sm text-gray-500 truncate font-medium">Add guests</div>
          </div>

          {/* Search Button */}
          <Button
            className="rounded-full h-12 w-12 bg-primary hover:bg-primary/90 shadow-md ml-2 shrink-0 transition-transform active:scale-95 flex items-center justify-center p-0"
          >
            <Search className="h-5 w-5 text-white" strokeWidth={2.5} />
          </Button>
        </div>
      </div>
    </div>
  )
}
