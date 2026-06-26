import { Link } from "react-router-dom";
import { Code2, Database, Palette, Zap } from "lucide-react";
import { DEFAULT_IMAGES } from "../utils/images.js";
import SafeImage from "../components/SafeImage.jsx";

export default function About() {
  const team = [
    {
      name: "Tanuja Lokhande",
      role: "Frontend Developer",
      details: [
        "React & Component Architecture",
        "Responsive UI with Tailwind CSS",
        "State Management & Hooks",
      ],
      contribution: "Engineered the complete user-facing interface with interactive React components, responsive design, and smooth animations. Implemented dynamic state management and seamless user interactions across all pages.",
      icon: Code2,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      img: '/assets/team/Tanuja.jpeg',
    },
    {
      name: "Unnati Kute",
      role: "Backend Developer",
      details: [
        "REST API Development",
        "Spring Boot Architecture",
        "Business Logic Implementation",
      ],
      contribution: "Built robust backend services with Spring Boot, designed scalable REST APIs, and implemented complex business logic. Managed data validation, error handling, and security protocols across all endpoints.",
      icon: Zap,
      color: "from-yellow-500 to-orange-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      img: '/assets/team/unnati.png',
    },
    {
      name: "Nikita Nijave",
      role: "Database Manager",
      details: [
        "Database Design & Optimization",
        "Data Integrity & Relationships",
        "Query Performance Tuning",
      ],
      contribution: "Designed normalized database schemas with optimal relationships, implemented efficient queries, and ensured data consistency. Optimized database performance and implemented backup strategies.",
      icon: Database,
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      img:  '/assets/team/nikita.jpg',
    },
    {
      name: "Vaishnavi Kadam",
      role: "Frontend Developer",
      details: [
        "UI/UX Design Implementation",
        "Visual Styling & Animations",
        "Component Reusability",
      ],
      contribution: "Created beautiful and intuitive user interfaces with pixel-perfect designs, implemented smooth animations, and ensured accessibility standards. Designed reusable component library for consistent branding.",
      icon: Palette,
      color: "from-purple-500 to-pink-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      img: '/assets/team/vaishnavi.jpeg',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">
            About LocalLoot
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed mb-4">
            LocalLoot is a revolutionary platform connecting neighbourhood shoppers with incredible local deals while empowering small businesses to reach nearby customers and grow their communities.
          </p>
          <p className="text-lg text-gray-600 mb-6">
            We believe in supporting local commerce and making it effortless for everyone to discover amazing deals from trusted local shops.
          </p>
          <Link 
            to="/contact" 
            className="inline-block px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            Get in Touch
          </Link>
        </div>

        {/* Our Mission Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-l-4 border-blue-500">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">🎯 Our Mission</h3>
            <p className="text-gray-600">
              To bridge the gap between local businesses and shoppers by creating an intuitive platform that celebrates neighbourhood commerce and builds stronger community connections.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-l-4 border-indigo-500">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">💡 Our Vision</h3>
            <p className="text-gray-600">
              To become the go-to platform where local businesses thrive and customers discover exclusive deals within their communities, fostering sustainable local economies.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-l-4 border-purple-500">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">🚀 Our Values</h3>
            <p className="text-gray-600">
              Community-first approach, transparency, innovation, and inclusivity. We're committed to making local commerce accessible to everyone while supporting small business growth.
            </p>
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-3">Meet Our Team</h2>
            <p className="text-lg text-gray-600">Four passionate developers building the future of local commerce</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member) => {
              const IconComponent = member.icon;
              return (
                <div
                  key={member.name}
                  className={`group relative ${member.bgColor} rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border-2 ${member.borderColor} overflow-hidden`}
                >
                  {/* Animated background gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${member.color} opacity-0 group-hover:opacity-10 transition-all duration-300`}></div>

                  {/* Content */}
                  <div className="relative z-10">
                    {/* Icon */}
                    <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br ${member.color} mb-4 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300`}>
                      <IconComponent className="w-7 h-7 text-white" />
                    </div>

                    {/* Profile Image with Animation */}
                    <div className="mb-4 relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-900 rounded-2xl opacity-0 group-hover:opacity-10 transition-all duration-300"></div>
                      <SafeImage
                        src={member.img}
                        alt={member.name}
                        fallback={DEFAULT_IMAGES.avatar}
                        className="w-33 h-33 rounded-2xl object-cover shadow-lg transform group-hover:scale-110 transition-all duration-300 mx-auto"
                      />
                    </div>

                    {/* Name and Role */}
                    <div className="text-center mb-4">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-300">
                        {member.name}
                      </h3>
                      <p className={`text-sm font-semibold bg-gradient-to-r ${member.color} bg-clip-text text-transparent mt-1`}>
                        {member.role}
                      </p>
                    </div>

                    {/* Key Skills/Details */}
                    <div className="mb-4 space-y-2 max-h-0 opacity-0 group-hover:max-h-40 group-hover:opacity-100 transition-all duration-500 overflow-hidden">
                      <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Key Skills:</p>
                      {member.details.map((detail, idx) => (
                        <div key={idx} className="text-xs text-gray-600 flex items-start">
                          <span className={`inline-block w-1.5 h-1.5 rounded-full bg-gradient-to-r ${member.color} mr-2 mt-1 flex-shrink-0`}></span>
                          {detail}
                        </div>
                      ))}
                    </div>

                    {/* Contribution */}
                    <p className="text-sm text-gray-700 leading-relaxed line-clamp-4 group-hover:line-clamp-none transition-all duration-300 font-medium">
                      {member.contribution}
                    </p>

                    {/* Decorative divider */}
                    <div className={`h-1 bg-gradient-to-r ${member.color} rounded-full mt-4 transform scale-x-0 group-hover:scale-x-100 transition-all duration-300 origin-left`}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Why Choose Us Section */}
        <div className="bg-white rounded-2xl p-12 shadow-xl mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Why Choose LocalLoot?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🛍️</span>
              </div>
              <div>
                <h4 className="font-bold text-lg text-gray-900 mb-2">Curated Local Deals</h4>
                <p className="text-gray-600">Discover exclusive offers from trusted neighbourhood shops, all in one convenient place.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🤝</span>
              </div>
              <div>
                <h4 className="font-bold text-lg text-gray-900 mb-2">Support Local Business</h4>
                <p className="text-gray-600">Help small businesses grow by shopping locally and building community connections.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">⚡</span>
              </div>
              <div>
                <h4 className="font-bold text-lg text-gray-900 mb-2">Smart Recommendations</h4>
                <p className="text-gray-600">Get personalized deal suggestions based on your preferences and shopping patterns.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-lg bg-pink-100 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🎁</span>
              </div>
              <div>
                <h4 className="font-bold text-lg text-gray-900 mb-2">Exclusive Rewards</h4>
                <p className="text-gray-600">Earn points on every purchase and unlock special rewards at your favourite local shops.</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-12 text-center shadow-xl">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Discover Local Deals?</h2>
          <p className="text-blue-100 text-lg mb-8">Join thousands of shoppers and businesses building stronger communities</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup?role=user"
              className="px-8 py-3 bg-white text-indigo-600 rounded-full font-bold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              Sign Up as Shopper
            </Link>
            <Link
              to="/signup?role=shopkeeper"
              className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-full font-bold hover:bg-white hover:text-indigo-600 transition-all duration-300"
            >
              Join as Merchant
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }

        .line-clamp-4 {
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .line-clamp-none {
          display: block;
        }
      `}</style>
    </div>
  );
}
