import { useFetchProfile } from "@hooks/useUser";  
import { useEffect } from "react";

const MenuItems = ({name, onclick, hide=false, blur=false}) => {
return (
            <div className="relative w-full flex flex-col justify-start group">
            {hide ? null : <div className="relative w-full h-1 px-3 mix-blend-color-dodge bg-zinc-300/30" />}
            <button
                className={`relative cursor-pointer w-full h-auto py-3 text-center text-white md:text-md lg:text-lg font-normal font-['Unbounded'] ${blur ? 'group-hover:bg-gradient-to-t group-hover:from-transparent group-hover:to-amber-50/10' :'group-hover:mix-blend-color-dodge group-hover:bg-amber-50/7' }`}
                onClick={onclick}
            >
                {name}
            </button>
        </div>
    );
};

const SideBar = ({in_lunar_point=false}) => {
    const { fetchProfile, profile, loading, error } = useFetchProfile();
    useEffect(() => {
        fetchProfile();
    }, []);
    function toTitleCase(str) {
  return str?.replace(/\w\S*/g, (txt) =>
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}
    return (
        <div className="relative w-full h-auto rounded-xl overflow-hidden">
            {/* Header background overlays */}
            <div className="absolute w-full h-full inset-0 bg-zinc-300/30 mix-blend-color-dodge rounded-xl" />
            <div className="relative w-full h-auto mix-blend-color-dodge bg-zinc-300/30 rounded-xl">

            {/* Welcome and username */}
            <div className="relative flex flex-col items-start justify-start py-3 pl-5 gap-1">
            <div className=" relative text-white text-lg lg:text-xl font-bold font-['Libre_Franklin'] ">
                Welcome
            </div>
            <div className=" relative text-white text-md lg:text-lg leading-snug mr-2 font-bold font-['Libre_Franklin'] line-wrap">
                {loading ? "• • •" :  toTitleCase(profile?.name)}
            </div>
            </div>
            </div>
            {loading ? null : <>
            <MenuItems name="Information" onclick={() => console.log("Profile clicked")} hide={true} />
            <MenuItems name="Wishlist" onclick={() => console.log("Wishlist clicked")} />
            <MenuItems name="Watch history" onclick={() => console.log("Settings clicked")} />
            <MenuItems name="Lunar points" onclick={() => console.log("Settings clicked")} blur={true} />
            </>}



            {loading ? null : in_lunar_point ? null : <>
            <div className="relative w-full h-7"/>
            <div className="absolute right-2 bottom-2 text-right text-white text-[8px] font-light font-['Unbounded']">
                {profile?.loyaltyRank?.lunarPoints || 0}/{profile?.loyaltyRank?.rank === 'SILVER' ? '500' : '1000'}
            </div>

            <div className="absolute h-1 w-full bottom-0 bg-gradient-to-r from-pink-400 via-sky-400 to-amber-300" />
            <div className={`absolute h-1 w-[${100 - (profile?.loyaltyRank?.lunarPoints || 0) / (profile?.loyaltyRank?.rank === 'SILVER' ? 500 : 1000) * 100}%] right-0 bottom-0 bg-slate-950`} />
            </>}
            
        
        </div>
    );
};

export default SideBar;
