export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-primary-800 border-t border-primary-700 py-4 px-6 mt-6">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="text-neutral-400 text-sm mb-4 md:mb-0">
          © {currentYear} Nexus Casino. All rights reserved.
        </div>
        
        <div className="flex space-x-6">
          <a href="#" className="text-neutral-400 hover:text-white transition-colors">Terms</a>
          <a href="#" className="text-neutral-400 hover:text-white transition-colors">Privacy</a>
          <a href="#" className="text-neutral-400 hover:text-white transition-colors">Support</a>
          <a href="#" className="text-neutral-400 hover:text-white transition-colors">Responsible Gaming</a>
        </div>
      </div>
    </footer>
  );
}
