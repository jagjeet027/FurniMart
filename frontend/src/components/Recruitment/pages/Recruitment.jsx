import React, { useState, useEffect } from 'react';
import { 
  Compass, ArrowRight, Star, Mountain, Users, Lightbulb, 
  Trophy, Heart, Coffee, Zap, Target, Globe, ChevronDown,
  MapPin, Clock, DollarSign, Briefcase, Award, Sparkles,
  BookOpen, Shield, Smile, TrendingUp, Home, Phone, Mail,
  Building, Rocket, Eye, CheckCircle
} from 'lucide-react';

const FurniMartRecruitment = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleExplore = () => {
    // Navigate to staff dashboard or show success message
    window.open('/recruitment/staff/dashboard');
  };

  const benefits = [
    { icon: DollarSign, title: "Competitive Salary", desc: "Industry-leading compensation packages with performance bonuses" },
    { icon: Heart, title: "Health & Wellness", desc: "Comprehensive health coverage including family medical insurance" },
    { icon: Coffee, title: "Flexible Hours", desc: "Work-life balance that matters with flexible timing options" },
    { icon: Trophy, title: "Growth Opportunities", desc: "Clear career advancement paths with mentorship programs" },
    { icon: Globe, title: "Remote Options", desc: "Hybrid and remote work flexibility for better productivity" },
    { icon: Award, title: "Learning Budget", desc: "Annual ₹50,000 budget for skill development and certifications" },
    { icon: BookOpen, title: "Training Programs", desc: "Regular workshops and skill enhancement sessions" },
    { icon: Shield, title: "Job Security", desc: "Stable employment with long-term career prospects" },
    { icon: Smile, title: "Fun Workplace", desc: "Vibrant office culture with team events and celebrations" }
  ];

  const positions = [
    {
      title: "Furniture Design Innovator",
      department: "Creative Design",
      location: "Mumbai, India",
      type: "Full-time",
      experience: "3-5 years",
      salary: "₹6-10 LPA",
      description: "Shape the future of furniture design with cutting-edge concepts and innovative solutions"
    },
    {
      title: "Digital Marketing Adventurer",
      department: "Marketing",
      location: "Bangalore, India", 
      type: "Full-time",
      experience: "2-4 years",
      salary: "₹4-8 LPA",
      description: "Lead our digital presence across all platforms and drive customer engagement"
    },
    {
      title: "Customer Experience Champion",
      department: "Support",
      location: "Delhi, India",
      type: "Full-time",
      experience: "1-3 years",
      salary: "₹3-6 LPA",
      description: "Be the voice that delights our customers daily and ensures satisfaction"
    },
    {
      title: "Supply Chain Explorer",
      department: "Operations",
      location: "Chennai, India",
      type: "Full-time", 
      experience: "4-6 years",
      salary: "₹8-12 LPA",
      description: "Optimize our global furniture supply network and logistics operations"
    },
    {
      title: "Sales Territory Manager",
      department: "Sales",
      location: "Pune, India",
      type: "Full-time",
      experience: "2-5 years",
      salary: "₹5-9 LPA",
      description: "Drive sales growth in your territory and build lasting client relationships"
    },
    {
      title: "Quality Assurance Specialist",
      department: "Quality",
      location: "Hyderabad, India",
      type: "Full-time",
      experience: "2-4 years",
      salary: "₹4-7 LPA",
      description: "Ensure our furniture meets the highest quality standards and customer expectations"
    }
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Senior Designer",
      quote: "FurniMart gave me the platform to revolutionize modern Indian furniture design. The creative freedom here is unparalleled.",
      avatar: "PS"
    },
    {
      name: "Rahul Kumar", 
      role: "Marketing Lead",
      quote: "The creative freedom and support here is unmatched. Every day is an adventure filled with new challenges and opportunities!",
      avatar: "RK"
    },
    {
      name: "Anita Patel",
      role: "Operations Manager", 
      quote: "Working at FurniMart means being part of India's furniture transformation story. The growth opportunities are endless.",
      avatar: "AP"
    }
  ];

  const companyValues = [
    {
      icon: Eye,
      title: "Innovation First",
      description: "We constantly push boundaries and embrace new ideas that revolutionize the furniture industry."
    },
    {
      icon: Users,
      title: "Team Spirit",
      description: "Collaboration and teamwork are at the heart of everything we do at FurniMart."
    },
    {
      icon: Trophy,
      title: "Excellence",
      description: "We strive for excellence in every piece of furniture and every customer interaction."
    },
    {
      icon: Heart,
      title: "Customer Love",
      description: "Our customers are our priority, and we go above and beyond to exceed their expectations."
    }
  ];

  const workCulture = [
    { title: "Open Communication", desc: "No hierarchies, just honest conversations and transparent feedback." },
    { title: "Learning Environment", desc: "Continuous growth opportunities with access to latest tools and technologies." },
    { title: "Work-Life Balance", desc: "Flexible schedules and remote work options for better personal time." },
    { title: "Recognition Programs", desc: "Regular appreciation and rewards for outstanding performance." },
    { title: "Team Building", desc: "Monthly team outings, festivals celebrations, and fun activities." },
    { title: "Health & Wellness", desc: "Yoga sessions, health checkups, and wellness programs for all employees." }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50 text-gray-800 relative">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-orange-200/20 rounded-full blur-xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-200/20 rounded-full blur-xl animate-float animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-rose-200/20 rounded-full blur-xl animate-float animation-delay-4000"></div>
        
        {/* Floating Furniture Icons */}
        <div className="absolute top-1/4 right-1/4 opacity-10 animate-float">
          <div className="w-16 h-16 bg-orange-300 rounded-lg transform rotate-12"></div>
        </div>
        <div className="absolute bottom-1/4 left-1/3 opacity-10 animate-float animation-delay-3000">
          <div className="w-12 h-20 bg-purple-300 rounded-t-lg transform -rotate-6"></div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="relative">
            <div className="inline-block px-6 py-3 bg-orange-100 text-orange-800 rounded-full text-lg font-semibold mb-8">
              🪑 Join FurniMart's Adventure
            </div>
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black leading-tight text-gray-900 mb-8">
              Craft Your
              <span className="block mt-4 bg-gradient-to-r from-orange-500 via-purple-500 to-rose-500 bg-clip-text text-transparent">
                Dream Career
              </span>
            </h1>
            <div className="absolute -top-8 -right-8 w-20 h-20 border-4 border-orange-400/30 rounded-full animate-spin-slow"></div>
          </div>

          <p className="text-2xl sm:text-3xl text-gray-600 leading-relaxed font-medium mb-12 max-w-4xl mx-auto">
            Ready to revolutionize India's furniture industry? Join our tribe of 
            <span className="text-orange-600 font-bold"> innovators</span>, 
            <span className="text-purple-600 font-bold"> creators</span>, and 
            <span className="text-rose-600 font-bold"> dreamers</span>. 
            Your extraordinary journey starts now!
          </p>

          {/* Journey Steps */}
          <div className="relative mt-16 py-12 max-w-4xl mx-auto">
            <div className="absolute left-0 top-1/2 w-full h-3 bg-gradient-to-r from-orange-200 via-purple-200 to-rose-200 rounded-full transform -translate-y-1/2"></div>
            <div className="relative flex justify-between">
              <div className="flex flex-col items-center space-y-4 group cursor-pointer">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center transform group-hover:scale-125 transition-all duration-300 shadow-xl">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <span className="text-lg font-bold text-gray-700">Apply</span>
              </div>
              <div className="flex flex-col items-center space-y-4 group cursor-pointer">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center transform group-hover:scale-125 transition-all duration-300 shadow-xl">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <span className="text-lg font-bold text-gray-700">Interview</span>
              </div>
              <div className="flex flex-col items-center space-y-4 group cursor-pointer">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center transform group-hover:scale-125 transition-all duration-300 shadow-xl">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <span className="text-lg font-bold text-gray-700">Join Team</span>
              </div>
              <div className="flex flex-col items-center space-y-4 group cursor-pointer">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center transform group-hover:scale-125 transition-all duration-300 shadow-xl">
                  <Compass className="w-8 h-8 text-white" />
                </div>
                <span className="text-lg font-bold text-gray-700">Lead</span>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 items-center justify-center mt-16">
            <button
              onClick={handleExplore}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="group relative inline-flex items-center px-12 py-6 text-2xl font-black overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 via-purple-500 to-rose-500 text-white transition-all duration-500 hover:from-orange-600 hover:via-purple-600 hover:to-rose-600 transform hover:scale-110 hover:shadow-2xl shadow-lg"
            >
              <span className="relative z-10 flex items-center gap-4">
                🚀 Start Your Adventure
                <ArrowRight 
                  className={`w-8 h-8 transition-transform duration-300 ${
                    isHovered ? 'translate-x-3' : ''
                  }`}
                />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </button>

            <button className="inline-flex items-center px-10 py-5 text-xl font-bold border-3 border-gray-800 text-gray-800 rounded-2xl hover:bg-gray-800 hover:text-white transition-all duration-300 transform hover:scale-105">
              View Open Positions
              <ChevronDown className="w-6 h-6 ml-3" />
            </button>
          </div>
        </div>
      </section>

      {/* Company Values Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-gray-50 to-orange-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-6">
              Our <span className="text-orange-600">Core Values</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              At FurniMart, our values drive everything we do. Join a company that believes in making a difference.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {companyValues.map((value, index) => (
              <div key={index} className="text-center p-8 bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 transform hover:rotate-12 transition-transform duration-500">
                  <value.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-orange-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-6">
              Why Choose <span className="text-orange-600">FurniMart</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We believe great furniture starts with great people. Discover the benefits that make FurniMart India's most exciting place to work.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="group relative p-8 bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 border-2 border-transparent hover:border-orange-200">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-orange-400 to-purple-500 rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-500">
                  <benefit.icon className="w-6 h-6 text-white" />
                </div>
                <div className="pt-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Work Culture Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-6">
              Our <span className="text-purple-600">Work Culture</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience a workplace where creativity thrives, ideas are valued, and every team member is empowered to make a difference.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {workCulture.map((culture, index) => (
              <div key={index} className="relative p-6 bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-orange-400">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{culture.title}</h3>
                    <p className="text-gray-600">{culture.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-50 to-rose-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-6">
              Open <span className="text-purple-600">Positions</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Find your perfect role and start your journey with India's fastest-growing furniture company.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {positions.map((position, index) => (
              <div key={index} className="group relative p-8 bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-102 border-2 border-gray-100 hover:border-orange-200">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{position.title}</h3>
                    <div className="flex gap-2 mb-2">
                      <span className="inline-block px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-semibold">
                        {position.department}
                      </span>
                      <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                        {position.salary}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-orange-500 group-hover:translate-x-2 transition-all duration-300" />
                </div>

                <p className="text-gray-600 mb-6">{position.description}</p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-orange-500" />
                    <span className="text-sm text-gray-600">{position.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-500" />
                    <span className="text-sm text-gray-600">{position.type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-rose-500" />
                    <span className="text-sm text-gray-600">{position.experience}</span>
                  </div>
                </div>

                <button className="w-full py-3 bg-gradient-to-r from-orange-500 to-purple-500 text-white font-bold rounded-xl hover:from-orange-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105">
                  Apply Now
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-6">
              Hear from Our <span className="text-rose-600">Team</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real stories from real FurniMart heroes who are shaping the future of furniture in India.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="relative p-8 bg-gradient-to-br from-orange-50 to-purple-50 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-700 italic mb-4">"{testimonial.quote}"</p>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-gray-50 to-orange-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-6">
              Get in <span className="text-orange-600">Touch</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Have questions about our open positions? Our HR team is here to help you start your FurniMart journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Call Us</h3>
              <p className="text-gray-600">+91 98765 43210</p>
              <p className="text-gray-600">Mon - Fri, 9 AM - 6 PM</p>
            </div>

            <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Email Us</h3>
              <p className="text-gray-600">careers@furnimart.com</p>
              <p className="text-gray-600">We'll respond within 24 hours</p>
            </div>

            <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
              <div className="w-16 h-16 bg-gradient-to-br from-rose-400 to-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Visit Us</h3>
              <p className="text-gray-600">FurniMart HQ, Mumbai</p>
              <p className="text-gray-600">Open for office visits</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 to-gray-800 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-black mb-8">
            Ready to Build the Future of 
            <span className="block mt-2 bg-gradient-to-r from-orange-400 to-purple-400 bg-clip-text text-transparent">
              Indian Furniture?
            </span>
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Join FurniMart today and be part of a revolution that's transforming how India thinks about furniture, design, and lifestyle. Your dream career awaits!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 items-center justify-center">
            <button 
              onClick={handleExplore}
              className="inline-flex items-center px-12 py-6 text-xl font-black bg-gradient-to-r from-orange-500 to-purple-500 text-white rounded-2xl hover:from-orange-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-110 shadow-2xl"
            >
              🚀 Join Our Team Now
              <ArrowRight className="w-6 h-6 ml-3" />
            </button>
            
            <button className="inline-flex items-center px-8 py-4 text-lg font-bold border-2 border-white text-white rounded-2xl hover:bg-white hover:text-gray-900 transition-all duration-300 transform hover:scale-105">
              Learn More About Us
            </button>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 12s linear infinite;
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-3000 {
          animation-delay: 3s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default FurniMartRecruitment;