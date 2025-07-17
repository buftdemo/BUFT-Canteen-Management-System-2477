import { format, subDays, addDays, parseISO, setHours } from 'date-fns';

// Mock departments
export const departments = [
  'Computer Science',
  'Textile Engineering',
  'Fashion Design',
  'Business Administration',
  'Mechanical Engineering',
  'Electrical Engineering',
  'Accounting',
  'Marketing',
  'Human Resources',
  'Administration'
];

// Mock designations
export const designations = [
  'Professor',
  'Associate Professor',
  'Assistant Professor',
  'Lecturer',
  'Senior Lecturer',
  'Department Head',
  'Lab Assistant',
  'Office Assistant',
  'Administrative Officer',
  'Dean'
];

// Generate mock employees
export const generateEmployees = (count = 50) => {
  const roles = ['employee', 'staff', 'admin'];
  const employees = [];
  
  for (let i = 1; i <= count; i++) {
    const id = `EMP-${String(i).padStart(4, '0')}`;
    const deptIndex = Math.floor(Math.random() * departments.length);
    const desigIndex = Math.floor(Math.random() * designations.length);
    const roleIndex = Math.random() > 0.9 ? (Math.random() > 0.5 ? 2 : 1) : 0;
    
    employees.push({
      id,
      employeeId: id,
      name: `Employee ${i}`,
      email: `employee${i}@buft.edu.bd`,
      department: departments[deptIndex],
      designation: designations[desigIndex],
      role: roles[roleIndex],
      profileUrl: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${(i % 70) + 1}.jpg`,
      createdAt: format(subDays(new Date(), Math.floor(Math.random() * 365)), 'yyyy-MM-dd')
    });
  }
  
  // Add admin accounts
  employees.push({
    id: 'ADMIN-001',
    employeeId: 'ADMIN-001',
    name: 'Administrator',
    email: 'admin@buft.edu.bd',
    department: 'Administration',
    designation: 'System Administrator',
    role: 'admin',
    profileUrl: 'https://randomuser.me/api/portraits/men/1.jpg',
    createdAt: format(subDays(new Date(), 500), 'yyyy-MM-dd')
  });
  
  employees.push({
    id: 'ADMIN-002',
    employeeId: 'ADMIN-002',
    name: 'Notification Admin',
    email: 'notification@buft.edu.bd',
    department: 'Administration',
    designation: 'Notification Manager',
    role: 'admin',
    profileUrl: 'https://randomuser.me/api/portraits/women/2.jpg',
    createdAt: format(subDays(new Date(), 450), 'yyyy-MM-dd')
  });
  
  return employees;
};

// Generate mock menu items
export const generateMenuItems = () => {
  return [
    {
      id: 1,
      name: 'Chicken Biryani',
      price: 120,
      category: 'Main Course',
      available: true,
      description: 'Fragrant rice with tender chicken pieces',
      popularity: 95,
      imageUrl: 'https://source.unsplash.com/random/300x200/?biryani'
    },
    {
      id: 2,
      name: 'Beef Curry',
      price: 100,
      category: 'Main Course',
      available: true,
      description: 'Slow-cooked beef in spicy curry sauce',
      popularity: 88,
      imageUrl: 'https://source.unsplash.com/random/300x200/?beef-curry'
    },
    {
      id: 3,
      name: 'Fish Fry',
      price: 80,
      category: 'Main Course',
      available: true,
      description: 'Deep-fried fish with special spices',
      popularity: 75,
      imageUrl: 'https://source.unsplash.com/random/300x200/?fish-fry'
    },
    {
      id: 4,
      name: 'Vegetable Curry',
      price: 60,
      category: 'Main Course',
      available: true,
      description: 'Mixed vegetables in a flavorful curry',
      popularity: 65,
      imageUrl: 'https://source.unsplash.com/random/300x200/?vegetable-curry'
    },
    {
      id: 5,
      name: 'Dal',
      price: 40,
      category: 'Side Dish',
      available: true,
      description: 'Classic lentil soup with spices',
      popularity: 80,
      imageUrl: 'https://source.unsplash.com/random/300x200/?dal'
    },
    {
      id: 6,
      name: 'Rice',
      price: 30,
      category: 'Side Dish',
      available: true,
      description: 'Steamed white rice',
      popularity: 100,
      imageUrl: 'https://source.unsplash.com/random/300x200/?rice'
    },
    {
      id: 7,
      name: 'Naan',
      price: 20,
      category: 'Side Dish',
      available: true,
      description: 'Freshly baked flatbread',
      popularity: 85,
      imageUrl: 'https://source.unsplash.com/random/300x200/?naan'
    },
    {
      id: 8,
      name: 'Salad',
      price: 25,
      category: 'Side Dish',
      available: true,
      description: 'Fresh vegetable salad with dressing',
      popularity: 70,
      imageUrl: 'https://source.unsplash.com/random/300x200/?salad'
    },
    {
      id: 9,
      name: 'Mango Juice',
      price: 35,
      category: 'Beverage',
      available: true,
      description: 'Refreshing mango juice',
      popularity: 90,
      imageUrl: 'https://source.unsplash.com/random/300x200/?mango-juice'
    },
    {
      id: 10,
      name: 'Tea',
      price: 15,
      category: 'Beverage',
      available: true,
      description: 'Hot tea with milk',
      popularity: 95,
      imageUrl: 'https://source.unsplash.com/random/300x200/?tea'
    },
    {
      id: 11,
      name: 'Coffee',
      price: 25,
      category: 'Beverage',
      available: true,
      description: 'Freshly brewed coffee',
      popularity: 85,
      imageUrl: 'https://source.unsplash.com/random/300x200/?coffee'
    },
    {
      id: 12,
      name: 'Gulab Jamun',
      price: 40,
      category: 'Dessert',
      available: true,
      description: 'Sweet milk solids balls soaked in sugar syrup',
      popularity: 92,
      imageUrl: 'https://source.unsplash.com/random/300x200/?gulab-jamun'
    }
  ];
};

// Generate mock reservations
export const generateReservations = (count = 100) => {
  const employees = generateEmployees();
  const menuItems = generateMenuItems();
  const reservations = [];
  
  // Statuses for reservations
  const statuses = ['confirmed', 'pending', 'canceled', 'completed'];
  
  // Generate past and future reservations
  for (let i = 1; i <= count; i++) {
    const daysOffset = Math.floor(Math.random() * 30) - 15; // -15 to +14 days
    const reservationDate = format(addDays(new Date(), daysOffset), 'yyyy-MM-dd');
    const isToday = reservationDate === format(new Date(), 'yyyy-MM-dd');
    
    // For demonstration, make some reservations after 10 AM cutoff
    const reservationTime = format(
      setHours(
        parseISO(`${reservationDate}T00:00:00`), 
        Math.floor(Math.random() * 24)
      ), 
      'HH:mm'
    );
    
    const isPastCutoff = reservationTime > '10:00' && isToday;
    
    // Random employee
    const employee = employees[Math.floor(Math.random() * employees.length)];
    
    // Random number of items (1-4)
    const itemCount = Math.floor(Math.random() * 4) + 1;
    const items = [];
    
    for (let j = 0; j < itemCount; j++) {
      const menuItem = menuItems[Math.floor(Math.random() * menuItems.length)];
      const quantity = Math.floor(Math.random() * 3) + 1;
      items.push({
        ...menuItem,
        quantity
      });
    }
    
    // Calculate total amount
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Random guest count (0-3)
    const guestCount = Math.random() > 0.7 ? Math.floor(Math.random() * 3) + 1 : 0;
    
    // Add guest cost if applicable
    const totalWithGuests = totalAmount + (items.reduce((sum, item) => sum + item.price, 0) * guestCount);
    
    // Determine status based on date and time
    let status;
    if (daysOffset < 0) {
      status = Math.random() > 0.1 ? 'completed' : 'canceled';
    } else if (daysOffset > 0) {
      status = Math.random() > 0.2 ? 'confirmed' : 'pending';
    } else {
      // Today's reservations
      if (isPastCutoff) {
        status = Math.random() > 0.5 ? 'confirmed' : 'pending';
      } else {
        status = statuses[Math.floor(Math.random() * statuses.length)];
      }
    }
    
    reservations.push({
      id: i,
      userEmail: employee.email,
      userName: employee.name,
      items,
      guestCount,
      guestNames: guestCount > 0 ? 'Guest Names' : null,
      totalAmount: totalWithGuests,
      type: guestCount > 0 ? 'with_guests' : 'personal',
      date: reservationDate,
      time: reservationTime,
      status,
      isPastCutoff
    });
  }
  
  return reservations;
};

// Generate system settings
export const generateSettings = () => {
  return {
    general: {
      siteName: 'BUFT Canteen Management System',
      timezone: 'Asia/Dhaka',
      siteDescription: 'Manage canteen reservations for BUFT faculty and staff'
    },
    notifications: {
      enableEmail: true,
      enablePush: false,
      enableSound: true
    },
    security: {
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      passwordMinLength: 8
    },
    database: {
      backupFrequency: 'daily',
      autoCleanup: true,
      connectionConfig: {
        host: 'localhost',
        port: 3306,
        database: 'buft_canteen',
        user: '[REDACTED]',
        password: '[REDACTED]'
      }
    },
    advanced: {
      apiRateLimit: 100,
      debugMode: false,
      maintenanceMode: false,
      enableCache: true
    },
    integrations: {
      emailService: {
        provider: 'SMTP',
        host: 'smtp.buft.edu.bd',
        port: 587,
        username: 'notifications@buft.edu.bd',
        password: '[REDACTED]'
      }
    }
  };
};

// Get current day's reservations
export const getCurrentDayReservations = () => {
  const today = format(new Date(), 'yyyy-MM-dd');
  return generateReservations().filter(r => r.date === today);
};

// Generate analytics data
export const generateAnalyticsData = () => {
  const dates = [];
  const currentDate = new Date();
  
  // Generate dates for last 30 days
  for (let i = 29; i >= 0; i--) {
    dates.push(format(subDays(currentDate, i), 'yyyy-MM-dd'));
  }
  
  // Generate reservation counts
  const reservationCounts = dates.map(date => {
    return {
      date,
      count: Math.floor(Math.random() * 50) + 10
    };
  });
  
  // Generate menu item popularity
  const menuItemPopularity = generateMenuItems().map(item => {
    return {
      name: item.name,
      orders: Math.floor(Math.random() * 500) + 50
    };
  });
  
  // Sort by popularity
  menuItemPopularity.sort((a, b) => b.orders - a.orders);
  
  return {
    reservationCounts,
    menuItemPopularity,
    totalEmployees: generateEmployees().length,
    totalMenuItems: generateMenuItems().length,
    averageOrderValue: 150,
    peakHours: ['12:00', '13:00', '14:00']
  };
};