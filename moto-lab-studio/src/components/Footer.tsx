import logo from "@/assets/logo.png";

const Footer = () => {
  return (
    <footer className="border-t border-border/30 py-10">
      <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <img src={logo} alt="MotoScience" className="h-7 w-7" />
          <span className="font-display text-sm font-bold tracking-wider gradient-text">
            MotoScience
          </span>
        </div>
        <p className="text-muted-foreground text-xs">
          © {new Date().getFullYear()} MotoScience. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
