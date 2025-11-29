import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building, CheckCircle, Clock, FileText, Users, DollarSign, ArrowRight, Zap, Shield, TrendingUp, Award, Lightbulb } from 'lucide-react';
import AddOrganizationModal from '../../../../frontend/src/finance/components/AddOrganizationModal';

const AddOrganizationPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const benefits = [
    {
      icon: Users,
      title: "Reach More Customers",
      description: "Connect with thousands of loan seekers actively comparing options",
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: DollarSign,
      title: "Increase Loan Volume",
      description: "Boost your loan portfolio with qualified leads from our platform",
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Building,
      title: "Build Brand Trust",
      description: "Establish credibility through verified organization status",
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: FileText,
      title: "Detailed Product Showcase",
      description: "Showcase your loan products with comprehensive details and features",
      color: 'from-orange-500 to-red-500'
    }
  ];

  const steps = [
    {
      step: 1,
      title: "Submit Application",
      description: "Fill out our comprehensive organization form with your details",
      icon: FileText
    },
    {
      step: 2,
      title: "Document Verification",
      description: "We verify your credentials and licensing documentation",
      icon: Shield
    },
    {
      step: 3,
      title: "Review Process",
      description: "Our team reviews your application within 2-3 business days",
      icon: Clock
    },
    {
      step: 4,
      title: "Go Live",
      description: "Once approved, your organization appears on our platform",
      icon: Zap
    }
  ];

  const requirements = [
    "Valid business license or registration",
    "Minimum 2 years of operation",
    "Proper financial licensing (NBFC, Banking, etc.)",
    "Clear loan terms and eligibility criteria",
    "Competitive interest rates",
    "Good business reputation and reviews"
  ];

  const faqItems = [
    { question: "Is there a fee to join?", answer: "No, joining our platform is completely free. We only succeed when you succeed." },
    { question: "How long does the approval process take?", answer: "Our review process typically takes 2-3 business days once we receive your complete application." },
    { question: "What types of organizations can apply?", answer: "Banks, NBFCs, credit unions, microfinance institutions, and other licensed financial organizations." },
    { question: "Can I update my organization details later?", answer: "Yes, you can update your organization profile and loan products anytime through our partner portal." },
    { question: "How do I manage my loan applications?", answer: "We provide a dedicated dashboard to manage applications, track performance, and communicate with customers." },
    { question: "What support do you provide?", answer: "We offer dedicated account management, technical support, and marketing assistance to all partners." }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <div className="w-full overflow-hidden bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900 min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 pb-20 px-4 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 opacity-20 blur-3xl rounded-full" 
            animate={{ y: [0, -30, 0], x: [0, 20, 0] }} 
            transition={{ duration: 6, repeat: Infinity }}
          ></motion.div>
          <motion.div 
            className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500 opacity-20 blur-3xl rounded-full" 
            animate={{ y: [0, 30, 0], x: [0, -20, 0] }} 
            transition={{ duration: 7, repeat: Infinity }}
          ></motion.div>
        </div>

        <div className="container relative z-10 mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/50 backdrop-blur-sm w-fit"
                >
                  <Building className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-200 text-sm font-medium">Partner Program</span>
                </motion.div>

                <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent leading-tight">
                  Join Our Lending Network
                </h1>

                <p className="text-lg md:text-xl text-slate-300 leading-relaxed">
                  Connect with thousands of loan seekers and grow your business. Become a trusted partner in our comprehensive loan comparison platform.
                </p>
              </div>

              {/* Stats */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-3 gap-4"
              >
                {[
                  { number: '10,000+', label: 'Monthly Seekers' },
                  { number: '500+', label: 'Partners' },
                  { number: '₹50Cr+', label: 'Facilitated' }
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    variants={itemVariants}
                    className="p-4 rounded-lg bg-gradient-to-br from-white/10 to-white/5 border border-white/10 backdrop-blur-md"
                  >
                    <div className="text-2xl font-bold text-cyan-400">{stat.number}</div>
                    <div className="text-xs text-slate-400 mt-1">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                onClick={() => setIsModalOpen(true)}
                className="group relative px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-bold text-lg overflow-hidden shadow-2xl hover:shadow-green-500/50 transition-all duration-300 transform hover:scale-105 w-fit"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-center gap-2">
                  <span>Apply to Join Now</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.button>
            </div>

            {/* Right Visual */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="hidden md:block"
            >
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="p-8 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 backdrop-blur-md"
              >
                <div className="flex items-center justify-center h-64">
                  <div className="text-center space-y-4">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500"
                    >
                      <Building className="w-12 h-12 text-white" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-white">Trusted Partners</h3>
                    <p className="text-slate-300">Join leading financial institutions</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 px-4 relative">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">Why Partner With Us?</h2>
            <p className="text-slate-400 text-lg">Discover the advantages of joining our lending network</p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ y: -12 }}
                  className={`p-8 rounded-xl bg-gradient-to-br ${benefit.color} opacity-10 hover:opacity-20 border border-current transition-all duration-300 group relative overflow-hidden`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
                  <div className="relative z-10">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className={`w-14 h-14 rounded-lg bg-gradient-to-r ${benefit.color} flex items-center justify-center mb-4`}
                    >
                      <Icon className="w-8 h-8 text-white" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-white mb-2">{benefit.title}</h3>
                    <p className="text-slate-300 text-sm">{benefit.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-4 relative">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-slate-400 text-lg">Simple 4-step process to join our platform</p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="relative"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={step.step}
                    variants={itemVariants}
                    whileHover={{ y: -8 }}
                    className="relative"
                  >
                    <div className="p-6 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 hover:border-cyan-500/50 transition-all duration-300 h-full">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                        className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 mb-4"
                      >
                        <span className="font-bold text-white text-lg">{step.step}</span>
                      </motion.div>
                      <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                      <p className="text-slate-400 text-sm">{step.description}</p>
                      <div className="mt-4 pt-4 border-t border-slate-700">
                        <Icon className="w-6 h-6 text-cyan-400" />
                      </div>
                    </div>

                    {/* Connecting Line */}
                    {index < steps.length - 1 && (
                      <motion.div
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        transition={{ delay: 0.3 + index * 0.1, duration: 0.6 }}
                        className="hidden md:block absolute top-1/2 -right-6 w-12 h-1 bg-gradient-to-r from-cyan-500 to-transparent origin-left"
                      />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Requirements Section */}
      <section className="py-24 px-4 relative">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Requirements List */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h2 className="text-4xl font-bold text-white flex items-center gap-3">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                  Eligibility Requirements
                </h2>
                <p className="text-slate-400">
                  To ensure quality and trust on our platform, we have specific requirements for organizations.
                </p>
              </div>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="space-y-3"
              >
                {requirements.map((requirement, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 hover:border-green-500/50 transition-all duration-300"
                  >
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300">{requirement}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* CTA Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative"
            >
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="p-8 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 backdrop-blur-md"
              >
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 mb-6 mx-auto">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white text-center mb-4">Quick Review Process</h3>
                <p className="text-slate-300 text-center mb-6">
                  Our team reviews applications within 2-3 business days. Get started today and join our growing network of trusted lenders.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setIsModalOpen(true)}
                  className="w-full py-3 px-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-bold hover:shadow-lg hover:shadow-green-500/50 transition-all duration-300"
                >
                  <div className="flex items-center justify-center gap-2">
                    <span>Submit Application</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </motion.button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-4 relative">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">Frequently Asked Questions</h2>
            <p className="text-slate-400 text-lg">Find answers to common questions</p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {faqItems.map((item, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="p-6 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 hover:border-purple-500/50 transition-all duration-300 group"
              >
                <div className="flex gap-3 mb-3">
                  <Lightbulb className="w-5 h-5 text-purple-400 flex-shrink-0 mt-1" />
                  <h3 className="text-lg font-bold text-white">{item.question}</h3>
                </div>
                <p className="text-slate-400 ml-8">{item.answer}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0">
          <motion.div className="absolute top-0 right-0 w-96 h-96 bg-green-500 opacity-20 blur-3xl rounded-full" animate={{ x: [0, 50, 0] }} transition={{ duration: 8, repeat: Infinity }}></motion.div>
          <motion.div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500 opacity-20 blur-3xl rounded-full" animate={{ x: [0, -50, 0] }} transition={{ duration: 8, repeat: Infinity }}></motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="container mx-auto max-w-4xl relative z-10 text-center"
        >
          <h2 className="text-5xl font-bold text-white mb-6">Ready to Grow Your Lending Business?</h2>
          <p className="text-xl text-slate-300 mb-8">
            Join hundreds of financial institutions already benefiting from our platform. Start your application today and connect with qualified borrowers.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => setIsModalOpen(true)}
            className="px-10 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-bold text-lg hover:shadow-2xl hover:shadow-green-500/50 transition-all duration-300"
          >
            <div className="flex items-center justify-center gap-2">
              <span>Start Your Application</span>
              <ArrowRight className="w-5 h-5" />
            </div>
          </motion.button>
        </motion.div>
      </section>

      {/* Modal */}
      <AddOrganizationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

export default AddOrganizationPage;