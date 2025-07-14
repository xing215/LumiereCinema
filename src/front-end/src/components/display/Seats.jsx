import ScreenIcon from '../../assets/img/Screen.svg';
import Seat from '../UI/Seat.jsx';
import CoupleSeat from '../UI/CoupleSeat.jsx';

const SeatLayout = (props) => {
    return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-5 xl:gap-10">
            <img src={ScreenIcon} alt="Screen w-full" />

            <div className="flex flex-col items-center gap-2 xl:gap-3">
                {props.data.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex items-center gap-2 xl:gap-3">
                        <p className="font-unbounded w-9 justify-start self-stretch text-center text-[18px] font-bold text-white xl:text-xl">{row[0]?.row}</p>
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
