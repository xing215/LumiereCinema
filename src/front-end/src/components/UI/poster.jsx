const Poster = ({Pics}) => {
    return (
        <img
            src={Pics}
            alt="Poster"
            className="relative z-10 pt-10 w-[90%] max-h-screen object-contain mx-auto"
        />
    )
}

export default Poster;