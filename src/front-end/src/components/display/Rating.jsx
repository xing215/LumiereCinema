import { Star } from 'lucide-react';

const Rating = ({ rated = 0, user = 0 }) => {
    return (
        <div className="flex items-center gap-2 md:gap-3 lg:gap-4 xl:gap-5 md:py-1 xl:py-2">
            <div className="flex items-center gap-0.5 md:gap-1 lg:gap-1.5 xl:gap-2">
                {Array.from({ length: 5 }, (_, i) => {
                    const halfPercent = (rated - i) * 100;
                    return (
                        <div key={i} className="relative h-5 w-5 md:h-6 md:w-6 lg:h-7 lg:w-7 xl:h-8 xl:w-8">
                            <Star className="h-full w-full text-gray-300" />
                            <Star className="absolute top-0 left-0 h-full w-full fill-yellow-400 text-yellow-400" style={{ clipPath: `inset(0 ${100 - halfPercent}% 0 0)` }} />
                        </div>
                    );
                })}
            </div>
            <p className="font-libre-franklin text-sm font-normal md:text-[16px] lg:text-xl xl:text-2xl">
                {user} {user !== 1 ? 'users' : 'user'}
            </p>
        </div>
    );
};

export default Rating;
