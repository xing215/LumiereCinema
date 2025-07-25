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
            
            console.log('Raw JSON data from Excel:', jsonData);
            console.log('First row example:', jsonData[0]);
            
            if (jsonData.length === 0) {
                alert('The file appears to be empty or has no valid data');
                return;
            }

            // Validate and transform data based on template type
            const processedData = processUploadedData(jsonData, templateType);
            
            console.log('Processed data:', processedData);
            
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
        // Helper function to convert DD/MM/YYYY to YYYY-MM-DD
        const convertDateFormat = (dateString) => {
            if (!dateString) return '';
            
            // If already in YYYY-MM-DD format, return as is
            if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
                return dateString;
            }
            
            // Convert DD/MM/YYYY to YYYY-MM-DD
            const parts = dateString.split('/');
            if (parts.length === 3) {
                const [day, month, year] = parts;
                return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            }
            
            return dateString; // Return original if can't parse
        };

        switch (type) {
            case 'movie':
                return data.map((row, index) => {
                    return {
                        title: row['Movie Title'] || '',
                        description: row['Description'] || '',
                        releaseDate: convertDateFormat(row['Release Date']) || '',
                        genre: typeof row['Genre'] === 'string' 
                            ? row['Genre'].split(',').map(g => g.trim()).filter(Boolean)
                            : [],
                        duration: parseInt(row['Duration']) || 0,
                        ageRating: row['Age Rating'] || '',
                        trailerURL: row['Trailer'] || '',
                        posterURL: row['Poster'] || '',
                        status: row['Status'] || 'Now Showing',
                        rowIndex: index,
                        isHidden: false,
                        director : row['Director'] || '',
                        cast: typeof row['Cast'] === 'string' 
                            ? row['Cast'].split(',').map(c => c.trim()).filter(Boolean)
                            : [],
                        language: row['Language'] || '',
                        ratingsAverage: parseFloat(row['Ratings Average']) || 0,
                        ratingsQuantity: parseInt(row['Ratings Quantity']) || 0,
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
