import React, { useState } from 'react';
import { Mail, Phone, MapPin, Bell, Shield, Key, Compass, Mountain, Trophy, Camera } from 'lucide-react';

const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = '' }) => (
  <div className={`p-4 ${className}`}>
    {children}
  </div>
);

const CardContent = ({ children, className = '' }) => (
  <div className={`p-4 pt-0 ${className}`}>
    {children}
  </div>
);

const ProfileSection = ({ title, icon: Icon, children }) => (
  <Card className="mb-6 border-2 border-amber-600/20 bg-stone-50/80 backdrop-blur-sm">
    <CardHeader className="bg-gradient-to-r from-amber-600/10 to-transparent">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="text-amber-600" size={24} />}
        <h2 className="text-xl font-bold text-amber-900">{title}</h2>
      </div>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

const Profile = () => {
  const [achievements, setAchievements] = useState([
    { icon: Mountain, title: 'Peak Performance', description: '100 Orders Completed', achieved: true },
    { icon: Trophy, title: 'Customer Champion', description: '50 5-Star Reviews', achieved: true },
    { icon: Compass, title: 'Pathfinder', description: 'Early Access Member', achieved: false }
  ]);

  const [notifications, setNotifications] = useState([
    { title: 'Email Notifications', description: 'Receive email updates about your account', enabled: true },
    { title: 'Order Updates', description: 'Get notified about order status changes', enabled: true },
    { title: 'Inventory Alerts', description: 'Receive alerts when stock is low', enabled: false }
  ]);

  const toggleNotification = (index) => {
    setNotifications(notifications.map((notif, i) => 
      i === index ? { ...notif, enabled: !notif.enabled } : notif
    ));
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-b from-amber-50 to-stone-100">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-amber-800 flex items-center gap-2">
          <Compass className="text-amber-600" />
          Adventure Profile
        </h1>

        <ProfileSection title="Explorer Details" icon={Mountain}>
          <div className="flex items-center gap-6 mb-6">
            <div className="relative group">
              <img
                src="/api/placeholder/96/96"
                alt="Profile"
                className="w-24 h-24 rounded-full ring-4 ring-amber-600 transition-transform group-hover:scale-105"
              />
              <button className="absolute bottom-0 right-0 p-2 bg-amber-600 rounded-full text-white hover:bg-amber-700 transition-colors">
                <Camera size={16} />
              </button>
            </div>
            <div>
              <h2 className="text-xl font-bold text-amber-900">Jagjeet Jaiswal</h2>
              <p className="text-amber-600">Master Explorer</p>
              <div className="mt-2 flex gap-2">
                <span className="px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded-full">
                  Level 5 Explorer
                </span>
                <span className="px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded-full">
                  Premium Member
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {[
              { icon: Mail, value: 'jagjeet@furnimart.com' },
              { icon: Phone, value: '+91 8092769596' },
              { icon: MapPin, value: 'Mullana, Ambala' }
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3 text-amber-800 p-2 hover:bg-amber-50 rounded-lg transition-colors">
                <item.icon size={20} className="text-amber-600" />
                <span>{item.value}</span>
              </div>
            ))}
          </div>
        </ProfileSection>

        <ProfileSection title="Achievements" icon={Trophy}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 ${
                  achievement.achieved
                    ? 'border-amber-600 bg-amber-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <achievement.icon
                  size={24}
                  className={achievement.achieved ? 'text-amber-600' : 'text-gray-400'}
                />
                <h3 className="font-bold mt-2 text-amber-900">{achievement.title}</h3>
                <p className="text-sm text-amber-600">{achievement.description}</p>
              </div>
            ))}
          </div>
        </ProfileSection>

        <ProfileSection title="Journey Alerts" icon={Bell}>
          <div className="space-y-4">
            {notifications.map((notification, index) => (
              <div key={index} className="flex items-center justify-between p-3 hover:bg-amber-50 rounded-lg transition-colors">
                <div>
                  <p className="font-medium text-amber-900">{notification.title}</p>
                  <p className="text-sm text-amber-600">{notification.description}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={notification.enabled}
                    onChange={() => toggleNotification(index)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                </label>
              </div>
            ))}
          </div>
        </ProfileSection>

        <ProfileSection title="Security Measures" icon={Shield}>
          <div className="space-y-4">
            <button className="flex items-center gap-3 w-full p-4 text-left rounded-lg hover:bg-amber-50 transition-colors border-2 border-transparent hover:border-amber-600/20">
              <Shield className="text-amber-600" size={20} />
              <div>
                <p className="font-medium text-amber-900">Two-Factor Authentication</p>
                <p className="text-sm text-amber-600">Add an extra layer of security to your account</p>
              </div>
            </button>
            <button className="flex items-center gap-3 w-full p-4 text-left rounded-lg hover:bg-amber-50 transition-colors border-2 border-transparent hover:border-amber-600/20">
              <Key className="text-amber-600" size={20} />
              <div>
                <p className="font-medium text-amber-900">Change Password</p>
                <p className="text-sm text-amber-600">Update your password regularly to stay secure</p>
              </div>
            </button>
          </div>
        </ProfileSection>
      </div>
    </div>
  );
};

export default Profile;