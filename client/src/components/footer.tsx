import { FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";
import logoPath from "@assets/download-removebg-preview.png";

export default function Footer() {
  const productLinks = [
    { label: "Features", href: "#" },
    { label: "Pricing", href: "#" },
    { label: "Documentation", href: "#" },
    { label: "API Reference", href: "#" },
  ];

  const supportLinks = [
    { label: "Help Center", href: "#" },
    { label: "Contact Us", href: "#" },
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
  ];

  const socialLinks = [
    { icon: FaTwitter, href: "https://x.com/Narrisia147692?t=8wzvqhk09rJsqmM9rGRvhw&s=09", label: "Twitter" },
    { icon: FaInstagram, href: "https://www.instagram.com/narrisiaai?igsh=YnpudzJjNnYwY2o5", label: "Instagram" },
    { icon: FaLinkedin, href: "https://www.linkedin.com/company/narrisia/", label: "LinkedIn" },
  ];

  return (
    <footer className="bg-gray-900 text-green-200 py-16 border-t border-green-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <img src={logoPath} alt="Narrisia.AI Logo" className="h-8 w-8 mr-3" />
              <span className="font-bold text-xl text-green-400">Narrisia.AI</span>
            </div>
            <p className="text-green-200 mb-6 max-w-md leading-relaxed">
              Building the future of AI development with powerful tools and seamless experiences.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-200 hover:text-green-400 transition-colors duration-200"
                    aria-label={social.label}
                  >
                    <IconComponent className="text-xl h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-green-400 font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-green-200 hover:text-green-300 transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-green-400 font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-green-200 hover:text-green-300 transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-green-400 mt-12 pt-8 text-center">
          <p className="text-green-200">© 2024 Narrisia.AI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
