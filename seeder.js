const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Facility = require('./models/Facility');
const User = require('./models/User');

dotenv.config();

const facilities = [
  {
    name: "Old Trafford Turf",
    facility_type: "Football",
    image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=600",
    location: "Manchester Road, Dhanmondi, Dhaka",
    price_per_hour: 1200,
    capacity: 14,
    available_slots: ["08:00 - 09:00", "09:00 - 10:00", "16:00 - 17:00", "17:00 - 18:00", "18:00 - 19:00", "19:00 - 20:00", "20:00 - 21:00"],
    description: "Premium artificial turf with professional FIFA-standard lighting and high-density grass. Perfect for 7-a-side football matches. Features a viewing gallery, mineral water stations, changing rooms, and secured parking facilities.",
    owner_email: "owner@sportnest.com",
    booking_count: 12
  },
  {
    name: "Smash Zone Court",
    facility_type: "Badminton",
    image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=600",
    location: "Road 11, Banani, Dhaka",
    price_per_hour: 600,
    capacity: 4,
    available_slots: ["09:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00", "14:00 - 15:00", "15:00 - 16:00", "16:00 - 17:00", "17:00 - 18:00"],
    description: "State-of-the-art wooden flooring badminton court equipped with anti-glare professional lighting. Air-conditioned arena ensuring comfort during long sessions. Equipment rental (rackets, shuttles) available at the desk.",
    owner_email: "owner@sportnest.com",
    booking_count: 24
  },
  {
    name: "Wimbledon Greens",
    facility_type: "Tennis",
    image: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&q=80&w=600",
    location: "Gulshan Avenue, Gulshan 2, Dhaka",
    price_per_hour: 800,
    capacity: 4,
    available_slots: ["07:00 - 08:00", "08:00 - 09:00", "15:00 - 16:00", "16:00 - 17:00", "17:00 - 18:00"],
    description: "Lush green synthetic grass tennis court with standard dimensions and layout. Perfect for both singles and doubles recreational or competitive matches. Coaching available on demand. Locker facilities included.",
    owner_email: "owner@sportnest.com",
    booking_count: 5
  },
  {
    name: "Aqua Splash Lanes",
    facility_type: "Swimming",
    image: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&q=80&w=600",
    location: "Sector 4, Uttara, Dhaka",
    price_per_hour: 500,
    capacity: 8,
    available_slots: ["08:00 - 09:00", "09:00 - 10:00", "10:00 - 11:00", "15:00 - 16:00", "16:00 - 17:00"],
    description: "An Olympic-sized swimming lane with temperature control systems. Clean crystal-clear water with state-of-the-art filtration. Showers, changing rooms, and certified lifeguards on duty continuously.",
    owner_email: "owner@sportnest.com",
    booking_count: 8
  },
  {
    name: "Dunk Nation Arena",
    facility_type: "Basketball",
    image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=600",
    location: "Satmasjid Road, Dhanmondi, Dhaka",
    price_per_hour: 1000,
    capacity: 10,
    available_slots: ["09:00 - 10:00", "10:00 - 11:00", "16:00 - 17:00", "17:00 - 18:00", "18:00 - 19:00"],
    description: "Premium indoor basketball court featuring polished maple wood flooring and professional height-adjustable hoops. High ceiling design with excellent natural ventilation. Perfect for 5-on-5 games.",
    owner_email: "owner@sportnest.com",
    booking_count: 15
  },
  {
    name: "Apex Arena Turf",
    facility_type: "Football",
    image: "https://images.unsplash.com/photo-1459865264687-595d652de67e?auto=format&fit=crop&q=80&w=600",
    location: "Mirpur 12, Mirpur, Dhaka",
    price_per_hour: 1100,
    capacity: 14,
    available_slots: ["08:00 - 09:00", "09:00 - 10:00", "17:00 - 18:00", "18:00 - 19:00", "19:00 - 20:00", "20:00 - 21:00"],
    description: "Standard FIFA 1-star synthetic turf perfect for rapid passing games. Located in the heart of Mirpur, offering accessible transit and secure lockboxes for players. Open all week.",
    owner_email: "owner@sportnest.com",
    booking_count: 19
  }
];

const seedData = async () => {
  try {
    console.log('Connecting to database for seeding...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sportnest');
    console.log('DB Connected successfully. Checking existing data...');
    // We do not delete existing data so the user's added facilities remain.
    console.log('Inserting default facilities...');
    await Facility.insertMany(facilities);
    console.log('Database seeded successfully!');
    process.exit();
  } catch (err) {
    console.error('Error seeding data:', err);
    process.exit(1);
  }
};

seedData();
