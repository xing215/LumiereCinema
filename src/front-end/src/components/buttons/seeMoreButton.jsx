import { useNavigate } from "react-router-dom";
import { getMovieListPath } from "@/routes/routeConfig";
const SeeMoreButton = ( { statusFilter } ) => {
    const navigate = useNavigate();

    const handleSeeMoreClick = () => {
        navigate(getMovieListPath(statusFilter));
    };

    return (
        <button onClick={handleSeeMoreClick} className="relative left-1/2 z-20 flex h-10 w-25 -translate-x-1/2 transform items-center justify-center rounded-md bg-pink-400 font-['Unbounded'] text-[8px] font-bold text-white shadow-[inset_0px_0px_50px_3px_rgba(155,47,255,1.00)] hover:cursor-pointer sm:h-7 sm:w-46 sm:rounded-lg md:text-sm lg:h-9 lg:w-64 lg:rounded-xl lg:text-lg">
            SEE MORE
        </button>
    );
};

export default SeeMoreButton;
