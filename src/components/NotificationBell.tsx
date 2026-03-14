import React from 'react';
import { Bell } from 'lucide-react';

const NotificationBell = () => (
  <button className="p-2 text-gray-400 hover:text-white">
    <Bell size={20} />
  </button>
);

export default NotificationBell;