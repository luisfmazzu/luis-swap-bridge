import { Link, useLocation } from 'react-router-dom';
import { useAccount, useConnect, useDisconnect, useEnsName } from 'wagmi';
import { Wallet, LogOut, Menu, X } from 'lucide-react';
import { Button } from './ui/button';
import { formatAddress } from '../utils/format';
import { useState } from 'react';

const Header = () => {
  const location = useLocation();
  const { address, isConnected } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: ensName } = useEnsName({ address });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleConnect = () => {
    const injectedConnector = connectors.find(connector => connector.id === 'injected');
    if (injectedConnector) {
      connect({ connector: injectedConnector });
    }
  };

  const isActivePage = (path: string) => location.pathname === path;

  return (
    <header className="bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            TipCrypto ⚡
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            <Link 
              to="/" 
              className={`transition-colors ${
                isActivePage('/') ? 'text-white' : 'text-white/80 hover:text-white'
              }`}
            >
              Home
            </Link>
            <Link 
              to="/dashboard" 
              className={`transition-colors ${
                isActivePage('/dashboard') ? 'text-white' : 'text-white/80 hover:text-white'
              }`}
            >
              Dashboard
            </Link>
            <Link 
              to="/my-tips" 
              className={`transition-colors ${
                isActivePage('/my-tips') ? 'text-white' : 'text-white/80 hover:text-white'
              }`}
            >
              My Tips
            </Link>
          </nav>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            {isConnected && address ? (
              <div className="flex items-center space-x-2">
                <div className="hidden sm:block text-right">
                  <div className="text-sm text-white/80">
                    {ensName || formatAddress(address)}
                  </div>
                  <div className="text-xs text-green-400">Connected</div>
                </div>
                <Button
                  onClick={() => disconnect()}
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleConnect}
                variant="gradient"
                className="shadow-lg"
              >
                <Wallet className="h-4 w-4 mr-2" />
                Connect Wallet
              </Button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-white/10 pt-4">
            <div className="flex flex-col space-y-2">
              <Link 
                to="/" 
                onClick={() => setMobileMenuOpen(false)}
                className={`py-2 transition-colors ${
                  isActivePage('/') ? 'text-white' : 'text-white/80'
                }`}
              >
                Home
              </Link>
              <Link 
                to="/dashboard" 
                onClick={() => setMobileMenuOpen(false)}
                className={`py-2 transition-colors ${
                  isActivePage('/dashboard') ? 'text-white' : 'text-white/80'
                }`}
              >
                Dashboard
              </Link>
              <Link 
                to="/my-tips" 
                onClick={() => setMobileMenuOpen(false)}
                className={`py-2 transition-colors ${
                  isActivePage('/my-tips') ? 'text-white' : 'text-white/80'
                }`}
              >
                My Tips
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;