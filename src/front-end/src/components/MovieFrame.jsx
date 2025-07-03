const MovieFrame = ({linkImg}) => {
    return (
        <div className="h-full min-w-1/6 justify-start overflow-hidden top-65 shadow-lg">
            <img src={linkImg}  alt={linkImg} className="h-full w-full object-cover rounded-2xl" />
        </div>
    );
}

export default MovieFrame;