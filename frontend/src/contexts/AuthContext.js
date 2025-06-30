import { createContext } from 'react';

const AuthContext = createContext({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
  coins: 0,
  updateCoins: () => {}
});

export default AuthContext;