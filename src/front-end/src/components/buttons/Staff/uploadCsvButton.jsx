import { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import * as XLSX from 'xlsx';
import { showUploadError } from '@utils/sweetalert';

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
            showUploadError('Please upload a valid Excel (.xlsx, .xls) or CSV file');
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
                showUploadError('The file appears to be empty or has no valid data');
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
            showUploadError('Error processing file. Please check the file format and try again.');
        } finally {
            setIsProcessing(false);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const processUploadedData = (data, type) => {
        // Helper function to convert Excel date serial number or string date to YYYY-MM-DD
        const convertDateFormat = (dateValue) => {
            if (!dateValue) return '';
            
            // If it's a number (Excel serial date)
            if (typeof dateValue === 'number') {
                // Excel epoch starts at 1900-01-01, but JavaScript Date starts at 1970-01-01
                // Excel serial date 1 = 1900-01-01
                const excelEpoch = new Date(1900, 0, 1); // January 1, 1900
                const date = new Date(excelEpoch.getTime() + (dateValue - 1) * 24 * 60 * 60 * 1000);
                return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
            }
            
            // If it's already a string, handle different formats
            const dateString = String(dateValue);
            
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

        // Helper function to convert Excel time decimal to HH:MM format
        const convertTimeFormat = (timeValue) => {
            if (!timeValue) return '';
            
            // If it's a decimal (Excel time format)
            if (typeof timeValue === 'number') {
                // Convert decimal to hours and minutes
                const totalMinutes = Math.round(timeValue * 24 * 60);
                const hours = Math.floor(totalMinutes / 60);
                const minutes = totalMinutes % 60;
                return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
            }
            
            // If it's already a string, return as is
            return String(timeValue);
        };

        switch (type) {
            case 'movie':
                return data.map((row, index) => {
                    // Helper function to safely parse numbers
                    const parseNumber = (value, defaultValue = 0) => {
                        if (value === undefined || value === null || value === '') return defaultValue;
                        const parsed = parseFloat(value);
                        return isNaN(parsed) ? defaultValue : parsed;
                    };

                    const parseInteger = (value, defaultValue = 0) => {
                        if (value === undefined || value === null || value === '') return defaultValue;
                        const parsed = parseInt(value);
                        return isNaN(parsed) ? defaultValue : parsed;
                    };

                    return {
                        title: row['Movie Title'] || '',
                        description: row['Description'] || '',
                        releaseDate: convertDateFormat(row['Release Date']) || '',
                        genre: typeof row['Genre'] === 'string' 
                            ? row['Genre'].split(',').map(g => g.trim()).filter(Boolean)
                            : [],
                        duration: parseInteger(row['Duration'], 0),
                        ageRating: row['Age Rating'] || '',
                        trailerURL: row['Trailer'] || '',
                        posterURL: row['Poster'] || '',
                        // Remove status field - no longer needed
                        rowIndex: index,
                        isHidden: true, // Default to true (hidden) as requested
                        director: row['Director'] || '',
                        cast: typeof row['Cast'] === 'string' 
                            ? row['Cast'].split(',').map(c => c.trim()).filter(Boolean)
                            : [],
                        language: row['Language'] || '',
                        // Fix number parsing for ratings
                        ratingsAverage: parseNumber(row['Ratings Average'], 0),
                        ratingsQuantity: parseInteger(row['Ratings Quantity'], 0),
                    };
                });
            case 'schedule':
                return data.map((row, index) => {
                    return {
                        movieName: row['Movie Name'] || row['Movie Title'] || '',
                        screenName: row['Screen Name'] || row['Screen'] || '',
                        date: convertDateFormat(row['Date']) || '',
                        startTime: convertTimeFormat(row['Start Time'] || row['StartTime']) || '',
                        endTime: convertTimeFormat(row['End Time'] || row['EndTime']) || '', // Keep for backward compatibility
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
