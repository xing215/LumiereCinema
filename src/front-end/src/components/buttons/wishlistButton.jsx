import { Heart } from 'lucide-react';

const WishlistButton = () => {
    return (
        <div className="relative h-7 w-7 hover:cursor-pointer sm:h-10 sm:w-10 lg:h-11 lg:w-11 xl:h-12 xl:w-12">
            <Heart className="absolute h-full w-full" strokeWidth={1.5} />
        </div>
    );
};

export default WishlistButton;
