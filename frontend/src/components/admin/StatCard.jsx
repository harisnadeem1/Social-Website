const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="p-4 bg-white rounded-md shadow-sm flex items-center space-x-3">
    <div className={`p-2 rounded-full bg-gray-100 ${color}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);
