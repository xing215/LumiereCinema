const SeeMoreButton = () => {
    return (
        <button className="relative z-20 left-1/2 transform -translate-x-1/2
            lg:w-64 sm:w-46 w-25
            lg:h-9 sm:h-7 h-4
            bg-pink-400
            lg:rounded-xl sm:rounded-lg rounded-md
            shadow-[inset_0px_0px_50px_3px_rgba(155,47,255,1.00)]
            text-white font-bold font-['Unbounded']
            flex items-center justify-center
            lg:text-lg md:text-sm text-[8px]">
            SEE MORE
        </button>
    );
};

export default SeeMoreButton;