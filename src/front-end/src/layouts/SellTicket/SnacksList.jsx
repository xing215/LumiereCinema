import SnackSelect from '../../components/UI/SnackSelect';

const SnackList = ({ snacks = [], onSnackSelect, selectedSnacks = [] }) => {
    return (
        <div className="flex flex-col items-center justify-center w-full h-full overflow-hidden">
            <div className="flex items-start justify-center h-[80vh] rounded-xl overflow-hidden w-[90%] relative">
                <div className="absolute pointer-events-none inset-0 w-full h-full bg-zinc-300/30 mix-blend-color-dodge"/>
                <div className="flex flex-row flex-wrap gap-4 items-start justify-center w-full h-auto max-h-full py-4 px-6 overflow-y-scroll">
                    {Array.isArray(snacks) && snacks.length > 0 ? (
                        snacks.filter(snack => snack.stock > 0).map(snack => {
                            const selected = selectedSnacks.find(s => s.shortname === snack.shortname);
                            return (
                                <SnackSelect
                                    key={snack._id}
                                    snack_type={snack.name}
                                    description={snack.description}
                                    price={snack.price}
                                    onAdd={() => onSnackSelect(snack.shortname, (selected?.quantity || 0) + 1)}
                                    onRemove={() => onSnackSelect(snack.shortname, Math.max((selected?.quantity || 0) - 1, 0))}
                                    quantity={selected?.quantity || 0}
                                    img={snack.imageURL}
                                    stock={snack.stock}
                                />
                            );
                        })
                    ) : (
                        <div className="text-white w-auto m-auto font-['Unbounded']">No snacks available.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SnackList;