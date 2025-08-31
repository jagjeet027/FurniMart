import React, { useState, useEffect } from 'react';
import { 
  Compass, ArrowRight, Star, Mountain, Users, Lightbulb, 
  Trophy, Heart, Coffee, Zap, Target, Globe, ChevronDown,
  MapPin, Clock, DollarSign, Briefcase, Award, Sparkles,
  BookOpen, Shield, Smile, TrendingUp, Home, Phone, Mail,
  Building, Rocket, Eye, CheckCircle, Factory, Truck,
  BarChart3, Handshake, Network, Cog, PieChart, Monitor
} from 'lucide-react';

const FurniMartRecruitment = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [selectedDepartment, setSelectedDepartment] = useState('all');

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
    { icon: DollarSign, title: "Competitive Salary", desc: "Industry-leading compensation packages with performance bonuses and quarterly incentives" },
    { icon: Heart, title: "Health & Wellness", desc: "Comprehensive health coverage including family medical insurance and wellness programs" },
    { icon: Coffee, title: "Flexible Hours", desc: "Work-life balance that matters with flexible timing options and remote work flexibility" },
    { icon: Trophy, title: "Growth Opportunities", desc: "Clear career advancement paths with mentorship programs and leadership development" },
    { icon: Globe, title: "Global Exposure", desc: "Work with international B2B clients and expand your global business network" },
    { icon: Award, title: "Learning Budget", desc: "Annual ₹75,000 budget for skill development, certifications, and professional courses" },
    { icon: BookOpen, title: "Training Programs", desc: "Regular workshops, industry conferences, and skill enhancement sessions" },
    { icon: Shield, title: "Job Security", desc: "Stable employment with long-term career prospects in growing B2B furniture market" },
    { icon: Smile, title: "Professional Culture", desc: "Collaborative work environment with industry experts and thought leaders" },
    { icon: Truck, title: "Industry Leadership", desc: "Be part of India's leading B2B furniture platform serving 10,000+ businesses" },
    { icon: Network, title: "Business Network", desc: "Access to vast network of manufacturers, suppliers, and enterprise clients" },
    { icon: Cog, title: "Innovation Labs", desc: "Work on cutting-edge technology solutions for B2B furniture commerce" }
  ];

  const departments = [
    {
      name: "Business Development",
      icon: Handshake,
      color: "from-blue-500 to-blue-700",
      roles: ["B2B Sales Manager", "Enterprise Account Manager", "Partnership Development Lead", "Regional Business Head"],
      description: "Drive B2B growth and build strategic partnerships with furniture manufacturers and enterprise clients."
    },
    {
      name: "Technology & Engineering",
      icon: Monitor,
      color: "from-slate-600 to-slate-800", 
      roles: ["Full Stack Developer", "DevOps Engineer", "Data Analyst", "Product Manager", "UI/UX Designer"],
      description: "Build and maintain our cutting-edge B2B platform that connects furniture businesses across India."
    },
    {
      name: "Operations & Supply Chain",
      icon: Factory,
      color: "from-emerald-600 to-emerald-800",
      roles: ["Operations Manager", "Supply Chain Analyst", "Logistics Coordinator", "Quality Manager"],
      description: "Optimize our B2B supply chain and ensure seamless operations for enterprise furniture delivery."
    },
    {
      name: "Finance & Analytics",
      icon: PieChart,
      color: "from-indigo-600 to-indigo-800",
      roles: ["Financial Analyst", "Business Intelligence Specialist", "Risk Manager", "Pricing Strategist"],
      description: "Drive financial strategy and provide data-driven insights for B2B furniture market decisions."
    },
    {
      name: "Marketing & Growth",
      icon: TrendingUp,
      color: "from-purple-600 to-purple-800",
      roles: ["Digital Marketing Manager", "Content Strategist", "Growth Hacker", "Brand Manager"],
      description: "Lead B2B marketing initiatives and drive growth through digital channels and industry partnerships."
    },
    {
      name: "Customer Success",
      icon: Users,
      color: "from-teal-600 to-teal-800",
      roles: ["Client Success Manager", "Technical Support Lead", "Training Specialist", "Relationship Manager"],
      description: "Ensure our B2B clients achieve maximum value from our platform and maintain long-term partnerships."
    }
  ];

  const testimonials = [
    {
      name: "Rajesh Agarwal",
      role: "VP Business Development",
      quote: "FurniMart's B2B platform has revolutionized how we connect with furniture manufacturers. The scale of impact we're creating in the industry is incredible.",
      avatar: "RA",
      experience: "5+ years"
    },
    {
      name: "Sneha Reddy", 
      role: "Senior Product Manager",
      quote: "Working on enterprise-grade solutions that serve thousands of businesses daily gives me immense satisfaction. The technical challenges here are world-class.",
      avatar: "SR",
      experience: "4+ years"
    },
    {
      name: "Vikram Singh",
      role: "Head of Operations", 
      quote: "Managing supply chains for enterprise clients across India has taught me skills I never imagined. FurniMart truly invests in your professional growth.",
      avatar: "VS",
      experience: "7+ years"
    },
    {
      name: "Meera Joshi",
      role: "Marketing Director",
      quote: "Leading B2B marketing for India's largest furniture platform means every strategy impacts thousands of businesses. The responsibility is exciting.",
      avatar: "MJ",
      experience: "6+ years"
    }
  ];

  const companyValues = [
    {
      icon: Eye,
      title: "B2B Excellence",
      description: "We deliver enterprise-grade solutions that transform how businesses buy and sell furniture across India."
    },
    {
      icon: Users,
      title: "Partnership Focus",
      description: "Building strong relationships with manufacturers, suppliers, and enterprise clients is at our core."
    },
    {
      icon: Trophy,
      title: "Market Leadership",
      description: "We lead India's B2B furniture market with innovative technology and unmatched service quality."
    },
    {
      icon: Globe,
      title: "Scale & Growth",
      description: "Serving 10,000+ businesses with a platform that handles millions in transactions monthly."
    }
  ];

  const workCulture = [
    { title: "Open Communication", desc: "Transparent feedback culture with direct access to leadership and cross-functional collaboration." },
    { title: "Continuous Learning", desc: "Regular training on B2B trends, industry insights, and professional development opportunities." },
    { title: "Work-Life Integration", desc: "Flexible schedules, remote options, and understanding of professional commitments." },
    { title: "Merit Recognition", desc: "Performance-based promotions, spot awards, and quarterly recognition programs." },
    { title: "Industry Exposure", desc: "Attend furniture exhibitions, B2B conferences, and networking events across India." },
    { title: "Innovation Time", desc: "20% time for exploring new ideas, side projects, and innovative solutions for B2B challenges." }
  ];

  const careerJourney = [
    {
      level: "Associate",
      duration: "0-2 years",
      description: "Learn B2B fundamentals, work with mentors, and contribute to real projects",
      skills: ["Industry Knowledge", "Client Interaction", "Process Understanding"]
    },
    {
      level: "Specialist", 
      duration: "2-4 years",
      description: "Lead specific initiatives, manage client relationships, and drive departmental goals",
      skills: ["Project Leadership", "Stakeholder Management", "Strategic Thinking"]
    },
    {
      level: "Manager",
      duration: "4-7 years", 
      description: "Manage teams, develop strategies, and influence business direction",
      skills: ["Team Leadership", "Business Strategy", "P&L Responsibility"]
    },
    {
      level: "Director",
      duration: "7+ years",
      description: "Shape company vision, lead major initiatives, and mentor future leaders",
      skills: ["Vision Setting", "Cross-functional Leadership", "Industry Expertise"]
    }
  ];

  const stats = [
    { number: "10,000+", label: "B2B Clients", icon: Building },
    { number: "₹500Cr+", label: "Annual GMV", icon: BarChart3 },
    { number: "500+", label: "Team Members", icon: Users },
    { number: "50+", label: "Cities Covered", icon: MapPin },
    { number: "5000+", label: "Manufacturers", icon: Factory },
    { number: "95%", label: "Client Retention", icon: Heart }
  ];

  const perks = [
    "Stock Options Program",
    "Annual Furniture Allowance ₹25,000",
    "Industry Conference Sponsorship", 
    "Quarterly Team Offsites",
    "Professional Membership Sponsorship",
    "Sabbatical Leave Options",
    "Internal Job Rotation Program",
    "Executive MBA Sponsorship",
    "Patent Filing Support",
    "Innovation Bonus Program"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 text-gray-800 relative">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-200/20 rounded-full blur-xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-slate-200/20 rounded-full blur-xl animate-float animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-indigo-200/20 rounded-full blur-xl animate-float animation-delay-4000"></div>
        
        {/* Floating Business Icons */}
        <div className="absolute top-1/4 right-1/4 opacity-10 animate-float">
          <div className="w-16 h-16 bg-blue-300 rounded-lg transform rotate-12 flex items-center justify-center">
            <Building className="w-8 h-8 text-white" />
          </div>
        </div>
        <div className="absolute bottom-1/4 left-1/3 opacity-10 animate-float animation-delay-3000">
          <div className="w-12 h-20 bg-slate-300 rounded-t-lg transform -rotate-6 flex items-center justify-center">
            <Factory className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="relative">
            <div className="inline-block px-6 py-3 bg-blue-100 text-blue-800 rounded-full text-lg font-semibold mb-8">
              🏢 Join India's Leading B2B Furniture Platform
            </div>
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black leading-tight text-gray-900 mb-8">
              Build Your
              <span className="block mt-4 bg-gradient-to-r from-blue-600 via-slate-600 to-indigo-600 bg-clip-text text-transparent">
                B2B Career
              </span>
            </h1>
            <div className="absolute -top-8 -right-8 w-20 h-20 border-4 border-blue-400/30 rounded-full animate-spin-slow"></div>
          </div>

          <p className="text-2xl sm:text-3xl text-gray-600 leading-relaxed font-medium mb-12 max-w-4xl mx-auto">
            Shape the future of India's ₹500Cr+ B2B furniture ecosystem. Join our mission to 
            <span className="text-blue-600 font-bold"> digitize</span>, 
            <span className="text-slate-600 font-bold"> streamline</span>, and 
            <span className="text-indigo-600 font-bold"> revolutionize</span> 
            how businesses buy and sell furniture across the nation.
          </p>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-16 max-w-5xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100">
                <stat.icon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-black text-gray-900">{stat.number}</div>
                <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Journey Steps */}
          <div className="relative mt-16 py-12 max-w-5xl mx-auto">
            <div className="absolute left-0 top-1/2 w-full h-3 bg-gradient-to-r from-blue-200 via-slate-200 to-indigo-200 rounded-full transform -translate-y-1/2"></div>
            <div className="relative flex justify-between">
              <div className="flex flex-col items-center space-y-4 group cursor-pointer">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center transform group-hover:scale-125 transition-all duration-300 shadow-xl">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <span className="text-lg font-bold text-gray-700">Apply</span>
              </div>
              <div className="flex flex-col items-center space-y-4 group cursor-pointer">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center transform group-hover:scale-125 transition-all duration-300 shadow-xl">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <span className="text-lg font-bold text-gray-700">Assessment</span>
              </div>
              <div className="flex flex-col items-center space-y-4 group cursor-pointer">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center transform group-hover:scale-125 transition-all duration-300 shadow-xl">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <span className="text-lg font-bold text-gray-700">Interview</span>
              </div>
              <div className="flex flex-col items-center space-y-4 group cursor-pointer">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center transform group-hover:scale-125 transition-all duration-300 shadow-xl">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <span className="text-lg font-bold text-gray-700">Onboard</span>
              </div>
              <div className="flex flex-col items-center space-y-4 group cursor-pointer">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center transform group-hover:scale-125 transition-all duration-300 shadow-xl">
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
              className="group relative inline-flex items-center px-12 py-6 text-2xl font-black overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-slate-600 to-indigo-600 text-white transition-all duration-500 hover:from-blue-700 hover:via-slate-700 hover:to-indigo-700 transform hover:scale-110 hover:shadow-2xl shadow-lg"
            >
              <span className="relative z-10 flex items-center gap-4">
                🚀 Explore Opportunities
                <ArrowRight 
                  className={`w-8 h-8 transition-transform duration-300 ${
                    isHovered ? 'translate-x-3' : ''
                  }`}
                />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </button>

            <button className="inline-flex items-center px-10 py-5 text-xl font-bold border-3 border-gray-800 text-gray-800 rounded-2xl hover:bg-gray-800 hover:text-white transition-all duration-300 transform hover:scale-105">
              Schedule a Call
              <Phone className="w-6 h-6 ml-3" />
            </button>
          </div>
        </div>
      </section>

      {/* Company Values Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-6">
              Our <span className="text-blue-600">Mission & Values</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              At FurniMart, we're building India's largest B2B furniture ecosystem. Our values drive innovation and create value for all stakeholders.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {companyValues.map((value, index) => (
              <div key={index} className="text-center p-8 bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-slate-600 rounded-full flex items-center justify-center mx-auto mb-6 transform hover:rotate-12 transition-transform duration-500">
                  <value.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Departments Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-6">
              Career <span className="text-slate-600">Departments</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore diverse career paths across our organization. From technology to business development, find where your skills create maximum impact.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {departments.map((dept, index) => (
              <div key={index} className="group relative p-8 bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 border-2 border-gray-100 hover:border-blue-200">
                <div className={`w-16 h-16 bg-gradient-to-br ${dept.color} rounded-xl flex items-center justify-center mb-6 transform group-hover:rotate-12 transition-transform duration-500`}>
                  <dept.icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{dept.name}</h3>
                <p className="text-gray-600 mb-6">{dept.description}</p>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-gray-800 mb-3">Key Roles:</h4>
                  {dept.roles.map((role, roleIndex) => (
                    <div key={roleIndex} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-gray-600">{role}</span>
                    </div>
                  ))}
                </div>

                <button className="w-full mt-6 py-3 bg-gradient-to-r from-blue-500 to-slate-600 text-white font-bold rounded-xl hover:from-blue-600 hover:to-slate-700 transition-all duration-300 transform hover:scale-105">
                  Explore Roles
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Career Journey Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-slate-50 to-indigo-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-6">
              Your <span className="text-indigo-600">Career Journey</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We believe in structured career growth. See how you can progress from entry-level to leadership roles at FurniMart.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {careerJourney.map((stage, index) => (
              <div key={index} className="relative">
                <div className="text-center p-8 bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 border-2 border-gray-100 hover:border-indigo-200">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg">
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{stage.level}</h3>
                  <p className="text-blue-600 font-semibold mb-4">{stage.duration}</p>
                  <p className="text-gray-600 mb-6">{stage.description}</p>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-gray-800">Key Skills:</h4>
                    {stage.skills.map((skill, skillIndex) => (
                      <div key={skillIndex} className="flex items-center justify-center gap-2">
                        <Sparkles className="w-3 h-3 text-indigo-500" />
                        <span className="text-xs text-gray-600">{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {index < careerJourney.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="w-8 h-8 text-indigo-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-50 to-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-6">
              Why Choose <span className="text-blue-600">FurniMart</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We offer comprehensive benefits designed for professionals who want to excel in India's dynamic B2B furniture industry.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="group relative p-8 bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 border-2 border-transparent hover:border-blue-200">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-blue-500 to-slate-600 rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-500">
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

      {/* Additional Perks Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-6">
              Additional <span className="text-slate-600">Perks</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Beyond salary and benefits, we offer unique perks that make FurniMart the premier destination for B2B professionals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {perks.map((perk, index) => (
              <div key={index} className="text-center p-6 bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100">
                <Sparkles className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                <span className="text-sm font-semibold text-gray-700">{perk}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Work Culture Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-6">
              Our <span className="text-indigo-600">Work Culture</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience a professional environment where B2B excellence thrives, innovation is rewarded, and every team member contributes to India's furniture transformation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {workCulture.map((culture, index) => (
              <div key={index} className="relative p-6 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-indigo-500">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-indigo-500" />
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

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-6">
              Success <span className="text-slate-600">Stories</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hear from our leadership team and senior professionals who are driving India's B2B furniture revolution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="relative p-8 bg-gradient-to-br from-blue-50 to-slate-50 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-slate-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                    <p className="text-blue-600 text-xs font-semibold">{testimonial.experience}</p>
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

      {/* Application Process Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-6">
              Application <span className="text-blue-600">Process</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive hiring process ensures we find the right fit for both candidates and our organization.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">1. Online Application</h3>
              <p className="text-gray-600">Submit your resume and cover letter through our career portal. We review all applications within 48 hours.</p>
            </div>

            <div className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-slate-500 to-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <Monitor className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">2. Technical Assessment</h3>
              <p className="text-gray-600">Role-specific assessment to evaluate your skills, problem-solving ability, and industry knowledge.</p>
            </div>

            <div className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">3. Panel Interview</h3>
              <p className="text-gray-600">Meet with hiring managers and team members to discuss your experience and cultural fit.</p>
            </div>

            <div className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <Handshake className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">4. Leadership Round</h3>
              <p className="text-gray-600">Final discussion with senior leadership about vision alignment and growth opportunities.</p>
            </div>

            <div className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">5. Offer & Onboarding</h3>
              <p className="text-gray-600">Receive offer letter and begin your comprehensive onboarding journey with dedicated mentorship.</p>
            </div>

            <div className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <Rocket className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">6. Career Growth</h3>
              <p className="text-gray-600">Continuous development with quarterly reviews, skill building, and promotion opportunities.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-gray-50 to-blue-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-6">
              Connect with Our <span className="text-blue-600">HR Team</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Have questions about careers at FurniMart? Our dedicated talent acquisition team is here to guide your journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Call Our HR Team</h3>
              <p className="text-gray-600 font-semibold">+91 98765 43210</p>
              <p className="text-gray-600">Mon - Fri, 9 AM - 6 PM</p>
              <p className="text-blue-600 text-sm mt-2">Direct line to HR</p>
            </div>

            <div className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-slate-500 to-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Email Careers Team</h3>
              <p className="text-gray-600 font-semibold">careers@furnimart.com</p>
              <p className="text-gray-600">24-hour response time</p>
              <p className="text-blue-600 text-sm mt-2">All inquiries welcome</p>
            </div>

            <div className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Visit Our Office</h3>
              <p className="text-gray-600 font-semibold">FurniMart Corporate HQ</p>
              <p className="text-gray-600">Mumbai, Maharashtra</p>
              <p className="text-blue-600 text-sm mt-2">Schedule office tour</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="mt-16 max-w-2xl mx-auto">
            <div className="bg-white rounded-3xl shadow-2xl p-8 border-2 border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Quick Inquiry Form</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                  <input type="text" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Your full name" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                  <input type="email" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="your.email@domain.com" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Phone</label>
                  <input type="tel" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="+91 98765 43210" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Experience</label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option>0-2 years</option>
                    <option>2-5 years</option>
                    <option>5-10 years</option>
                    <option>10+ years</option>
                  </select>
                </div>
              </div>
              <div className="mt-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">Area of Interest</label>
                <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>Business Development</option>
                  <option>Technology & Engineering</option>
                  <option>Operations & Supply Chain</option>
                  <option>Finance & Analytics</option>
                  <option>Marketing & Growth</option>
                  <option>Customer Success</option>
                </select>
              </div>
              <div className="mt-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
                <textarea rows="4" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Tell us about your interest in joining FurniMart..."></textarea>
              </div>
              <button className="w-full mt-6 py-4 bg-gradient-to-r from-blue-600 to-slate-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-slate-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
                Submit Inquiry
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 to-slate-800 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-72 h-72 bg-slate-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-black mb-8">
            Ready to Lead India's 
            <span className="block mt-2 bg-gradient-to-r from-blue-400 to-slate-300 bg-clip-text text-transparent">
              B2B Furniture Revolution?
            </span>
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Join FurniMart and be part of the team that's transforming how 10,000+ businesses across India buy, sell, and manage furniture. Your expertise will shape an entire industry's digital future.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 items-center justify-center mb-12">
            <button 
              onClick={handleExplore}
              className="inline-flex items-center px-12 py-6 text-xl font-black bg-gradient-to-r from-blue-600 to-slate-600 text-white rounded-2xl hover:from-blue-700 hover:to-slate-700 transition-all duration-300 transform hover:scale-110 shadow-2xl"
            >
              🚀 Start Your B2B Journey
              <ArrowRight className="w-6 h-6 ml-3" />
            </button>
            
            <button className="inline-flex items-center px-8 py-4 text-lg font-bold border-2 border-white text-white rounded-2xl hover:bg-white hover:text-gray-900 transition-all duration-300 transform hover:scale-105">
              Download Company Profile
              <BookOpen className="w-5 h-5 ml-3" />
            </button>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-black text-blue-400">₹500Cr+</div>
              <div className="text-sm text-gray-400">Annual Revenue</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-slate-400">5000+</div>
              <div className="text-sm text-gray-400">Manufacturers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-indigo-400">50+</div>
              <div className="text-sm text-gray-400">Cities</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-emerald-400">95%</div>
              <div className="text-sm text-gray-400">Client Satisfaction</div>
            </div>
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