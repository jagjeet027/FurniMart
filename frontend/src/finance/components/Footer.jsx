import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building, Mail, Phone, MapPin, Facebook, Linkedin, Twitter, ArrowRight } from 'lucide-react';

const Footer = () => {
  const footerSections = [
    {
      title: 'Quick Links',
      links: [
        { label: 'Home', path: '/' },
        { label: 'Search Loans', path: '/search' },
        { label: 'Eligibility Check', path: '/eligibility' },
        { label: 'Compare Loans', path: '/compare' },
        { label: 'Dashboard', path: '/dashboard' }
      ]
    },
    {
      title: 'Loan Categories',
      links: [
        { label: 'Startup Loans', path: '/search?category=startup' },
        { label: 'SME Loans', path: '/search?category=sme' },
        { label: 'NGO Funding', path: '/search?category=ngo' },
        { label: 'Education Loans', path: '/search?category=education' },
        { label: 'Agriculture Loans', path: '/search?category=agriculture' }
      ]
    }
  ];

  const contactInfo = [
    { icon: Mail, text: 'support@loancompare.com', label: 'Email' },
    { icon: Phone, text: '+91 98765 43210', label: 'Phone' },
    { icon: MapPin, text: 'Mumbai, Maharashtra, India', label: 'Location' }
  ];

  const socialLinks = [
    { icon: Facebook, label: 'Facebook', color: 'hover:text-blue-500' },
    { icon: Linkedin, label: 'LinkedIn', color: 'hover:text-blue-700' },
    { icon: Twitter, label: 'Twitter', color: 'hover:text-blue-400' }
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
      transition: { duration: 0.5 },
    },
  };

  return (
    <footer className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-gray-300 relative overflow-hidden">
      {/* Background gradient blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ y: [0, 50, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 opacity-5 blur-3xl rounded-full"
        />
        <motion.div
          animate={{ y: [50, 0, 50] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500 opacity-5 blur-3xl rounded-full"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        {/* Main Footer Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12"
        >
          {/* Logo Section */}
          <motion.div variants={itemVariants} className="space-y-4">
            <Link to="/" className="flex items-center gap-2 w-fit">
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }} 
                className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-lg flex items-center justify-center"
              >
                <Building className="w-6 h-6 text-white" />
              </motion.div>
              <span className="text-2xl font-bold text-white">LoanCompare</span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
              Your trusted platform for comparing and finding the perfect loan for your organization. Connecting businesses with ideal financing solutions.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-4 pt-2">
              {socialLinks.map((social, idx) => {
                const SocialIcon = social.icon;
                return (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.2, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300 ${social.color}`}
                    title={social.label}
                  >
                    <SocialIcon className="w-5 h-5" />
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Links Sections */}
          {footerSections.map((section, idx) => (
            <motion.div key={idx} variants={itemVariants} className="space-y-4">
              <h3 className="text-lg font-semibold text-white">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <motion.li key={link.path} whileHover={{ x: 5 }}>
                    <Link
                      to={link.path}
                      className="text-gray-400 hover:text-cyan-400 transition-colors duration-300 flex items-center gap-2 group"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span className="group-hover:translate-x-1 transition-transform">{link.label}</span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}

          {/* Contact Section */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Contact Us</h3>
            <div className="space-y-4">
              {contactInfo.map((contact, idx) => {
                const ContactIcon = contact.icon;
                return (
                  <motion.div
                    key={idx}
                    whileHover={{ x: 5, backgroundColor: 'rgba(255,255,255,0.05)' }}
                    className="flex items-start gap-3 p-3 rounded-lg transition-colors duration-300 cursor-pointer"
                  >
                    <ContactIcon className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 font-medium">{contact.label}</p>
                      <p className="text-sm text-gray-300">{contact.text}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ duration: 0.8 }}
          className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent my-8 origin-left"
        />

        {/* Bottom Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex flex-col md:flex-row justify-between items-center gap-6"
        >
          <motion.p variants={itemVariants} className="text-sm text-gray-400 text-center md:text-left">
            &copy; 2024 LoanCompare. All rights reserved. | Connecting Organizations with Perfect Financing Solutions
          </motion.p>

          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex gap-8 flex-wrap justify-center">
            {[
              { label: 'Privacy Policy', href: '#privacy' },
              { label: 'Terms of Service', href: '#terms' },
              { label: 'Disclaimer', href: '#disclaimer' }
            ].map((item) => (
              <motion.a
                key={item.href}
                variants={itemVariants}
                href={item.href}
                className="text-sm text-gray-400 hover:text-cyan-400 transition-colors duration-300 flex items-center gap-1 group"
              >
                {item.label}
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </motion.a>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Animated Bottom Border */}
      <motion.div
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500"
      />
    </footer>
  );
};

export default Footer;