const Dashboard = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Wallet Info</h2>
          <p className="text-white/80">Connect your wallet to get started</p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Network Status</h2>
          <p className="text-white/80">Not connected</p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Gas Tracker</h2>
          <p className="text-white/80">Loading gas prices...</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;