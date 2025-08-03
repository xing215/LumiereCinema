import ScreenIcon from '@assets/img/Screen.svg';
import Seat from '@components/UI/Seat.jsx';
import CoupleSeat from '@components/UI/CoupleSeat.jsx';

const SeatLayout = (props) => {
    // Extract props for edit mode
    const { 
        data, 
        isEditable = false, 
        onSeatClick, 
        selectedSeatType, 
        highlightedSeats = [] 
    } = props;

    // For edit mode, handle seats data differently
    const seatData = isEditable ? prepareSeatDataForEdit(data) : data;

    return (
        <div className="relative flex h-full flex-col items-center justify-center gap-5 lg:gap-5">
            {isEditable ? (
                <div className="bg-gray-300 h-4 w-48 rounded-t-lg flex items-center justify-center">
                    <span className="text-black text-sm font-bold">SCREEN</span>
                </div>
            ) : (
                <img src={ScreenIcon} alt="Screen" className="relative object-contain" />
            )}
            
            <div className="relative flex flex-col items-start gap-1.5 lg:gap-2 xl:gap-3">
                {seatData.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex items-center gap-2 lg:gap-2 xl:gap-3">
                        <p className="font-unbounded w-9 justify-start self-stretch text-center text-sm font-bold text-white md:text-[18px] xl:text-xl">
                            {row[0]?.row}
                        </p>
                        {(() => {
                            const seats = [];
                            for (let i = 0; i < row.length; i++) {
                                const current = row[i];
                                const next = row[i + 1];

                                if (current.type === 'Couple' && next?.type === 'Couple') {
                                    // Gộp thành CoupleSeat
                                    if (isEditable) {
                                        const isHighlighted = highlightedSeats.includes(current.seatNumber) || 
                                                            highlightedSeats.includes(next.seatNumber);
                                        
                                        seats.push(
                                            <div
                                                key={`${rowIndex}-${i}`}
                                                className={`cursor-pointer transition-all duration-200 ${
                                                    isHighlighted ? 'scale-110 ring-2 ring-blue-400' : ''
                                                } hover:scale-105`}
                                                onClick={() => {
                                                    console.log('🎭 [COUPLE_EDIT_CLICK]', {
                                                        seats: [current.seatNumber, next.seatNumber],
                                                        selectedType: selectedSeatType
                                                    });
                                                    onSeatClick?.([current, next]);
                                                }}
                                            >
                                                <CoupleSeat />
                                            </div>
                                        );
                                    } else {
                                        seats.push(<CoupleSeat key={`${rowIndex}-${i}`} />);
                                    }
                                    i++; // Bỏ qua ghế tiếp theo
                                } else {
                                    // Render single seat
                                    if (isEditable) {
                                        const isHighlighted = highlightedSeats.includes(current.seatNumber);
                                        const seatType = current.type || (current.isHidden ? 'Hidden' : 'Standard');
                                        
                                        seats.push(
                                            <div
                                                key={`${rowIndex}-${i}`}
                                                className={`cursor-pointer transition-all duration-200 ${
                                                    isHighlighted ? 'scale-110 ring-2 ring-blue-400' : ''
                                                } hover:scale-105`}
                                                onClick={() => {
                                                    console.log('🎭 [SINGLE_EDIT_CLICK]', {
                                                        seat: current.seatNumber,
                                                        currentType: seatType,
                                                        selectedType: selectedSeatType,
                                                        seatData: current
                                                    });
                                                    onSeatClick?.(current);
                                                }}
                                            >
                                                <Seat type={seatType} />
                                            </div>
                                        );
                                    } else {
                                        seats.push(<Seat key={`${rowIndex}-${i}`} type={current.type} />);
                                    }
                                }
                            }
                            return seats;
                        })()}
                    </div>
                ))}
            </div>
        </div>
    );
};

// Helper function to prepare seat data for edit mode
function prepareSeatDataForEdit(seats) {
    if (!seats || seats.length === 0) return [];
    
    // Group seats by row
    const seatsByRow = seats.reduce((acc, seat) => {
        const row = seat.location?.row || seat.row;
        if (!acc[row]) acc[row] = [];
        acc[row].push(seat);
        return acc;
    }, {});

    // Sort rows alphabetically and convert to array format
    const sortedRows = Object.keys(seatsByRow).sort();
    
    return sortedRows.map(rowLetter => {
        const rowSeats = seatsByRow[rowLetter].sort((a, b) => 
            (a.location?.column || a.column) - (b.location?.column || b.column)
        );
        return rowSeats.map(seat => ({
            ...seat,
            row: rowLetter
        }));
    });
}

export default SeatLayout;
