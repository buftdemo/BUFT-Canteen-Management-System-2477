import React, { createContext, useContext, useState, useEffect } from 'react';
import { format } from 'date-fns';

const MenuContext = createContext();

export const useMenu = () => {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
};

export const MenuProvider = ({ children }) => {
  const [todayMenu, setTodayMenu] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    items: [
      { id: 1, name: 'Chicken Biryani', price: 120, category: 'Main Course', available: true },
      { id: 2, name: 'Beef Curry', price: 100, category: 'Main Course', available: true },
      { id: 3, name: 'Fish Fry', price: 80, category: 'Main Course', available: true },
      { id: 4, name: 'Vegetable Curry', price: 60, category: 'Main Course', available: true },
      { id: 5, name: 'Dal', price: 40, category: 'Side Dish', available: true },
      { id: 6, name: 'Rice', price: 30, category: 'Side Dish', available: true },
    ]
  });

  const [reservations, setReservations] = useState([]);
  const [menuHistory, setMenuHistory] = useState([]);

  const updateMenu = (newMenu) => {
    setTodayMenu(newMenu);
    // In a real app, this would trigger a socket event
    console.log('Menu updated:', newMenu);
  };

  const addReservation = (reservation) => {
    const newReservation = {
      id: Date.now(),
      ...reservation,
      date: format(new Date(), 'yyyy-MM-dd'),
      time: format(new Date(), 'HH:mm'),
      status: 'confirmed'
    };
    setReservations(prev => [...prev, newReservation]);
    return newReservation;
  };

  const getReservationsByUser = (userEmail) => {
    return reservations.filter(res => res.userEmail === userEmail);
  };

  const getAllReservations = () => {
    return reservations;
  };

  const value = {
    todayMenu,
    updateMenu,
    addReservation,
    getReservationsByUser,
    getAllReservations,
    menuHistory
  };

  return (
    <MenuContext.Provider value={value}>
      {children}
    </MenuContext.Provider>
  );
};