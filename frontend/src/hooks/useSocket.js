import { useEffect } from 'react';
import { getSocket } from '../api/socket';

const DASHBOARD_REFRESH = 'dashboard:refresh';

export function useSocketRefresh(onRefresh) {
  useEffect(() => {
    const socket = getSocket();
    const handler = () => {
      if (typeof onRefresh === 'function') onRefresh();
    };
    socket.on(DASHBOARD_REFRESH, handler);
    return () => socket.off(DASHBOARD_REFRESH, handler);
  }, [onRefresh]);
}
