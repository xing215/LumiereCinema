import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import ChatbotIcon from '@assets/img/Chatbot-Icon.svg';
import { useMovieAutocomplete, useSearchHistory } from '@hooks/useMovieSearch';
import { getMovieDetailsPath } from '@routes/routeConfig';
import SearchMovieCard from '@components/UI/SearchMovieCard';

const Icon = () => {
    return (
        <div className="absolute top-1/2 right-1.5 -translate-y-1/2 sm:right-2 md:right-3 lg:right-5 xl:right-10">
            <img src={ChatbotIcon} alt="Chatbot" className="h-5 w-5 sm:h-5 sm:w-5 md:h-7 md:w-7 lg:h-8 lg:w-8 xl:h-12 xl:w-12" />
        </div>
    );
};

const SearchSuggestions = ({ suggestions, onSelect, show, loading, inputRect }) => {
    if (!show || !inputRect) return null;

    const dropdownStyle = {
        position: 'fixed',
        top: inputRect.bottom + 8,
        left: inputRect.left,
        width: inputRect.width,
        maxHeight: '300px',
        minHeight: '150px',
        zIndex: 999999,
        backgroundColor: '#d1d5db',
        borderRadius: '12px',
        border: '1px solid #d1d5db',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'auto'
    };

    return createPortal(
        <div 
            data-search-dropdown="true"
            style={dropdownStyle}
        >
            {loading ? (
                <div className="px-4 py-6 text-center text-gray-500">
                    <div className="animate-pulse">
                        <div className="text-sm text-gray-400">Searching movies...</div>
                        <div className="mt-4 flex items-center space-x-4">
                            <div className="h-16 w-12 rounded bg-gray-200"></div>
                            <div className="flex-1">
                                <div className="mb-2 h-4 rounded bg-gray-200"></div>
                                <div className="h-3 w-3/4 rounded bg-gray-200"></div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : suggestions && suggestions.length === 0 ? (
                <div className="px-4 py-6 text-center text-gray-500">
                    <div className="mb-2 text-4xl">🎬</div>
                    <p className="text-sm">No movies found</p>
                </div>            ) : suggestions && suggestions.length > 0 ? (
                <>
                    {suggestions.map((movie, index) => (
                        <SearchMovieCard key={movie._id || index} movie={movie} onClick={onSelect} />
                    ))}
                </>
            ) : null}
        </div>,
        document.body
    );
};

const AiSearch = ({ placeholder = 'Search movies, actors, directors...' }) => {
    const [query, setQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isInputVisible, setIsInputVisible] = useState(false);
    const [inputRect, setInputRect] = useState(null);
    const containerRef = useRef(null);
    const inputRef = useRef(null);
    const navigate = useNavigate();

    // Custom hooks
    const { suggestions, getSuggestions, clearSuggestions, loading } = useMovieAutocomplete({
        minLength: 2,
        debounceDelay: 300,
        maxSuggestions: 6,
    });

    const { history, addToHistory } = useSearchHistory(10);

    // Update input position for dropdown
    const updatePosition = () => {
        if (inputRef.current) {
            const rect = inputRef.current.getBoundingClientRect();
            setInputRect(rect);
        }
    };// Handle button click to show input
    const handleButtonClick = () => {
        setIsInputVisible(true);
        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.focus();
            }
        }, 100);
    };    // Handle input changes
    const handleInputChange = (e) => {
        const value = e.target.value;
        setQuery(value);

        if (value.trim().length >= 2) {
            getSuggestions(value);
            setShowSuggestions(true);
            setTimeout(updatePosition, 10);
        } else {
            clearSuggestions();
            setShowSuggestions(false);
        }
    };    // Handle suggestion selection
    const handleSuggestionSelect = (movie) => {
        // Add to history
        addToHistory(movie.title);

        // Reset states - SearchMovieCard will handle navigation
        setQuery('');
        setShowSuggestions(false);
        setIsInputVisible(false);
        setIsFocused(false);
        clearSuggestions();
    };    // Handle focus
    const handleFocus = () => {
        setIsFocused(true);
        if (query.trim().length >= 2) {
            setShowSuggestions(true);
            setTimeout(updatePosition, 10);
        }
    };

    // Handle blur with delay
    const handleBlur = (e) => {
        setTimeout(() => {
            setIsFocused(false);
            if (!query.trim()) {
                setShowSuggestions(false);
            }
        }, 300);
    };// Handle key events
    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            setQuery('');
            setShowSuggestions(false);
            setIsInputVisible(false);
            setIsFocused(false);
            clearSuggestions();
            if (inputRef.current) {
                inputRef.current.blur();
            }
        }
    };    // Handle click outside to close suggestions
    useEffect(() => {
        const handleClickOutside = (event) => {
            const isInsideContainer = containerRef.current && containerRef.current.contains(event.target);
            const isInsideDropdown = event.target.closest('[data-search-dropdown="true"]');

            if (!isInsideContainer && !isInsideDropdown) {
                setIsFocused(false);
                setShowSuggestions(false);
                if (!query.trim()) {
                    setIsInputVisible(false);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [query]);

    // Update position on scroll/resize with throttling
    useEffect(() => {
        let isThrottled = false;
        
        const handlePositionUpdate = () => {
            if (!isThrottled && showSuggestions && inputRef.current) {
                isThrottled = true;
                requestAnimationFrame(() => {
                    updatePosition();
                    isThrottled = false;
                });
            }
        };

        if (showSuggestions) {
            window.addEventListener('scroll', handlePositionUpdate, { passive: true });
            window.addEventListener('resize', handlePositionUpdate);
        }
        
        return () => {
            window.removeEventListener('scroll', handlePositionUpdate);
            window.removeEventListener('resize', handlePositionUpdate);
        };
    }, [showSuggestions]);

    // Update position when visibility changes
    useEffect(() => {
        if (showSuggestions && inputRef.current) {
            updatePosition();
        }
    }, [showSuggestions]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            setShowSuggestions(false);
            clearSuggestions();
        };
    }, [clearSuggestions]);    // Auto-show suggestions when data is available
    useEffect(() => {
        if (suggestions && suggestions.length > 0 && query.trim().length >= 2 && !loading) {
            setShowSuggestions(true);
            updatePosition();
        }
    }, [suggestions, loading, query]);

    return (
        <div className="relative z-10 w-screen items-center pt-7 md:pt-15 lg:pt-20 xl:pt-30">
            <div ref={containerRef} className="relative min-h-[30px] md:min-h-[35px] lg:min-h-[50px] xl:min-h-[66px]" style={{ overflow: 'visible' }}>
                {/* Original Button Design */}
                {!isInputVisible && (
                    <button
                        onClick={handleButtonClick}
                        className="absolute top-1/2 left-1/2 h-[30px] w-[300px] -translate-x-1/2 -translate-y-1/2 transform rounded-2xl bg-gray-300/70 transition-all duration-200 hover:bg-gray-300/90 md:h-[35px] md:w-[580px] lg:h-[50px] lg:w-[850px] xl:h-[66px] xl:w-[1350px]"
                    >
                        <Icon />
                    </button>
                )}                {/* Input Field with Dropdown Container (shows when button is clicked) */}
                {isInputVisible && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform">                 
                        <div className="relative" style={{ overflow: 'visible', zIndex: 999 }}>                            
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                                placeholder={placeholder}
                                className="h-[30px] w-[300px] rounded-2xl bg-gray-300/70 px-3 pr-8 text-xs text-gray-800 placeholder-gray-500 shadow-lg backdrop-blur-sm focus:outline-none md:h-[35px] md:w-[580px] md:px-4 md:pr-12 md:text-sm lg:h-[50px] lg:w-[850px] lg:px-6 lg:pr-16 lg:text-base xl:h-[66px] xl:w-[1350px] xl:px-8 xl:pr-20 xl:text-lg"
                            />
                            <Icon />
                        </div>
                    </div>
                )}                {/* Portal-based dropdown - renders outside of container constraints */}
                <SearchSuggestions 
                    suggestions={suggestions} 
                    onSelect={handleSuggestionSelect} 
                    show={showSuggestions} 
                    loading={loading}
                    inputRect={inputRect}
                />
            </div>
        </div>
    );
};

export default AiSearch;
