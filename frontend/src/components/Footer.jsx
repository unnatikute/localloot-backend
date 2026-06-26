import { Link } from "react-router-dom";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  Heart,
} from "lucide-react";
import MyBookmarks from "./../pages/MyBookmarks";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-gray-900 via-gray-900 to-black text-gray-300 mt-12 md:mt-16 animate-fade-up border-t border-purple-500/20">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* Brand Section */}
          <div className="sm:col-span-2 md:col-span-1 transform hover:scale-105 transition-all duration-300">
            <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2 md:mb-3 hover:from-yellow-300 hover:to-yellow-400 transition-all duration-300">
              Local
              <span className="text-yellow-300 hover:text-yellow-200 transition-colors">
                Loot
              </span>
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed mb-3 hover:text-gray-300 transition-colors">
              Discover the best local offers and deals in your area. Your
              one-stop destination for authentic local businesses and amazing
              discounts.
            </p>
            <div className="flex gap-3 mb-3 md:mb-0">
              <a
                href="#"
                className="bg-blue-600 hover:bg-blue-700 p-2 rounded-lg transition-all duration-300 transform hover:scale-125 hover:rotate-12 shadow-lg hover:shadow-xl"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="bg-sky-500 hover:bg-sky-600 p-2 rounded-lg transition-all duration-300 transform hover:scale-125 hover:rotate-12 shadow-lg hover:shadow-xl"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="bg-pink-600 hover:bg-pink-700 p-2 rounded-lg transition-all duration-300 transform hover:scale-125 hover:rotate-12 shadow-lg hover:shadow-xl"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="bg-indigo-600 hover:bg-indigo-700 p-2 rounded-lg transition-all duration-300 transform hover:scale-125 hover:rotate-12 shadow-lg hover:shadow-xl"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="transform hover:scale-105 transition-all duration-300 hover:translate-x-1">
            <h4 className="text-white font-bold mb-4 text-lg flex items-center gap-2 group">
              <span className="text-blue-400 group-hover:rotate-180 transition-transform duration-500">
                🔗
              </span>{" "}
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-gray-400 hover:text-yellow-300 transition-all duration-300 font-medium flex items-center gap-2 group"
                >
                  <span className="group-hover:translate-x-1 transition-transform duration-300">
                    →
                  </span>{" "}
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/categories"
                  className="text-gray-400 hover:text-yellow-300 transition-all duration-300 font-medium flex items-center gap-2 group"
                >
                  <span className="group-hover:translate-x-1 transition-transform duration-300">
                    →
                  </span>{" "}
                  Categories
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-gray-400 hover:text-yellow-300 transition-all duration-300 font-medium flex items-center gap-2 group"
                >
                  <span className="group-hover:translate-x-1 transition-transform duration-300">
                    →
                  </span>{" "}
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-gray-400 hover:text-yellow-300 transition-all duration-300 font-medium flex items-center gap-2 group"
                >
                  <span className="group-hover:translate-x-1 transition-transform duration-300">
                    →
                  </span>{" "}
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* My Account */}
          <div className="transform hover:scale-105 transition-all duration-300 hover:translate-x-1">
            <h4 className="text-white font-bold mb-4 text-lg flex items-center gap-2 group">
              <span className="text-purple-400 group-hover:scale-125 transition-transform duration-300">
                👤
              </span>{" "}
              My Account
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
  to="/mylikes"
  className="text-gray-400 hover:text-yellow-300 transition-all duration-300 font-medium flex items-center gap-2 group"
>
  <span className="group-hover:scale-125 transition-transform duration-300">
    ❤️
  </span>{" "}
  My Likes
</Link>

<Link
  to="/mybookmarks"
  className="text-gray-400 hover:text-yellow-300 transition-all duration-300 font-medium flex items-center gap-2 group"
>
  <span className="group-hover:scale-125 transition-transform duration-300">
    🔖
  </span>{" "}
  My Bookmarks
</Link>
              </li>
              <li>
                <Link
                  to="/shop-dashboard"
                  className="text-gray-400 hover:text-yellow-300 transition-all duration-300 font-medium flex items-center gap-2 group"
                >
                  <span className="group-hover:scale-125 transition-transform duration-300">
                    📊
                  </span>{" "}
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect Section */}
          <div className="transform hover:scale-105 transition-all duration-300 hover:translate-x-1">
            <h4 className="text-white font-bold mb-4 text-lg flex items-center gap-2 group">
              <span className="text-green-400 group-hover:scale-125 transition-transform duration-300">
                📞
              </span>{" "}
              Connect With Us
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 group cursor-pointer hover:translate-x-1 transition-all duration-300">
                <Mail className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0 group-hover:rotate-12 transition-transform duration-300" />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <a
                    href="mailto:support@localloot.com"
                    className="text-gray-300 hover:text-yellow-300 transition-colors font-medium"
                  >
                    support@localloot.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3 group cursor-pointer hover:translate-x-1 transition-all duration-300">
                <Phone className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <a
                    href="tel:+919876543210"
                    className="text-gray-300 hover:text-yellow-300 transition-colors font-medium"
                  >
                    +91 98765 43210
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3 group cursor-pointer hover:translate-x-1 transition-all duration-300">
                <MapPin className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                <div>
                  <p className="text-xs text-gray-500">Location</p>
                  <p className="text-gray-300 font-medium group-hover:text-yellow-300 transition-colors">
                    Pune, Maharashtra, India
                  </p>
                </div>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="sm:col-span-2 md:col-span-1 transform hover:scale-105 transition-all duration-300">
            <h4 className="text-white font-bold mb-4 text-lg flex items-center gap-2 group">
              <span className="text-red-400 group-hover:animate-pulse">📧</span>{" "}
              Newsletter
            </h4>
            <p className="text-sm text-gray-400 mb-3 hover:text-gray-300 transition-colors">
              Subscribe to get exclusive deals and updates!
            </p>
            <div className="flex flex-col gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 focus:shadow-lg focus:shadow-yellow-400/20 transition-all duration-300 text-sm transform focus:scale-105"
              />
              <button className="px-3 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 rounded-lg font-bold hover:from-yellow-500 hover:to-orange-500 transition-all duration-300 shadow-lg hover:shadow-xl text-sm transform hover:scale-105 active:scale-95">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 pt-4 md:pt-6">
          {/* Copyright */}
          <div className="text-center pt-4 md:pt-6 border-t border-gray-700 transform hover:scale-105 transition-all duration-300">
            <p className="text-gray-400 text-sm mb-2 hover:text-gray-300 transition-colors">
              © {currentYear}{" "}
              <span className="font-bold text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text hover:from-yellow-300 hover:to-yellow-400 transition-all duration-300">
                LocalLoot
              </span>
              . All rights reserved.
            </p>
            <p className="text-gray-500 text-xs flex items-center justify-center gap-1 flex-wrap hover:text-gray-400 transition-colors">
              Made with{" "}
              <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" />{" "}
              in Pune, India 🇮🇳
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-up {
          animation: fade-up 0.6s ease-out forwards;
        }
      `}</style>
    </footer>
  );
}
