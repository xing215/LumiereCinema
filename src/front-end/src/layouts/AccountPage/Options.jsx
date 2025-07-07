import NavButton from '../../components/buttons/navButton.jsx';

// const textClass = "w-[230px] text-white text-[23px] font-bold";
// const textStyle = {
//   fontFamily: "Mina",
//   fontStyle: "normal",
//   lineHeight: "normal",
// };

// const lineClass = "h-[1px] w-full";
// const lineStyle = {
//         background: 'rgba(217, 217, 217, 0.4)',
//         mixBlendMode: 'color-dodge'
//     };

const Options = () => {
    return (
        <div className="relative top-0 left-0 w-[270px] h-[328px] mix-blend-color-dodge bg-zinc-300/30 flex-shrink-0 rounded-[12px] flex flex-col gap-3" 
        >
            <div className="w-[270px] h-[88px] mix-blend-color-dodge bg-zinc-300/30 rounded-xl flex flex-col items-center"
            >
                <div className="w-60 justify-start text-white text-xl font-bold font-['Mina']">Welcome</div>
                <div className="w-60 justify-start text-white text-xl font-bold font-['Mina']">Vương Ngũ Tiếng Thành</div>
            </div>

            {/* <div className="flex flex-col gap-3"> */}
            <NavButton name="Information" />
            {/* <div className={lineClass} style={lineStyle} /> */}
            <div className="w-[270px] h-0.5 mix-blend-color-dodge bg-zinc-300/30" />

            <NavButton name="Wishlist" />
            {/* <div className={lineClass} style={lineStyle} /> */}
            <div className="w-[270px] h-0.5 mix-blend-color-dodge bg-zinc-300/30" />

            <NavButton name="Watch history" />
            {/* <div className={lineClass} style={lineStyle} /> */}
            <div className="w-[270px] h-0.5 mix-blend-color-dodge bg-zinc-300/30" />

            <NavButton name="Lunar points" />
            
            {/* </div> */}

        </div>
    );
}

export default Options;