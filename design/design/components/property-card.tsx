import Image from "next/image"
import { Heart, Star, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface PropertyProps {
  image: string
  title: string
  location: string
  price: number
  rating: number
  isGuestFavorite?: boolean
  dates: string
}

export function PropertyCard({ image, title, location, price, rating, isGuestFavorite, dates }: PropertyProps) {
  return (
    <div className="group cursor-pointer flex flex-col gap-4">
      {/* Image Container - Softer corners, warmer shadow */}
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-secondary shadow-sm group-hover:shadow-md transition-all duration-300">
        <Image
          src={image || "/placeholder.svg"}
          alt={title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Favorite Button */}
        <button className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-all group/btn shadow-sm">
          <Heart className="h-4 w-4 text-gray-600 group-hover/btn:text-red-500 transition-colors" />
        </button>

        {/* Host Avatar Badge - The "Genuine" Touch */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm">
          <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
            <User className="h-3 w-3 text-primary" />
          </div>
          <span className="text-xs font-medium text-gray-700">Hosted by Anna</span>
        </div>

        {/* Local Gem Badge */}
        {isGuestFavorite && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-white/90 backdrop-blur-sm text-primary border-0 font-serif font-medium shadow-sm px-3">
              ✦ Local Gem
            </Badge>
          </div>
        )}
      </div>

      {/* Content - Clean & Descriptive */}
      <div className="space-y-1 px-1">
        <div className="flex justify-between items-start">
          <h3 className="font-serif text-xl font-medium text-foreground group-hover:text-primary transition-colors">
            {location}
          </h3>
          <div className="flex items-center gap-1 text-sm font-medium bg-secondary/50 px-2 py-0.5 rounded-full">
            <Star className="h-3 w-3 fill-current text-primary" />
            <span>{rating}</span>
          </div>
        </div>
        <p className="text-muted-foreground text-sm font-light leading-relaxed">{title}</p>
        <div className="flex items-baseline gap-1 mt-2">
          <span className="font-semibold text-foreground text-lg">${price}</span>
          <span className="text-muted-foreground text-sm">/ night</span>
        </div>
      </div>
    </div>
  )
}
