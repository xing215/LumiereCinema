import React, { useState } from 'react';

const SearchButton = ({ onSearch, placeholder = 'Search here' }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const handleInputChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        // Call onSearch with the search term (debounced or immediate)
        if (onSearch) {
            onSearch(value);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (onSearch) {
                onSearch(searchTerm);
            }
        }
    };

    const handleClear = () => {
        setSearchTerm('');
        if (onSearch) {
            onSearch('');
        }
    };

    return (
        <div className="absolute top-[5vh] right-1/15 flex items-center gap-2">
            <p className="font-unbounded text-base font-normal">Search: </p>
            <div className="relative">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder={placeholder}
                    className="h-6 w-60 rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm placeholder-gray-400 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                {searchTerm && (
                    <button onClick={handleClear} className="absolute top-1/2 right-2 -translate-y-1/2 transform text-sm font-bold text-gray-400 hover:text-gray-600" title="Clear search">
                        x
                    </button>
                )}
            </div>
        </div>
    );
};

export default SearchButton;
