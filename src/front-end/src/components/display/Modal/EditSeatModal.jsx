import SeatLayout from "../Seats.jsx";
import Seat from "../../UI/Seat.jsx";
import CoupleSeat from "../../UI/CoupleSeat.jsx";
import {Disc} from "lucide-react";

const DisplayButton = ({data}) => {
    return (
        <div className="relative w-[25%] h-7 bg-zinc-300/70 rounded-xl text-black font-bold font-unbounded text-center">
            {data}
        </div>
    )
}

const CancelButton = (props) => {
    return (
        <button className="w-40 h-8 relative flex items-center justify-center" onClick={props.onclick}>
            <div className="absolute inset-0 bg-slate-900 rounded-2xl shadow-[inset_0px_0px_60.654205322265625px_3.639252185821533px_rgba(155,47,255,1.00)]" />
            <span className="relative text-white text-lg font-bold font-unbounded z-10">
                CANCEL
            </span>
        </button>
    );
};

const ConfirmButton = () => {
    return (
        <button className="w-40 h-8 relative flex items-center justify-center">
            <div className="absolute inset-0 bg-pink-400 rounded-2xl shadow-[inset_0px_0px_60.654205322265625px_3.639252185821533px_rgba(155,47,255,1.00)]" />
            <span className="relative text-white text-lg font-bold font-unbounded z-10">
                CONFIRM
          </span>
        </button>
    );
};

const ScreenInformation = (props) => {
    return (
        <div className="relative flex flex-col items-start gap-4 w-full">
            <div className="w-full flex items-center gap-2">
                <p className="justify-start text-white text-lg font-bold font-libre-franklin">Screen:</p>
                <DisplayButton data={props.data?.[2]}/>
            </div>
            <div className="w-full flex items-center gap-2">
                <p className="justify-start text-white text-lg font-bold font-libre-franklin">Rows:</p>
                <DisplayButton data={props.data?.[3]}/>
            </div>
            <div className="w-full flex items-center gap-2">
                <p className="justify-start text-white text-lg font-bold font-libre-franklin">Columns:</p>
                <DisplayButton data={props.data?.[4]}/>
            </div>
        </div>
    )
}

const SeatInformation = () => {
    return (
        <div className="relative w-full flex flex-col items-start xl:gap-4 gap-2.5">

            <div className="flex justify-end items-center gap-2 w-full">
                <p className="w-[20%] justify-start text-white xl:text-lg text-base font-bold font-libre-franklin">Price</p>
                <p className="w-[20%] justify-start text-white xl:text-lg text-base font-bold font-libre-franklin">DPrice</p>
            </div>

            <div className="flex items-center justify-end gap-2 w-full">
                <div className="flex items-center gap-2 xl:w-40 w-35">
                    <Seat type="Normal"/>
                    <p className="text-white text-base font-bold font-libre-franklin capitalize">
                        Normal
                    </p>
                </div>
                <DisplayButton/>
                <DisplayButton/>
            </div>
            <div className="flex items-center justify-end gap-2 w-full">
                <div className="flex items-center gap-2 xl:w-40 w-35">
                    <Seat type="VIP"/>
                    <p className="text-white text-base font-bold font-libre-franklin capitalize">
                        VIP
                    </p>
                </div>
                <DisplayButton/>
                <DisplayButton/>
            </div>
            <div className="flex items-center justify-end gap-2 w-full">
                <div className="flex items-center gap-2 xl:w-40 w-35">
                    <CoupleSeat/>
                    <p className="text-white text-base font-bold font-libre-franklin capitalize">
                        Couple
                    </p>
                </div>
                <DisplayButton/>
                <DisplayButton/>
            </div>
            <div className="flex items-center justify-end gap-2 w-full">
                <div className="flex items-center gap-2 xl:w-40 w-35">
                    <Seat type="Hidden"/>
                    <p className="text-white text-base font-bold font-libre-franklin capitalize">
                        Hidden
                    </p>
                </div>
                <DisplayButton/>
                <DisplayButton/>
            </div>
        </div>
    )
}

