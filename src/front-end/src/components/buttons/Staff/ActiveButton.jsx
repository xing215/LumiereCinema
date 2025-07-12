import {useState} from "react";
import {Square, SquareCheckBig} from "lucide-react";

const ActiveButton = () => {
    const [checked, setChecked] = useState(false);

    const handleClick = () => {
        setChecked((prev) => !prev);
    };

    return (
        <button onClick={handleClick} className="h-5 w-5 cursor-pointer">
            {checked ? <SquareCheckBig className="h-full w-full" /> : <Square className="h-full w-full" />}
        </button>
    );
};

export default ActiveButton;