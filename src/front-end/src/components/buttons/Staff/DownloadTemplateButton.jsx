import { Download } from 'lucide-react';

const DownloadTemplateButton = () => {
    return (
        <button className="relative z-20 flex h-8 w-44 items-center justify-center gap-1 text-sm font-medium text-slate-950 underline hover:cursor-pointer">
            Download template
            <Download className="h-4 text-slate-950" />
        </button>
    );
};

export default DownloadTemplateButton;