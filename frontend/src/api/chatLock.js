const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const lockChat = async (conversationId, token) => {
  const res = await fetch(`${BASE_URL}/chatter-lock/lock/${conversationId}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
};

export const unlockChat = async (conversationId, token) => {
  const res = await fetch(`${BASE_URL}/chatter-lock/unlock/${conversationId}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
};

export const checkLockStatus = async (conversationId, token) => {
  const res = await fetch(`${BASE_URL}/chatter-lock/status/${conversationId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
};
