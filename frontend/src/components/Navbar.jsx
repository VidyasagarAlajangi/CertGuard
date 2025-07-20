import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { User, Menu, X, LogOut } from 'lucide-react';
import { logout } from '../authSlice';
import logo from '../assets/logo.png';

const AnimatedNavLink = ({ to, children }) => (
  <Link
    to={to}
    reloadDocument={to.includes('#')}
    className="text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium"
  >
    {children}
  </Link>
);

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [isOpen, setIsOpen] = useState(false);
  const [rounded, setRounded] = useState('rounded-full');
  const timeoutRef = useRef(null);

  const toggleMenu = () => setIsOpen((prev) => !prev);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (isOpen) setRounded('rounded-xl');
    else timeoutRef.current = setTimeout(() => setRounded('rounded-full'), 300);
    return () => timeoutRef.current && clearTimeout(timeoutRef.current);
  }, [isOpen]);

  const navLinks = [
    { label: 'Verify', to: '/verify' },
    { label: 'Features', to: '/#features' },
    user && user.role === 'admin'
      ? { label: 'Admin Dashboard', to: '/admin', requiresAuth: true }
      : user && user.role === 'company'
      ? { label: 'Company Dashboard', to: '/company', requiresAuth: true }
      : { label: 'Dashboard', to: '/dashboard', requiresAuth: true },
  ];

  const handleLogout = () => {
    dispatch(logout());
    setIsOpen(false);
  };

  const AuthButtons = () =>
    user ? (
      <div className="group relative">
        <button className="ml-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-semibold flex items-center gap-2 transition-colors hover:bg-blue-200">
          <User size={22} />
          <span className="hidden sm:inline">{user?.name}</span>
        </button>
        <div className="absolute right-0 mt-2 w-48 bg-[#1f1f1f] border border-[#333] rounded-lg shadow-lg py-1 z-20 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all pointer-events-auto origin-top-right">
          <div className="px-3 py-2 text-xs text-gray-400 border-b border-[#333]">
            Signed in as <strong>{user?.name}</strong>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-slate-700 flex items-center gap-2 transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    ) : (
      <>
        <Link to="/login">
          <button className="px-4 py-2 sm:px-3 text-xs sm:text-sm border border-[#333] bg-[rgba(31,31,31,0.62)] text-gray-300 rounded-full hover:border-white/50 hover:text-white transition-colors duration-200 w-full sm:w-auto">
            LogIn
          </button>
        </Link>
        <Link to="/signup" className="relative group w-full sm:w-auto">
          <div className="absolute inset-0 -m-2 rounded-full hidden sm:block bg-gray-100 opacity-40 filter blur-lg pointer-events-none transition-all duration-300 ease-out group-hover:opacity-60 group-hover:blur-xl group-hover:-m-3" />
          <button className="relative z-10 px-4 py-2 sm:px-3 text-xs sm:text-sm font-semibold text-black bg-gradient-to-br from-gray-100 to-gray-300 rounded-full hover:from-gray-200 hover:to-gray-400 transition-all duration-200 w-full sm:w-auto">
            Signup
          </button>
        </Link>
      </>
    );

  const MobileMenu = () => (
    <div
      className={`sm:hidden transition-all duration-300 ease-in-out overflow-hidden ${
        isOpen
          ? 'max-h-[1000px] opacity-100 pt-4'
          : 'max-h-0 opacity-0 pt-0 pointer-events-none'
      }`}
    >
      <nav className="flex flex-col items-center space-y-4 text-base w-full">
        {navLinks.map(
          ({ label, to, requiresAuth }) =>
            !(requiresAuth && !user) && (
              <Link
                key={to}
                to={to}
                reloadDocument={to.includes('#')}
                className="text-gray-300 hover:text-white transition-colors w-full text-center"
                onClick={toggleMenu}
              >
                {label}
              </Link>
            ),
        )}
      </nav>
      <div className="flex flex-col items-center space-y-4 mt-4 w-full px-4">
        {user ? (
          <div className="w-full">
            <div className="flex items-center justify-center gap-3 mb-4 px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-semibold">
              <User size={22} />
              <span className="font-medium">{user.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="w-full text-center px-6 py-3 text-lg text-gray-300 hover:bg-slate-700 rounded-lg flex items-center justify-center gap-3 transition-colors border border-slate-600"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 w-full">
            <Link to="/login" className="w-full" onClick={toggleMenu}>
              <button className="w-full px-4 py-2 sm:px-3 text-sm border border-[#333] bg-[rgba(31,31,31,0.62)] text-gray-300 rounded-full hover:border-white/50 hover:text-white transition-colors duration-200">
                LogIn
              </button>
            </Link>
            <Link to="/signup" className="w-full" onClick={toggleMenu}>
              <button className="w-full relative z-10 px-4 py-2 sm:px-3 text-sm font-semibold text-black bg-gradient-to-br from-gray-100 to-gray-300 rounded-full hover:from-gray-200 hover:to-gray-400 transition-all duration-200">
                Signup
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <header
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pl-6 pr-6 py-3 border border-[#333] bg-gray-800 w-[calc(100%-2rem)] sm:w-[800px] transition-[border-radius] duration-300 ease-in-out ${rounded}`}
    >
      <div className="flex items-center justify-between w-full gap-x-6 sm:gap-x-8">
        <Link to="/" className="flex items-center gap-3">
          <img
            src={logo}
            alt="CertGuard Logo"
            className="w-10 h-10 object-contain mr-2 "
            style={{ display: "inline-block", verticalAlign: "middle" }}
          />
          <span className="hidden sm:inline font-semibold text-white text-shadow-glow">
  CertGuard
</span>

        </Link>

        <nav className="hidden sm:flex items-center space-x-6 text-sm">
          {navLinks.map(
            ({ label, to, requiresAuth }) =>
              !(requiresAuth && !user) && (
                <AnimatedNavLink key={to} to={to}>
                  {label}
                </AnimatedNavLink>
              ),
          )}
        </nav>

        <div className="hidden sm:flex items-center gap-3">
          <AuthButtons />
        </div>

        <button
          className="sm:hidden flex items-center justify-center w-8 h-8 text-gray-300 focus:outline-none"
          onClick={toggleMenu}
          aria-label={isOpen ? 'Close Menu' : 'Open Menu'}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <MobileMenu />
    </header>
  );
};

export default Navbar;
