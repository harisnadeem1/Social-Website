export const testAccounts = [
  {
    id: 'user001',
    email: 'user@test.com',
    password: 'password123',
    name: 'Alex Johnson',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    coins: 100,
    isPremium: false
  },
  {
    id: 'admin001',
    email: 'admin@flirtduo.com',
    password: 'admin123',
    name: 'The Godfather',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    coins: 1000,
    isPremium: true
  },
  {
    id: 'chatter001',
    email: 'chatter@flirtduo.com',
    password: 'chatter123',
    name: 'Emma Chatter',
    role: 'chatter',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    coins: 0,
    isPremium: false
  },
  {
    id: 'premium001',
    email: 'premium@test.com',
    password: 'premium123',
    name: 'Premium User',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    coins: 500,
    isPremium: true
  }
];

export const testAccountsObj = {
  user: testAccounts[0],
  admin: testAccounts[1],
  chatter: testAccounts[2],
  premium: testAccounts[3]
};