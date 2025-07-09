const MovieCard = ({linkImg, page}) => {
    return (
        <div className={`h-full bg-transparent justify-start overflow-hidden shadow-lg
            ${page === "MovieList" ? "w-full h-full" : "xl:min-w-1/6 lg:min-w-1/4 min-w-1/3"}
            `}>
            <img src={linkImg}  alt={Movie poster} className="h-full w-full object-cover xl:rounded-2xl lg:rounded-xl md:rounded-lg rounded-sm" />
        </div>
    );
}

export default MovieCard;
