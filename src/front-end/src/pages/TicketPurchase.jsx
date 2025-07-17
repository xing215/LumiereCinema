// src/pages/TicketPurchase.jsx
import React, { useState } from 'react';
import Header from '../layouts/LandingPage/Header.jsx';
import { Title } from '../components/UI/label.jsx';
import MenuSelectScreen from '../layouts/TicketPurchase/MenuSelectScreen.jsx';
import MenuSelectSeats from '../layouts/TicketPurchase/MenuSelectSeats.jsx';
import MenuSelectSnack from '../layouts/TicketPurchase/MenuSelectSnack.jsx';
import MenuInfo from '../layouts/TicketPurchase/MenuInfo.jsx';
import MenuPayment from '../layouts/TicketPurchase/MenuPayment.jsx';
import Footer from '../layouts/LandingPage/Footer.jsx';


//PLEASE READ
// NEED INFO FOR SCHEDULES

/* 
 * TICKET DATA STRUCTURE REFERENCE:
 * 
 * Movie Ticket JSON for API:
 * {
 *   "customer": "ObjectId" | null,
 *   "noLoginCustomerInfo": { "name": "", "phone": "", "email": "" },
 *   "branch": "ObjectId",
 *   "schedule": "ObjectId", 
 *   "seats": ["A1", "A2"],
 *   "promotion": "ObjectId" | null,
 *   "seller": "ObjectId" | null
 * }
 * 
 * Snack Ticket JSON for API:
 * {
 *   "customer": "ObjectId" | null,
 *   "noLoginCustomerInfo": { "name": "", "phone": "", "email": "" },
 *   "branch": "ObjectId",
 *   "snackList": [{ "snack": "ObjectId", "quantity": number }],
 *   "promotionCode": "string",
 *   "seller": "ObjectId" | null
 * }
 */

const MENU_STEPS = {
    SCREEN: 0,
    SEATS: 1,
    SNACK: 2,
    INFO: 3,
    PAYMENT: 4,
};

