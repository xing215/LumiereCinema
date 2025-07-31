import { Download } from 'lucide-react';

const DownloadTemplateButton = ({ 
    templatePath, 
    filename, 
    buttonText = 'Download template',
    disabled = false 
}) => {
    const downloadTemplate = async () => {
        if (!templatePath || !filename) {
            console.error('Template path and filename are required');
            alert('Template configuration is missing. Please contact administrator.');
            return;
        }

        try {
            // Fetch the file
            const response = await fetch(templatePath);
            if (!response.ok) {
                throw new Error(`Failed to fetch template: ${response.status}`);
            }

            // Get the file as blob
            const blob = await response.blob();

            // Create a link element to download the file
            const link = document.createElement('a');
            const url = window.URL.createObjectURL(blob);
            link.href = url;
            link.download = filename;
            link.style.display = 'none';
            
            // Add to DOM, click, and remove
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Clean up the URL object
            window.URL.revokeObjectURL(url);
            
        } catch (error) {
            console.error('Error downloading template:', error);
            alert('Error downloading template file. Please try again.');
        }
    };

    return (
        <button 
            onClick={downloadTemplate}
            disabled={disabled}
            className="relative z-20 flex h-8 w-44 items-center justify-center gap-1 text-sm font-medium text-slate-950 underline hover:cursor-pointer hover:text-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {buttonText}
            <Download className="h-4 text-slate-950" />
        </button>
    );
};

export default DownloadTemplateButton;