import ScreenIcon from '../../assets/img/Screen.svg';
import Seat from '../UI/Seat.jsx';
import CoupleSeat from '../UI/CoupleSeat.jsx';

const SeatLayout = (props) => {
    return (
        <div className="relative flex h-full flex-col items-center justify-center gap-5 lg:gap-5">
            <img src={ScreenIcon} alt="Screen" className="relative object-contain" />
            <div className="relative flex flex-col items-start gap-1.5 lg:gap-2 xl:gap-3">
                {props.data.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex items-center gap-2 lg:gap-2 xl:gap-3">
                        <p className="font-unbounded w-9 justify-start self-stretch text-center text-sm font-bold text-white md:text-[18px] xl:text-xl">{row[0]?.row}</p>
                        {(() => {
                            const seats = [];
                            for (let i = 0; i < row.length; i++) {
                                const current = row[i];
                                const next = row[i + 1];

                                if (current.type === 'Couple' && next?.type === 'Couple') {
                                    // Gộp thành CoupleSeat
                                    seats.push(<CoupleSeat key={`${rowIndex}-${i}`} />);
                                    i++; // Bỏ qua ghế tiếp theo
                                } else {
                                    seats.push(<Seat key={`${rowIndex}-${i}`} type={current.type} />);
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

export default SeatLayout;
