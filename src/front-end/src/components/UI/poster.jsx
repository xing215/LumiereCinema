const Poster = ({Pics}) => {
    return (
        <div className="relative h-auto w-screen">
            <img
                src={Pics}
                alt="Poster"
                className="z-10 lg:pt-10 sm:pt-8 pt-7 lg:w-[95%] sm:w-[98%] max-h-screen object-contain mx-auto"
            />
        </div>
    )
}


export default Poster;