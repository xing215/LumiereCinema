import { useState, useEffect } from 'react';
import StaffLayout from '@layouts/StaffLayout';
import MobileNotSupported from '@components/display/MobileNotSupported';
import SearchButton from '@components/buttons/Staff/SearchButton';
import ManageTable from '@components/UI/ManageTable';
import DeleteButton from '@components/buttons/Staff/DeleteButton';
import DownloadTemplateButton from '@components/buttons/Staff/DownloadTemplateButton';
import UploadCSVButton from '@components/buttons/Staff/uploadCsvButton';
import AddButton from '@components/buttons/Staff/AddButton';
import ConfirmButton from '@components/buttons/Staff/ConfirmButton';
import CancelButton from '@components/buttons/Staff/CancelButton';
import { useGetMovies, useRemoveMovie, useUpdateMovie, useAddMovie } from '@hooks/useAdmin';
import { useInlineEdit, useStatusUpdate } from '@hooks/useInlineEdit';
import { useMovieValidation } from '@hooks/useMovieValidation';
import {
    showDeleteConfirmation,
    showDeletingMovies,
    showMoviesDeleted,
    showUploadLoading,
    showUploadResults,
    showUploadConfirmation,
    showAddingMovies,
    showMoviesAdded,
    showCancellingUpload,
    showUploadCancelled,
    showProcessingVisibility,
    showMovieShown,
    showMovieHidden,
    showUploadError,
    closeSwal,
    forceCloseSwal
} from '@utils/sweetalert';


const IntegratedButton = ({ onImportData, onAddMovie, isLoading = false }) => (
    <div className="absolute right-1/12 z-10 flex items-end gap-4 lg:top-1/7 xl:top-[10vh]">
        <AddButton text="Add Movie" onClick={onAddMovie} disabled={isLoading} />
        <div className="flex flex-col items-center gap-1">
            <DownloadTemplateButton 
                templatePath="/templates/MovieList-Template.xlsx"
                filename="MovieList-Template.xlsx"
                buttonText="Download template"
                disabled={isLoading}
            />
            <UploadCSVButton 
                templateType="movie" 
                onDataParsed={onImportData}
                disabled={isLoading}
            />
        </div>
    </div>
)

const AddMovieButtons = ({ onConfirm, onCancel, isLoading = false }) => (
    <div className="absolute right-1/12 z-10 flex items-end gap-4 lg:top-1/7 xl:top-[10vh]">
        <ConfirmButton 
            onClick={onConfirm}
            disabled={isLoading}
        />
        <CancelButton 
            onClick={onCancel}
            disabled={isLoading}
        />
    </div>
)

const ReviewButtons = ({ onConfirm, onCancel, isLoading = false }) => (
    <div className="absolute right-1/12 z-10 flex items-end gap-4 lg:top-1/7 xl:top-[15vh]">
        <ConfirmButton 
            onClick={onConfirm}
            disabled={isLoading}
        />
        <CancelButton 
            onClick={onCancel}
            disabled={isLoading}
        />
    </div>
)

