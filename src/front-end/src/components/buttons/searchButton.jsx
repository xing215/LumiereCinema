import { Search } from 'lucide-react';

const SearchButton = () => (
    <div className="z-50 flex h-[36px] w-auto -translate-y-1 items-center">
        <div className="sm:[33-px] h-full w-[10px] md:w-[53px] lg:w-[83px]" />
        <div className="h-full w-[5px] md:w-[10px] lg:w-[15px]" />
        <button className="h-[25px] w-[12px] hover:cursor-pointer md:h-[30px] md:w-[15px] lg:h-[40px] lg:w-[25px] xl:h-[45px] xl:w-[30px]" aria-label="Search">
            <Search className="h-full w-full text-white" strokeWidth={4} />
        </button>
    </div>
);

export default SearchButton;
