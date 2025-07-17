const AddButton = (props) => {
    return (
        <button className="font-unbounded relative z-20 flex h-8 w-44 items-center justify-center rounded-md bg-pink-400 text-sm font-bold text-white shadow-[inset_0px_0px_50px_3px_rgba(155,47,255,1.00)] hover:cursor-pointer sm:rounded-lg lg:rounded-xl">
            {props?.text}
        </button>
    );
};

export default AddButton