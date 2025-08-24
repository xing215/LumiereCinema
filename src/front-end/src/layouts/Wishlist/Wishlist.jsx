import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CustomDropdown from '@/components/UI/CustomDropdown';
import { ROUTES, getBuyTicketPath, getMovieDetailsPath } from '@routes/routeConfig';
import { useGetWishlist, useRemoveFromWishlist } from '@/hooks/useUser';
import MovieCard from '@/components/UI/MovieCard';
import { AlignJustify, Grid3X3, Trash2 } from 'lucide-react';
import TickButton from '@/components/buttons/Staff/TickButton';
import { showConfirmation, showDeletingItems, showItemsDeleted, showOperationError, showWarning, showSuccess } from '@/utils/sweetalert';

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

    useEffect(() => {
        getWishlist();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setAccountPage(value);
        if (value === 'Information') {
            navigate(ROUTES.PROFILE);
        } else if (value === 'Wishlist') {
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
        setSelectedMovies((prev) => {
            if (prev.includes(movieId)) {
                return prev.filter((id) => id !== movieId);
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
            await showWarning('No Selection', 'Please select at least one movie to remove from your wishlist.');
            return;
        }

        const movieCount = selectedMovies.length;
        const movieText = movieCount === 1 ? 'movie' : 'movies';

        const confirmation = await showConfirmation(
            `Remove ${movieText} from Wishlist?`,
            `Are you sure you want to remove ${movieCount} ${movieText} from your wishlist? This action cannot be undone!`,
            'Remove',
            'Cancel',
        );

        if (!confirmation.isConfirmed) return;

        try {
            // Show loading
            showDeletingItems('movies from wishlist', movieCount);

            // Remove movies one by one (you could batch this if backend supports it)
            for (const movieId of selectedMovies) {
                await removeFromWishlist(movieId);
            }

            // Show success with custom message
            const successTitle = movieCount === 1 ? 'Movie Removed!' : 'Movies Removed!';
            const successText = movieCount === 1 ? 'The movie has been successfully removed from your wishlist.' : `${movieCount} movies have been successfully removed from your wishlist.`;

            await showSuccess(successTitle, successText, 3000);

            // Refresh wishlist and clear selections
            await getWishlist();
            setSelectedMovies([]);
        } catch (error) {
            console.error('Error removing movies from wishlist:', error);
            await showOperationError('Remove from wishlist', error?.message || 'Failed to remove movies from wishlist. Please try again.');
        }
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
    const filteredWishlist = wishlist
        ? wishlist.filter((movie) => {
              if (filterStatus === 'All') return true;

              const movieStatus = getMovieStatus(movie);
              return movieStatus === filterStatus;
          })
        : [];

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
            <div className="relative flex w-screen items-center justify-center overflow-hidden pt-3 md:pt-7">
                <div className="text-center text-red-400">
                    <p className="mb-2 text-lg font-semibold">Error</p>
                    <p className="text-sm">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative flex w-full items-center justify-center overflow-hidden">
            <div className="relative flex h-full w-full flex-col items-center justify-center rounded-xl md:min-h-[470px] md:flex-row md:items-start md:justify-start md:gap-3 lg:h-auto">
                {/* Main Content */}
                <div className="relative h-auto w-full">
                    <div className="mx-auto w-full">
                        {/* Header */}
                        <div className="mb-6 flex items-center justify-between">
                            <h1 className="font-['Libre_Franklin'] text-2xl font-bold text-white md:text-3xl">Wishlist</h1>
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
                                        openDirection="down"
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
                                    className="rounded-lg bg-indigo-600 p-2 text-white transition-colors duration-200 hover:bg-indigo-500"
                                    title={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
                                >
                                    {viewMode === 'grid' ? <AlignJustify size={16} /> : <Grid3X3 size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Loading State */}
                        {loading && (
                            <div className="py-8 text-center text-white">
                                <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-b-2 border-white"></div>
                                <p>Loading your wishlist...</p>
                            </div>
                        )}

                        {/* Empty Wishlist */}
                        {!loading && wishlist && wishlist.length === 0 && (
                            <div className="py-8 text-center text-white">
                                <p className="mb-2 text-lg font-semibold">Your wishlist is empty</p>
                                <p className="text-sm opacity-75">Start adding movies to your wishlist to see them here!</p>
                            </div>
                        )}

                        {/* No results after filtering */}
                        {!loading && wishlist && wishlist.length > 0 && filteredWishlist.length === 0 && (
                            <div className="py-8 text-center text-white">
                                <p className="mb-2 text-lg font-semibold">No movies found</p>
                                <p className="text-sm opacity-75">No movies match the selected filter: {filterStatus}</p>
                            </div>
                        )}

                        {/* Content based on view mode */}
                        {!loading && currentPageData.length > 0 && (
                            <>
                                {viewMode === 'grid' ? (
                                    /* Grid View */
                                    <div className="grid min-h-[400px] grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-3">
                                        {currentPageData.map((movie, index) => (
                                            <div key={movie._id || index} className="-m-5 aspect-[300/470] w-[123%] scale-80 md:-my-15 lg:-my-10">
                                                <MovieCard movie={movie} page="Wishlist" />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    /* List View - Based on WatchHistory.jsx */
                                    <div className="flex w-full flex-col items-start justify-start gap-1">
                                        {/* Table Header - Desktop Grid */}
                                        <div className="hidden w-full grid-cols-[0px_1fr_60px_85px_75px_120px] items-center gap-2 md:grid">
                                            <div /> {/* Spacer */}
                                            <div className="font-['Unbounded'] text-[10px] font-medium text-white">Movie</div>
                                            {/* Age Rating */}
                                            <div className="text-center font-['Unbounded'] text-[10px] font-medium text-white">Age</div>
                                            <div className="text-center font-['Unbounded'] text-[10px] font-medium text-white">Release Date</div>
                                            <div className="text-center font-['Unbounded'] text-[10px] font-medium text-white">Duration</div>
                                            <div /> {/* Button spacer */}
                                        </div>

                                        {/* Header Divider - Ẩn trên mobile */}
                                        <div className="hidden h-0.5 self-stretch bg-zinc-300/30 mix-blend-color-dodge md:block" />

                                        {/* Table Rows - Desktop Grid */}
                                        <div className="hidden w-full md:block">
                                            {currentPageData.map((movie, index) => (
                                                <React.Fragment key={movie._id || index}>
                                                    <div className="grid min-h-[40px] w-full grid-cols-[0px_20px_1fr_60px_85px_75px_120px] items-start gap-2 py-2">
                                                        <div /> {/* Spacer */}
                                                        {/* TickButton for selection 1 */}
                                                        <div className="flex items-center justify-center text-white">
                                                            <TickButton check={selectedMovies.includes(movie._id)} onTick={() => handleMovieSelect(movie._id)} />
                                                        </div>
                                                        {/* Movie Title */}
                                                        <div className="pr-2 font-['Unbounded'] text-[11px] leading-tight break-words text-white">
                                                            <span
                                                                className="cursor-pointer font-bold transition-colors duration-200 hover:text-purple-500"
                                                                onClick={() => navigate(getMovieDetailsPath(movie._id))}
                                                            >
                                                                {movie.title || 'Unknown Movie'}
                                                            </span>
                                                        </div>
                                                        {/* Age Rating */}
                                                        <div className="text-center font-['Unbounded'] text-[11px] font-medium text-white">{movie.ageRating || 'N/A'}</div>
                                                        {/* Release Date */}
                                                        <div className="px-1 text-center font-['Unbounded'] text-[11px] leading-tight font-medium break-words text-white">
                                                            {movie.releaseDate
                                                                ? (() => {
                                                                      const d = new Date(movie.releaseDate);
                                                                      return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
                                                                  })()
                                                                : 'N/A'}
                                                        </div>
                                                        {/* Duration */}
                                                        <div className="text-center font-['Unbounded'] text-[11px] leading-tight font-medium whitespace-nowrap text-white">
                                                            {movie.duration ? `${movie.duration} min` : 'N/A'}
                                                        </div>
                                                        {/* Buy Ticket Button */}
                                                        <div className="flex items-start justify-center pt-0">
                                                            <button
                                                                onClick={() => handleBookTicket(movie._id)}
                                                                className="h-5 w-24 rounded-xl bg-pink-400 shadow-[inset_0px_0px_50px_3px_rgba(155,47,255,1.00)] transition-colors duration-200 hover:bg-pink-500"
                                                            >
                                                                <div className="text-center font-['Unbounded'] text-[10px] font-bold text-white">BUY TICKET</div>
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Row Divider */}
                                                    <div className="h-0.5 w-full bg-zinc-300/30 mix-blend-color-dodge" />
                                                </React.Fragment>
                                            ))}
                                        </div>

                                        {/* Mobile Layout - Card Style */}
                                        {currentPageData.map((movie, index) => (
                                            <div key={`mobile-${movie._id || index}`} className="mb-3 block w-full rounded-lg bg-zinc-800/30 p-4 md:hidden">
                                                <div className="flex flex-col gap-3">
                                                    {/* Movie Title & Checkbox */}
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1 pr-2">
                                                            <div className="mb-1 font-['Unbounded'] text-sm leading-tight font-bold text-white">
                                                                <span
                                                                    className="cursor-pointer font-bold transition-colors duration-200 hover:text-purple-500"
                                                                    onClick={() => navigate(getMovieDetailsPath(movie._id))}
                                                                >
                                                                    {movie.title || 'Unknown Movie'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        {/* TickButton for selection 2 */}
                                                        <div className="flex items-center gap-2 text-white">
                                                            <TickButton check={selectedMovies.includes(movie._id)} onTick={() => handleMovieSelect(movie._id)} />
                                                        </div>
                                                    </div>
                                                    {/* Release Date & Duration */}
                                                    <div className="flex items-start justify-between gap-4">
                                                        {/* Age Rating */}
                                                        <div className="flex-1">
                                                            <div className="mb-1 font-['Unbounded'] text-xs font-light text-white/70">Age</div>
                                                            <div className="font-['Unbounded'] text-xs font-medium text-white">{movie.ageRating || 'N/A'}</div>
                                                        </div>
                                                        {/* Release Date */}
                                                        <div className="flex-1">
                                                            <div className="mb-1 font-['Unbounded'] text-xs font-light text-white/70">Release Date</div>
                                                            <div className="font-['Unbounded'] text-xs font-medium text-white">
                                                                {movie.releaseDate
                                                                    ? (() => {
                                                                          const d = new Date(movie.releaseDate);
                                                                          return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
                                                                      })()
                                                                    : 'N/A'}
                                                            </div>
                                                        </div>
                                                        {/* Duration */}
                                                        <div className="flex-1">
                                                            <div className="mb-1 font-['Unbounded'] text-xs font-light text-white/70">Duration</div>
                                                            <div className="font-['Unbounded'] text-xs font-medium text-white">{movie.duration ? `${movie.duration} min` : 'N/A'}</div>
                                                        </div>
                                                    </div>

                                                    {/* Buy Ticket Button */}
                                                    <div className="mt-2 flex items-start justify-start">
                                                        <button
                                                            onClick={() => handleBookTicket(movie._id)}
                                                            className="h-6 w-28 rounded-lg bg-pink-400 shadow-[inset_0px_0px_50px_3px_rgba(155,47,255,1.00)] transition-colors duration-200 hover:bg-pink-500"
                                                        >
                                                            <div className="text-center font-['Unbounded'] text-[10px] font-bold text-white">BUY TICKET</div>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Empty State */}
                                        {currentPageData.length === 0 && !loading && (
                                            <div className="w-full py-8 text-center">
                                                <p className="font-['Unbounded'] text-sm text-white opacity-60">No movies in wishlist</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}

                        {/* Delete Button & Pagination Controls */}
                        {!loading && currentPageData.length > 0 && (
                            <div className="mt-8 space-y-4">
                                {/* Delete Button - Only visible in list view and if at least one movie is selected */}
                                {viewMode === 'list' && selectedMovies.length > 0 && (
                                    <div className="flex justify-end">
                                        <button
                                            onClick={handleDeleteSelected}
                                            className="flex items-center gap-2 rounded-xl bg-pink-400 px-4 py-2 font-bold text-white shadow-[inset_0px_0px_50px_3px_rgba(155,47,255,1.00)] transition-colors duration-200 hover:bg-purple-700"
                                        >
                                            <Trash2 size={16} />
                                            <span className="font-['Unbounded'] text-[12px] tracking-wider">REMOVE ALL</span>
                                        </button>
                                    </div>
                                )}

                                {/* Pagination Controls */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-between pt-4">
                                        <button
                                            onClick={handlePrevPage}
                                            disabled={currentPage === 1}
                                            className={`rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 ${
                                                currentPage === 1 ? 'cursor-not-allowed opacity-50' : 'hover:bg-indigo-500'
                                            }`}
                                        >
                                            Previous
                                        </button>

                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-white">
                                                Page {currentPage} of {totalPages}
                                            </span>
                                        </div>

                                        <button
                                            onClick={handleNextPage}
                                            disabled={currentPage === totalPages}
                                            className={`rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 ${
                                                currentPage === totalPages ? 'cursor-not-allowed opacity-50' : 'hover:bg-indigo-500'
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
