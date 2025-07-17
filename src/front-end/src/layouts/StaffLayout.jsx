/**
 * StaffLayout Component
 *
 * A wrapper component that provides a complete staff layout with sidebar navigation.
 * Handles all sidebar complexity internally and provides a clean API for staff pages.
 *
 * @example
 * // Import the component
 * import StaffLayout from '../../layouts/StaffLayout.jsx';
 *
 * // Usage as Wrapper Component
 * <StaffLayout>
 *   <div>Your staff page content here</div>
 * </StaffLayout>
 *
 * // Usage with custom background
 * <StaffLayout backgroundClass="bg-zinc-300/70"> (Light background like schedule management)
 *   <YourStaffPageContent />
 * </StaffLayout>
 */

import React, { useState, useEffect } from 'react';
import StaffSidebar from '../components/display/staffSidebar.jsx';
import { useUser } from '../contexts/UserContext.jsx';

const StaffLayout = ({ children, theme = 'dark', showQuickActions = true, onItemClick = (item) => console.log('Clicked:', item.label), className = '', backgroundClass = 'bg-slate-950' }) => {
    // Initialize sidebar state from localStorage or default to true (collapsed)
    const [isCollapsed, setIsCollapsed] = useState(() => {
        const savedState = localStorage.getItem('staffSidebarCollapsed');
        return savedState !== null ? JSON.parse(savedState) : true;
    });
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { userRoles, userName } = useUser();

    // Save sidebar state to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('staffSidebarCollapsed', JSON.stringify(isCollapsed));
    }, [isCollapsed]);

    return (
        <div className={`flex h-screen w-screen ${backgroundClass}`}>
            {/* Sidebar */}
            <StaffSidebar
                isCollapsed={isCollapsed}
                onToggle={() => setIsCollapsed(!isCollapsed)}
                theme={theme}
                userRoles={userRoles}
                currentUser={{
                    name: userName,
                    role: userRoles[0] || 'none',
                }}
                showQuickActions={showQuickActions}
                onItemClick={onItemClick}
                onMobileToggle={setIsMobileMenuOpen}
            />

            {/* Main Content */}
            <div
                className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-0 lg:ml-16' : 'ml-0 lg:ml-64'} relative overflow-hidden ${className} ${isMobileMenuOpen ? 'blur-sm lg:blur-none' : ''}`}
            >
                {children}
            </div>
        </div>
    );
};

export default StaffLayout;
