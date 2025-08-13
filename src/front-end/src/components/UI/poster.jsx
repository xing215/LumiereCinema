const Poster = ({ Pics, className = '' }) => {
    return (
        <div className="relative h-auto w-screen">
            <img src={Pics} alt="Poster" className={`z-10 mx-auto max-h-screen rounded-xl object-contain pt-7 sm:w-[98%] sm:pt-8 lg:w-[95%] lg:pt-10 ${className}`} />
        </div>
    );
};

export default Poster;
