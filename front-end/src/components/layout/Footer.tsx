import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white rounded-t-[32px] md:rounded-[32px] p-8 md:p-12 mt-12 mx-0 md:mx-4 mb-0 md:mb-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
        
        {/* Company Column */}
        <div>
          <h4 className="font-bold mb-4 text-sm md:text-lg text-white">Company</h4>
          <ul className="space-y-2 text-gray-400 text-xs md:text-sm">
            <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
            <li><Link to="/careers" className="hover:text-white transition-colors">Careers</Link></li>
            <li><Link to="/press" className="hover:text-white transition-colors">Press</Link></li>
            <li><Link to="/blog" className="hover:text-white transition-colors">Blog</Link></li>
          </ul>
        </div>

        {/* Support Column */}
        <div>
          <h4 className="font-bold mb-4 text-sm md:text-lg text-white">Support</h4>
          <ul className="space-y-2 text-gray-400 text-xs md:text-sm">
            <li><Link to="/help" className="hover:text-white transition-colors">Help Center</Link></li>
            <li><Link to="/safety" className="hover:text-white transition-colors">Safety Center</Link></li>
            <li><Link to="/guidelines" className="hover:text-white transition-colors">Guidelines</Link></li>
            <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
          </ul>
        </div>

        {/* Legal Column */}
        <div>
          <h4 className="font-bold mb-4 text-sm md:text-lg text-white">Legal</h4>
          <ul className="space-y-2 text-gray-400 text-xs md:text-sm">
            <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            <li><Link to="/cookies" className="hover:text-white transition-colors">Cookie Policy</Link></li>
            <li><Link to="/ip" className="hover:text-white transition-colors">Intellectual Property</Link></li>
          </ul>
        </div>

        {/* Social Column */}
        <div>
          <h4 className="font-bold mb-4 text-sm md:text-lg text-white">Social</h4>
          <ul className="space-y-2 text-gray-400 text-xs md:text-sm">
            <li><a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Instagram</a></li>
            <li><a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Twitter / X</a></li>
            <li><a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Facebook</a></li>
            <li><a href="https://tiktok.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">TikTok</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-800 pt-8 text-center text-xs md:text-sm text-gray-500">
        <p className="mb-2">© 2026 The Dating App. All rights reserved.</p>
        <p>Made in Hyderabad, India ❤️ for genuine connections.</p>
      </div>
    </footer>
  );
};

export default Footer;