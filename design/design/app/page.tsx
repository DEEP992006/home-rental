import { Navbar } from "@/components/navbar"
import { PropertyCard } from "@/components/property-card"
import { FeaturesSection } from "@/components/features-section"
import { HowItWorks } from "@/components/how-it-works"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { getCurrentUser } from "@/lib/auth"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default async function LandingPage() {
  const user = await getCurrentUser()

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section - "Artifact" Style with large Rust background */}
        <section className="relative bg-primary text-primary-foreground pt-28 pb-20 md:pt-40 md:pb-32 px-6 overflow-hidden rounded-b-[3rem]">
          <div className="container mx-auto grid md:grid-cols-12 gap-12 items-center relative z-10">
            <div className="md:col-span-7 space-y-8">
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-medium tracking-tight leading-[1.1]">
                Skip the expensive <br />
                <span className="italic">hotel & villa.</span>
              </h1>
              <p className="text-xl md:text-2xl text-primary-foreground/80 max-w-xl font-light leading-relaxed">
                Need a room for a day or travel? Hotels are full and overpriced. Experience genuine local homes for a
                fraction of the cost.
              </p>

              <div className="pt-6">
                {!user ? (
                  <div className="bg-white p-2 pl-6 rounded-full inline-flex items-center w-full max-w-md shadow-2xl">
                    <div className="flex-1 text-gray-500 text-lg">Where to?</div>
                    <Button
                      size="lg"
                      className="rounded-full px-8 h-12 bg-black text-white hover:bg-gray-900 font-medium"
                    >
                      Search
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-4">
                    <Link href="/explore">
                      <Button
                        size="lg"
                        className="bg-white text-black hover:bg-gray-100 h-14 px-8 rounded-full text-lg font-medium"
                      >
                        Explore Homes
                      </Button>
                    </Link>
                    {user.role === "OWNER" && (
                      <Link href="/owner/add-property">
                        <Button
                          size="lg"
                          variant="outline"
                          className="border-white text-white hover:bg-white/10 h-14 px-8 rounded-full text-lg bg-transparent"
                        >
                          List Property
                        </Button>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
            {/* Decorative Image in Hero */}
            <div className="md:col-span-5 relative h-[400px] md:h-[600px] rounded-t-[10rem] rounded-b-3xl overflow-hidden border-4 border-white/10 shadow-2xl">
              <Image
                src="/luxury-modern-vacation-home-interior-with-view.jpg"
                alt="Hero interior"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </section>

        {/* Logic: Dashboard Section - Styled minimally */}
        {user && (
          <section className="py-20 bg-background">
            <div className="container mx-auto px-6">
              <div className="flex items-center gap-4 mb-12">
                <h2 className="text-3xl md:text-4xl font-serif text-foreground">Welcome back, Traveler</h2>
                <div className="h-px flex-1 bg-border" />
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {user.role === "OWNER" && (
                  <>
                    <Link
                      href="/owner/my-properties"
                      className="group bg-card border border-border p-8 rounded-xl hover:border-primary transition-colors"
                    >
                      <h3 className="text-2xl font-serif mb-2 group-hover:text-primary transition-colors">
                        My Properties
                      </h3>
                      <p className="text-muted-foreground mb-4">Manage listings & status.</p>
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </Link>
                    <Link
                      href="/owner/add-property"
                      className="group bg-card border border-border p-8 rounded-xl hover:border-primary transition-colors"
                    >
                      <h3 className="text-2xl font-serif mb-2 group-hover:text-primary transition-colors">Add New</h3>
                      <p className="text-muted-foreground mb-4">List a home for rent.</p>
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </Link>
                  </>
                )}

                <Link
                  href="/explore"
                  className="group bg-card border border-border p-8 rounded-xl hover:border-primary transition-colors md:col-span-1"
                >
                  <h3 className="text-2xl font-serif mb-2 group-hover:text-primary transition-colors">Explore</h3>
                  <p className="text-muted-foreground mb-4">Browse verified stays.</p>
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* How It Works - Editorial Style */}
        <HowItWorks />

        {/* Featured Properties - Editorial Grid */}
        <section className="container mx-auto px-6 py-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div className="max-w-xl">
              <h2 className="text-4xl md:text-5xl font-serif mb-4 text-foreground">Curated Collections</h2>
              <p className="text-muted-foreground text-lg">
                Hand-picked homes verified for quality, comfort, and style.
              </p>
            </div>
            <Button
              variant="outline"
              className="rounded-full border-foreground/20 hover:bg-foreground hover:text-background bg-transparent"
            >
              View all collections
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <PropertyCard
              image="/modern-villa-california.jpg"
              title="Entire villa in Malibu"
              location="Malibu, CA"
              rating={4.95}
              price={450}
              dates="Oct 22 - 27"
              isGuestFavorite={true}
            />
            <PropertyCard
              image="/cozy-cabin-alps.jpg"
              title="Cozy chalet"
              location="Chamonix, FR"
              rating={4.88}
              price={210}
              dates="Nov 5 - 10"
            />
            <PropertyCard
              image="/minimalist-apartment-tokyo.jpg"
              title="Modern loft"
              location="Tokyo, JP"
              rating={4.92}
              price={135}
              dates="Dec 12 - 17"
              isGuestFavorite={true}
            />
            <PropertyCard
              image="/luxury-penthouse-new-york.jpg"
              title="Penthouse"
              location="New York, NY"
              rating={4.85}
              price={620}
              dates="Jan 15 - 20"
            />
          </div>
        </section>

        {/* Features - Minimalist */}
        <FeaturesSection />

        {/* Host CTA - Editorial Split */}
        {(!user || user.role !== "OWNER") && (
          <section className="py-24 px-6">
            <div className="container mx-auto bg-[#3E3935] text-[#F5F2EF] rounded-3xl overflow-hidden">
              <div className="grid md:grid-cols-2">
                <div className="p-12 md:p-20 flex flex-col justify-center">
                  <h2 className="text-4xl md:text-6xl font-serif mb-6 leading-none">
                    Open your <br />
                    <span className="italic text-[#A65D42]">door.</span>
                  </h2>
                  <p className="text-lg text-white/80 mb-10 max-w-sm leading-relaxed">
                    Become a host and share your sanctuary with the world. Simple, secure, and rewarding.
                  </p>
                  <div>
                    <Link href="/sign-up">
                      <Button
                        size="lg"
                        className="bg-[#F5F2EF] text-[#3E3935] hover:bg-white rounded-full px-8 h-14 text-lg"
                      >
                        Start Hosting
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="relative h-[400px] md:h-auto min-h-[500px]">
                  <Image src="/happy-people-hosting-dinner.jpg" alt="Hosting" fill className="object-cover" />
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}
