import { useState } from 'react';

export const useMovieValidation = () => {
    const [validationErrors, setValidationErrors] = useState([]);

    const validateMovie = (movieData, rowIndex = 0, existingMovies = []) => {
        const errors = [];

        // Required fields validation
        if (!movieData.title?.trim()) {
            errors.push(`Row ${rowIndex + 1}: Movie title is required`);
        } else {
            // Check for duplicate movie title in existing database
            const duplicateMovie = existingMovies.find((movie) => movie.title?.toLowerCase().trim() === movieData.title.toLowerCase().trim());

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
    };

    const validateMoviesBatch = (moviesData, existingMovies = []) => {
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
                    genre: Array.isArray(movieData.genre)
                        ? movieData.genre
                        : movieData.genre
                          ? movieData.genre
                                .split(',')
                                .map((g) => g.trim())
                                .filter(Boolean)
                          : [],
                    duration: movieData.duration ? parseInt(movieData.duration) : 0,
                    ageRating: movieData.ageRating || 'P',
                    director: movieData.director?.trim() || '',
                    cast: Array.isArray(movieData.cast)
                        ? movieData.cast
                        : movieData.cast
                          ? movieData.cast
                                .split(',')
                                .map((c) => c.trim())
                                .filter(Boolean)
                          : [],
                    language: movieData.language?.trim() || '',
                    trailerURL: movieData.trailerURL?.trim() || '',
                    posterURL: movieData.posterURL?.trim() || '',
                    isHidden: movieData.isHidden !== undefined ? movieData.isHidden : true,
                    ratingsAverage: 0,
                    ratingsQuantity: 0,
                    // Add temporary ID for frontend tracking
                    tempId: `temp_${Date.now()}_${index}`,
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
            hasErrors: allErrors.length > 0,
        };
    };

    const clearValidationErrors = () => {
        setValidationErrors([]);
    };

    return {
        validateMovie,
        validateMoviesBatch,
        validationErrors,
        clearValidationErrors,
    };
};