const TicketPurchase = () => {
    const [currentStep, setCurrentStep] = useState(MENU_STEPS.SCREEN);

    // Mock schedule data - matches backend Schedule model structure (sorted by earliest time)
    // Includes schedules for multiple dates
    const mockSchedules = [
        // July 14, 2025 (Monday)
        { 
            _id: '66b8a1c4f2e8d5a1b3c4d5e1',
            movie: '66b8a1c4f2e8d5a1b3c4d5e7',
            screen: '66b8a1c4f2e8d5a1b3c4d5e8',
            startTime: '2025-07-14T08:00:00.000',
            endTime: '2025-07-14T10:30:00.000',
            OccupiedSeat: [],
            movieData: { title: 'Tham Tu Kien', duration: 150 },
            screenData: { name: 'Screen 1', totalSeats: 80 },
            availableSeats: 80
        },
        { 
            _id: '66b8a1c4f2e8d5a1b3c4d5e2',
            movie: '66b8a1c4f2e8d5a1b3c4d5e7',
            screen: '66b8a1c4f2e8d5a1b3c4d5ec',
            startTime: '2025-07-14T14:00:00.000',
            endTime: '2025-07-14T16:30:00.000',
            OccupiedSeat: [{ seatNumber: 'A1', ticket: '66b8a1c4f2e8d5a1b3c4d5e9' }],
            movieData: { title: 'Tham Tu Kien', duration: 150 },
            screenData: { name: 'Screen 2', totalSeats: 68 },
            availableSeats: 67
        },
        
        // July 15, 2025 (Tuesday)
        { 
            _id: '66b8a1c4f2e8d5a1b3c4d5e3',
            movie: '66b8a1c4f2e8d5a1b3c4d5e7',
            screen: '66b8a1c4f2e8d5a1b3c4d5e8',
            startTime: '2025-07-15T09:00:00.000',
            endTime: '2025-07-15T11:30:00.000',
            OccupiedSeat: [
                { seatNumber: 'B1', ticket: '66b8a1c4f2e8d5a1b3c4d5ea' },
                { seatNumber: 'B2', ticket: '66b8a1c4f2e8d5a1b3c4d5eb' }
            ],
            movieData: { title: 'Tham Tu Kien', duration: 150 },
            screenData: { name: 'Screen 1', totalSeats: 80 },
            availableSeats: 78
        },
        { 
            _id: '66b8a1c4f2e8d5a1b3c4d5e4',
            movie: '66b8a1c4f2e8d5a1b3c4d5e7',
            screen: '66b8a1c4f2e8d5a1b3c4d5f2',
            startTime: '2025-07-15T18:00:00.000',
            endTime: '2025-07-15T20:30:00.000',
            OccupiedSeat: [],
            movieData: { title: 'Tham Tu Kien', duration: 150 },
            screenData: { name: 'Screen 3', totalSeats: 48 },
            availableSeats: 48
        },

        // July 16, 2025 (Wednesday) - Original schedules
        { 
            _id: '66b8a1c4f2e8d5a1b3c4d5e6',
            movie: '66b8a1c4f2e8d5a1b3c4d5e7',
            screen: '66b8a1c4f2e8d5a1b3c4d5e8',
            startTime: '2025-07-16T07:00:00.000',
            endTime: '2025-07-16T09:30:00.000',
            OccupiedSeat: [
                { seatNumber: 'A1', ticket: '66b8a1c4f2e8d5a1b3c4d5e9' },
                { seatNumber: 'A2', ticket: '66b8a1c4f2e8d5a1b3c4d5ea' }
            ],
            movieData: { title: 'Tham Tu Kien', duration: 150 },
            screenData: { name: 'Screen 1', totalSeats: 80 },
            availableSeats: 78
        },
        { 
            _id: '66b8a1c4f2e8d5a1b3c4d5eb',
            movie: '66b8a1c4f2e8d5a1b3c4d5e7',
            screen: '66b8a1c4f2e8d5a1b3c4d5ec',
            startTime: '2025-07-16T10:30:00.000',
            endTime: '2025-07-16T13:00:00.000',
            OccupiedSeat: [
                { seatNumber: 'B5', ticket: '66b8a1c4f2e8d5a1b3c4d5ed' },
                { seatNumber: 'B6', ticket: '66b8a1c4f2e8d5a1b3c4d5ee' },
                { seatNumber: 'C1', ticket: '66b8a1c4f2e8d5a1b3c4d5ef' }
            ],
            movieData: { title: 'Tham Tu Kien', duration: 150 },
            screenData: { name: 'Screen 2', totalSeats: 68 },
            availableSeats: 65
        },
        { 
            _id: '66b8a1c4f2e8d5a1b3c4d5f0',
            movie: '66b8a1c4f2e8d5a1b3c4d5e7',
            screen: '66b8a1c4f2e8d5a1b3c4d5e8',
            startTime: '2025-07-16T14:00:00.000',
            endTime: '2025-07-16T16:30:00.000',
            OccupiedSeat: [],
            movieData: { title: 'Tham Tu Kien', duration: 150 },
            screenData: { name: 'Screen 1', totalSeats: 82 },
            availableSeats: 82
        },
        { 
            _id: '66b8a1c4f2e8d5a1b3c4d5f1',
            movie: '66b8a1c4f2e8d5a1b3c4d5e7',
            screen: '66b8a1c4f2e8d5a1b3c4d5f2',
            startTime: '2025-07-16T17:30:00.000',
            endTime: '2025-07-16T20:00:00.000',
            OccupiedSeat: [
                { seatNumber: 'E1', ticket: '66b8a1c4f2e8d5a1b3c4d5f3' },
                { seatNumber: 'E2', ticket: '66b8a1c4f2e8d5a1b3c4d5f4' },
                { seatNumber: 'F1', ticket: '66b8a1c4f2e8d5a1b3c4d5f5' }
            ],
            movieData: { title: 'Tham Tu Kien', duration: 150 },
            screenData: { name: 'Screen 3', totalSeats: 48 },
            availableSeats: 45
        },
        { 
            _id: '66b8a1c4f2e8d5a1b3c4d5f6',
            movie: '66b8a1c4f2e8d5a1b3c4d5e7',
            screen: '66b8a1c4f2e8d5a1b3c4d5ec',
            startTime: '2025-07-16T20:00:00.000',
            endTime: '2025-07-16T22:30:00.000',
            OccupiedSeat: [
                { seatNumber: 'A5', ticket: '66b8a1c4f2e8d5a1b3c4d5f7' },
                { seatNumber: 'B3', ticket: '66b8a1c4f2e8d5a1b3c4d5f8' }
            ],
            movieData: { title: 'Tham Tu Kien', duration: 150 },
            screenData: { name: 'Screen 2', totalSeats: 25 },
            availableSeats: 23
        },
        { 
            _id: '66b8a1c4f2e8d5a1b3c4d5f9',
            movie: '66b8a1c4f2e8d5a1b3c4d5e7',
            screen: '66b8a1c4f2e8d5a1b3c4d5e8',
            startTime: '2025-07-16T22:30:00.000',
            endTime: '2025-07-17T01:00:00.000',
            OccupiedSeat: [],
            movieData: { title: 'Tham Tu Kien', duration: 150 },
            screenData: { name: 'Screen 1', totalSeats: 90 },
            availableSeats: 90
        },

        // July 17, 2025 (Thursday)
        { 
            _id: '66b8a1c4f2e8d5a1b3c4d5f10',
            movie: '66b8a1c4f2e8d5a1b3c4d5e7',
            screen: '66b8a1c4f2e8d5a1b3c4d5e8',
            startTime: '2025-07-17T11:00:00.000',
            endTime: '2025-07-17T13:30:00.000',
            OccupiedSeat: [{ seatNumber: 'C5', ticket: '66b8a1c4f2e8d5a1b3c4d5f11' }],
            movieData: { title: 'Tham Tu Kien', duration: 150 },
            screenData: { name: 'Screen 1', totalSeats: 80 },
            availableSeats: 79
        },
        { 
            _id: '66b8a1c4f2e8d5a1b3c4d5f12',
            movie: '66b8a1c4f2e8d5a1b3c4d5e7',
            screen: '66b8a1c4f2e8d5a1b3c4d5ec',
            startTime: '2025-07-17T19:30:00.000',
            endTime: '2025-07-17T22:00:00.000',
            OccupiedSeat: [],
            movieData: { title: 'Tham Tu Kien', duration: 150 },
            screenData: { name: 'Screen 2', totalSeats: 68 },
            availableSeats: 68
        },

        // July 18, 2025 (Friday)
        { 
            _id: '66b8a1c4f2e8d5a1b3c4d5f13',
            movie: '66b8a1c4f2e8d5a1b3c4d5e7',
            screen: '66b8a1c4f2e8d5a1b3c4d5e8',
            startTime: '2025-07-18T13:00:00.000',
            endTime: '2025-07-18T15:30:00.000',
            OccupiedSeat: [
                { seatNumber: 'D1', ticket: '66b8a1c4f2e8d5a1b3c4d5f14' },
                { seatNumber: 'D2', ticket: '66b8a1c4f2e8d5a1b3c4d5f15' },
                { seatNumber: 'D3', ticket: '66b8a1c4f2e8d5a1b3c4d5f16' }
            ],
            movieData: { title: 'Tham Tu Kien', duration: 150 },
            screenData: { name: 'Screen 1', totalSeats: 80 },
            availableSeats: 77
        },
        { 
            _id: '66b8a1c4f2e8d5a1b3c4d5f17',
            movie: '66b8a1c4f2e8d5a1b3c4d5e7',
            screen: '66b8a1c4f2e8d5a1b3c4d5f2',
            startTime: '2025-07-18T21:00:00.000',
            endTime: '2025-07-18T23:30:00.000',
            OccupiedSeat: [],
            movieData: { title: 'Tham Tu Kien', duration: 150 },
            screenData: { name: 'Screen 3', totalSeats: 48 },
            availableSeats: 48
        },

        // July 20, 2025 (Sunday) - Non-continuous date
        { 
            _id: '66b8a1c4f2e8d5a1b3c4d5f18',
            movie: '66b8a1c4f2e8d5a1b3c4d5e7',
            screen: '66b8a1c4f2e8d5a1b3c4d5e8',
            startTime: '2025-07-20T10:00:00.000',
            endTime: '2025-07-20T12:30:00.000',
            OccupiedSeat: [
                { seatNumber: 'A3', ticket: '66b8a1c4f2e8d5a1b3c4d5f19' },
                { seatNumber: 'A4', ticket: '66b8a1c4f2e8d5a1b3c4d5f20' }
            ],
            movieData: { title: 'Tham Tu Kien', duration: 150 },
            screenData: { name: 'Screen 1', totalSeats: 80 },
            availableSeats: 78
        },
        { 
            _id: '66b8a1c4f2e8d5a1b3c4d5f21',
            movie: '66b8a1c4f2e8d5a1b3c4d5e7',
            screen: '66b8a1c4f2e8d5a1b3c4d5ec',
            startTime: '2025-07-20T15:30:00.000',
            endTime: '2025-07-20T18:00:00.000',
            OccupiedSeat: [],
            movieData: { title: 'Tham Tu Kien', duration: 150 },
            screenData: { name: 'Screen 2', totalSeats: 68 },
            availableSeats: 68
        },
        { 
            _id: '66b8a1c4f2e8d5a1b3c4d5f22',
            movie: '66b8a1c4f2e8d5a1b3c4d5e7',
            screen: '66b8a1c4f2e8d5a1b3c4d5f2',
            startTime: '2025-07-20T19:00:00.000',
            endTime: '2025-07-20T21:30:00.000',
            OccupiedSeat: [
                { seatNumber: 'F5', ticket: '66b8a1c4f2e8d5a1b3c4d5f23' }
            ],
            movieData: { title: 'Tham Tu Kien', duration: 150 },
            screenData: { name: 'Screen 3', totalSeats: 48 },
            availableSeats: 47
        },

        // July 23, 2025 (Wednesday) - Another non-continuous date
        { 
            _id: '66b8a1c4f2e8d5a1b3c4d5f24',
            movie: '66b8a1c4f2e8d5a1b3c4d5e7',
            screen: '66b8a1c4f2e8d5a1b3c4d5e8',
            startTime: '2025-07-23T09:30:00.000',
            endTime: '2025-07-23T12:00:00.000',
            OccupiedSeat: [
                { seatNumber: 'B7', ticket: '66b8a1c4f2e8d5a1b3c4d5f25' },
                { seatNumber: 'B8', ticket: '66b8a1c4f2e8d5a1b3c4d5f26' },
                { seatNumber: 'C7', ticket: '66b8a1c4f2e8d5a1b3c4d5f27' }
            ],
            movieData: { title: 'Tham Tu Kien', duration: 150 },
            screenData: { name: 'Screen 1', totalSeats: 80 },
            availableSeats: 77
        },
        { 
            _id: '66b8a1c4f2e8d5a1b3c4d5f28',
            movie: '66b8a1c4f2e8d5a1b3c4d5e7',
            screen: '66b8a1c4f2e8d5a1b3c4d5ec',
            startTime: '2025-07-23T16:15:00.000',
            endTime: '2025-07-23T18:45:00.000',
            OccupiedSeat: [],
            movieData: { title: 'Tham Tu Kien', duration: 150 },
            screenData: { name: 'Screen 2', totalSeats: 68 },
            availableSeats: 68
        },
        { 
            _id: '66b8a1c4f2e8d5a1b3c4d5f29',
            movie: '66b8a1c4f2e8d5a1b3c4d5e7',
            screen: '66b8a1c4f2e8d5a1b3c4d5f2',
            startTime: '2025-07-23T20:45:00.000',
            endTime: '2025-07-23T23:15:00.000',
            OccupiedSeat: [
                { seatNumber: 'E7', ticket: '66b8a1c4f2e8d5a1b3c4d5f30' },
                { seatNumber: 'E8', ticket: '66b8a1c4f2e8d5a1b3c4d5f31' }
            ],
            movieData: { title: 'Tham Tu Kien', duration: 150 },
            screenData: { name: 'Screen 3', totalSeats: 48 },
            availableSeats: 46
        }
    ].sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

    // Cinema branches data - matches backend Branch model structure
    const cinemas = [
        {
            _id: '66b8a1c4f2e8d5a1b3c4d5c1',
            name: "Lumiere Cao Thắng",
            address: "379-381 Cao Thắng St, Ward 12",
            city: "Ho Chi Minh City",
            imageURL: "https://example.com/images/caothang.jpg",
            location: {
                type: "Point",
                coordinates: [106.6917, 10.7769] // [longitude, latitude]
            },
            isActive: true,
            // Frontend display data
            distance: "2 km",
            showings: "7 showings today"
        },
        {
            _id: '66b8a1c4f2e8d5a1b3c4d5c2',
            name: "Lumiere Saigon Center",
            address: "65 Le Loi St, Ben Nghe Ward, District 1",
            city: "Ho Chi Minh City",
            imageURL: "https://example.com/images/saigoncenter.jpg",
            location: {
                type: "Point",
                coordinates: [106.7005, 10.7718]
            },
            isActive: true,
            distance: "3.5 km",
            showings: "6 showings today"
        },
        {
            _id: '66b8a1c4f2e8d5a1b3c4d5c3',
            name: "Lumiere Landmark 81",
            address: "720A Điện Biên Phủ St, Vinhomes Central Park",
            city: "Ho Chi Minh City",
            imageURL: "https://example.com/images/landmark81.jpg",
            location: {
                type: "Point",
                coordinates: [106.7123, 10.7955]
            },
            isActive: true,
            distance: "5 km",
            showings: "8 showings today"
        },
        {
            _id: '66b8a1c4f2e8d5a1b3c4d5c4',
            name: "Lumiere Bitexco",
            address: "2 Hai Trieu St, Ben Nghe Ward, District 1",
            city: "Ho Chi Minh City",
            imageURL: "https://example.com/images/bitexco.jpg",
            location: {
                type: "Point",
                coordinates: [106.7036, 10.7718]
            },
            isActive: true,
            distance: "4 km",
            showings: "5 showings today"
        },
        {
            _id: '66b8a1c4f2e8d5a1b3c4d5c5',
            name: "Lumiere Vincom Center",
            address: "72 Le Thanh Ton St, Ben Nghe Ward, District 1",
            city: "Ho Chi Minh City",
            imageURL: "https://example.com/images/vincomcenter.jpg",
            location: {
                type: "Point",
                coordinates: [106.7005, 10.7741]
            },
            isActive: true,
            distance: "6 km",
            showings: "7 showings today"
        },
        {
            _id: '66b8a1c4f2e8d5a1b3c4d5c6',
            name: "Lumiere Diamond Plaza",
            address: "34 Le Duan St, Ben Nghe Ward, District 1",
            city: "Ho Chi Minh City",
            imageURL: "https://example.com/images/diamondplaza.jpg",
            location: {
                type: "Point",
                coordinates: [106.7017, 10.7756]
            },
            isActive: true,
            distance: "7 km",
            showings: "6 showings today"
        },
        {
            _id: '66b8a1c4f2e8d5a1b3c4d5c7',
            name: "Lumiere Parkson Hùng Vương",
            address: "126 Hùng Vương St, Ward 12, District 5",
            city: "Ho Chi Minh City",
            imageURL: "https://example.com/images/parksonhungvuong.jpg",
            location: {
                type: "Point",
                coordinates: [106.6783, 10.7571]
            },
            isActive: true,
            distance: "8 km",
            showings: "5 showings today"
        }
    ];

    // Movie Ticket Data
    const [movieTicketData, setMovieTicketData] = useState({
        customer: null, // Will be set if user is logged in
        noLoginCustomerInfo: {
            name: '',
            phone: '',
            email: ''
        },
        branch: null,
        schedule: null,
        seats: [],
        promotion: null,
        seller: null, // Will be set if purchased at counter
        total: 0
    });

    // Snack Ticket Data
    const [snackTicketData, setSnackTicketData] = useState({
        customer: null, // Will be set if user is logged in
        noLoginCustomerInfo: {
            name: '',
            phone: '',
            email: ''
        },
        branch: null,
        snackList: [], // Array of {snack: id, quantity: number}
        promotionCode: '',
        seller: null, // Will be set if purchased at counter
        total: 0
    });

    // Utility functions to update ticket data
    const updateMovieTicket = (updates) => {
        setMovieTicketData(prev => ({ ...prev, ...updates }));
        console.log('Updated Movie Ticket Data:', { ...movieTicketData, ...updates });
    };

    const updateSnackTicket = (updates) => {
        setSnackTicketData(prev => ({ ...prev, ...updates }));
        console.log('Updated Snack Ticket Data:', { ...snackTicketData, ...updates });  
    };

    const goToNextStep = () => {
        if (currentStep < MENU_STEPS.PAYMENT) {
            setCurrentStep(currentStep + 1);
        }
    };

    const goToPreviousStep = () => {
        if (currentStep > MENU_STEPS.SCREEN) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handlePaymentComplete = async () => {
        try {
            // Handle payment completion logic here
            console.log('Processing payment...');
            console.log('Movie Ticket Data:', movieTicketData);
            console.log('Snack Ticket Data:', snackTicketData);
            
            // TODO: Send ticket data to backend API
            // Example API calls:
            // if (movieTicketData.schedule && movieTicketData.seats.length > 0) {
            //     await createMovieTicket(movieTicketData);
            // }
            // if (snackTicketData.snackList.length > 0) {
            //     await createSnackTicket(snackTicketData);
            // }
            
            console.log('Payment completed!');
        } catch (error) {
            console.error('Payment failed:', error);
        }
    };

    const renderCurrentMenu = () => {
        switch (currentStep) {
            case MENU_STEPS.SCREEN:
                return (
                    <MenuSelectScreen 
                        onNext={goToNextStep} 
                        onBack={goToPreviousStep}
                        movieTicketData={movieTicketData}
                        updateMovieTicket={updateMovieTicket}
                        updateSnackTicket={updateSnackTicket}
                        mockSchedules={mockSchedules}
                        cinemas={cinemas}
                    />
                );
            case MENU_STEPS.SEATS:
                return (
                    <MenuSelectSeats 
                        onNext={goToNextStep} 
                        onBack={goToPreviousStep}
                        movieTicketData={movieTicketData}
                        updateMovieTicket={updateMovieTicket}
                        mockSchedules={mockSchedules}
                    />
                );
            case MENU_STEPS.SNACK:
                return (
                    <MenuSelectSnack 
                        onNext={goToNextStep} 
                        onBack={goToPreviousStep}
                        snackTicketData={snackTicketData}
                        updateSnackTicket={updateSnackTicket}
                    />
                );
            case MENU_STEPS.INFO:
                return (
                    <MenuInfo 
                        onNext={goToNextStep} 
                        onBack={goToPreviousStep}
                        movieTicketData={movieTicketData}
                        snackTicketData={snackTicketData}
                        updateMovieTicket={updateMovieTicket}
                        updateSnackTicket={updateSnackTicket}
                        mockSchedules={mockSchedules}
                    />
                );
            case MENU_STEPS.PAYMENT:
                return (
                    <MenuPayment 
                        onNext={handlePaymentComplete} 
                        onBack={goToPreviousStep}
                        movieTicketData={movieTicketData}
                        snackTicketData={snackTicketData}
                        mockSchedules={mockSchedules}
                    />
                );
            default:
                return (
                    <MenuSelectScreen 
                        onNext={goToNextStep} 
                        onBack={goToPreviousStep}
                        movieTicketData={movieTicketData}
                        updateMovieTicket={updateMovieTicket}
                        updateSnackTicket={updateSnackTicket}
                        mockSchedules={mockSchedules}
                        cinemas={cinemas}
                    />
                );
        }
    };

    return (
        <div className="no-scrollbar relative min-h-screen w-screen overflow-x-hidden bg-slate-950">
            <Header />
            <Title text="BUY TICKET" />
            {renderCurrentMenu()}
            <div className="h-10 w-screen lg:h-20" />
            <Footer />
        </div>
    );
};

export default TicketPurchase;
