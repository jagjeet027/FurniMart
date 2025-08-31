import React, { useState, useEffect } from 'react';
import { Search, MapPin, Clock, DollarSign, Users, Building, CheckCircle, ArrowRight, Briefcase, Target, Award, Globe, Star, TrendingUp, Shield, Heart, Coffee, Zap, ChevronDown, Play, ExternalLink, Mail, Phone, Linkedin, Twitter, Facebook, Instagram } from 'lucide-react';

import { useNavigate } from 'react-router-dom';

const FurnimartCareerPortal = () => {
  const navigate = useNavigate();
  const [selectedJob, setSelectedJob] = useState(null);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [applicationData, setApplicationData] = useState({
    name: '',
    email: '',
    phone: '',
    experience: '',
    position: '',
    resume: null,
    coverLetter: '',
    linkedin: '',
    portfolio: ''
  });

  // Auto-rotate testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleClickExplore = () => {
    navigate('/staff/hiring/');
  }

  const teamMembers = [
    {
      name: "Rajesh Kumar",
      position: "CEO & Founder",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face",
      quote: "Building trust in B2B commerce through innovation and verification excellence."
    },
    {
      name: "Priya Sharma",
      position: "Head of Verification",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face",
      quote: "Every verified manufacturer strengthens our ecosystem and builds industry trust."
    },
    {
      name: "Amit Singh",
      position: "CTO",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
      quote: "Technology is our backbone - we're building the future of furniture B2B."
    },
    {
      name: "Sneha Patel",
      position: "Head of People & Culture",
      image: "careerPortal/src/assetsjaggie.jpg",
      quote: "We believe great people build great products. Culture is our competitive advantage."
    }
  ];

  const testimonials = [
    {
      name: "Arjun Mehta",
      position: "Senior Developer",
      content: "Joining FurniMart was the best career decision I made. The technology challenges are exciting and the impact on the furniture industry is real.",
      rating: 5
    },
    {
      name: "Kavya Reddy",
      position: "Verification Manager",
      content: "The company's commitment to authenticity aligns perfectly with my values. Every day, I help build trust in our industry.",
      rating: 5
    },
    {
      name: "Rohit Gupta",
      position: "Business Analyst",
      content: "FurniMart provides incredible growth opportunities. The learning curve is steep but the support from leadership is exceptional.",
      rating: 5
    }
  ];

  const whyChooseReasons = [
    {
      icon: Shield,
      title: "Industry Pioneer",
      description: "Be part of India's first comprehensive manufacturer verification platform in furniture B2B commerce. We're setting industry standards."
    },
    {
      icon: TrendingUp,
      title: "Exponential Growth",
      description: "Join a rocket ship! 300% year-over-year growth, expanding to 50+ cities. Your career will scale with our success."
    },
    {
      icon: Target,
      title: "Meaningful Impact",
      description: "Your work directly fights fraud and builds trust. Help thousands of businesses find reliable partners and grow sustainably."
    },
    {
      icon: Zap,
      title: "Innovation Focus",
      description: "Work with AI-powered verification, blockchain for transparency, and cutting-edge B2B tools. Stay ahead of the curve."
    },
    {
      icon: Users,
      title: "Dream Team",
      description: "Collaborate with ex-founders, industry veterans, and brilliant minds from top companies. Learn from the best."
    },
    {
      icon: Globe,
      title: "Market Leadership",
      description: "Lead the transformation of a ₹50,000 crore industry. Be the architect of tomorrow's furniture commerce."
    }
  ];

  const cultureValues = [
    {
      icon: Heart,
      title: "Trust First",
      description: "Everything we do is built on trust - from verifying manufacturers to supporting our team members. Integrity is non-negotiable.",
      color: "from-red-500 to-pink-500"
    },
    {
      icon: Zap,
      title: "Move Fast",
      description: "We ship fast, learn faster, and iterate constantly. Speed without compromising quality is our superpower.",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: Users,
      title: "Team Obsessed",
      description: "We win together or not at all. Every team member's success contributes to our collective achievement.",
      color: "from-blue-500 to-purple-500"
    },
    {
      icon: Target,
      title: "Customer Centric",
      description: "Our B2B clients' success is our success. We obsess over making their wholesale operations seamless and profitable.",
      color: "from-green-500 to-teal-500"
    }
  ];

  const handleApplicationSubmit = (e) => {
    e.preventDefault();
    // Simulate admin data collection
    console.log('Application data for admin:', applicationData);
    alert('🎉 Application submitted successfully! Our admin team will review your application within 48 hours.');
    setApplicationData({
      name: '',
      email: '',
      phone: '',
      experience: '',
      position: '',
      resume: null,
      coverLetter: '',
      linkedin: '',
      portfolio: ''
    });
    setSelectedJob(null);
  };

  const companyStats = [
    { icon: Users, label: "Verified Manufacturers", value: "50+", growth: "+45% this year" },
    { icon: Building, label: "Partner Wholesalers", value: "200+", growth: "+80% this year" },
    { icon: Globe, label: "Cities Covered", value: "5+", growth: "Expanding to 50" },
    { icon: Award, label: "Years of Trust", value: "8+", growth: "Since 2017" }
  ];

  return (
    <div className="min-h-screen bg-slate-900 overflow-x-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1920&h=1080&fit=crop')] bg-cover bg-center opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent"></div>
        
        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="bg-white/5 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-2xl">
                  <Building className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">FurniMart</h1>
                  <p className="text-blue-200 text-sm">Careers Portal</p>
                </div>
              </div>
              <nav className="hidden md:flex space-x-8">
                <a href="/staff/hiring/" className="text-white hover:text-orange-400 transition-all duration-300 font-medium">Jobs</a>
                <a href="#culture" className="text-white hover:text-orange-400 transition-all duration-300 font-medium">Culture</a>
                <a href="#team" className="text-white hover:text-orange-400 transition-all duration-300 font-medium">Team</a>
                <a href="#benefits" className="text-white hover:text-orange-400 transition-all duration-300 font-medium">Benefits</a>
                <a href="https://furnimart.com" target="_blank" className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 flex items-center gap-2">
                  Visit Website <ExternalLink className="w-4 h-4" />
                </a>
              </nav>
            </div>
          </div>
        </header>

        {/* Hero Section with Background Image */}
        <section className="relative py-32 px-6 min-h-screen flex items-center">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1920&h=1080&fit=crop')] bg-cover bg-center"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-transparent"></div>
          
          <div className="relative max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-md rounded-full px-6 py-3 mb-8 border border-orange-500/30">
                <Star className="w-5 h-5 text-orange-400" />
                <span className="text-white font-medium">India's Most Trusted B2B Furniture Platform</span>
              </div>
              
              <h1 className="text-3xl md:text-5xl font-black text-white mb-8 leading-none">
                Shape the
                <span className="block bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
                  Future
                </span>
                <span className="block text-4xl md:text-3xl font-normal text-blue-200">
                  of Furniture Commerce
                </span>
              </h1>
              
              <p className="text-xl text-blue-100 mb-12 leading-relaxed max-w-xl">
                Join the revolution! We're not just building a platform - we're creating the trust infrastructure 
                that powers India's ₹50,000 crore furniture industry. Every line of code, every verification, 
                every relationship you build makes commerce more transparent and trustworthy.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6">
                <button 
                  onClick={handleClickExplore}
                  className="group bg-gradient-to-r from-orange-500 to-red-500 text-white px-10 py-5 rounded-2xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105 font-bold text-lg shadow-2xl hover:shadow-orange-500/25"
                >
                  <span className="flex items-center justify-center gap-3">
                    Explore Openings
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
                <button 
                  onClick={() => setIsVideoPlaying(true)}
                  className="group border-2 border-white/30 text-white px-10 py-5 rounded-2xl hover:bg-white/10 transition-all duration-300 backdrop-blur-sm font-bold text-lg"
                >
                  <span className="flex items-center justify-center gap-3">
                    <Play className="w-5 h-5" />
                    Watch Our Story
                  </span>
                </button>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
                <div className="grid grid-cols-2 gap-6">
                  {companyStats.map((stat, index) => (
                    <div key={index} className="text-center p-4 bg-white/5 rounded-2xl">
                      <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <stat.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                      <div className="text-blue-200 text-xs mb-1">{stat.label}</div>
                      <div className="text-green-400 text-xs font-medium">{stat.growth}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Video Modal */}
        {isVideoPlaying && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="relative max-w-4xl w-full">
              <button 
                onClick={() => setIsVideoPlaying(false)}
                className="absolute -top-12 right-0 text-white text-2xl hover:text-orange-400 transition-colors"
              >
                ×
              </button>
              <div className="bg-slate-800 rounded-2xl p-8 text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Play className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Company Story Video</h3>
                <p className="text-blue-200 mb-6">Experience our journey from startup to India's most trusted B2B furniture platform</p>
                <p className="text-gray-400 text-sm">Video integration available in production environment</p>
              </div>
            </div>
          </div>
        )}

        {/* Why Choose FurniMart - Enhanced */}
        <section className="py-24 px-6 bg-gradient-to-r from-slate-900/50 to-blue-900/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-md rounded-full px-6 py-3 mb-6">
                <Award className="w-5 h-5 text-orange-400" />
                <span className="text-white font-medium">Why Top Talent Chooses Us</span>
              </div>
              <h2 className="text-5xl font-bold text-white mb-6">Beyond Just a Job</h2>
              <p className="text-xl text-blue-200 max-w-3xl mx-auto">
                We're building more than a platform - we're crafting the future of how furniture businesses operate, 
                grow, and trust each other across India.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {whyChooseReasons.map((reason, index) => (
                <div 
                  key={index}
                  className="group bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:border-orange-500/30"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <reason.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4 group-hover:text-orange-400 transition-colors">
                    {reason.title}
                  </h3>
                  <p className="text-blue-200 leading-relaxed">{reason.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section id="team" className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-5xl font-bold text-white mb-6">Meet Our Leadership</h2>
              <p className="text-xl text-blue-200 max-w-3xl mx-auto">
                Visionary leaders with decades of combined experience in technology, furniture industry, and B2B commerce
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member, index) => (
                <div 
                  key={index}
                  className="group bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-500 hover:scale-105 text-center"
                >
                  <div className="relative mb-6">
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-gradient-to-r from-orange-500 to-red-500 group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-slate-900 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{member.name}</h3>
                  <p className="text-orange-400 text-sm font-medium mb-4">{member.position}</p>
                  <p className="text-blue-200 text-sm italic leading-relaxed">"{member.quote}"</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Culture & Values - Enhanced */}
        <section id="culture" className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-5xl font-bold text-white mb-6">Our Culture & Values</h2>
              <p className="text-xl text-blue-200 max-w-4xl mx-auto">
                At FurniMart, culture isn't just about perks - it's about creating an environment where 
                exceptional people do their best work while building something meaningful for the furniture industry.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-16">
              {cultureValues.map((value, index) => (
                <div 
                  key={index}
                  className="group bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-500 hover:scale-105"
                >
                  <div className={`w-16 h-16 bg-gradient-to-r ${value.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <value.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-orange-400 transition-colors">
                    {value.title}
                  </h3>
                  <p className="text-blue-200 leading-relaxed text-lg">{value.description}</p>
                </div>
              ))}
            </div>

            {/* Work Environment Showcase */}
            <div className="bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-xl rounded-3xl p-12 border border-white/20">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h3 className="text-3xl font-bold text-white mb-6">Work Environment That Inspires</h3>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center mt-1">
                        <Coffee className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-lg mb-2">Modern Workspace</h4>
                        <p className="text-blue-200">State-of-the-art offices with ergonomic furniture (we practice what we preach!), gaming zones, and collaborative spaces designed for creativity.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg flex items-center justify-center mt-1">
                        <Zap className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-lg mb-2">Innovation Labs</h4>
                        <p className="text-blue-200">Dedicated R&D spaces where you can experiment with new verification technologies, AI models, and platform features.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-500 rounded-lg flex items-center justify-center mt-1">
                        <Heart className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-lg mb-2">Wellness Focus</h4>
                        <p className="text-blue-200">On-site gym, meditation rooms, healthy catering, and regular wellness programs. We care about your holistic well-being.</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-3xl p-8 backdrop-blur-md border border-white/20">
                    <img 
                      src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop" 
                      alt="Modern office workspace"
                      className="w-full h-64 object-cover rounded-2xl mb-6"
                    />
                    <div className="text-center">
                      <h4 className="text-white font-bold text-lg mb-2">Our Ludhiana HQ</h4>
                      <p className="text-blue-200">Where innovation meets tradition in Punjab's furniture capital</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Employee Testimonials */}
        <section className="py-24 px-6 bg-gradient-to-br from-blue-900/30 to-purple-900/30 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">What Our Team Says</h2>
              <p className="text-blue-200 text-lg">Real stories from real FurniMart employees</p>
            </div>

            <div className="relative">
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 border border-white/20">
                <div className="text-center mb-8">
                  <div className="flex justify-center mb-6">
                    {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                      <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-2xl text-white font-medium leading-relaxed mb-8 max-w-4xl mx-auto">
                    "{testimonials[activeTestimonial].content}"
                  </blockquote>
                  <div>
                    <h4 className="text-xl font-bold text-white">{testimonials[activeTestimonial].name}</h4>
                    <p className="text-orange-400 font-medium">{testimonials[activeTestimonial].position}</p>
                  </div>
                </div>
                
                <div className="flex justify-center gap-3">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveTestimonial(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === activeTestimonial ? 'bg-orange-500 w-8' : 'bg-white/30'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Benefits Section */}
        <section id="benefits" className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-5xl font-bold text-white mb-6">Comprehensive Benefits Package</h2>
              <p className="text-xl text-blue-200 max-w-3xl mx-auto">
                We believe in taking care of our people so they can focus on building something extraordinary
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Health & Wellness */}
              <div className="bg-gradient-to-br from-green-500/10 to-blue-500/10 backdrop-blur-xl rounded-3xl p-8 border border-green-500/20">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-6">Health & Wellness</h3>
                <ul className="text-blue-100 space-y-3">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span>₹5L comprehensive health insurance</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span>Annual health checkups & wellness programs</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span>Mental health support & counseling</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span>₹20K annual gym/fitness reimbursement</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span>Healthy meals & snacks at office</span>
                  </li>
                </ul>
              </div>

              {/* Financial Benefits */}
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl rounded-3xl p-8 border border-purple-500/20">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6">
                  <DollarSign className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-6">Financial Growth</h3>
                <ul className="text-blue-100 space-y-3">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-purple-400" />
                    <span>Competitive salary + performance bonuses</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-purple-400" />
                    <span>Employee stock options (ESOP)</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-purple-400" />
                    <span>Annual salary reviews & increments</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-purple-400" />
                    <span>Referral bonuses up to ₹1L</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-purple-400" />
                    <span>Professional development budget ₹50K</span>
                  </li>
                </ul>
              </div>

              {/* Work-Life Balance */}
              <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 backdrop-blur-xl rounded-3xl p-8 border border-orange-500/20">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-6">
                  <Coffee className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-6">Work-Life Balance</h3>
                <ul className="text-blue-100 space-y-3">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-orange-400" />
                    <span>Flexible working hours (7 AM - 10 PM)</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-orange-400" />
                    <span>Work from home 3 days/week</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-orange-400" />
                    <span>30 days annual leave + festivals</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-orange-400" />
                    <span>Quarterly team retreats & outings</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-orange-400" />
                    <span>Sabbatical options for long-term employees</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Daily Life at FurniMart */}
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-12 border border-white/10">
              <h3 className="text-3xl font-bold text-white mb-8 text-center">A Day in the Life at FurniMart</h3>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <img 
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop" 
                    alt="Team collaboration"
                    className="w-full h-48 object-cover rounded-2xl mb-4"
                  />
                  <h4 className="text-white font-bold text-lg mb-2">Morning Standups</h4>
                  <p className="text-blue-200">Start your day with energizing team sync-ups and planning sessions</p>
                </div>
                <div className="text-center">
                  <img 
                    src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop" 
                    alt="Innovation workspace"
                    className="w-full h-48 object-cover rounded-2xl mb-4"
                  />
                  <h4 className="text-white font-bold text-lg mb-2">Innovation Time</h4>
                  <p className="text-blue-200">Dedicated hours for experimentation, learning, and building breakthrough features</p>
                </div>
                <div className="text-center">
                  <img 
                    src="https://tse3.mm.bing.net/th/id/OIP.6kAbfri-SkO3QucmTZZmbQAAAA?pid=Api&P=0&h=220" 
                    alt="Team celebration"
                    className="w-full h-48 object-cover rounded-2xl mb-4"
                  />
                  <h4 className="text-white font-bold text-lg mb-2">Celebrate Wins</h4>
                  <p className="text-blue-200">Regular celebrations of achievements, both big and small, with the entire team</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Application Process */}
        <section className="py-24 px-6 bg-gradient-to-r from-slate-900/50 to-blue-900/50 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-6">Our Hiring Process</h2>
              <p className="text-xl text-blue-200">Transparent, fair, and designed to find the perfect fit</p>
            </div>
            
            <div className="grid md:grid-cols-5 gap-4 mb-16">
              {[
                { step: "1", title: "Apply Online", desc: "Submit application", time: "2 mins" },
                { step: "2", title: "Admin Review", desc: "Profile assessment", time: "24-48 hrs" },
                { step: "3", title: "Technical Round", desc: "Skills evaluation", time: "1 hour" },
                { step: "4", title: "Culture Fit", desc: "Team interaction", time: "45 mins" },
                { step: "5", title: "Welcome!", desc: "Join the family", time: "Immediate" }
              ].map((phase, index) => (
                <div key={index} className="relative">
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center border border-white/20 hover:bg-white/15 transition-all duration-300">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white font-bold">{phase.step}</span>
                    </div>
                    <h3 className="text-white font-bold mb-2">{phase.title}</h3>
                    <p className="text-blue-200 text-sm mb-2">{phase.desc}</p>
                    <p className="text-orange-400 text-xs font-medium">{phase.time}</p>
                  </div>
                  {index < 4 && (
                    <div className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2">
                      <ArrowRight className="w-6 h-6 text-orange-400" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Hiring Stats */}
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center border border-white/20">
                <div className="text-3xl font-bold text-green-400 mb-2">95%</div>
                <div className="text-white font-medium mb-1">Offer Acceptance</div>
                <div className="text-blue-200 text-sm">Industry leading rate</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center border border-white/20">
                <div className="text-3xl font-bold text-blue-400 mb-2">7 Days</div>
                <div className="text-white font-medium mb-1">Average Process</div>
                <div className="text-blue-200 text-sm">From apply to offer</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center border border-white/20">
                <div className="text-3xl font-bold text-purple-400 mb-2">4.9/5</div>
                <div className="text-white font-medium mb-1">Candidate Rating</div>
                <div className="text-blue-200 text-sm">Glassdoor reviews</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center border border-white/20">
                <div className="text-3xl font-bold text-orange-400 mb-2">89%</div>
                <div className="text-white font-medium mb-1">Employee Retention</div>
                <div className="text-blue-200 text-sm">2+ years tenure</div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Job Application Modal */}
        {selectedJob && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800/95 backdrop-blur-xl rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/20 shadow-2xl">
              <div className="flex justify-between items-start mb-8">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-3xl font-bold text-white">{selectedJob.title}</h3>
                    {selectedJob.urgency && (
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        selectedJob.urgency === 'Urgent' ? 'bg-red-500 text-white' :
                        selectedJob.urgency === 'Hot' ? 'bg-orange-500 text-white' :
                        selectedJob.urgency === 'Featured' ? 'bg-purple-500 text-white' :
                        'bg-green-500 text-white'
                      }`}>
                        {selectedJob.urgency}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-6 text-blue-200 text-sm mb-6">
                    <span className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-orange-400" />
                      {selectedJob.department}
                    </span>
                    <span className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-orange-400" />
                      {selectedJob.location}
                    </span>
                    <span className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-orange-400" />
                      <span className="font-bold text-green-400">{selectedJob.salary}</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-orange-400" />
                      {selectedJob.experience}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedJob(null)}
                  className="text-gray-400 hover:text-white text-3xl transition-colors p-2"
                >
                  ×
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-orange-400" />
                    Role Overview
                  </h4>
                  <p className="text-blue-100 mb-6 leading-relaxed">{selectedJob.description}</p>
                  
                  <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    Requirements
                  </h4>
                  <ul className="space-y-3">
                    {selectedJob.requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-3 text-blue-100">
                        <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <form onSubmit={handleApplicationSubmit} className="space-y-6">
                  <h4 className="text-xl font-bold text-white mb-4">Apply for This Position</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={applicationData.name}
                        onChange={(e) => setApplicationData({...applicationData, name: e.target.value})}
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none transition-colors"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Email *</label>
                      <input
                        type="email"
                        required
                        value={applicationData.email}
                        onChange={(e) => setApplicationData({...applicationData, email: e.target.value})}
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none transition-colors"
                        placeholder="your.email@domain.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Phone Number *</label>
                      <input
                        type="tel"
                        required
                        value={applicationData.phone}
                        onChange={(e) => setApplicationData({...applicationData, phone: e.target.value})}
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none transition-colors"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Experience *</label>
                      <select
                        required
                        value={applicationData.experience}
                        onChange={(e) => setApplicationData({...applicationData, experience: e.target.value})}
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:border-orange-500 focus:outline-none transition-colors"
                      >
                        <option value="">Select experience</option>
                        <option value="0-1">0-1 years</option>
                        <option value="1-3">1-3 years</option>
                        <option value="3-5">3-5 years</option>
                        <option value="5-8">5-8 years</option>
                        <option value="8+">8+ years</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">LinkedIn Profile</label>
                    <input
                      type="url"
                      value={applicationData.linkedin}
                      onChange={(e) => setApplicationData({...applicationData, linkedin: e.target.value})}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none transition-colors"
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Portfolio/GitHub (Optional)</label>
                    <input
                      type="url"
                      value={applicationData.portfolio}
                      onChange={(e) => setApplicationData({...applicationData, portfolio: e.target.value})}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none transition-colors"
                      placeholder="https://github.com/yourprofile"
                    />
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Why FurniMart? *</label>
                    <textarea
                      required
                      value={applicationData.coverLetter}
                      onChange={(e) => setApplicationData({...applicationData, coverLetter: e.target.value})}
                      rows={4}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none resize-none transition-colors"
                      placeholder="Tell us why you want to join FurniMart and how you'll contribute to our mission..."
                    />
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Resume/CV *</label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      required
                      onChange={(e) => setApplicationData({...applicationData, resume: e.target.files[0]})}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gradient-to-r file:from-orange-500 file:to-red-500 file:text-white hover:file:from-orange-600 hover:file:to-red-600 transition-all"
                    />
                    <p className="text-gray-400 text-xs mt-2">Accepted formats: PDF, DOC, DOCX (Max 10MB)</p>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 font-bold text-lg transform hover:scale-105 shadow-lg"
                    >
                      Submit Application 🚀
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedJob(null)}
                      className="px-8 py-4 border border-white/30 text-white rounded-xl hover:bg-white/10 transition-all duration-300 font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Support & Contact Section */}
        <section className="py-24 px-6 bg-gradient-to-br from-slate-900/80 to-purple-900/80 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-6">Need Support?</h2>
              <p className="text-xl text-blue-200">Our team is here to help with your career journey</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 text-center border border-white/20 hover:bg-white/15 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Email Support</h3>
                <p className="text-blue-200 mb-4">Get personalized assistance with your application</p>
                <a href="mailto:careers@furnimart.com" className="text-orange-400 hover:text-orange-300 font-medium">
                  careers@furnimart.com
                </a>
              </div>

              <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 text-center border border-white/20 hover:bg-white/15 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Phone className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Phone Support</h3>
                <p className="text-blue-200 mb-4">Speak directly with our HR team</p>
                <a href="tel:+919876543210" className="text-orange-400 hover:text-orange-300 font-medium">
                  +91 98765 43210
                </a>
              </div>

              <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 text-center border border-white/20 hover:bg-white/15 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Live Chat</h3>
                <p className="text-blue-200 mb-4">Instant answers to your questions</p>
                <button className="text-orange-400 hover:text-orange-300 font-medium">
                  Start Chat
                </button>
              </div>
            </div>

            {/* Visit Website CTA */}
            <div className="mt-16 text-center">
              <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-xl rounded-3xl p-12 border border-orange-500/30">
                <h3 className="text-3xl font-bold text-white mb-4">Explore FurniMart Platform</h3>
                <p className="text-xl text-blue-200 mb-8 max-w-2xl mx-auto">
                  See the platform you'll be working on! Experience how we're revolutionizing B2B furniture commerce.
                </p>
                <a 
                  href="https://furnimart.com" 
                  target="_blank"
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-500 to-red-500 text-white px-10 py-5 rounded-2xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 font-bold text-lg transform hover:scale-105 shadow-xl"
                >
                  Visit FurniMart Website
                  <ExternalLink className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Footer */}
        <footer className="bg-slate-900/95 backdrop-blur-xl py-16 px-6 border-t border-white/10">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-5 gap-8 mb-12">
              <div className="col-span-2">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center">
                    <Building className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">FurniMart</h3>
                    <p className="text-orange-400 font-medium">B2B Furniture Excellence</p>
                  </div>
                </div>
                <p className="text-blue-200 mb-6 leading-relaxed">
                  India's premier B2B furniture platform connecting verified manufacturers 
                  with trusted wholesalers and dealers nationwide. Building trust through technology.
                </p>
                <div className="flex space-x-4">
                  <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-white hover:text-orange-400 hover:bg-white/20 transition-all">
                    <Linkedin className="w-5 h-5" />
                  </a>
                  <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-white hover:text-orange-400 hover:bg-white/20 transition-all">
                    <Twitter className="w-5 h-5" />
                  </a>
                  <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-white hover:text-orange-400 hover:bg-white/20 transition-all">
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-white hover:text-orange-400 hover:bg-white/20 transition-all">
                    <Facebook className="w-5 h-5" />
                  </a>
                </div>
              </div>
              
              <div>
                <h4 className="text-white font-bold mb-6 text-lg">Quick Links</h4>
                <ul className="space-y-3 text-blue-200">
                  <li><a href="#jobs" className="hover:text-orange-400 transition-colors flex items-center gap-2"><ArrowRight className="w-4 h-4" />Current Openings</a></li>
                  <li><a href="#culture" className="hover:text-orange-400 transition-colors flex items-center gap-2"><ArrowRight className="w-4 h-4" />Company Culture</a></li>
                  <li><a href="#benefits" className="hover:text-orange-400 transition-colors flex items-center gap-2"><ArrowRight className="w-4 h-4" />Employee Benefits</a></li>
                  <li><a href="#team" className="hover:text-orange-400 transition-colors flex items-center gap-2"><ArrowRight className="w-4 h-4" />Meet Our Team</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-white font-bold mb-6 text-lg">About FurniMart</h4>
                <ul className="space-y-3 text-blue-200">
                  <li><a href="https://furnimart.com/about" className="hover:text-orange-400 transition-colors flex items-center gap-2"><ArrowRight className="w-4 h-4" />Our Mission</a></li>
                  <li><a href="https://furnimart.com/verification" className="hover:text-orange-400 transition-colors flex items-center gap-2"><ArrowRight className="w-4 h-4" />Verification Process</a></li>
                  <li><a href="https://furnimart.com/partners" className="hover:text-orange-400 transition-colors flex items-center gap-2"><ArrowRight className="w-4 h-4" />Partner Network</a></li>
                  <li><a href="https://furnimart.com/success" className="hover:text-orange-400 transition-colors flex items-center gap-2"><ArrowRight className="w-4 h-4" />Success Stories</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-white font-bold mb-6 text-lg">Contact Info</h4>
                <div className="space-y-4 text-blue-200">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-orange-400 mt-1" />
                    <div>
                      <p className="font-medium text-white">Headquarters</p>
                      <p className="text-sm">Industrial Area Phase-1<br />Ludhiana, Punjab 141003</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-orange-400" />
                    <div>
                      <p className="font-medium text-white">Email</p>
                      <p className="text-sm">careers@furnimart.com</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-orange-400" />
                    <div>
                      <p className="font-medium text-white">Phone</p>
                      <p className="text-sm">+91 98765 43210</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border-t border-white/20 mt-12 pt-8">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-blue-200 text-center md:text-left">
                  © 2025 FurniMart Technologies Pvt Ltd. All rights reserved. | Building trust in B2B furniture commerce.
                </p>
                <div className="flex gap-6 text-sm text-blue-200">
                  <a href="#" className="hover:text-orange-400 transition-colors">Privacy Policy</a>
                  <a href="#" className="hover:text-orange-400 transition-colors">Terms of Service</a>
                  <a href="#" className="hover:text-orange-400 transition-colors">Accessibility</a>
                </div>
              </div>
            </div>
          </div>
        </footer>

        {/* Floating Action Button */}
        <div className="fixed bottom-8 right-8 z-40">
          <button 
            onClick={() => document.getElementById('jobs').scrollIntoView({ behavior: 'smooth' })}
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-full shadow-2xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-110 group"
          >
            <Briefcase className="w-6 h-6 group-hover:bounce" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FurnimartCareerPortal;