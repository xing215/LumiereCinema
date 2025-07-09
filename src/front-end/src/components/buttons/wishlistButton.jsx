import {Heart} from "lucide-react";

const WishlistButton = ({user}) => {
    return (
        <div className="relative
        xl:h-12 lg:h-11 sm:h-10 h-7
        xl:w-12 lg:w-11 sm:w-10 w-7">
            <Heart className="absolute w-full h-full" strokeWidth={1.5}/>
        </div>
    )
}

export default WishlistButton;