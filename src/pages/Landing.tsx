const Landing = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center text-white">
        <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Support Creators
        </h1>
        <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
          Send cryptocurrency tips directly to your favorite creators using the Ethereum blockchain
        </p>
        <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-lg text-lg hover:opacity-90 transition-opacity">
          Get Started
        </button>
      </div>
    </div>
  );
};

export default Landing;