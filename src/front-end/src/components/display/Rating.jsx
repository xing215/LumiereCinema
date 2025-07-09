import { Star } from "lucide-react";

const Rating = ({ rated = 0 , user = 0}) => {
    return (
        <div className="flex items-center
        xl:py-2 md:py-1
        xl:gap-2 lg:gap-1.5 md:gap-1 gap-0.5">
            {Array.from({ length: 5 }, (_, i) => {
                const isFull = i + 1 <= rated;
                const isHalf = i + 0.5 <= rated;

                return (
                    <div key={i} className="relative
                    xl:w-8 lg:w-7 md:w-6 w-5
                    xl:h-8 lg:h-7 md:h-6 h-5">
                        <Star className="w-full h-full text-gray-300" />
                        {isFull && (
                            <Star className="w-full h-full text-yellow-400 fill-yellow-400 absolute top-0 left-0" />
                        )}
                        {isHalf && (
                            <Star
                                className="w-full h-full text-yellow-400 fill-yellow-400 absolute top-0 left-0"
                                style={{ clipPath: "inset(0 50% 0 0)" }}
                            />
                        )}
                    </div>
                );
            })}

            <p className="font-normal font-libre-franklin
            xl:text-2xl lg:text-xl md:text-[16px] text-sm"> - {user} {user > 2 ? "users" : "user"}</p>
        </div>
    );
};

export default Rating;
