import { use } from 'react';

const MovieCard = ({ movie, onSelect }) => {
  return (
    <div className="md:h-[110px] min-h-auto w-[32%] flex flex-row relative rounded-xl overflow-hidden cursor-pointer " onClick={() => onSelect(movie)}>
            <div className="absolute pointer-events-none inset-0 w-full h-full bg-zinc-300/30 mix-blend-color-dodge"/>

      <img className="z-1 object-cover aspect-square" src={movie.posterURL} />
      <div className="w-full flex-1 h-auto">
        <div className=" w-full flex flex-col justify-between p-4 h-auto">
          <div className="pl-2  text-md font-bold h-auto font-['Unbounded'] line-clamp-2 text-white">{movie.title}</div>
          {movie?.closestSchedule && (
            <div className="text-[13px] h-auto pl-2 font-['Unbounded'] text-white pt-2 font-light">
              {(() => {
                if (!movie?.closestSchedule.startTime) return '';
                const startDate = new Date(movie.closestSchedule.startTime);
                const vnOptions = { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit', hour12: false  };
                const today = new Date();
                const isToday = startDate.getDate() === today.getDate() &&
                  startDate.getMonth() === today.getMonth() &&
                  startDate.getFullYear() === today.getFullYear();
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

const MovieList = ({ movies, loading, onMovieSelect }) => {

  // Sort movies by closestSchedule.startTime (ascending)
  const sortedMovies = [...movies].sort((a, b) => {
    const aTime = a?.closestSchedule?.startTime ? new Date(a.closestSchedule.startTime).getTime() : Infinity;
    const bTime = b?.closestSchedule?.startTime ? new Date(b.closestSchedule.startTime).getTime() : Infinity;
    return aTime - bTime;
  });


  return (
    <div className="flex flex-col items-center justify-center w-full h-full overflow-hidden">
      <div className="flex items-start justify-center h-[80vh] rounded-xl overflow-hidden  w-[90%] relative">
        <div className="absolute pointer-events-none inset-0 w-full h-full bg-zinc-300/30 mix-blend-color-dodge"/>
        <div className="flex flex-row flex-wrap gap-4 items-start justify-start w-full h-auto max-h-full py-4 px-6 overflow-y-scroll">
          {loading ? <div className="md:text-md h-auto items-center justify-center  font-['Unbounded'] text-base font-black text-white mx-2"> • • •</div> : 
          sortedMovies.map((movie) => (
            <MovieCard key={movie._id} movie={movie} onSelect={onMovieSelect} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MovieList;

