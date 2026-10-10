import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/logo.png";

const navLinks = [
  { label: "Explore", href: "/#features" },
  { label: "Compare", href: "/compare" },
  { label: "Modify", href: "/modify" },
  { label: "Garage", href: "/#garage" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/30 backdrop-blur-2xl">
      <div className="container flex items-center justify-between h-16 md:h-20">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="MotoScience" className="h-9 w-9" />
          <span className="font-display text-lg font-bold tracking-wider gradient-text">
            MotoScience
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-300"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#cta"
            className="gradient-bg text-primary-foreground px-5 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Get Started
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-card border-t border-border/30 overflow-hidden"
          >
            <div className="container py-4 flex flex-col gap-3">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="text-sm font-medium text-muted-foreground hover:text-primary py-2 transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="#cta"
                onClick={() => setOpen(false)}
                className="gradient-bg text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-semibold text-center mt-2"
              >
                Get Started
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
