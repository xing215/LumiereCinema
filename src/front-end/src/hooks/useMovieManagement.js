import { useState, useEffect, useCallback } from 'react';
import { useGetMovies, useRemoveMovie, useUpdateMovie, useAddMovie } from '@hooks/useAdmin';
import { useInlineEdit, useStatusUpdate } from '@hooks/useInlineEdit';
import {
    showDeleteConfirmation,
    showDeletingMovies,
    showMoviesDeleted,
    showUploadLoading,
    showUploadResults,
    showUploadConfirmation,
    showAddingMovies,
    showMoviesAdded,
    showUploadCancelled,
    showProcessingVisibility,
    showMovieShown,
    showMovieHidden,
    showUploadError,
    closeSwal,
    forceCloseSwal
} from '@utils/sweetalert';

/**
 * Comprehensive hook for managing movie operations in the admin panel
 * Handles CRUD operations, batch uploads, validation, and UI state management
 */
export const useMovieManagement = () => {
    // API hooks
    const { getMovies, movies, setMovies, loading } = useGetMovies();
    const { removeMovie, loading: removeLoading } = useRemoveMovie();
    const { updateMovie } = useUpdateMovie();
    const { addMovie, loading: addLoading } = useAddMovie();
    const { updateStatus, updatingRows } = useStatusUpdate(updateMovie);

    // Validation state
    const [validationErrors, setValidationErrors] = useState([]);

    // Movie validation logic integrated directly
    const validateMovie = useCallback((movieData, rowIndex = 0, existingMovies = []) => {
        const errors = [];

        // Required fields validation
        if (!movieData.title?.trim()) {
            errors.push(`Row ${rowIndex + 1}: Movie title is required`);
        } else {
            // Check for duplicate movie title in existing database
            const duplicateMovie = existingMovies.find(movie => 
                movie.title?.toLowerCase().trim() === movieData.title.toLowerCase().trim()
            );
            
            if (duplicateMovie) {
                errors.push(`Row ${rowIndex + 1}: Movie "${movieData.title}" already exists in database`);
            }
        }

        // Duration validation
        if (movieData.duration && (isNaN(movieData.duration) || movieData.duration <= 0)) {
            errors.push(`Row ${rowIndex + 1}: Duration must be a positive number`);
        }

        // Release date validation
        if (movieData.releaseDate) {
            const date = new Date(movieData.releaseDate);
            if (isNaN(date.getTime())) {
                errors.push(`Row ${rowIndex + 1}: Invalid release date format`);
            }
        }

        // Age rating validation
        const validAgeRatings = ['P', 'K', 'T13', 'T16', 'T18'];
        if (movieData.ageRating && !validAgeRatings.includes(movieData.ageRating)) {
            errors.push(`Row ${rowIndex + 1}: Invalid age rating. Must be one of: ${validAgeRatings.join(', ')}`);
        }

        // URL validation for trailer and poster - only check for http/https protocol
        const urlPattern = /^https?:\/\/.+/i;

        if (movieData.trailerURL && movieData.trailerURL.trim() && !urlPattern.test(movieData.trailerURL.trim())) {
            errors.push(`Row ${rowIndex + 1}: Trailer URL must start with http:// or https://`);
        }

        if (movieData.posterURL && movieData.posterURL.trim() && !urlPattern.test(movieData.posterURL.trim())) {
            errors.push(`Row ${rowIndex + 1}: Poster URL must start with http:// or https://`);
        }

        return errors;
    }, []);

    const validateMoviesBatch = useCallback((moviesData, existingMovies = []) => {
        const allErrors = [];
        const validMovies = [];
        const processedTitles = new Set(); // Track titles within the batch for duplicate detection

        moviesData.forEach((movieData, index) => {
            // First check for duplicates within the batch being uploaded
            const currentErrors = [];
            
            if (movieData.title?.trim()) {
                const titleLower = movieData.title.toLowerCase().trim();
                if (processedTitles.has(titleLower)) {
                    currentErrors.push(`Row ${(movieData.rowIndex || index) + 1}: Duplicate movie title "${movieData.title}" found in upload batch`);
                } else {
                    processedTitles.add(titleLower);
                }
            }
            
            // Then run individual movie validation
            const movieErrors = validateMovie(movieData, movieData.rowIndex || index, existingMovies);
            
            // Combine all errors
            const allMovieErrors = [...currentErrors, ...movieErrors];
            
            if (allMovieErrors.length === 0) {
                // Process valid movie data
                const processedMovie = {
                    title: movieData.title?.trim() || '',
                    description: movieData.description?.trim() || '',
                    releaseDate: movieData.releaseDate || '',
                    genre: Array.isArray(movieData.genre) ? movieData.genre : 
                           (movieData.genre ? movieData.genre.split(',').map(g => g.trim()).filter(Boolean) : []),
                    duration: movieData.duration ? parseInt(movieData.duration) : 0,
                    ageRating: movieData.ageRating || 'P',
                    director: movieData.director?.trim() || '',
                    cast: Array.isArray(movieData.cast) ? movieData.cast :
                          (movieData.cast ? movieData.cast.split(',').map(c => c.trim()).filter(Boolean) : []),
                    language: movieData.language?.trim() || '',
                    trailerURL: movieData.trailerURL?.trim() || '',
                    posterURL: movieData.posterURL?.trim() || '',
                    isHidden: movieData.isHidden !== undefined ? movieData.isHidden : true,
                    ratingsAverage: 0,
                    ratingsQuantity: 0,
                    // Add temporary ID for frontend tracking
                    tempId: `temp_${Date.now()}_${index}`
                };
                validMovies.push(processedMovie);
            } else {
                allErrors.push(...allMovieErrors);
            }
        });

        setValidationErrors(allErrors);
        
        return {
            validMovies,
            errors: allErrors,
            hasErrors: allErrors.length > 0
        };
    }, [validateMovie]);

    const clearValidationErrors = useCallback(() => {
        setValidationErrors([]);
    }, []);

    // UI state
    const [tickedMovies, setTickedMovies] = useState(new Set());
    const [importLoading, setImportLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Review state for batch operations
    const [reviewMovies, setReviewMovies] = useState([]);
    const [showReviewMode, setShowReviewMode] = useState(false);
    
    // Add movie state
    const [isAddingMovie, setIsAddingMovie] = useState(false);
    const [newMovieData, setNewMovieData] = useState({
        title: '',
        description: '',
        releaseDate: '',
        genre: '',
        duration: '',
        ageRating: 'P',
        director: '',
        cast: '',
        language: '',
        trailerURL: '',
        posterURL: ''
    });

    // Inline editing hook
    const {
        editingCell,
        startEdit,
        saveEdit,
        cancelEdit,
        isUpdating
    } = useInlineEdit(updateMovie, getMovies, movies, setMovies);

    // Column configuration
    const editableColumns = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    const columnFieldMapping = {
        1: 'title',
        2: 'description', 
        3: 'releaseDate',
        4: 'genre',
        5: 'duration',
        6: 'ageRating',
        7: 'director',
        8: 'cast',
        9: 'language',
        10: 'trailerURL',
        11: 'posterURL',
        12: 'isHidden'
    };

    const header = ['', 'Movie Title', 'Description', 'Release Date', 'Genre', 'Duration', 'Age Rating', 'Director', 'Cast', 'Language', 'Trailer', 'Poster', 'Active', 'Preview'];

    // Field types configuration for EditableCell
    const fieldTypes = {
        0: 'text',   // TickButton (not editable)
        1: 'text',   // Movie Title - text
        2: 'text',   // Description - text
        3: 'date',   // Release Date - date picker
        4: 'text',   // Genre - text (comma-separated)
        5: 'number', // Duration - number
        6: 'text',   // Age Rating - text
        7: 'text',   // Director - text
        8: 'text',   // Cast - text (comma-separated)
        9: 'text',   // Language - text
        10: 'text',  // Trailer URL - text
        11: 'text',  // Poster URL - text
        12: 'text',  // Active (not typically editable directly)
        13: 'text'   // Preview (not editable)
    };

    const movieColumnConfig = [
        { width: 'w-12', truncate: false },    // TickButton - checkbox column
        { width: 'w-48', truncate: true },     // Movie Title
        { width: 'w-64', truncate: true },     // Description - largest column, truncated
        { width: 'w-40', truncate: false },    // Release Date - date column
        { width: 'w-40', truncate: true },     // Genre - comma-separated genres
        { width: 'w-20', truncate: false },    // Duration - small column for numbers
        { width: 'w-20', truncate: false },    // Age Rating
        { width: 'w-36', truncate: true },     // Director
        { width: 'w-48', truncate: true },     // Cast - comma-separated names
        { width: 'w-28', truncate: true },     // Language
        { width: 'w-50', truncate: true },     // Trailer
        { width: 'w-50', truncate: true },     // Poster
        { width: 'w-20', truncate: false },    // ActiveButton - toggle column
        { width: 'w-24', truncate: false }     // Preview - action column
    ];

    // Initialize movies on mount
    useEffect(() => {
        const fetchMovies = async () => {
            try {
                await getMovies();
            } catch (error) {
                console.error('Error fetching movies:', error);
            }
        };

        fetchMovies();
    }, []);

    // Cleanup SweetAlert on unmount
    useEffect(() => {
        return () => {
            forceCloseSwal();
        };
    }, []);

    // Search functionality
    const handleSearch = useCallback((term) => {
        setSearchTerm(term);
    }, []);

    const filterMovies = useCallback((moviesList) => {
        if (!searchTerm.trim()) {
            return moviesList;
        }
        
        const searchLower = searchTerm.toLowerCase();
        return moviesList.filter(movie => {
            const titleMatch = movie.title?.toLowerCase().includes(searchLower);
            let genreMatch = false;
            if (Array.isArray(movie.genre)) {
                genreMatch = movie.genre.some(g => g.toLowerCase().includes(searchLower));
            } else if (movie.genre) {
                genreMatch = movie.genre.toLowerCase().includes(searchLower);
            }
            return titleMatch || genreMatch;
        });
    }, [searchTerm]);

    // Inline editing handlers
    const handleStartEdit = useCallback((rowIndex, columnIndex, currentValue) => {
        if (editableColumns.includes(columnIndex) && !isUpdating) {
            if (isAddingMovie) {
                if (rowIndex === 0) {
                    startEdit(rowIndex, columnIndex, currentValue);
                }
                return;
            }
            startEdit(rowIndex, columnIndex, currentValue);
        }
    }, [editableColumns, isUpdating, isAddingMovie, startEdit]);

    const handleSaveEdit = useCallback(async (rowIndex, columnIndex, newValue) => {
        // Handle new movie field changes
        if (isAddingMovie && rowIndex === 0) {
            handleNewMovieFieldChange(columnIndex, newValue);
            cancelEdit();
            return;
        }
        
        // Handle review movie changes
        const adjustedIndex = isAddingMovie ? rowIndex - 1 : rowIndex;
        
        if (adjustedIndex < reviewMovies.length) {
            const fieldName = columnFieldMapping[columnIndex];
            if (fieldName) {
                const updatedReviewMovies = [...reviewMovies];
                let processedValue = newValue;
                
                if (fieldName === 'genre') {
                    processedValue = newValue.split(',').map(g => g.trim()).filter(Boolean);
                } else if (fieldName === 'cast') {
                    processedValue = newValue.split(',').map(c => c.trim()).filter(Boolean);
                }
                
                updatedReviewMovies[adjustedIndex] = {
                    ...updatedReviewMovies[adjustedIndex],
                    [fieldName]: processedValue
                };
                
                setReviewMovies(updatedReviewMovies);
                cancelEdit();
            }
            return;
        }
        
        // Handle existing movie changes
        const filteredMovies = filterMovies(movies || []);
        const existingMovieIndex = adjustedIndex - reviewMovies.length;
        const movie = filteredMovies[existingMovieIndex];
        const fieldName = columnFieldMapping[columnIndex];
        
        if (movie && fieldName) {
            const movieId = movie.id || movie._id;
            
            let processedValue = newValue;
            if (fieldName === 'genre') {
                processedValue = newValue.split(',').map(g => g.trim()).filter(Boolean);
            } else if (fieldName === 'cast') {
                processedValue = newValue.split(',').map(c => c.trim()).filter(Boolean);
            }
            
            try {
                await saveEdit(movieId, fieldName, processedValue);
            } catch (error) {
                console.error('Failed to save edit:', error);
            }
        }
    }, [isAddingMovie, reviewMovies, movies, columnFieldMapping, filterMovies, saveEdit, cancelEdit]);

    const handleCancelEdit = useCallback(() => {
        cancelEdit();
    }, [cancelEdit]);

    // New movie management
    const handleNewMovieFieldChange = useCallback((columnIndex, value) => {
        const fieldName = columnFieldMapping[columnIndex];
        if (fieldName) {
            setNewMovieData(prev => ({
                ...prev,
                [fieldName]: value
            }));
        }
    }, [columnFieldMapping]);

    const handleStartAddMovie = useCallback(() => {
        cancelEdit();
        setIsAddingMovie(true);
        setNewMovieData({
            title: '',
            description: '',
            releaseDate: '',
            genre: '',
            duration: '',
            ageRating: 'P',
            director: '',
            cast: '',
            language: '',
            trailerURL: '',
            posterURL: ''
        });
    }, [cancelEdit]);

    const handleCancelAddMovie = useCallback(() => {
        cancelEdit();
        setIsAddingMovie(false);
        setNewMovieData({
            title: '',
            description: '',
            releaseDate: '',
            genre: '',
            duration: '',
            ageRating: 'P',
            director: '',
            cast: '',
            language: '',
            trailerURL: '',
            posterURL: ''
        });
    }, [cancelEdit]);

    const handleConfirmAddMovie = useCallback(async () => {
        try {
            const validationErrors = validateMovie(newMovieData, 0, movies || []);
            
            if (validationErrors.length > 0) {
                showUploadError(validationErrors[0]);
                return;
            }

            showAddingMovies(1);

            const movieToAdd = {
                title: newMovieData.title.trim(),
                description: newMovieData.description.trim(),
                releaseDate: newMovieData.releaseDate,
                genre: newMovieData.genre ? newMovieData.genre.split(',').map(g => g.trim()).filter(Boolean) : [],
                duration: newMovieData.duration ? parseInt(newMovieData.duration) : 0,
                ageRating: newMovieData.ageRating || 'P',
                director: newMovieData.director.trim(),
                cast: newMovieData.cast ? newMovieData.cast.split(',').map(c => c.trim()).filter(Boolean) : [],
                language: newMovieData.language.trim(),
                trailerURL: newMovieData.trailerURL.trim(),
                posterURL: newMovieData.posterURL.trim(),
                isHidden: true,
                ratingsAverage: 0,
                ratingsQuantity: 0
            };

            const result = await addMovie(movieToAdd);

            if (result.success) {
                cancelEdit();
                await getMovies();
                setIsAddingMovie(false);
                setNewMovieData({
                    title: '',
                    description: '',
                    releaseDate: '',
                    genre: '',
                    duration: '',
                    ageRating: 'P',
                    director: '',
                    cast: '',
                    language: '',
                    trailerURL: '',
                    posterURL: ''
                });

                closeSwal();
                showMoviesAdded(1);
            } else {
                closeSwal();
                showUploadError(result.error || 'Failed to add movie');
            }
        } catch (error) {
            console.error('Failed to add movie:', error);
            closeSwal();
            showUploadError(error.message || 'Failed to add movie');
        }
    }, [newMovieData, validateMovie, movies, addMovie, cancelEdit, getMovies]);

    // Status change handler
    const onStatusChange = useCallback(async (rowIndex, newIsHidden) => {
        const adjustedIndex = isAddingMovie ? rowIndex - 1 : rowIndex;
        
        if (adjustedIndex < reviewMovies.length) {
            const updatedReviewMovies = [...reviewMovies];
            updatedReviewMovies[adjustedIndex] = {
                ...updatedReviewMovies[adjustedIndex],
                isHidden: newIsHidden
            };
            setReviewMovies(updatedReviewMovies);
            return;
        }
        
        const filteredMovies = filterMovies(movies || []);
        const existingMovieIndex = adjustedIndex - reviewMovies.length;
        const targetMovie = filteredMovies[existingMovieIndex];
        if (!targetMovie) return;
        
        const originalIndex = movies.findIndex(movie => movie._id === targetMovie._id);
        if (originalIndex === -1) return;
        
        try {
            showProcessingVisibility();
            
            const result = await updateStatus(movies, setMovies, originalIndex, 'isHidden', newIsHidden);
            
            if (result.success) {
                if (newIsHidden) {
                    showMovieHidden(targetMovie.title);
                } else {
                    showMovieShown(targetMovie.title);
                }
            } else {
                closeSwal();
                showUploadError(result.error || 'Failed to update visibility');
            }
        } catch (error) {
            closeSwal();
            showUploadError(error.message || 'Failed to update visibility');
        }
    }, [isAddingMovie, reviewMovies, movies, filterMovies, updateStatus, setMovies]);

    // Delete operations
    const handleDeleteConfirm = useCallback(async () => {
        const filteredMovies = filterMovies(movies || []);
        const allFilteredMovies = [...reviewMovies, ...filteredMovies];
        const selectedIndices = Array.from(tickedMovies);
        
        const reviewMovieIndices = [];
        const existingMovieIds = [];
        
        selectedIndices.forEach(index => {
            const adjustedIndex = isAddingMovie ? index - 1 : index;
            
            if (adjustedIndex < reviewMovies.length) {
                reviewMovieIndices.push(adjustedIndex);
            } else {
                const existingIndex = adjustedIndex - reviewMovies.length;
                const movie = filteredMovies[existingIndex];
                if (movie) {
                    existingMovieIds.push(movie.id || movie._id);
                }
            }
        });
        
        try {
            const totalToDelete = reviewMovieIndices.length + existingMovieIds.length;
            showDeletingMovies(totalToDelete);
            
            if (reviewMovieIndices.length > 0) {
                const updatedReviewMovies = reviewMovies.filter((_, index) => 
                    !reviewMovieIndices.includes(index)
                );
                setReviewMovies(updatedReviewMovies);
                
                if (updatedReviewMovies.length === 0) {
                    setShowReviewMode(false);
                }
            }
            
            for (const movieId of existingMovieIds) {
                await removeMovie(movieId);
            }
            
            if (existingMovieIds.length > 0) {
                await getMovies();
            }
            
            setTickedMovies(new Set());
            showMoviesDeleted(totalToDelete);
        } catch (error) {
            console.error('Failed to delete movies:', error);
            closeSwal();
            showUploadError(error.message || 'Failed to delete movies');
        }
    }, [tickedMovies, isAddingMovie, reviewMovies, movies, filterMovies, removeMovie, getMovies]);

    const handleDeleteClick = useCallback(async () => {
        const confirmResult = await showDeleteConfirmation(tickedMovies.size);
        if (confirmResult.isConfirmed) {
            await handleDeleteConfirm();
        }
    }, [tickedMovies, handleDeleteConfirm]);

    // Import operations
    const handleImportData = useCallback(async (parsedData) => {
        if (!parsedData || parsedData.length === 0) {
            showUploadError('No valid data found in the file');
            return;
        }

        setImportLoading(true);
        
        try {
            showUploadLoading();
            clearValidationErrors();
            
            const validationResult = validateMoviesBatch(parsedData, movies || []);
            
            closeSwal();
            await new Promise(resolve => setTimeout(resolve, 100));
            
            if (validationResult.validMovies.length === 0) {
                await showUploadResults(0, validationResult.errors.length, validationResult.errors);
                setImportLoading(false);
                return;
            }
            
            if (validationResult.hasErrors) {
                const confirmResult = await showUploadResults(
                    validationResult.validMovies.length, 
                    validationResult.errors.length, 
                    validationResult.errors
                );
                
                if (confirmResult.isConfirmed) {
                    setReviewMovies(validationResult.validMovies);
                    setShowReviewMode(true);
                }
            } else {
                const confirmResult = await showUploadConfirmation(validationResult.validMovies.length);
                
                if (confirmResult.isConfirmed) {
                    setReviewMovies(validationResult.validMovies);
                    setShowReviewMode(true);
                }
            }

        } catch (error) {
            console.error('Import error:', error);
            closeSwal();
            showUploadError(error.message || 'An error occurred during validation');
        } finally {
            setImportLoading(false);
        }
    }, [movies, clearValidationErrors, validateMoviesBatch]);

    const handleConfirmReview = useCallback(async () => {
        if (reviewMovies.length === 0) return;
        
        setImportLoading(true);
        try {
            showAddingMovies(reviewMovies.length);
            
            let successCount = 0;
            let errorCount = 0;
            const errors = [];

            for (const movieData of reviewMovies) {
                try {
                    const { tempId, ...movieToAdd } = movieData;
                    const result = await addMovie(movieToAdd);
                    
                    if (result.success) {
                        successCount++;
                    } else {
                        errors.push(`${movieData.title}: ${result.error || 'Failed to add movie'}`);
                        errorCount++;
                    }
                } catch (error) {
                    errors.push(`${movieData.title}: ${error.message || 'Unknown error'}`);
                    errorCount++;
                }
            }
            
            await getMovies();
            setReviewMovies([]);
            setShowReviewMode(false);
            
            closeSwal();
            
            if (errorCount > 0) {
                showUploadResults(successCount, errorCount, errors);
            } else {
                showMoviesAdded(successCount);
            }
            
        } catch (error) {
            closeSwal();
            showUploadError('Failed to confirm movies');
        } finally {
            setImportLoading(false);
        }
    }, [reviewMovies, addMovie, getMovies]);

    const handleCancelReview = useCallback(async () => {
        if (reviewMovies.length === 0) return;
        
        try {
            setReviewMovies([]);
            setShowReviewMode(false);
            showUploadCancelled();
        } catch (error) {
            console.error('Error canceling review:', error);
            closeSwal();
            showUploadError('Failed to cancel review.');
        }
    }, [reviewMovies]);

    // Data processing
    const getProcessedMovieData = useCallback(() => {
        const filteredMovies = filterMovies(movies || []);
        const existingMovies = filteredMovies;

        // Create rows for existing movies
        const existingMovieRows = existingMovies.map((movie, index) => [
            'TickButton',
            movie.title || movie.name || '',
            movie.description || '',
            movie.releaseDate || '',
            Array.isArray(movie.genre) ? movie.genre.join(', ') : (movie.genre || ''),
            movie.duration || '',
            movie.ageRating || '',
            movie.director || 'N/A',
            Array.isArray(movie.cast) ? movie.cast.join(', ') : (movie.cast || 'N/A'),
            movie.language || 'N/A',
            movie.trailerURL || '',
            movie.posterURL || '',
            { 
                type: 'ActiveButton', 
                isHidden: movie.isHidden || false,
                rowIndex: reviewMovies.length + index + (isAddingMovie ? 1 : 0),
                isUpdating: updatingRows.has(reviewMovies.length + index + (isAddingMovie ? 1 : 0))
            }, 
            'PreviewButton'
        ]);

        // Create rows for review movies
        const reviewMovieRows = reviewMovies.map((movie, index) => [
            { type: 'ReviewIndicator' },
            movie.title || '',
            movie.description || '',
            movie.releaseDate || '',
            Array.isArray(movie.genre) ? movie.genre.join(', ') : (movie.genre || ''),
            movie.duration || '',
            movie.ageRating || '',
            movie.director || 'N/A',
            Array.isArray(movie.cast) ? movie.cast.join(', ') : (movie.cast || 'N/A'),
            movie.language || 'N/A',
            movie.trailerURL || '',
            movie.posterURL || '',
            { 
                type: 'ActiveButton', 
                isHidden: movie.isHidden || false,
                rowIndex: index + (isAddingMovie ? 1 : 0),
                isUpdating: false,
                disabled: false
            }, 
            { type: 'ReviewLabel', text: 'REVIEW' }
        ]);

        let allMovieRows = [...reviewMovieRows, ...existingMovieRows];
        
        // Add new movie row if adding
        if (isAddingMovie) {
            const newMovieRow = [
                { type: 'AddIndicator' },
                newMovieData.title,
                newMovieData.description,
                newMovieData.releaseDate,
                newMovieData.genre,
                newMovieData.duration,
                newMovieData.ageRating,
                newMovieData.director,
                newMovieData.cast,
                newMovieData.language,
                newMovieData.trailerURL,
                newMovieData.posterURL,
                { 
                    type: 'ActiveButton', 
                    isHidden: true,
                    rowIndex: 0,
                    isUpdating: false,
                    disabled: true
                }, 
                { type: 'AddLabel', text: 'NEW' }
            ];
            allMovieRows = [newMovieRow, ...allMovieRows];
        }

        // Format release dates
        const formattedMovieRows = allMovieRows.map(row => {
            const newRow = [...row];
            newRow[3] = formatReleaseDate(row[3]);
            return newRow;
        });

        return formattedMovieRows;
    }, [movies, reviewMovies, isAddingMovie, newMovieData, updatingRows, filterMovies]);

    const formatReleaseDate = useCallback((dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toISOString().split('T')[0];
    }, []);

    return {
        // Data
        movieData: getProcessedMovieData(),
        header,
        movieColumnConfig,
        editableColumns,
        fieldTypes,
        
        // State
        loading,
        tickedMovies,
        setTickedMovies,
        isAddingMovie,
        showReviewMode,
        importLoading,
        addLoading,
        removeLoading,
        
        // Inline editing
        editingCell,
        handleStartEdit,
        handleSaveEdit,
        handleCancelEdit,
        isUpdating,
        
        // Movie operations
        handleStartAddMovie,
        handleCancelAddMovie,
        handleConfirmAddMovie,
        handleDeleteClick,
        onStatusChange,
        
        // Batch operations
        handleImportData,
        handleConfirmReview,
        handleCancelReview,
        
        // Search
        handleSearch,
        
        // Validation
        validateMovie,
        validateMoviesBatch,
        validationErrors,
        clearValidationErrors
    };
};