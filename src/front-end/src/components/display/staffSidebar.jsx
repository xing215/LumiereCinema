import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Menu, Film } from 'lucide-react';
import { useUser } from '../../contexts/UserContext.jsx';
import sidebarConfig, { hasRole, filterMenuItems, getUserRoleInfo, getUserPermissions, hasPermission } from '../../config/adminSidebar.config.js';

const StaffSidebar = ({
    isCollapsed = false,
    onToggle = () => {},
    theme = 'dark',
    onItemClick = () => {},
    userRoles = ['none'], // Default to all roles
    currentUser = null,
    showQuickActions = true,
    onMobileToggle = () => {},
}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useUser();
    const [expandedItems, setExpandedItems] = useState({});
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [filteredMainItems, setFilteredMainItems] = useState([]);
    const [filteredBottomItems, setFilteredBottomItems] = useState([]);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const currentTheme = sidebarConfig.themes[theme] || sidebarConfig.themes.dark;
    const userRoleInfo = getUserRoleInfo(userRoles);

    // Helper function to get last 2 words of a name
    const getShortName = (fullName) => {
        if (!fullName) return '';
        const words = fullName.trim().split(/\s+/);
        if (words.length <= 2) return fullName;
        return words.slice(-2).join(' ');
    };

    // Filter menu items based on user roles and permissions
    useEffect(() => {
        // Main items are filtered by permissions
        const filteredMain = filterMenuItems(sidebarConfig.mainItems, userRoles, true);
        // Bottom items are filtered by roles (for backward compatibility)
        const filteredBottom = filterMenuItems(sidebarConfig.bottomItems, userRoles, false);

        setFilteredMainItems(filteredMain);
        setFilteredBottomItems(filteredBottom);
    }, [userRoles]);

    // Handle transition state
    useEffect(() => {
        if (isTransitioning) {
            const timer = setTimeout(() => {
                setIsTransitioning(false);
            }, 300); // Match transition duration
            return () => clearTimeout(timer);
        }
    }, [isTransitioning]);

    // Custom toggle handler with transition state
    const handleToggle = () => {
        setIsTransitioning(true);
        onToggle();
    };

    const handleItemClick = (item) => {
        // Handle logout action
        if (item.action === 'logout') {
            // Add logout logic here
            if (window.confirm('Are you sure you want to logout?')) {
                // Use the UserContext logout function
                logout();
                // Redirect to root path
                navigate('/');
            }
            return;
        }

        // Handle navigation
        if (item.path) {
            navigate(item.path);
        }

        // Handle sub-items expansion
        if (item.subItems && item.subItems.length > 0) {
            setExpandedItems((prev) => ({
                ...prev,
                [item.id]: !prev[item.id],
            }));
        }

        // Close mobile menu after navigation
        setIsMobileOpen(false);
        onMobileToggle(false);

        // Call parent callback
        onItemClick(item);
    };

    const isActive = (path) => {
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    const SidebarItem = ({ item, level = 0 }) => {
        const Icon = item.icon;
        const hasSubItems = item.subItems && item.subItems.length > 0;
        const isExpanded = expandedItems[item.id];
        const itemIsActive = isActive(item.path);
        const hasBadge = item.badge && sidebarConfig.settings.showBadges;

        return (
            <div className="w-full">
                <button
                    onClick={() => handleItemClick(item)}
                    className={`flex w-full items-center gap-3 rounded-lg px-4 py-2 transition-all duration-200 ${currentTheme.hover} ${itemIsActive ? currentTheme.active : ''} ${level > 0 ? 'ml-4' : ''} `}
                    title={isCollapsed ? item.label : item.description}
                >
                    {Icon && <Icon size={18} className="flex-shrink-0" />}

                    {(!isCollapsed || isMobileOpen) && (
                        <div className={`flex min-w-0 flex-1 items-center gap-3 ${isTransitioning ? 'sidebar-content-hide' : 'sidebar-content-show'}`}>
                            <span className={`flex-1 truncate text-left ${currentTheme.text}`}>{item.label}</span>

                            {/* Badge */}
                            {hasBadge && <span className="flex-shrink-0 rounded-full bg-red-500 px-2 py-1 text-xs text-white">{item.badge}</span>}

                            {/* Chevron for sub-items */}
                            {hasSubItems && <ChevronRight size={16} className={`sidebar-icon-transition flex-shrink-0 ${isExpanded ? 'rotate-90' : ''}`} />}
                        </div>
                    )}
                </button>

                {/* Sub-items */}
                {hasSubItems && isExpanded && (!isCollapsed || isMobileOpen) && (
                    <div className="mt-1 ml-4 space-y-1">
                        {item.subItems.map((subItem) => (
                            <button
                                key={subItem.id}
                                onClick={() => navigate(subItem.path)}
                                className={`flex w-full items-center gap-3 rounded-lg px-4 py-2 transition-all duration-200 ${currentTheme.hover} ${isActive(subItem.path) ? currentTheme.active : ''} ${currentTheme.textSecondary} `}
                            >
                                <div className="flex h-5 w-5 items-center justify-center">
                                    <div className="h-2 w-2 rounded-full bg-current opacity-50" />
                                </div>
                                <span className="text-sm">{subItem.label}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <>
            {/* Mobile overlay - transparent, for closing menu */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 z-40 lg:hidden"
                    onClick={() => {
                        setIsMobileOpen(false);
                        onMobileToggle(false);
                    }}
                />
            )}

            {/* Mobile toggle button */}
            <button
                onClick={() => {
                    setIsMobileOpen(true);
                    onMobileToggle(true);
                }}
                className={`fixed top-4 left-4 z-50 rounded-lg p-2 lg:hidden ${currentTheme.bg} ${currentTheme.text} ${currentTheme.border} border`}
            >
                <Menu size={20} />
            </button>

            {/* Sidebar */}
            <div
                className={`fixed top-0 left-0 z-50 h-full transition-all duration-300 ${currentTheme.bg} ${currentTheme.text} ${currentTheme.border} ${isCollapsed ? 'w-16 lg:w-16' : 'w-64'} ${isMobileOpen ? 'w-64 translate-x-0' : '-translate-x-full'} flex flex-col border-r lg:translate-x-0`}
            >
                {/* Header */}
                <div className={`border-b p-4 ${currentTheme.border}`}>
                    <div className="flex items-center justify-between">
                        {(!isCollapsed || isMobileOpen) && (
                            <div className={`flex items-center gap-2 ${isTransitioning ? 'sidebar-content-hide' : 'sidebar-content-show'}`}>
                                {typeof sidebarConfig.app.logo === 'string' ? (
                                    <img src={sidebarConfig.app.logo} alt="Logo" className="h-6 w-6 object-contain" />
                                ) : (
                                    <Film size={24} className={currentTheme.accent} />
                                )}
                                <div>
                                    <span className="text-lg font-bold whitespace-nowrap">{sidebarConfig.app.name}</span>
                                    {currentUser && (
                                        <div className={`text-xs whitespace-nowrap ${currentTheme.textSecondary}`}>
                                            {getShortName(currentUser.name)} ({userRoleInfo.info?.name})
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        {isCollapsed && !isMobileOpen && (
                            <button
                                onClick={handleToggle}
                                className={`rounded-lg p-1 ${currentTheme.hover} hidden lg:block ${isTransitioning ? 'sidebar-content-hide' : 'sidebar-content-show'}`}
                                title="Click to expand sidebar"
                            >
                                {typeof sidebarConfig.app.logo === 'string' ? (
                                    <img src={sidebarConfig.app.logo} alt="Logo" className="h-6 w-6 object-contain" />
                                ) : (
                                    <Film size={24} className={currentTheme.accent} />
                                )}
                            </button>
                        )}
                        {(!isCollapsed || isMobileOpen) && (
                            <button onClick={onToggle} className={`rounded-lg p-1 ${currentTheme.hover} hidden lg:block`} title="Collapse sidebar">
                                <ChevronLeft size={16} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Main navigation */}
                <div className="flex-1 overflow-y-auto py-2">
                    <nav className="space-y-1 px-2">
                        {filteredMainItems.map((item) => (
                            <SidebarItem key={item.id} item={item} />
                        ))}
                    </nav>
                </div>

                {/* Bottom navigation */}
                <div className={`border-t ${currentTheme.border} p-2`}>
                    <nav className="space-y-1">
                        {filteredBottomItems.map((item) => (
                            <SidebarItem key={item.id} item={item} />
                        ))}
                    </nav>
                </div>
            </div>
        </>
    );
};

export default StaffSidebar;
