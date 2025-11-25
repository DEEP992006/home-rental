import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MapPin, Menu, User } from "lucide-react"

export function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-background/90 backdrop-blur-md border-b border-border/40">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo - More personal branding */}
        <Link href="/" className="flex items-center gap-2 text-primary font-serif font-bold text-2xl tracking-tight">
          <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
            <MapPin className="h-4 w-4 text-primary fill-current" />
          </div>
          Local.
        </Link>

        {/* Center Nav - Simplified & Friendly */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <Link href="/stays" className="text-foreground font-semibold border-b-2 border-primary pb-0.5">
            Stays
          </Link>
          <Link href="/experiences" className="hover:text-foreground transition-colors">
            Experiences
          </Link>
          <Link href="/community" className="hover:text-foreground transition-colors">
            Community
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            className="hidden md:flex rounded-full text-sm font-medium text-foreground hover:bg-secondary/50"
          >
            Become a Host
          </Button>

          {/* User Menu - Softer shadow, more organic */}
          <div className="flex items-center gap-3 border border-border bg-white rounded-full p-1 pl-4 pr-1 hover:shadow-md transition-all cursor-pointer">
            <Menu className="h-4 w-4 text-muted-foreground" />
            <div className="h-8 w-8 bg-secondary rounded-full text-secondary-foreground flex items-center justify-center ring-2 ring-background">
              <User className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
