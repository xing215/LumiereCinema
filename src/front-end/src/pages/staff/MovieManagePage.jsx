import { useState, useEffect } from 'react';
import StaffLayout from '@layouts/StaffLayout';
import MobileNotSupported from '@components/display/MobileNotSupported';
import SearchButton from '@components/buttons/Staff/SearchButton';
import ConfirmationModal from '@components/display/Modal/Confirmation';
import ManageTable from '@components/UI/ManageTable';
import DeleteButton from '@components/buttons/Staff/DeleteButton';
import DownloadTemplateButton from '@components/buttons/Staff/DownloadTemplateButton';
import UploadCSVButton from '@components/buttons/Staff/uploadCsvButton';
import AddButton from '@components/buttons/Staff/AddButton';
import { useGetMovies, useRemoveMovie, useUpdateMovie, useAddMovie } from '@hooks/useAdmin';
import { useInlineEdit } from '@hooks/useInlineEdit';


const IntegratedButton = ({ onImportData, isLoading = false }) => (
    <div className="absolute right-1/12 z-10 flex items-end gap-4 lg:top-1/7 xl:top-[10vh]">
        <AddButton text="Add Movie" />
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

const MovieManagePage = () => {
    const { getMovies, movies, loading } = useGetMovies();
    const { removeMovie, loading: removeLoading } = useRemoveMovie();
    const { updateMovie } = useUpdateMovie();
    const { addMovie, loading: addLoading } = useAddMovie();
    
    const [tickedMovies, setTickedMovies] = useState(new Set());
    const [showConfirmDeleteMovies, setShowConfirmDeleteMovies] = useState(false);
    const [importLoading, setImportLoading] = useState(false);

    // Initialize inline editing hook
    const {
        editingCell,
        startEdit,
        saveEdit,
        cancelEdit,
        isUpdating
    } = useInlineEdit(updateMovie, getMovies);

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

    // Define which columns are editable (by index) and their corresponding field names
    const editableColumns = [1, 2, 3, 4, 5, 6, 7, 8]; // Movie Title, Description, Release Date, Genre, Duration, Age Rating, Trailer, Poster (removing Status since it uses ActiveButton)
    const columnFieldMapping = {
        1: 'title',
        2: 'description', 
        3: 'releaseDate',
        4: 'genre',
        5: 'duration',
        6: 'ageRating',
        7: 'trailerURL',
        8: 'posterURL',
        9: 'status' // Add status field mapping
    };

    // Handle starting inline edit
    const handleStartEdit = (rowIndex, columnIndex, currentValue) => {
        // Allow editing without expansion requirement and if not already updating and column is editable
        if (editableColumns.includes(columnIndex) && !isUpdating) {
            startEdit(rowIndex, columnIndex, currentValue);
        }
    };

    // Handle saving inline edit
    const handleSaveEdit = async (rowIndex, columnIndex, newValue) => {
        const movie = movies[rowIndex];
        const fieldName = columnFieldMapping[columnIndex];
        
        if (movie && fieldName) {
            const movieId = movie.id || movie._id;
            
            // Special handling for genre field (convert comma-separated string to array)
            let processedValue = newValue;
            if (fieldName === 'genre') {
                processedValue = newValue.split(',').map(g => g.trim()).filter(Boolean);
            }
            
            try {
                await saveEdit(movieId, fieldName, processedValue);
            } catch (error) {
                console.error('Failed to save edit:', error);
                // Could add toast notification here for user feedback
            }
        }
    };

    // Handle status change from ActiveButton
    const handleStatusChange = async (rowIndex, newStatus) => {
        const movie = movies[rowIndex];
        if (movie) {
            const movieId = movie.id || movie._id;
            try {
                await saveEdit(movieId, 'status', newStatus);
            } catch (error) {
                console.error('Failed to save status:', error);
            }
        }
    };

    const movieRows = movies?.map((movie, index) => [
        'TickButton',
        movie.title || movie.name || '',
        movie.description || '',
        movie.releaseDate || '',
        Array.isArray(movie.genre) ? movie.genre.join(', ') : (movie.genre || ''), // Format genre array as comma-separated string
        movie.duration || '',
        movie.ageRating || '', // Use ageRating instead of audienceType
        movie.trailerURL || '', // Use trailerURL (capital URL)
        movie.posterURL || '', // Use posterURL (capital URL)
        { type: 'ActiveButton', status: movie.status, rowIndex: index }, // Pass actual status and row index
        'PreviewButton'
    ]) || [];

    const handleDelete = async () => {
        const selectedMovieIds = Array.from(tickedMovies).map(index => {
            return movies[index]?.id || movies[index]?._id;
        }).filter(Boolean);
        
        try {
            // Delete each selected movie
            for (const movieId of selectedMovieIds) {
                await removeMovie(movieId);
            }
            
            // Refresh the movie list
            await getMovies();
            setTickedMovies(new Set());
            setShowConfirmDeleteMovies(false);
        } catch (error) {
            console.error('Failed to delete movies:', error);
        }
    };

    // Import movies from Excel
    const handleImportData = async (parsedData) => {
        if (!parsedData || parsedData.length === 0) {
            alert('No valid data found in the file');
            return;
        }

        setImportLoading(true);
        
        try {
            let successCount = 0;
            let errorCount = 0;
            const errors = [];

            for (const movieData of parsedData) {
                try {
                    // Validate required fields
                    if (!movieData.title) {
                        errors.push(`Row ${movieData.rowIndex + 1}: Movie title is required`);
                        errorCount++;
                        continue;
                    }

                    // Prepare movie data for API
                    const movieToAdd = {
                        title: movieData.title,
                        description: movieData.description,
                        releaseDate: movieData.releaseDate,
                        genre: movieData.genre,
                        duration: movieData.duration,
                        ageRating: movieData.ageRating,
                        trailerURL: movieData.trailerURL,
                        posterURL: movieData.posterURL,
                        status: movieData.status || 'Active'
                    };

                    const result = await addMovie(movieToAdd);
                    
                    if (result.success) {
                        successCount++;
                    } else {
                        errors.push(`Row ${movieData.rowIndex + 1}: ${result.error || 'Failed to add movie'}`);
                        errorCount++;
                    }
                } catch (error) {
                    errors.push(`Row ${movieData.rowIndex + 1}: ${error.message || 'Unknown error'}`);
                    errorCount++;
                }
            }

            // Show results
            let message = `Import completed!\nSuccessfully imported: ${successCount} movies`;
            if (errorCount > 0) {
                message += `\nFailed: ${errorCount} movies`;
                if (errors.length > 0) {
                    message += `\n\nErrors:\n${errors.slice(0, 5).join('\n')}`;
                    if (errors.length > 5) {
                        message += `\n... and ${errors.length - 5} more errors`;
                    }
                }
            }
            
            alert(message);

            // Refresh the movie list if any movies were added
            if (successCount > 0) {
                await getMovies();
            }

        } catch (error) {
            console.error('Import error:', error);
            alert('An error occurred during import. Please try again.');
        } finally {
            setImportLoading(false);
        }
    };

    const header = ['', 'Movie Title', 'Description', 'Release Date', 'Genre', 'Duration (min)', 'Age Rating', 'Trailer', 'Poster', 'Status', 'Preview'];

    // Configuration for Movie table columns without ID column
    const movieColumnConfig = [
        { width: 'w-12', truncate: false },    // TickButton - checkbox column
        { width: 'w-52', truncate: true },     // Movie Title - wider since no ID column
        { width: 'w-82', truncate: true },     // Description - largest column, truncated
        { width: 'w-40', truncate: false },    // Release Date - date column
        { width: 'w-40', truncate: true },     // Genre - wider for comma-separated genres
        { width: 'w-20', truncate: false },    // Duration - small column for numbers
        { width: 'w-24', truncate: false },    // Age Rating - moderate width
        { width: 'w-20', truncate: true },    // Trailer - button column
        { width: 'w-40', truncate: true },    // Poster - button column
        { width: 'w-20', truncate: false },    // ActiveButton - action column
        { width: 'w-24', truncate: false }     // Preview - action column
    ];
    const formatReleaseDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toISOString().split('T')[0];
    };

    // Format movieRows with formatted release date
    const formattedMovieRows = movieRows.map(row => {
        const newRow = [...row];
        newRow[3] = formatReleaseDate(row[3]);
        return newRow;
    });

    return (
        <StaffLayout backgroundClass="bg-zinc-300/70">
            <MobileNotSupported>
                <SearchButton />
                {tickedMovies.size > 0 ? (
                    <DeleteButton 
                        onClicked={() => setShowConfirmDeleteMovies(true)} 
                        disabled={removeLoading}
                    />
                ) : (
                    <IntegratedButton 
                        onImportData={handleImportData}
                        isLoading={loading || importLoading || addLoading}
                    />
                )}
                {showConfirmDeleteMovies && (
                    <ConfirmationModal 
                        item={tickedMovies.size} 
                        handleDelete={handleDelete} 
                        onClose={() => setShowConfirmDeleteMovies(false)}
                        loading={removeLoading}
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
                        onCancelEdit={cancelEdit}
                        isUpdating={isUpdating}
                        onStatusChange={handleStatusChange}
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
