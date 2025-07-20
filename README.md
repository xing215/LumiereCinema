# Lumiere Cinema

A comprehensive cinema management system with modern web interface built with React and Vite for university coursework.

## 📋 Project Information

- **University**: Vietnam National University Ho Chi Minh City - University of Science (VNU-HCMUS)
- **Semester**: 6th Semester
- **Course**: Introduction to Software Engineering
- **Project Type**: Team Project
- **Frontend**: React 19 + Vite
- **Backend**: Node.js + Express + MongoDB
- **Styling**: TailwindCSS
- **Development Status**: Core Features Implemented

## 📖 Description

Lumiere Cinema is a modern cinema management system designed to streamline cinema operations. The system provides comprehensive functionality for managing movie schedules, ticket bookings, customer information, and cinema administration. Built with modern web technologies, it offers a responsive and intuitive user interface for both customers and cinema staff.

## ✨ Features

### Customer Features
- **Movie Browsing**: Browse current and upcoming movies with detailed information
- **Advanced Ticket Booking**: Enhanced seat selection with seat type information (Standard, VIP, Couple)
- **Smart Pricing**: Automatic special pricing for students (16-25) and elderly (60+) customers
- **Interactive Seat Map**: Visual seat selection with real-time availability and pricing
- **User Account**: Personal account management and booking history
- **Payment Integration**: Secure payment processing with promotion support

### Admin Features
- **Movie Management**: Add, edit, and remove movies from the system
- **Schedule Management**: Create and manage movie showtimes
- **Theater Management**: Configure cinema halls and seating arrangements with categories
- **Booking Management**: View and manage customer bookings with detailed analytics
- **Revenue Reports**: Generate financial reports and analytics
- **User Management**: Manage customer accounts and permissions
- **Cache Management**: Advanced caching system for optimal performance

### System Features
- **Enhanced Seat Management**: Comprehensive seat categorization and pricing
- **Real-time Seat Holding**: Temporary seat reservation system
- **Advanced Statistics**: Detailed occupancy rates and seat category breakdowns
- **Consolidated API**: Unified REST API structure for better maintainability
- **Redis Caching**: High-performance caching for seat maps and schedule data
- **Transaction Support**: Atomic operations for booking integrity
- **Special Pricing Engine**: Automated discounts for eligible customer categories

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB 
- Redis Server
- npm or yarn

### Installation & Running
```bash
# Clone the repository
git clone [repository-url]

# Backend setup
cd src/back-end
npm install
npm run dev

# Frontend setup (in new terminal)
cd src/front-end
npm install
npm run dev
```

### Testing Enhancements
```bash
# Test seat enhancement features
cd src/back-end
node test-seat-enhancements.js
```

## 📈 Recent Updates (July 2025)

### ✅ Seat Enhancement & Route Consolidation
- **Enhanced Seat Maps**: Added seat type information (Standard, VIP, Couple) with pricing details
- **Smart Pricing Logic**: Automatic special pricing for students (16-25) and elderly (60+) customers  
- **Route Consolidation**: Unified API structure under `/api/tickets/*` with proper authentication
- **Performance Optimization**: Redis caching for seat layouts and schedule data
- **Critical Bug Fixes**: Fixed seat reservation cache invalidation and promotion discount logic

See `SEAT_ENHANCEMENT_IMPLEMENTATION.md` and `CRITICAL_CACHE_FIXES_SUMMARY.md` for detailed implementation notes.

## 🎮 API Documentation

### Enhanced Seat Map API
```
GET /api/tickets/screen/:scheduleId
```
Returns comprehensive seat information including:
- Seat categories and pricing (regular + special rates)
- Real-time availability status
- Enhanced statistics with category breakdown
- Hidden seat handling

### Consolidated Ticket Routes
```
POST /api/tickets/create              # Unified ticket creation
GET  /api/tickets/movie/*             # Movie ticket operations
GET  /api/tickets/snack/*             # Snack ticket operations  
POST /api/tickets/hold                # Seat holding system
GET  /api/tickets/cache/stats         # Cache performance (admin)
```


### Running the Development Environment


## 🎮 Usage

*Usage instructions will be provided once the core features are implemented.*

## 🔧 Technology Stack


## 👥 Team Members

- **Vuong Ngu Tin Thanh** ([@xing215](https://github.com/xing215))
- **Phan Nhut Anh** ([@andreeNewbie](https://github.com/andreeNewbie))
- **Ta Thien Lam** ([@gugOfBoat](https://github.com/gugOfBoat))
- **Nguyen Thien Nha Tran** ([@heyyouknowme](https://github.com/heyyouknowme))
- **Ngo Hong Thanh** ([@hnaht277](https://github.com/hnaht277))

## 📞 Support

For project-related questions or issues, please refer to the project documentation in the `docs/` folder.
Reach our team via email at lumiere.cinema@clc.fitus.edu.vn.

---

*This project is being developed as part of the 6th semester "Introduction to Software Engineering" course at Vietnam National University Ho Chi Minh City - University of Science (VNU-HCMUS).*
