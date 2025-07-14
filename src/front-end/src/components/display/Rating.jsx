import { Star } from 'lucide-react';

const Rating = ({ rated = 0, user = 0 }) => {
    return (
        <div className="flex items-center gap-0.5 md:gap-1 md:py-1 lg:gap-1.5 xl:gap-2 xl:py-2">
            {Array.from({ length: 5 }, (_, i) => {
                const isFull = i + 1 <= rated;
                const isHalf = i + 0.5 <= rated;

                return (
                    <div key={i} className="relative h-5 w-5 md:h-6 md:w-6 lg:h-7 lg:w-7 xl:h-8 xl:w-8">
                        <Star className="h-full w-full text-gray-300" />
                        {isFull && <Star className="absolute top-0 left-0 h-full w-full fill-yellow-400 text-yellow-400" />}
                        {isHalf && <Star className="absolute top-0 left-0 h-full w-full fill-yellow-400 text-yellow-400" style={{ clipPath: 'inset(0 50% 0 0)' }} />}
                    </div>
                );
            })}

            <p className="font-libre-franklin text-sm font-normal md:text-[16px] lg:text-xl xl:text-2xl">
                {' '}
                - {user} {user !== 1 ? 'users' : 'user'}
            </p>
        </div>
    );
};

export default Rating;
