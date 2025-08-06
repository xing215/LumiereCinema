import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatbotIcon from '@assets/img/Chatbot-Icon.svg';
import { useMovieAutocomplete, useSearchHistory } from '@hooks/useMovieSearch';

const Icon = () => {
    return (
        <div className="absolute top-1/2 right-1.5 -translate-y-1/2 sm:right-2 md:right-3 lg:right-5 xl:right-10">
            <img src={ChatbotIcon} alt="Search" className="h-3 w-3 sm:h-5 sm:w-5 md:h-7 md:w-7 lg:h-8 lg:w-8 xl:h-12 xl:w-12" />
        </div>
    );
};

const SearchSuggestions = ({ suggestions, onSelect, show }) => {
    if (!show || suggestions.length === 0) return null;

    return (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto z-50">
            {suggestions.map((movie, index) => (
                <div
                    key={movie._id || index}
                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    onClick={() => onSelect(movie)}
                >
                    <div className="flex items-center space-x-3">
                        <img
                            src={movie.posterURL}
                            alt={movie.title}
                            className="w-10 h-14 object-cover rounded"
                            onError={(e) => {
                                e.target.src = '/placeholder-movie-poster.jpg';
                            }}
                        />
                        <div className="flex-1">
                            <h4 className="font-medium text-gray-900 text-sm">
                                {movie.title}
                            </h4>
                            <p className="text-xs text-gray-500">
                                {movie.genre?.slice(0, 2).join(', ')} • {movie.ageRating}
                            </p>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                                movie.status === 'Now Showing' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-blue-100 text-blue-800'
                            }`}>
                                {movie.status}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const SearchHistory = ({ history, onSelect, show }) => {
    if (!show || history.length === 0) return null;

    return (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            <div className="px-4 py-2 text-xs font-medium text-gray-500 border-b border-gray-100">
                Recent Searches
            </div>
            {history.slice(0, 5).map((item, index) => (
                <div
                    key={item.id || index}
                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    onClick={() => onSelect(item.keyword)}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">{item.keyword}</span>
                        <span className="text-xs text-gray-400">
                            🕒 {new Date(item.timestamp).toLocaleDateString()}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
};

const AiSearch = ({ onSearch, placeholder = "Search movies, actors, directors..." }) => {
    const [query, setQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const inputRef = useRef(null);
    const containerRef = useRef(null);
    const navigate = useNavigate();
    
    // Use custom hooks
    const { suggestions, getSuggestions, clearSuggestions } = useMovieAutocomplete({
        minLength: 2,
        debounceDelay: 300,
        maxSuggestions: 5
    });
    
    const { history, addToHistory } = useSearchHistory(10);

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

    // Handle search submission
    const handleSearch = (searchQuery = query) => {
        const cleanQuery = searchQuery.trim();
        if (!cleanQuery) return;

        // Add to search history
        addToHistory(cleanQuery);
        
        // Clear suggestions
        setShowSuggestions(false);
        setIsFocused(false);
          // Execute search callback or navigate
        if (onSearch) {
            onSearch(cleanQuery);
        } else {
            navigate(`/search?q=${encodeURIComponent(cleanQuery)}`);
        }
        
        // Clear input and blur
        if (inputRef.current) {
            inputRef.current.blur();
        }
    };    // Handle suggestion selection
    const handleSuggestionSelect = (movie) => {
        // Navigate to movie details
        navigate(`/movie?movieId=${movie._id}`);
        setShowSuggestions(false);
        setIsFocused(false);
    };

    // Handle history selection
    const handleHistorySelect = (keyword) => {
        setQuery(keyword);
        handleSearch(keyword);
    };

    // Handle key events
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSearch();
        } else if (e.key === 'Escape') {
            setShowSuggestions(false);
            setIsFocused(false);
            if (inputRef.current) {
                inputRef.current.blur();
            }
        }
    };

    // Handle focus events
    const handleFocus = () => {
        setIsFocused(true);
        if (query.trim().length >= 2) {
            setShowSuggestions(true);
        }
    };

    const handleBlur = (e) => {
        // Delay to allow clicking on suggestions
        setTimeout(() => {
            if (!containerRef.current?.contains(document.activeElement)) {
                setIsFocused(false);
                setShowSuggestions(false);
            }
        }, 150);
    };

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsFocused(false);
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative z-10 w-screen items-center pt-7 md:pt-15 lg:pt-20 xl:pt-30">
            <div 
                ref={containerRef}
                className="relative max-w-6xl mx-auto px-4"
            >
                <div className="relative">
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        placeholder={placeholder}
                        className={`w-full h-[20px] md:h-[35px] lg:h-[50px] xl:h-[66px] 
                                  px-4 pr-12 md:pr-16 lg:pr-20 xl:pr-24
                                  rounded-2xl bg-gray-300/70 text-gray-800 placeholder-gray-500
                                  focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white
                                  transition-all duration-200
                                  text-sm md:text-base lg:text-lg xl:text-xl`}
                    />
                    <Icon />
                </div>

                {/* Suggestions dropdown */}
                <SearchSuggestions
                    suggestions={suggestions}
                    onSelect={handleSuggestionSelect}
                    show={showSuggestions && suggestions.length > 0}
                />

                {/* Search history dropdown */}
                <SearchHistory
                    history={history}
                    onSelect={handleHistorySelect}
                    show={isFocused && !showSuggestions && query.length < 2 && history.length > 0}
                />
            </div>
        </div>
    );
};

export default AiSearch;
