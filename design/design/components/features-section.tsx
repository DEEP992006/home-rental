import { Home, MapPin, Wallet, UserCheck } from "lucide-react"

const features = [
  {
    icon: Wallet,
    title: "Unbeatable Prices",
    description: "Save significantly compared to hotels and expensive villas.",
  },
  {
    icon: Home,
    title: "Genuine Local Homes",
    description: "Stay in real homes with character, not sterile hotel rooms.",
  },
  {
    icon: UserCheck,
    title: "Verified Owners",
    description: "Every host is physically verified by our KYC team.",
  },
  {
    icon: MapPin,
    title: "Local Experience",
    description: "Live like a local in the heart of the neighborhood.",
  },
]

export function FeaturesSection() {
  return (
    <section className="py-20 border-t border-border">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 divide-y md:divide-y-0 md:divide-x divide-border">
          {features.map((feature, index) => (
            <div
              key={index}
              className="pt-8 md:pt-0 md:px-6 first:pl-0 flex flex-col items-center text-center md:items-start md:text-left"
            >
              <feature.icon className="w-8 h-8 text-primary mb-4" strokeWidth={1.5} />
              <h3 className="text-lg font-serif font-medium mb-2 text-foreground">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