const seatRows = [
    [ { row: "A", no: 1, type: "Normal" }, { row: "A", no: 2, type: "Couple" }, { row: "A", no: 3, type: "Couple" }, { row: "A", no: 4, type: "Normal" }, { row: "A", no: 5, type: "Normal" }, { row: "A", no: 6, type: "Normal" }, { row: "A", no: 7, type: "Normal" }, { row: "A", no: 8, type: "Normal" }, { row: "A", no: 9, type: "Normal" }, { row: "A", no: 10, type: "Normal" }, { row: "A", no: 11, type: "Normal" }, { row: "A", no: 12, type: "Normal" } ],
    [ { row: "B", no: 1, type: "Normal" }, { row: "B", no: 2, type: "Normal" }, { row: "B", no: 3, type: "Normal" }, { row: "B", no: 4, type: "Normal" }, { row: "B", no: 5, type: "Normal" }, { row: "B", no: 6, type: "Normal" }, { row: "B", no: 7, type: "Normal" }, { row: "B", no: 8, type: "Normal" }, { row: "B", no: 9, type: "Normal" }, { row: "B", no: 10, type: "Normal" }, { row: "B", no: 11, type: "Normal" }, { row: "B", no: 12, type: "Normal" } ],
    [ { row: "C", no: 1, type: "Normal" }, { row: "C", no: 2, type: "Normal" }, { row: "C", no: 3, type: "Normal" }, { row: "C", no: 4, type: "Normal" }, { row: "C", no: 5, type: "Normal" }, { row: "C", no: 6, type: "Normal" }, { row: "C", no: 7, type: "Normal" }, { row: "C", no: 8, type: "Normal" }, { row: "C", no: 9, type: "Normal" }, { row: "C", no: 10, type: "Normal" }, { row: "C", no: 11, type: "Normal" }, { row: "C", no: 12, type: "Normal" } ],
    [ { row: "D", no: 1, type: "Normal" }, { row: "D", no: 2, type: "Normal" }, { row: "D", no: 3, type: "Normal" }, { row: "D", no: 4, type: "Normal" }, { row: "D", no: 5, type: "Normal" }, { row: "D", no: 6, type: "Normal" }, { row: "D", no: 7, type: "Normal" }, { row: "D", no: 8, type: "Normal" }, { row: "D", no: 9, type: "Normal" }, { row: "D", no: 10, type: "Normal" }, { row: "D", no: 11, type: "Normal" }, { row: "D", no: 12, type: "Normal" } ],
    [ { row: "E", no: 1, type: "VIP" }, { row: "E", no: 2, type: "VIP" }, { row: "E", no: 3, type: "Normal" }, { row: "E", no: 4, type: "Normal" }, { row: "E", no: 5, type: "Normal" }, { row: "E", no: 6, type: "Normal" }, { row: "E", no: 7, type: "Normal" }, { row: "E", no: 8, type: "Normal" }, { row: "E", no: 9, type: "Normal" }, { row: "E", no: 10, type: "Normal" }, { row: "E", no: 11, type: "Normal" }, { row: "E", no: 12, type: "Normal" } ],
    [ { row: "F", no: 1, type: "VIP" }, { row: "F", no: 2, type: "VIP" }, { row: "F", no: 3, type: "Normal" }, { row: "F", no: 4, type: "Normal" }, { row: "F", no: 5, type: "Normal" }, { row: "F", no: 6, type: "Normal" }, { row: "F", no: 7, type: "Normal" }, { row: "F", no: 8, type: "Normal" }, { row: "F", no: 9, type: "Normal" }, { row: "F", no: 10, type: "Normal" }, { row: "F", no: 11, type: "Normal" }, { row: "F", no: 12, type: "Normal" } ],
    [ { row: "G", no: 1, type: "Normal" }, { row: "G", no: 2, type: "Normal" }, { row: "G", no: 3, type: "Couple" }, { row: "G", no: 4, type: "Couple" }, { row: "G", no: 5, type: "Normal" }, { row: "G", no: 6, type: "Normal" }, { row: "G", no: 7, type: "Normal" }, { row: "G", no: 8, type: "Normal" }, { row: "G", no: 9, type: "Normal" }, { row: "G", no: 10, type: "Normal" }, { row: "G", no: 11, type: "Normal" }, { row: "G", no: 12, type: "Hidden" } ],
    [ { row: "H", no: 1, type: "Normal" }, { row: "H", no: 2, type: "Normal" }, { row: "H", no: 3, type: "Normal" }, { row: "H", no: 4, type: "Normal" }, { row: "H", no: 5, type: "Normal" }, { row: "H", no: 6, type: "Normal" }, { row: "H", no: 7, type: "Normal" }, { row: "H", no: 8, type: "Normal" }, { row: "H", no: 9, type: "Normal" }, { row: "H", no: 10, type: "Normal" }, { row: "H", no: 11, type: "Normal" }, { row: "H", no: 12, type: "Hidden" } ],
    [ { row: "I", no: 1, type: "Normal" }, { row: "I", no: 2, type: "Normal" }, { row: "I", no: 3, type: "Normal" }, { row: "I", no: 4, type: "Normal" }, { row: "I", no: 5, type: "Normal" }, { row: "I", no: 6, type: "Normal" }, { row: "I", no: 7, type: "Normal" }, { row: "I", no: 8, type: "Normal" }, { row: "I", no: 9, type: "Normal" }, { row: "I", no: 10, type: "Normal" }, { row: "I", no: 11, type: "Normal" }, { row: "I", no: 12, type: "Normal" } ],
    [ { row: "J", no: 1, type: "Normal" }, { row: "J", no: 2, type: "Normal" }, { row: "J", no: 3, type: "Normal" }, { row: "J", no: 4, type: "Normal" }, { row: "J", no: 5, type: "Normal" }, { row: "J", no: 6, type: "Normal" }, { row: "J", no: 7, type: "Normal" }, { row: "J", no: 8, type: "Normal" }, { row: "J", no: 9, type: "Normal" }, { row: "J", no: 10, type: "Normal" }, { row: "J", no: 11, type: "Normal" }, { row: "J", no: 12, type: "Normal" } ]
];

const EditSeatModal = (props) => {
    return (
        <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[20px] z-50 ">
            <div className="fixed xl:inset-[5%] lg:inset-[10%] xl:bg-slate-900 lg:bg-slate-900/60 rounded-xl shadow-[8px_8px_20px_0px_rgba(0,0,0,0.25)] backdrop-blur-[20px]
            flex flex-col items-center justify-center gap-2">

                <div className="relative flex items-center w-full">
                    <div className="relative flex-col gap-4 xl:w-100 w-70 ml-[2%]">
                        <ScreenInformation data={props.screenData}/>
                        <SeatInformation/>
                    </div>
                    <div className="w-[10%]"/>
                    <div className="relative w-[60%] mr-[2%]">
                        <SeatLayout data={seatRows}/>
                    </div>
                </div>

                <div className="w-full h-[10%]"/>
                <div className="relative gap-4 items-center flex">
                    <CancelButton onclick={props.onClose}/>
                    <ConfirmButton/>
                </div>

            </div>
        </div>
    );
}

export default EditSeatModal;