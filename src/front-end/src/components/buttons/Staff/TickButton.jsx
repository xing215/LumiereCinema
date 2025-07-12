import { Square, SquareCheckBig } from 'lucide-react';

const TickButton = (props) => {
    return (
        <button onClick={props.onTick} className="h-5 w-5 cursor-pointer">
            {props.check ? <SquareCheckBig className="h-full w-full" /> : <Square className="h-full w-full" />}
        </button>
    );
};

export default TickButton;
