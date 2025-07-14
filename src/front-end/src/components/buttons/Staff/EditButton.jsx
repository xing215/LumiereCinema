import { SquarePen } from 'lucide-react';

const EditButton = ({ onClick }) => {
    return (
        <button onClick={onClick} className="h-5 w-5 hover:cursor-pointer">
            <SquarePen className="h-full w-full" />
        </button>
    );
};

export default EditButton;
