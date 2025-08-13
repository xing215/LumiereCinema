// =============================================================================
// IMPORTS
// =============================================================================

// No imports needed - pure React component

// =============================================================================
// MOVIE CARD COMPONENT
// =============================================================================

const MovieCard = ({ movie, onSelect }) => {
    return (
        <div className="relative flex min-h-auto w-[32%] cursor-pointer flex-row overflow-hidden rounded-xl md:h-[110px]" onClick={() => onSelect(movie)}>
            <div className="pointer-events-none absolute inset-0 h-full w-full bg-zinc-300/30 mix-blend-color-dodge" />

            <img className="z-1 aspect-square object-cover" src={movie.posterURL} />

            <div className="h-auto w-full flex-1">
                <div className="flex h-auto w-full flex-col justify-between p-4">
                    <div className="text-md line-clamp-2 h-auto pl-2 font-['Unbounded'] font-bold text-white">{movie.title}</div>

                    {movie?.closestSchedule && (
                        <div className="h-auto pt-2 pl-2 font-['Unbounded'] text-[13px] font-light text-white">
                            {(() => {
                                if (!movie?.closestSchedule.startTime) return '';
                                const startDate = new Date(movie.closestSchedule.startTime);
                                const vnOptions = { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit', hour12: false };
                                const today = new Date();
                                const isToday = startDate.getDate() === today.getDate() && startDate.getMonth() === today.getMonth() && startDate.getFullYear() === today.getFullYear();

                                if (isToday) {
                                    return `${startDate.toLocaleTimeString('en-US', vnOptions)} - ${movie?.remainingSeats} seats left`;
                                } else {
                                    return `${startDate.toLocaleDateString('en-GB')}`;
                                }
                            })()}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// =============================================================================
// MAIN MOVIE LIST COMPONENT
// =============================================================================

const MovieList = ({ movies, loading, onMovieSelect }) => {
    // =============================================================================
    // DATA PROCESSING
    // =============================================================================

    const sortedMovies = [...movies].sort((a, b) => {
        const aTime = a?.closestSchedule?.startTime ? new Date(a.closestSchedule.startTime).getTime() : Infinity;
        const bTime = b?.closestSchedule?.startTime ? new Date(b.closestSchedule.startTime).getTime() : Infinity;
        return aTime - bTime;
    });

    // =============================================================================
    // COMPONENT RENDER
    // =============================================================================

    return (
        <div className="flex h-full w-full flex-col items-center justify-center overflow-hidden">
            <div className="relative flex h-[80vh] w-[90%] items-start justify-center overflow-hidden rounded-xl">
                <div className="pointer-events-none absolute inset-0 h-full w-full bg-zinc-300/30 mix-blend-color-dodge" />

                <div className="flex h-auto max-h-full w-full flex-row flex-wrap items-start justify-start gap-4 overflow-y-scroll px-6 py-4">
                    {loading ? (
                        <div className="md:text-md mx-2 h-auto items-center justify-center font-['Unbounded'] text-base font-black text-white">• • •</div>
                    ) : (
                        sortedMovies.map((movie) => <MovieCard key={movie._id} movie={movie} onSelect={onMovieSelect} />)
                    )}
                </div>
            </div>
        </div>
    );
};

export default MovieList;
