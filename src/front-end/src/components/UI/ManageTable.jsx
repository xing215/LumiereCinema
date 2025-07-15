import RowTemplate from './ManageTable/RowTemplate.jsx';
import Header from './ManageTable/Header.jsx';

const ManageTable = ({ data, anyTicked, setTickedRows, onEdit, onEditSeat, header }) => {
    const handleTick = (rowIndex) => {
        setTickedRows((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(rowIndex)) {
                newSet.delete(rowIndex);
            } else {
                newSet.add(rowIndex);
            }
            return newSet;
        });
    };

    return (
        <div className="absolute top-1/4 left-1/2 w-[90%] -translate-x-1/2 transform lg:h-[65%] xl:h-[60%]">
            <Header Data={header} />
            <RowTemplate data={['null']} />
            <div className="no-scrollbar relative flex h-[90%] w-full flex-col items-center overflow-x-auto">
                {data.map((row, index) => (
                    <RowTemplate key={index} data={row} isHeader={false} checked={anyTicked.has(index)} rowIndex={index} onTicked={() => handleTick(index)} onEdit={onEdit} onEditSeat={onEditSeat} />
                ))}
            </div>
        </div>
    );
};

export default ManageTable;
