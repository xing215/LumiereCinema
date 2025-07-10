import {Search} from 'lucide-react'

const SearchButton = () => (
    <div className="flex items-center h-[36px] w-auto z-50 -translate-y-1">
        <div className="lg:w-[83px] md:w-[53px] sm:[33-px] w-[10px] h-full"/>
        <div className="lg:w-[15px] md:w-[10px] w-[5px] h-full"/>
        <button
            className="xl:w-[30px] lg:w-[25px] md:w-[15px] w-[12px]
            xl:h-[45px] lg:h-[40px] md:h-[30px] h-[25px]"
            aria-label="Search"
        >
            <Search className="w-full h-full text-white" strokeWidth={4}/>
        </button>
    </div>
);

export default SearchButton;
