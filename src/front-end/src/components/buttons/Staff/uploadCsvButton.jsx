import { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import * as XLSX from 'xlsx';

const UploadCSVButton = ({ onDataParsed, templateType = 'movie', disabled = false }) => {
    const fileInputRef = useRef(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleFileClick = () => {
        if (!disabled && fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Check file type
        const fileExtension = file.name.split('.').pop().toLowerCase();
        if (!['xlsx', 'xls', 'csv'].includes(fileExtension)) {
            alert('Please upload a valid Excel (.xlsx, .xls) or CSV file');
            return;
        }

        setIsProcessing(true);

        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data, { type: 'array' });
            
            // Get first worksheet
            const worksheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[worksheetName];
            
            // Convert to JSON
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            
            if (jsonData.length === 0) {
                alert('The file appears to be empty or has no valid data');
                return;
            }

            // Validate and transform data based on template type
            const processedData = processUploadedData(jsonData, templateType);
            
            // Call parent callback with processed data
            if (onDataParsed) {
                onDataParsed(processedData);
            } else {
                console.log('Parsed data:', processedData);
                alert(`Successfully parsed ${processedData.length} rows of data`);
            }

        } catch (error) {
            console.error('Error processing file:', error);
            alert('Error processing file. Please check the file format and try again.');
        } finally {
            setIsProcessing(false);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const processUploadedData = (data, type) => {
        switch (type) {
            case 'movie':
                return data.map((row, index) => {
                    // Map Excel columns to movie fields
                    return {
                        title: row['Movie Title'] || '',
                        description: row['Description'] || '',
                        releaseDate: row['Release Date'] || '',
                        genre: typeof row['Genre'] === 'string' 
                            ? row['Genre'].split(',').map(g => g.trim()).filter(Boolean)
                            : [],
                        duration: parseInt(row['Duration (min)']) || 0,
                        ageRating: row['Age Rating'] || '',
                        trailerURL: row['Trailer URL'] || '',
                        posterURL: row['Poster URL'] || '',
                        status: row['Status'] || 'Active',
                        rowIndex: index
                    };
                });
            default:
                return data;
        }
    };

    return (
        <>
            <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                style={{ display: 'none' }}
            />
            <button 
                onClick={handleFileClick}
                disabled={disabled || isProcessing}
                className={`font-unbounded relative z-20 flex h-8 w-44 items-center justify-center gap-1 rounded-md text-sm font-bold text-white shadow-[inset_0px_0px_50px_3px_rgba(155,47,255,1.00)] transition-all sm:rounded-lg lg:rounded-xl
                    ${disabled || isProcessing 
                        ? 'bg-gray-400 cursor-not-allowed opacity-50' 
                        : 'bg-pink-400 hover:cursor-pointer hover:bg-pink-500'
                    }`}
            >
                {isProcessing ? (
                    <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                    </>
                ) : (
                    <>
                        <Upload className="h-4 w-4" />
                        Upload Excel
                    </>
                )}
            </button>
        </>
    );
};

export default UploadCSVButton;
