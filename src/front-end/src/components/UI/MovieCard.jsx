const MovieCard = ({ linkImg, page }) => {
    return (
        <div className={`h-full aspect-[300/470] justify-start overflow-hidden bg-transparent shadow-lg ${page === 'Home' ? 'min-w-1/3 lg:min-w-1/4 xl:min-w-1/6' : 'h-full w-full'} `}>
            <img src={linkImg} alt="Movie" className="h-full w-full rounded-sm object-cover md:rounded-lg lg:rounded-xl xl:rounded-2xl" />
        </div>
    );
};

export default MovieCard;