const MovieManagePage = () => {
    const { getMovies, movies, setMovies, loading } = useGetMovies();
    const { removeMovie, loading: removeLoading } = useRemoveMovie();
    const { updateMovie } = useUpdateMovie();
    const { addMovie, loading: addLoading } = useAddMovie();
    const { updateStatus, updatingRows } = useStatusUpdate(updateMovie);
    const { validateMovie, validateMoviesBatch, validationErrors, clearValidationErrors } = useMovieValidation();
    
    const [tickedMovies, setTickedMovies] = useState(new Set());
    const [importLoading, setImportLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    // State for tracking review movies (stored in frontend only)
    const [reviewMovies, setReviewMovies] = useState([]);
    const [showReviewMode, setShowReviewMode] = useState(false);
    
    // State for adding new movie
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

    // Initialize inline editing hook
    const {
        editingCell,
        startEdit,
        saveEdit,
        cancelEdit,
        isUpdating
    } = useInlineEdit(updateMovie, getMovies, movies, setMovies);

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

    // Cleanup SweetAlert on component unmount
    useEffect(() => {
        return () => {
            forceCloseSwal();
        };
    }, []);

    // Define which columns are editable (by index) and their corresponding field names
    const editableColumns = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]; // Movie Title, Description, Release Date, Genre, Duration, Age Rating, Director, Cast, Language, Trailer, Poster (excluding Visible since it uses ActiveButton)
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
        12: 'isHidden' // Add isHidden field mapping for ActiveButton
    };

    // Handle starting inline edit
    const handleStartEdit = (rowIndex, columnIndex, currentValue) => {
        // Allow editing without expansion requirement and if not already updating and column is editable
        if (editableColumns.includes(columnIndex) && !isUpdating) {
            // If adding movie, only allow editing row 0 (the new movie row)
            if (isAddingMovie) {
                if (rowIndex === 0) {
                    startEdit(rowIndex, columnIndex, currentValue);
                }
                // Ignore clicks on existing movie rows when in add mode
                return;
            }
            
            // Normal editing mode - allow editing any row
            startEdit(rowIndex, columnIndex, currentValue);
        }
    };

    // Handle saving inline edit
    const handleSaveEdit = async (rowIndex, columnIndex, newValue) => {
        // Check if this is the new movie row (index 0 when adding)
        if (isAddingMovie && rowIndex === 0) {
            handleNewMovieFieldChange(columnIndex, newValue);
            cancelEdit(); // Clear edit state immediately after updating new movie data
            return;
        }
        
        // Check if this is a review movie (stored in frontend only)
        const adjustedIndex = isAddingMovie ? rowIndex - 1 : rowIndex;
        
        if (adjustedIndex < reviewMovies.length) {
            // This is a review movie, update in frontend state only
            const fieldName = columnFieldMapping[columnIndex];
            if (fieldName) {
                const updatedReviewMovies = [...reviewMovies];
                let processedValue = newValue;
                
                // Special handling for genre and cast fields
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
        
        // This is an existing movie, handle normally
        const existingMovieIndex = adjustedIndex - reviewMovies.length;
        const movie = existingMovies[existingMovieIndex];
        const fieldName = columnFieldMapping[columnIndex];
        
        if (movie && fieldName) {
            const movieId = movie.id || movie._id;
            
            // Special handling for genre and cast fields (convert comma-separated string to array)
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
                // Could add toast notification here for user feedback
            }
        }
    };

    // Handle canceling inline edit with special logic for add movie mode
    const handleCancelEdit = () => {
        // Always clear the edit state regardless of context
        cancelEdit();
        
        // If we're in add movie mode and editing the new movie row,
        // we don't need any special handling - just clear the edit state
        // The edit state should never leak to existing movie rows
    };

    // Handle new movie field changes
    const handleNewMovieFieldChange = (columnIndex, value) => {
        const fieldName = columnFieldMapping[columnIndex];
        if (fieldName) {
            setNewMovieData(prev => ({
                ...prev,
                [fieldName]: value
            }));
        }
    };

    // Start adding new movie
    const handleStartAddMovie = () => {
        // Clear any active edit state first
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
    };

    // Cancel adding new movie
    const handleCancelAddMovie = () => {
        // Clear any active edit state first
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
    };

    // Confirm adding new movie
    const handleConfirmAddMovie = async () => {
        try {
            // Validate using validation hook
            const validationErrors = validateMovie(newMovieData, 0, movies || []);
            
            if (validationErrors.length > 0) {
                showUploadError(validationErrors[0]); // Show first error
                return;
            }

            // Show adding progress
            showAddingMovies();

            // Prepare movie data for API
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
                isHidden: true, // Default to hidden
                ratingsAverage: 0,  // Always default to 0
                ratingsQuantity: 0  // Always default to 0
            };

            const result = await addMovie(movieToAdd);

            if (result.success) {
                // Clear any active edit state first
                cancelEdit();
                
                // Refresh movies list
                await getMovies();
                
                // Reset add movie state
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

                // Show success message
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
    };

    // Handle status/visibility toggle from ActiveButton
    const onStatusChange = async (rowIndex, newIsHidden) => {
        // Adjust index based on whether we're in add mode
        const adjustedIndex = isAddingMovie ? rowIndex - 1 : rowIndex;
        
        // Check if this is a review movie (stored in frontend only)
        if (adjustedIndex < reviewMovies.length) {
            // This is a review movie, update in frontend state only
            const updatedReviewMovies = [...reviewMovies];
            updatedReviewMovies[adjustedIndex] = {
                ...updatedReviewMovies[adjustedIndex],
                isHidden: newIsHidden
            };
            setReviewMovies(updatedReviewMovies);
            return;
        }
        
        // This is an existing movie, handle normally
        const existingMovieIndex = adjustedIndex - reviewMovies.length;
        const targetMovie = existingMovies[existingMovieIndex];
        if (!targetMovie) return;
        
        const originalIndex = movies.findIndex(movie => movie._id === targetMovie._id);
        if (originalIndex === -1) return;
        
        try {
            // Show processing message
            showProcessingVisibility();
            
            const result = await updateStatus(movies, setMovies, originalIndex, 'isHidden', newIsHidden);
            
            if (result.success) {
                // Show appropriate success message
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
    };

    // Handle search functionality
    const handleSearch = (term) => {
        setSearchTerm(term);
    };

    // Filter movies based on search term
    const filterMovies = (moviesList) => {
        if (!searchTerm.trim()) {
            return moviesList;
        }
        
        const searchLower = searchTerm.toLowerCase();
        return moviesList.filter(movie => {
            // Search in movie title
            const titleMatch = movie.title?.toLowerCase().includes(searchLower);
            
            // Search in genre
            let genreMatch = false;
            if (Array.isArray(movie.genre)) {
                genreMatch = movie.genre.some(g => g.toLowerCase().includes(searchLower));
            } else if (movie.genre) {
                genreMatch = movie.genre.toLowerCase().includes(searchLower);
            }
            
            return titleMatch || genreMatch;
        });
    };

    // Separate movies into review movies (frontend only) and existing with search filter
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

    // Create rows for review movies (stored in frontend only) - always expanded
    const reviewMovieRows = reviewMovies.map((movie, index) => [
        { type: 'ReviewIndicator' }, // Special indicator for review movies
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
            disabled: false // Allow editing during review
        }, 
        { type: 'ReviewLabel', text: 'REVIEW' }
    ]);

    // Combine with review movies at the top
    let allMovieRows = [...reviewMovieRows, ...existingMovieRows];
    
    // Add new movie row at the top if adding
    if (isAddingMovie) {
        const newMovieRow = [
            { type: 'AddIndicator' }, // Special indicator for new movie
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
                disabled: true // Disable during add
            }, 
            { type: 'AddLabel', text: 'NEW' }
        ];
        allMovieRows = [newMovieRow, ...allMovieRows];
    }

    const handleDeleteConfirm = async () => {
        // Get all movies (review + existing) to find correct IDs
        const allFilteredMovies = [...reviewMovies, ...existingMovies];
        const selectedIndices = Array.from(tickedMovies);
        
        const reviewMovieIndices = [];
        const existingMovieIds = [];
        
        selectedIndices.forEach(index => {
            const adjustedIndex = isAddingMovie ? index - 1 : index;
            
            if (adjustedIndex < reviewMovies.length) {
                // This is a review movie (frontend only)
                reviewMovieIndices.push(adjustedIndex);
            } else {
                // This is an existing movie (needs backend deletion)
                const existingIndex = adjustedIndex - reviewMovies.length;
                const movie = existingMovies[existingIndex];
                if (movie) {
                    existingMovieIds.push(movie.id || movie._id);
                }
            }
        });
        
        try {
            const totalToDelete = reviewMovieIndices.length + existingMovieIds.length;
            showDeletingMovies(totalToDelete);
            
            // Delete review movies (frontend only)
            if (reviewMovieIndices.length > 0) {
                const updatedReviewMovies = reviewMovies.filter((_, index) => 
                    !reviewMovieIndices.includes(index)
                );
                setReviewMovies(updatedReviewMovies);
                
                // Update review mode state
                if (updatedReviewMovies.length === 0) {
                    setShowReviewMode(false);
                }
            }
            
            // Delete existing movies (backend)
            for (const movieId of existingMovieIds) {
                await removeMovie(movieId);
            }
            
            // Refresh the movie list if any existing movies were deleted
            if (existingMovieIds.length > 0) {
                await getMovies();
            }
            
            setTickedMovies(new Set());
            
            // Show success message
            showMoviesDeleted(totalToDelete);
        } catch (error) {
            console.error('Failed to delete movies:', error);
            closeSwal();
            showUploadError(error.message || 'Failed to delete movies');
        }
    };

    const handleDeleteClick = async () => {
        const confirmResult = await showDeleteConfirmation(tickedMovies.size);
        if (confirmResult.isConfirmed) {
            await handleDeleteConfirm();
        }
    };

    // Import movies from Excel - validate and store in frontend for review
    const handleImportData = async (parsedData) => {
        if (!parsedData || parsedData.length === 0) {
            showUploadError('No valid data found in the file');
            return;
        }

        setImportLoading(true);
        
        try {
            // Show validation loading
            showUploadLoading();
            
            // Clear previous validation errors
            clearValidationErrors();
            
            // Validate all movies in frontend
            const validationResult = validateMoviesBatch(parsedData, movies || []);
            
            // Close loading and wait a moment to ensure it's fully closed
            closeSwal();
            await new Promise(resolve => setTimeout(resolve, 100));
            
            if (validationResult.hasErrors) {
                // Show validation errors and stop here
                await showUploadResults(validationResult.validMovies.length, validationResult.errors.length, validationResult.errors);
                setImportLoading(false);
                return;
            }
            
            if (validationResult.validMovies.length === 0) {
                showUploadError('No valid movies found to import');
                setImportLoading(false);
                return;
            }
            
            // Show upload success confirmation
            const confirmResult = await showUploadConfirmation(validationResult.validMovies.length);
            
            if (confirmResult.isConfirmed) {
                setReviewMovies(validationResult.validMovies);
                setShowReviewMode(true);
            }

        } catch (error) {
            console.error('Import error:', error);
            closeSwal();
            showUploadError(error.message || 'An error occurred during validation');
        } finally {
            setImportLoading(false);
        }
    };

    // Confirm review - upload review movies to backend
    const handleConfirmReview = async () => {
        if (reviewMovies.length === 0) return;
        
        setImportLoading(true);
        try {
            showAddingMovies();
            
            let successCount = 0;
            let errorCount = 0;
            const errors = [];

            // Upload each review movie to backend
            for (const movieData of reviewMovies) {
                try {
                    // Remove tempId before sending to backend
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
            
            // Refresh movies list
            await getMovies();
            
            // Clear review state
            setReviewMovies([]);
            setShowReviewMode(false);
            
            closeSwal();
            
            if (errorCount > 0) {
                // Show partial success with errors
                showUploadResults(successCount, errorCount, errors);
            } else {
                // Show complete success
                showMoviesAdded(successCount);
            }
            
        } catch (error) {
            closeSwal();
            showUploadError('Failed to confirm movies');
        } finally {
            setImportLoading(false);
        }
    };

    // Cancel review - clear review movies from frontend
    const handleCancelReview = async () => {
        if (reviewMovies.length === 0) return;
        
        try {
            showCancellingUpload();
            
            // Clear review movies from frontend (no backend deletion needed)
            setReviewMovies([]);
            setShowReviewMode(false);
            
            showUploadCancelled();
            
        } catch (error) {
            console.error('Error canceling review:', error);
            closeSwal();
            showUploadError('Failed to cancel review.');
        }
    };

    const header = ['', 'Movie Title', 'Description', 'Release Date', 'Genre', 'Duration', 'Age Rating', 'Director', 'Cast', 'Language', 'Trailer', 'Poster', 'Active', 'Preview'];

    // Configuration for Movie table columns
    const movieColumnConfig = [
        { width: 'w-12', truncate: false },    // TickButton - checkbox column
        { width: 'w-48', truncate: true },     // Movie Title
        { width: 'w-64', truncate: true },     // Description - largest column, truncated
        { width: 'w-40', truncate: false },    // Release Date - date column
        { width: 'w-32', truncate: true },     // Genre - comma-separated genres
        { width: 'w-20', truncate: false },    // Duration - small column for numbers
        { width: 'w-20', truncate: false },    // Age Rating
        { width: 'w-36', truncate: true },     // Director
        { width: 'w-48', truncate: true },     // Cast - comma-separated names
        { width: 'w-28', truncate: true },     // Language
        { width: 'w-32', truncate: true },     // Trailer
        { width: 'w-32', truncate: true },     // Poster
        { width: 'w-20', truncate: false },    // ActiveButton - toggle column
        { width: 'w-24', truncate: false }     // Preview - action column
    ];
    const formatReleaseDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toISOString().split('T')[0];
    };

    // Format movieRows with formatted release date
    const formattedMovieRows = allMovieRows.map(row => {
        const newRow = [...row];
        newRow[3] = formatReleaseDate(row[3]);
        return newRow;
    });

    return (
        <StaffLayout backgroundClass="bg-zinc-300/70">
            <MobileNotSupported>
                <SearchButton onSearch={handleSearch} placeholder="Search by movie title or genre..." />
                
                {isAddingMovie ? (
                    <AddMovieButtons 
                        onConfirm={handleConfirmAddMovie}
                        onCancel={handleCancelAddMovie}
                        isLoading={addLoading}
                    />
                ) : showReviewMode ? (
                    <ReviewButtons 
                        onConfirm={handleConfirmReview}
                        onCancel={handleCancelReview}
                        isLoading={importLoading}
                    />
                ) : tickedMovies.size > 0 ? (
                    <DeleteButton 
                        onClicked={handleDeleteClick} 
                        disabled={removeLoading}
                    />
                ) : (
                    <IntegratedButton 
                        onImportData={handleImportData}
                        onAddMovie={handleStartAddMovie}
                        isLoading={loading || importLoading || addLoading}
                    />
                )}
                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-2xl font-['Unbounded'] text-black">Loading movies...</div>
                    </div>
                ) : (
                    <ManageTable
                        data={formattedMovieRows}
                        anyTicked={tickedMovies}
                        setTickedRows={setTickedMovies}
                        header={header}
                        columnConfig={movieColumnConfig}
                        editableFields={editableColumns}
                        editingCell={editingCell}
                        onStartEdit={handleStartEdit}
                        onSaveEdit={handleSaveEdit}
                        onCancelEdit={handleCancelEdit}
                        isUpdating={isUpdating}
                        onStatusChange={onStatusChange}
                        reviewMovieIds={new Set(reviewMovies.map(movie => movie.tempId))} // Pass review movie temp IDs for special handling
                    />
                )}
                <div className="font-unbounded absolute top-5 left-1/6 z-10 text-5xl font-bold text-black">Movies</div>
                <div className="absolute bottom-1/3 left-0 z-5 h-44 w-44 -translate-x-1/2 transform rounded-full bg-amber-300 mix-blend-hard-light blur-[100px]" />
                <div className="absolute top-1/5 right-0 z-5 h-44 w-44 translate-x-1/2 transform rounded-full bg-amber-300 mix-blend-hard-light blur-[100px]" />
                <div className="absolute left-1/3 z-5 h-52 w-52 -translate-y-2/3 transform rounded-full bg-blue-500 mix-blend-hard-light blur-[100px]" />
                <div className="absolute right-0 bottom-0 z-5 h-56 w-56 translate-1/2 transform rounded-full bg-purple-600 mix-blend-hard-light blur-[100px]" />
            </MobileNotSupported>
        </StaffLayout>
    );
};
export default MovieManagePage;
