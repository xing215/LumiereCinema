import { GalleryThumbnails } from 'lucide-react';

const PreviewButton = () => {

    return (
        <button className="h-5 w-full cursor-pointer">
            <GalleryThumbnails className="w-full h-full"/>
        </button>
    );
};

export default PreviewButton;
