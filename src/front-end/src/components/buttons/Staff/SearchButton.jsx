const SearchButton = () => {
    return (
        <div className="absolute top-1/20 right-1/15 flex gap-2">
            <p className="font-unbounded text-base font-normal">Search: </p>
            <div className="h-6 w-60 rounded-lg bg-white hover:cursor-pointer" />
        </div>
    );
};

export default SearchButton;
