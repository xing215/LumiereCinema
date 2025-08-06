import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatbotIcon from '@assets/img/Chatbot-Icon.svg';
import { useMovieAutocomplete, useSearchHistory } from '@hooks/useMovieSearch';
import { getMovieDetailsPath } from '@routes/routeConfig';
import SearchMovieCard from '@components/UI/SearchMovieCard';

const Icon = () => {
    return (
        <div className="absolute top-1/2 right-1.5 -translate-y-1/2 sm:right-2 md:right-3 lg:right-5 xl:right-10">
            <img src={ChatbotIcon} alt="Chatbot" className="h-3 w-3 sm:h-5 sm:w-5 md:h-7 md:w-7 lg:h-8 lg:w-8 xl:h-12 xl:w-12" />
        </div>
    );
};

const SearchSuggestions = ({ suggestions, onSelect, show, loading }) => {
    if (!show) return null;

    return (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 max-h-96 overflow-y-auto z-[9999]">
            {loading ? (
                <div className="px-4 py-6 text-center text-gray-500">
                    <div className="animate-pulse">
                        <div className="text-sm text-gray-400">Searching movies...</div>
                        <div className="flex items-center space-x-4 mt-4">
                            <div className="w-12 h-16 bg-gray-200 rounded"></div>
                            <div className="flex-1">
                                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : suggestions && suggestions.length === 0 ? (
                <div className="px-4 py-6 text-center text-gray-500">
                    <div className="text-4xl mb-2">🎬</div>
                    <p className="text-sm">No movies found</p>
                </div>
            ) : suggestions && suggestions.length > 0 ? (
                <>
                    {suggestions.map((movie, index) => (
                        <SearchMovieCard
                            key={movie._id || index}
                            movie={movie}
                            onClick={onSelect}
                        />
                    ))}
                </>
            ) : null}
        </div>
    );
};

const AiSearch = ({ placeholder = "Search movies, actors, directors..." }) => {
    const [query, setQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isInputVisible, setIsInputVisible] = useState(false);
    const inputRef = useRef(null);
    const containerRef = useRef(null);
    const navigate = useNavigate();
    
    // Use custom hooks
    const { suggestions, getSuggestions, clearSuggestions, loading } = useMovieAutocomplete({
        minLength: 2,
        debounceDelay: 300,
        maxSuggestions: 6
    });
    
    const { history, addToHistory } = useSearchHistory(10);
    
    // Handle button click to show input
    const handleButtonClick = () => {
        setIsInputVisible(true);
        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.focus();
            }
        }, 100);
    };

    // Handle input changes
    const handleInputChange = (e) => {
        const value = e.target.value;
        setQuery(value);
        
        if (value.trim().length >= 2) {
            getSuggestions(value);
            setShowSuggestions(true);
        } else {
            clearSuggestions();
            setShowSuggestions(false);
        }
    };

    // Handle suggestion selection
    const handleSuggestionSelect = (movie) => {
        console.log('🎬 Movie selected:', movie);
        
        // Add to history
        addToHistory(movie.title);
        
        // Reset states
        setQuery('');
        setShowSuggestions(false);
        setIsInputVisible(false);
        setIsFocused(false);
        clearSuggestions();
        
        // Navigate to movie details
        navigate(getMovieDetailsPath(movie._id));
    };

    // Handle focus
    const handleFocus = () => {
        setIsFocused(true);
        if (query.trim().length >= 2) {
            setShowSuggestions(true);
        }
    };

    // Handle blur with delay
    const handleBlur = () => {
        setTimeout(() => {
            setIsFocused(false);
            setShowSuggestions(false);
        }, 200);
    };

    // Handle key events
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
    };

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
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

    return (
        <div className="relative z-10 w-screen items-center pt-7 md:pt-15 lg:pt-20 xl:pt-30">
            <div 
                ref={containerRef}
                className="relative"
            >
                {/* Original Button Design */}
                {!isInputVisible && (
                    <button 
                        onClick={handleButtonClick}
                        className="absolute top-1/2 left-1/2 h-[20px] w-[300px] -translate-x-1/2 -translate-y-1/2 transform rounded-2xl bg-gray-300/70 md:h-[35px] md:w-[580px] lg:h-[50px] lg:w-[850px] xl:h-[66px] xl:w-[1350px] hover:bg-gray-300/90 transition-all duration-200"
                    >
                        <Icon />
                    </button>
                )}

                {/* Input Field (shows when button is clicked) */}
                {isInputVisible && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform">
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            placeholder={placeholder}
                            className="h-[20px] w-[300px] px-3 pr-8 rounded-2xl bg-white/90 backdrop-blur-sm text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white shadow-lg text-xs md:h-[35px] md:w-[580px] md:px-4 md:pr-12 md:text-sm lg:h-[50px] lg:w-[850px] lg:px-6 lg:pr-16 lg:text-base xl:h-[66px] xl:w-[1350px] xl:px-8 xl:pr-20 xl:text-lg"
                        />
                        <Icon />
                    </div>
                )}

                {/* Suggestions dropdown */}
                {isInputVisible && (
                    <div 
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 transform w-[300px] md:w-[580px] lg:w-[850px] xl:w-[1350px]" 
                        style={{ top: 'calc(50% + 15px)' }}
                    >
                        <SearchSuggestions
                            suggestions={suggestions}
                            onSelect={handleSuggestionSelect}
                            show={showSuggestions}
                            loading={loading}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default AiSearch;
