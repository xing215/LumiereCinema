import BuyATicketButton from '../../components/buttons/buyATicketButton.jsx';
import Poster from '../../assets/sample/ThamTuKien.jpg';
import Rating from '../../components/display/Rating.jsx';
import WishlistButton from '../../components/buttons/wishlistButton.jsx';

const Description = ({ scripts }) => {
    return (
        <div className="relative flex flex-col items-center">
            <p className="font-unbounded justify-start text-center text-lg font-medium text-white sm:text-2xl md:text-3xl lg:text-4xl">DESCRIPTION</p>
            <p className="font-libre-franklin py-1 text-start text-xs font-normal text-white sm:text-lg md:py-2 md:text-xl lg:py-3 lg:text-2xl">{scripts}</p>
        </div>
    );
};
const MovieInfo = () => {
    return (
        <div className="relative z-20 flex w-full flex-col bg-slate-950">
            <div className="relative flex w-full gap-5 md:gap-12">
                <div className="relative left-0 h-60 w-[53%] md:h-90 md:w-[45%] lg:h-95 lg:w-[30%] xl:h-105 xl:w-[22%]">
                    <div className="absolute h-full w-full -translate-y-1/7 transform md:-translate-y-1/6 lg:-translate-y-1/4 xl:-translate-y-1/5">
                        <img src={Poster} alt="Poster" className="h-full w-full rounded-xl object-cover" />
                    </div>
                </div>

                <div className="font-unbounded flex w-[75%] flex-col text-left text-white">
                    <p className="text-lg font-black [text-shadow:_0px_4px_4px_rgb(0_0_0_/_0.25)] sm:text-xl md:text-3xl lg:text-4xl xl:text-5xl">Khủng long xanh du hành thế giới truyện tranh</p>

                    <p className="pt-1 text-[10px] font-black sm:pt-2 sm:text-[12px] md:text-sm xl:text-base">23.05 - 01.06</p>

                    <p className="pt-1 text-[10px] font-medium sm:pt-2 sm:text-[12px] md:text-sm xl:text-base">KINH DỊ - TRINH THÁM</p>

                    <p className="py-1 text-[10px] font-medium sm:py-2 sm:text-[12px] md:text-sm xl:text-base">125' - T15</p>

                    <div className="w-full md:h-2 xl:h-4" />

                    <Rating rated={3.6} user={100} />

                    <div className="h-2 w-full" />

                    <div className="flex gap-2 md:gap-4 lg:gap-6 xl:gap-8">
                        <BuyATicketButton />
                        <WishlistButton />
                    </div>
                </div>
            </div>
            <div className="h-3 w-full md:h-5 lg:h-10" />
            <Description
                scripts="Thám Tử Kiên là nhân vật được yêu thích trong tác phẩm điện của ăn khách của NGƯỜI VỢ CUỐI CÙNG của Victor Vũ.
            Thám Tử Kiên: Kỳ Án Không Đầu sẽ là một phim Victor Vũ trở về với thể loại sở trường Kinh Dị – Trinh Thám sau những tác phẩm tình cảm lãng mạn."
            />
        </div>
    );
};

export default MovieInfo;
