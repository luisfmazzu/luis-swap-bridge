import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { ArrowRight, Sparkles, Shield, Zap, Globe, Heart, Wallet } from 'lucide-react';
import { Button } from '../components/ui/button';
import CreatorCard from '../components/CreatorCard';
import { creators } from '../creators';

const Landing = () => {
  const navigate = useNavigate();
  const { isConnected } = useAccount();

  const featuredCreators = creators.slice(0, 3);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6
      }
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <motion.section 
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
          <motion.div variants={itemVariants} className="mb-8">
            <Sparkles className="w-16 h-16 text-yellow-400 mx-auto mb-4 animate-pulse" />
          </motion.div>

          <motion.h1 
            variants={itemVariants}
            className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent leading-tight"
          >
            Support Creators
            <br />
            <span className="text-4xl md:text-6xl">with Crypto Tips</span>
          </motion.h1>

          <motion.p 
            variants={itemVariants}
            className="text-xl md:text-2xl text-white/80 mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            Send cryptocurrency tips directly to your favorite creators using the 
            <span className="text-indigo-400 font-semibold"> Ethereum blockchain</span>. 
            Fast, transparent, and decentralized.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              onClick={() => navigate(isConnected ? '/dashboard' : '/dashboard')}
              size="lg"
              variant="gradient"
              className="text-lg px-8 py-4 shadow-2xl hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-300"
            >
              <Zap className="mr-2 h-5 w-5" />
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <Button
              onClick={() => navigate('/dashboard')}
              size="lg"
              variant="outline"
              className="text-lg px-8 py-4 border-white/20 text-white hover:bg-white/10 backdrop-blur-sm"
            >
              <Globe className="mr-2 h-5 w-5" />
              Explore Creators
            </Button>
          </motion.div>

          {/* Features */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16"
          >
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
              <Shield className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Secure</h3>
              <p className="text-white/70">Built on Ethereum blockchain for maximum security and transparency</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
              <Zap className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Fast</h3>
              <p className="text-white/70">Instant tips with real-time transaction tracking</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
              <Heart className="w-12 h-12 text-pink-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Direct</h3>
              <p className="text-white/70">No middlemen - tips go directly to creators</p>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Featured Creators Section */}
      <motion.section 
        className="py-20 px-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div variants={itemVariants} className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Featured Creators
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Discover amazing creators and support them with crypto tips
            </p>
          </motion.div>

          <motion.div 
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {featuredCreators.map((creator, index) => (
              <motion.div
                key={creator.id}
                variants={itemVariants}
                custom={index}
              >
                <CreatorCard 
                  creator={creator} 
                  disabled={!isConnected}
                />
              </motion.div>
            ))}
          </motion.div>

          <motion.div variants={itemVariants} className="text-center mt-12">
            <Button
              onClick={() => navigate('/dashboard')}
              size="lg"
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              View All Creators
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </motion.section>

      {/* Call to Action */}
      <motion.section 
        className="py-20 px-4 bg-gradient-to-r from-indigo-900/50 to-purple-900/50"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 
            variants={itemVariants}
            className="text-4xl md:text-5xl font-bold text-white mb-6"
          >
            Ready to Start Tipping?
          </motion.h2>
          <motion.p 
            variants={itemVariants}
            className="text-xl text-white/80 mb-8"
          >
            Connect your wallet and start supporting creators with cryptocurrency
          </motion.p>
          <motion.div variants={itemVariants}>
            <Button
              onClick={() => navigate('/dashboard')}
              size="lg"
              variant="gradient"
              className="text-lg px-8 py-4 shadow-2xl"
            >
              <Wallet className="mr-2 h-5 w-5" />
              Connect Wallet & Start Tipping
            </Button>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};

export default Landing;