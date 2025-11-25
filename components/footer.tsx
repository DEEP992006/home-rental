import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h4 className="font-bold text-gray-900 mb-4">Support</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="#" className="hover:underline">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  AirCover
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  Anti-discrimination
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  Disability support
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  Cancellation options
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-4">Hosting</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="#" className="hover:underline">
                  Roam your home
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  AirCover for Hosts
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  Hosting resources
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  Community forum
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  Hosting responsibly
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-4">Roam</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="#" className="hover:underline">
                  Newsroom
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  New features
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  Investors
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  Gift cards
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-4">Get the app</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Experience Roam on mobile. Available on iOS and Android.
            </p>
            <div className="flex gap-2">
              {/* Placeholder for app store badges */}
              <div className="h-10 w-32 bg-gray-200 rounded-md"></div>
              <div className="h-10 w-32 bg-gray-200 rounded-md"></div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div className="flex flex-wrap justify-center gap-4">
            <span>© 2025 Roam, Inc.</span>
            <Link href="#" className="hover:underline">
              Privacy
            </Link>
            <Link href="#" className="hover:underline">
              Terms
            </Link>
            <Link href="#" className="hover:underline">
              Sitemap
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span>English (US)</span>
            <span>$ USD</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
