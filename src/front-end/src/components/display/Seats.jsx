import ScreenIcon from "../../assets/img/Screen.svg"
import Seat from "../UI/Seat.jsx"
import CoupleSeat from "../UI/CoupleSeat.jsx";

const SeatLayout = (props) => {
    return (
        <div className="flex flex-col xl:gap-10 gap-5 w-full h-full items-center justify-center">
            <img src={ScreenIcon} alt="Screen w-full" />

            <div className="flex flex-col items-center xl:gap-3 gap-2">
                {props.data.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex xl:gap-3 gap-2 items-center">
                        <p className="self-stretch w-9 text-center justify-start text-white xl:text-xl text-[18px] font-bold font-unbounded">
                            {row[0]?.row}
                        </p>
                        {(() => {
                            const seats = [];
                            for (let i = 0; i < row.length; i++) {
                                const current = row[i];
                                const next = row[i + 1];

                                if (
                                    current.type === "Couple" &&
                                    next?.type === "Couple"
                                ) {
                                    // Gộp thành CoupleSeat
                                    seats.push(
                                        <CoupleSeat key={`${rowIndex}-${i}`} />
                                    );
                                    i++; // Bỏ qua ghế tiếp theo
                                } else {
                                    seats.push(
                                        <Seat
                                            key={`${rowIndex}-${i}`}
                                            type={current.type}
                                        />
                                    );
                                }
                            }
                            return seats;
                        })()}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default SeatLayout;