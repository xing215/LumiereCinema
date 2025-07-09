import BuyATicketButton from "../../components/buttons/buyATicketButton.jsx";
import Poster from "../../assets/sample/ThamTuKien.jpg";
import Rating from "../../components/display/Rating.jsx";
import WishlistButton from "../../components/buttons/wishlistButton.jsx";

const Description = ({scripts}) => {
    return (
      <div className="relative flex flex-col items-center">
          <p className="text-center justify-start text-white font-medium font-unbounded
          lg:text-4xl md:text-3xl sm:text-2xl text-lg">DESCRIPTION</p>
          <p className="font-libre-franklin text-white font-normal text-start
          lg:py-3 md:py-2 py-1
          lg:text-2xl md:text-xl sm:text-lg text-xs">{scripts}</p>
      </div>
    );
}
const MovieInfo = () => {
    return (
        <div className="relative w-full bg-slate-950 flex flex-col z-20">
            <div className="relative flex w-full
            md:gap-12 gap-5">

                <div className="relative left-0
                xl:w-[22%] lg:w-[30%] md:w-[45%] w-[53%]
                xl:h-105 lg:h-95 md:h-90 h-60">
                    <div className="absolute w-full h-full transform xl:-translate-y-1/5 lg:-translate-y-1/4 md:-translate-y-1/6 -translate-y-1/7">
                        <img src={Poster} alt="Poster" className="w-full h-full object-cover rounded-xl" />
                    </div>
                </div>

                <div className="flex flex-col text-left text-white font-unbounded w-[75%]">
                    <p className="font-black [text-shadow:_0px_4px_4px_rgb(0_0_0_/_0.25)]
                    xl:text-5xl lg:text-4xl md:text-3xl sm:text-xl text-lg">Khủng long xanh du hành thế giới truyện tranh</p>

                    <p className="font-black
                    xl:text-base md:text-sm sm:text-[12px] text-[10px]
                    sm:pt-2 pt-1">23.05 - 01.06</p>

                    <p className="font-medium
                    xl:text-base md:text-sm sm:text-[12px] text-[10px]
                    sm:pt-2 pt-1">KINH DỊ - TRINH THÁM</p>

                    <p className="font-medium
                    xl:text-base md:text-sm sm:text-[12px] text-[10px]
                    sm:py-2 py-1">125' - T15</p>

                    <div className="w-full
                    xl:h-4 md:h-2"/>

                    <Rating rated={3.6} user={100}/>

                    <div className="w-full h-2"/>

                    <div className="flex
                    xl:gap-8 lg:gap-6 md:gap-4 gap-2">
                        <BuyATicketButton/>
                        <WishlistButton/>
                    </div>
                </div>
            </div>
            <div className="w-full
            lg:h-10 md:h-5 h-3"/>
            <Description scripts="Thám Tử Kiên là nhân vật được yêu thích trong tác phẩm điện của ăn khách của NGƯỜI VỢ CUỐI CÙNG của Victor Vũ.
            Thám Tử Kiên: Kỳ Án Không Đầu sẽ là một phim Victor Vũ trở về với thể loại sở trường Kinh Dị – Trinh Thám sau những tác phẩm tình cảm lãng mạn."/>
        </div>
    );
}

export default MovieInfo