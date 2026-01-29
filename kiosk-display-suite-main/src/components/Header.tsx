import logo from "@/assets/logo.svg";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-secondary h-16 flex items-center px-6 shadow-lg">
      <img 
        src={logo} 
        alt="Nayax Logo" 
        className="h-8 brightness-0 invert"
      />
      <div className="ml-auto flex items-center gap-4">
        <span className="text-secondary-foreground/70 text-sm font-medium">
          Totem 10
        </span>
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
      </div>
    </header>
  );
};

export default Header;
