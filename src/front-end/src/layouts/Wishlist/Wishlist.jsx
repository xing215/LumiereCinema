import SideBar from "@/layouts/UserProfile/SideBar";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CustomDropdown from "@/components/UI/CustomDropdown";
import { ROUTES, getBuyTicketPath, getMovieDetailsPath } from '@routes/routeConfig';
import { useGetWishlist, useRemoveFromWishlist } from "@/hooks/useUser";
import MovieCard from "@/components/UI/MovieCard";
import { AlignJustify, Grid3X3, Trash2 } from "lucide-react";
import TickButton from "@/components/buttons/Staff/TickButton";

const Wishlist = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Fetch wishlist data
    const { getWishlist, wishlist, loading, error } = useGetWishlist();
    const { removeFromWishlist } = useRemoveFromWishlist();

    // Thêm state cho pagination, view mode và filter
    const [currentPage, setCurrentPage] = useState(1);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' hoặc 'list'
    const [filterStatus, setFilterStatus] = useState('All'); // 'All', 'Now Showing', 'Up Coming'
    const itemsPerPage = viewMode === 'grid' ? 6 : 5; // Grid: 6 cards, List: 5 rows
    const [selectedMovies, setSelectedMovies] = useState([]); // Array of selected movie IDs
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);

    useEffect(() => {
        getWishlist();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setAccountPage(value);
        if (value === 'Information') {
           navigate(ROUTES.PROFILE);
        }
        else if (value === 'Wishlist') {
            navigate(ROUTES.WISHLIST);
        } else if (value === 'Watch history') {
            navigate(ROUTES.WATCH_HISTORY);
        } else if (value === 'Lunar points') {
            navigate(ROUTES.LUNAR_POINT);
        }
    };

    // Handle filter change
    const handleFilterChange = (e) => {
        setFilterStatus(e.target.value);
        setCurrentPage(1); // Reset to page 1 when filter changes
        setSelectedMovies([]); // Reset selected movies when filter changes
    };

    // Handle checkbox selection
    const handleMovieSelect = (movieId) => {
        setSelectedMovies(prev => {
            if (prev.includes(movieId)) {
                return prev.filter(id => id !== movieId);
            } else {
                return [...prev, movieId];
            }
        });
    };

    // Handle select all checkbox
    // const handleSelectAll = () => {
    //     if (selectedMovies.length === currentPageData.length) {
    //         // If all current page items are selected, deselect all
    //         setSelectedMovies([]);
    //     } else {
    //         // Select all current page items
    //         const currentPageIds = currentPageData.map(movie => movie._id);
    //         setSelectedMovies(currentPageIds);
    //     }
    // };

    // Handle delete selected movies
    const handleDeleteSelected = async () => {
        if (selectedMovies.length === 0) {
            setShowDeleteAlert(true);
            return;
        }

        const confirmDelete = window.confirm(`Are you sure you want to remove ${selectedMovies.length} movie(s) from your wishlist?`);
        if (!confirmDelete) return;

        try {
            // Remove movies one by one (you could batch this if backend supports it)
            for (const movieId of selectedMovies) {
                await removeFromWishlist(movieId);
            }
            
            // Refresh wishlist and clear selections
            await getWishlist();
            setSelectedMovies([]);
        } catch (error) {
            console.error('Error removing movies from wishlist:', error);
        }
    };

    // Handle close alert
    const handleCloseAlert = () => {
        setShowDeleteAlert(false);
    };

    const pathSegments = location.pathname.split('/').filter(Boolean);
    const [accountPage, setAccountPage] = useState('');
    const [lastSegment, setLastSegment] = useState('/' + pathSegments[pathSegments.length - 1]);
    
    useEffect(() => {
        const getLastSegment = '/' + pathSegments[pathSegments.length - 1];
        setLastSegment(getLastSegment);
    }, [pathSegments]);

    useEffect(() => {
        // Set the default account page based on the URL
        if (lastSegment === ROUTES.PROFILE) {
            setAccountPage('Information');
        } else if (lastSegment === ROUTES.WISHLIST) {
            setAccountPage('Wishlist');
        } else if (lastSegment === ROUTES.WATCH_HISTORY) {
            setAccountPage('Watch history');
        } else if (lastSegment === ROUTES.LUNAR_POINT) {
            setAccountPage('Lunar points');
        }
    }, [lastSegment]);

    // Filter logic - determine movie status based on release date
    const getMovieStatus = (movie) => {
        if (!movie.releaseDate) return 'Unknown';
        
        const now = new Date();
        const releaseDate = new Date(movie.releaseDate);
        
        if (releaseDate > now) {
            return 'Up Coming';
        } else {
            return 'Now Showing';
        }
    };

    // Filter wishlist based on selected filter
    const filteredWishlist = wishlist ? wishlist.filter(movie => {
        if (filterStatus === 'All') return true;
        
        const movieStatus = getMovieStatus(movie);
        return movieStatus === filterStatus;
    }) : [];

    // Tính toán pagination với filtered data
    const totalItems = filteredWishlist.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPageData = filteredWishlist.slice(startIndex, endIndex);

    // Hàm điều hướng trang
    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
            setSelectedMovies([]); // clear selected movies when changing page
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
            setSelectedMovies([]); // clear selected movies when changing page
        }
    };

    // Reset về trang 1 khi wishlist thay đổi hoặc viewMode thay đổi
    useEffect(() => {
        setCurrentPage(1);
        setSelectedMovies([]); // Reset selected movies when wishlist or view mode changes
    }, [wishlist, viewMode, filterStatus]);

    // Handle view mode toggle
    const toggleViewMode = () => {
        setViewMode(viewMode === 'grid' ? 'list' : 'grid');
        setSelectedMovies([]); // Reset selected movies when view mode changes
    };

    // Handle book ticket navigation
    const handleBookTicket = (movieId) => {
        navigate(getBuyTicketPath(movieId));
    };

    // Error handling
    if (error) {
        return (
            <div className="overflow-hidden relative flex w-screen items-center justify-center pt-3 md:pt-7">
                <div className="text-red-400 text-center">
                    <p className="text-lg font-semibold mb-2">Error</p>
                    <p className="text-sm">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="overflow-hidden relative flex w-screen items-center justify-center pt-3 md:pt-7">
            
            {/* Alert Popup */}
            {showDeleteAlert && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-zinc-800 rounded-lg p-6 max-w-sm w-[90%] mx-4">
                        <h3 className="text-white text-lg font-bold font-['Libre_Franklin'] mb-4">
                            No Selection
                        </h3>
                        <p className="text-white text-sm font-['Unbounded'] mb-6 opacity-75">
                            Please select at least one movie to delete from your wishlist.
                        </p>
                        <div className="flex justify-center">
                            <button
                                onClick={handleCloseAlert}
                                className="px-6 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-500 transition-colors duration-200"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="relative flex h-full w-full md:gap-3 flex-col md:flex-row justify-center items-center md:items-start md:justify-start rounded-xl md:min-h-[470px] md:w-screen lg:h-auto lg:w-[calc(75vw)]">
                
                {/* Mobile Dropdown */}
                <div className="block md:hidden w-[95%] h-auto pb-3">
                    <CustomDropdown 
                        name="discount"
                        placeholder=""
                        value={accountPage}
                        onChange={handleInputChange}
                        bgColor="indigo-700 backdrop-blur-[30px]"
                        inputBgColor="pink-400"
                        variant={'figma'}
                        hoverColor="purple-700"
                        borderColor=""
                        textColor="white"
                        dropdownTextColor="white"
                        height="h-10"
                        inputTextSize="text-md"
                        optionTextSize="text-sm"
                        openDirection='down'
                        textAlign="left"
                        options={[
                            { value: 'Information', label: 'Information' },
                            { value: 'Wishlist', label: 'Wishlist' },
                            { value: 'Watch history', label: 'Watch history' },
                            { value: 'Lunar points', label: 'Lunar points' },
                        ]}
                    />
                </div>

                {/* Desktop Sidebar */}
                <div className="hidden md:block w-[25%] h-auto">
                    <SideBar />
                </div>

                {/* Main Content */}
                <div className="relative w-full h-auto md:w-[72%]">
                    {/* Background Overlay */}
                    <div className="pointer-events-none absolute inset-0 z-0 rounded-xl bg-zinc-300/30 mix-blend-color-dodge lg:[transform:translate3d(0,0,0)]" />
                    
                    <div className="p-6 md:p-8 w-full mx-auto">
                        {/* Header */}
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-white text-2xl md:text-3xl font-bold font-['Libre_Franklin']">
                                Wishlist
                            </h1>
                            <div className="flex items-center gap-4">
                                {/* Filter Dropdown */}
                                <div className="w-40">
                                    <CustomDropdown 
                                        name="filterStatus"
                                        placeholder="Filter"
                                        value={filterStatus}
                                        onChange={handleFilterChange}
                                        bgColor="indigo-700 backdrop-blur-[30px]"
                                        inputBgColor="pink-400"
                                        variant={'figma'}
                                        hoverColor="indigo-500"
                                        borderColor=""
                                        textColor="white"
                                        dropdownTextColor="white"
                                        height="h-8"
                                        inputTextSize="text-xs"
                                        optionTextSize="text-xs"
                                        openDirection='down'
                                        textAlign="center"
                                        width="w-full"
                                        options={[
                                            { value: 'All', label: 'All' },
                                            { value: 'Now Showing', label: 'Now Showing' },
                                            { value: 'Up Coming', label: 'Up Coming' },
                                        ]}
                                    />
                                </div>
                                
                                {/* View Toggle Button */}
                                <button
                                    onClick={toggleViewMode}
                                    className="p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors duration-200"
                                    title={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
                                >
                                    {viewMode === 'grid' ? <AlignJustify size={16} /> : <Grid3X3 size={16} />}
                                </button>
                                
                                
                            </div>
                        </div>


                        {/* Loading State */}
                        {loading && (
                            <div className="text-white text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                                <p>Loading your wishlist...</p>
                            </div>
                        )}

                        {/* Empty Wishlist */}
                        {!loading && wishlist && wishlist.length === 0 && (
                            <div className="text-white text-center py-8">
                                <p className="text-lg font-semibold mb-2">Your wishlist is empty</p>
                                <p className="text-sm opacity-75">Start adding movies to your wishlist to see them here!</p>
                            </div>
                        )}

                        {/* No results after filtering */}
                        {!loading && wishlist && wishlist.length > 0 && filteredWishlist.length === 0 && (
                            <div className="text-white text-center py-8">
                                <p className="text-lg font-semibold mb-2">No movies found</p>
                                <p className="text-sm opacity-75">No movies match the selected filter: {filterStatus}</p>
                            </div>
                        )}

                        {/* Content based on view mode */}
                        {!loading && currentPageData.length > 0 && (
                            <>
                                {viewMode === 'grid' ? (
                                    /* Grid View */
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 md:gap-6 min-h-[400px]">
                                        {currentPageData.map((movie, index) => (
                                            <div key={movie._id || index} className="aspect-[300/470]">
                                                <MovieCard 
                                                    movie={movie} 
                                                    page="Wishlist"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    /* List View - Based on WatchHistory.jsx */
                                    <div className="w-full flex flex-col justify-start items-start gap-1">
                                        
                                        {/* Table Header - Desktop Grid */}
                                        <div className="hidden md:grid w-full grid-cols-[0px_1fr_60px_85px_75px_120px] gap-2 items-center">
                                            <div /> {/* Spacer */}

                                            <div className="text-white text-[10px] font-medium font-['Unbounded']">
                                                Movie
                                            </div>
                                            {/* Age Rating */}
                                            <div className="text-white text-[10px] font-medium font-['Unbounded'] text-center">
                                                Age
                                            </div>

                                            <div className="text-white text-[10px] font-medium font-['Unbounded'] text-center">
                                                Release Date
                                            </div>
                                            <div className="text-white text-[10px] font-medium font-['Unbounded'] text-center">
                                                Duration
                                            </div>
                                            <div /> {/* Button spacer */}
                                        </div>

                                        {/* Header Divider - Ẩn trên mobile */}
                                        <div className="hidden md:block self-stretch h-0.5 mix-blend-color-dodge bg-zinc-300/30" />

                                        {/* Table Rows - Desktop Grid */}
                                        <div className="hidden md:block w-full">
                                            {currentPageData.map((movie, index) => (
                                                <React.Fragment key={movie._id || index}>
                                                    <div className="w-full grid grid-cols-[0px_20px_1fr_60px_85px_75px_120px] gap-2 items-start py-2 min-h-[40px]">
                                                        <div /> {/* Spacer */}

                                                        {/* TickButton for selection 1 */}
                                                        <div className="flex justify-center items-center text-white">
                                                            <TickButton
                                                                check={selectedMovies.includes(movie._id)}
                                                                onTick={() => handleMovieSelect(movie._id)}
                                                            />
                                                        </div>
                                                        
                                                        {/* Movie Title */}
                                                        <div className="text-white text-[11px] font-['Unbounded'] leading-tight break-words pr-2">
                                                            <span 
                                                                className="font-bold cursor-pointer hover:text-purple-500 transition-colors duration-200"
                                                                onClick={() => navigate(getMovieDetailsPath(movie._id))}
                                                            >
                                                                {movie.title || 'Unknown Movie'}
                                                            </span>
                                                        </div>

                                                        {/* Age Rating */}
                                                        <div className="text-center text-white text-[11px] font-medium font-['Unbounded']">
                                                            {movie.ageRating || 'N/A'}
                                                        </div>
                                                        
                                                        {/* Release Date */}
                                                        <div className="text-center text-white text-[11px] font-medium font-['Unbounded'] leading-tight break-words px-1">
                                                            {movie.releaseDate ? (() => {
                                                                const d = new Date(movie.releaseDate);
                                                                return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
                                                            })() : 'N/A'}
                                                        </div>
                                                        
                                                        {/* Duration */}
                                                        <div className="text-center text-white text-[11px] font-medium font-['Unbounded'] leading-tight whitespace-nowrap">
                                                            {movie.duration ? `${movie.duration} min` : 'N/A'}
                                                        </div>
                                                        
                                                        {/* Buy Ticket Button */}
                                                        <div className="flex justify-center items-start pt-0">
                                                            <button
                                                                onClick={() => handleBookTicket(movie._id)}
                                                                className="w-24 h-5 bg-pink-400 rounded-xl shadow-[inset_0px_0px_50px_3px_rgba(155,47,255,1.00)] hover:bg-pink-500 transition-colors duration-200"
                                                            >
                                                                <div className="text-center text-white text-[10px] font-bold font-['Unbounded']">
                                                                    BUY TICKET
                                                                </div>
                                                            </button>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Row Divider */}
                                                    <div className="w-full h-0.5 mix-blend-color-dodge bg-zinc-300/30" />
                                                </React.Fragment>
                                            ))}
                                        </div>

                                        {/* Mobile Layout - Card Style */}
                                        {currentPageData.map((movie, index) => (
                                            <div key={`mobile-${movie._id || index}`} className="block md:hidden w-full bg-zinc-800/30 rounded-lg p-4 mb-3">
                                                <div className="flex flex-col gap-3">
                                                    {/* Movie Title & Checkbox */}
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1 pr-2">
                                                            <div className="text-white text-sm font-bold font-['Unbounded'] leading-tight mb-1">
                                                                <span 
                                                                    className="font-bold cursor-pointer hover:text-purple-500 transition-colors duration-200"
                                                                    onClick={() => navigate(getMovieDetailsPath(movie._id))}
                                                                >
                                                                    {movie.title || 'Unknown Movie'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        {/* TickButton for selection 2 */}
                                                        <div className="flex items-center gap-2 text-white">
                                                            <TickButton
                                                                check={selectedMovies.includes(movie._id)}
                                                                onTick={() => handleMovieSelect(movie._id)}
                                                            />
                                                        </div>
                                                    </div>
                                                    {/* Release Date & Duration */}
                                                    <div className="flex justify-between items-start gap-4">
                                                        {/* Age Rating */}
                                                        <div className="flex-1">
                                                            <div className="text-white/70 text-xs font-light font-['Unbounded'] mb-1">
                                                                Age
                                                            </div>
                                                            <div className="text-white text-xs font-medium font-['Unbounded']">
                                                                {movie.ageRating || 'N/A'}
                                                            </div>
                                                        </div>
                                                        {/* Release Date */}
                                                        <div className="flex-1">
                                                            <div className="text-white/70 text-xs font-light font-['Unbounded'] mb-1">
                                                                Release Date
                                                            </div>
                                                            <div className="text-white text-xs font-medium font-['Unbounded']">
                                                                {movie.releaseDate ? (() => {
                                                                    const d = new Date(movie.releaseDate);
                                                                    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
                                                                })() : 'N/A'}
                                                            </div>
                                                        </div>
                                                        {/* Duration */}
                                                        <div className="flex-1">
                                                            <div className="text-white/70 text-xs font-light font-['Unbounded'] mb-1">
                                                                Duration
                                                            </div>
                                                            <div className="text-white text-xs font-medium font-['Unbounded']">
                                                                {movie.duration ? `${movie.duration} min` : 'N/A'}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Buy Ticket Button */}
                                                    <div className="flex mt-2 items-start justify-start">
                                                        <button
                                                            onClick={() => handleBookTicket(movie._id)}
                                                            className="w-28 h-6 bg-pink-400 rounded-lg shadow-[inset_0px_0px_50px_3px_rgba(155,47,255,1.00)] hover:bg-pink-500 transition-colors duration-200"
                                                        >
                                                            <div className="text-center text-white text-[10px] font-bold font-['Unbounded']">
                                                                BUY TICKET
                                                            </div>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Empty State */}
                                        {currentPageData.length === 0 && !loading && (
                                            <div className="w-full text-center py-8">
                                                <p className="text-white text-sm font-['Unbounded'] opacity-60">
                                                    No movies in wishlist
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}

                        {/* Delete Button & Pagination Controls */}
                        {!loading && currentPageData.length > 0 && (
                            <div className="mt-8 space-y-4">
                                {/* Delete Button - Always visible in list view */}
                                {viewMode === 'list' && (
                                    <div className="flex justify-end">
                                        <button
                                            onClick={handleDeleteSelected}
                                            className="flex items-center gap-2 px-4 py-2 bg-pink-400 rounded-xl shadow-[inset_0px_0px_50px_3px_rgba(155,47,255,1.00)] text-white font-bold hover:bg-purple-700 transition-colors duration-200"
                                        >
                                            <Trash2 size={16} />
                                            <span className="text-[12px] font-['Unbounded'] tracking-wider">
                                                DELETE SELECTED
                                            </span>
                                        </button>
                                    </div>
                                )}

                                {/* Delete Button - Only show when movies are selected in list view */}
                                {/* {viewMode === 'list' && selectedMovies.length > 0 && (
                                    <div className="flex justify-end">
                                        <button
                                            onClick={handleDeleteSelected}
                                            className="flex items-center gap-2 px-4 py-2 bg-pink-400 rounded-xl shadow-[inset_0px_0px_50px_3px_rgba(155,47,255,1.00)] text-white font-bold hover:bg-purple-700 transition-colors duration-200"
                                        >
                                            <Trash2 size={16} />
                                            <span className="text-[12px] font-['Unbounded'] tracking-wider">
                                                DELETE SELECTED ({selectedMovies.length})
                                            </span>
                                        </button>
                                    </div>
                                )} */}

                                {/* Pagination Controls */}
                                {totalPages > 1 && (
                                    <div className="flex justify-between items-center pt-4">
                                        <button
                                            onClick={handlePrevPage}
                                            disabled={currentPage === 1}
                                            className={`px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium transition-colors duration-200 ${
                                                currentPage === 1 
                                                    ? 'opacity-50 cursor-not-allowed' 
                                                    : 'hover:bg-indigo-500'
                                            }`}
                                        >
                                            Previous
                                        </button>
                                        
                                        <div className="flex items-center gap-2">
                                            <span className="text-white text-sm font-medium">
                                                Page {currentPage} of {totalPages}
                                            </span>
                                        </div>
                                        
                                        <button
                                            onClick={handleNextPage}
                                            disabled={currentPage === totalPages}
                                            className={`px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium transition-colors duration-200 ${
                                                currentPage === totalPages 
                                                    ? 'opacity-50 cursor-not-allowed' 
                                                    : 'hover:bg-indigo-500'
                                            }`}
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Wishlist;