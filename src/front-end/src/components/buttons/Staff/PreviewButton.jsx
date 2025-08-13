import { GalleryThumbnails } from 'lucide-react';

const PreviewButton = () => {
    return (
        <button className="h-5 w-full cursor-pointer">
            <GalleryThumbnails className="h-full w-full" />
        </button>
    );
};

export default PreviewButton;
