import { Instagram, Twitter, Youtube } from "lucide-react"

const footerLinks = {
  Product: ["Features", "Pricing", "Integrations", "API"],
  Resources: ["Help Center", "Blog", "Tutorials", "Community"],
  Company: ["About", "Careers", "Press", "Contact"],
  Legal: ["Privacy", "Terms", "License", "Cookies"],
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/30">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <a href="#" className="font-serif text-2xl font-medium">
              PixelMarket
            </a>
            <p className="mt-4 text-muted-foreground max-w-xs leading-relaxed">
              The premium marketplace where photographers earn what they deserve.
            </p>
            <div className="flex gap-4 mt-6">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-medium mb-4">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} PixelMarket. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Made with care for photographers worldwide.
          </p>
        </div>
      </div>
    </footer>
  )
}
