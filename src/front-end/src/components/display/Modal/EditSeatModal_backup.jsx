import { useState, useEffect, useCallback } from 'react';
import SeatLayout from '@components/display/Seats.jsx';
import Seat from '@components/UI/Seat.jsx';
import CoupleSeat from '@components/UI/CoupleSeat.jsx';
import { useGetScreenSeats, useUpdateScreen, useBulkCreateSeats, useUpdateSeat } from '@hooks/useBranch';
import { useUser } from '@contexts/UserContext';
import { showError, showSuccess, showLoading, closeSwal } from '@utils/sweetalert';

const DisplayButton = ({ data, onClick, isEditable = false }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(data || '');

    const handleDoubleClick = () => {
        if (isEditable) {
            setIsEditing(true);
            setValue(data || '');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            setIsEditing(false);
            setValue(data || '');
        }
    };

    const handleSave = () => {
        if (onClick && value !== data) {
            onClick(value);
        }
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="font-unbounded relative h-7 w-[25%] rounded-xl bg-zinc-300/70 text-center font-bold text-black">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    onBlur={handleSave}
                    className="w-full h-full bg-transparent text-center font-bold text-black border-none outline-none"
                    autoFocus
                />
            </div>
        );
    }

    return (
        <div 
            className={`font-unbounded relative h-7 w-[25%] rounded-xl bg-zinc-300/70 text-center font-bold text-black ${isEditable ? 'cursor-pointer hover:bg-zinc-400/70' : ''}`}
            onDoubleClick={handleDoubleClick}
            title={isEditable ? "Double-click to edit" : ""}
        >
            {data || ''}
        </div>
    );
};

const CancelButton = (props) => {
    return (
        <button className="relative flex h-8 w-40 items-center justify-center" onClick={props.onclick}>
            <div className="absolute inset-0 rounded-2xl bg-slate-900 shadow-[inset_0px_0px_60.654205322265625px_3.639252185821533px_rgba(155,47,255,1.00)]" />
            <span className="font-unbounded relative z-10 text-lg font-bold text-white">CANCEL</span>
        </button>
    );
};

const ConfirmButton = ({ onClick, disabled = false }) => {
    return (
        <button 
            className="relative flex h-8 w-40 items-center justify-center" 
            onClick={onClick}
            disabled={disabled}
        >
            <div className="absolute inset-0 rounded-2xl bg-pink-400 shadow-[inset_0px_0px_60.654205322265625px_3.639252185821533px_rgba(155,47,255,1.00)]" />
            <span className="font-unbounded relative z-10 text-lg font-bold text-white">CONFIRM</span>
        </button>
    );
};

const ScreenInformation = ({ screenData, onFieldChange }) => {
    return (
        <div className="relative flex w-full flex-col items-start gap-4">
            <div className="flex w-full items-center gap-2">
                <p className="font-libre-franklin justify-start text-lg font-bold text-white">Screen:</p>
                <DisplayButton 
                    data={screenData?.screenName || screenData?.name} 
                    onClick={(value) => onFieldChange('screenName', value)}
                    isEditable={true}
                />
            </div>
            <div className="flex w-full items-center gap-2">
                <p className="font-libre-franklin justify-start text-lg font-bold text-white">Rows:</p>
                <DisplayButton 
                    data={screenData?.size?.rows || screenData?.rows} 
                    onClick={(value) => onFieldChange('rows', parseInt(value) || 1)}
                    isEditable={true}
                />
            </div>
            <div className="flex w-full items-center gap-2">
                <p className="font-libre-franklin justify-start text-lg font-bold text-white">Columns:</p>
                <DisplayButton 
                    data={screenData?.size?.columns || screenData?.columns} 
                    onClick={(value) => onFieldChange('columns', parseInt(value) || 1)}
                    isEditable={true}
                />
            </div>
        </div>
    );
};

const SeatInformation = ({ selectedSeatType, onSeatTypeSelect }) => {
    const seatTypes = [
        { type: 'STANDARD', label: 'Standard', component: Seat },
        { type: 'COUPLE', label: 'Couple', component: CoupleSeat },
        { type: 'HIDDEN', label: 'Hidden', component: Seat }
    ];

    return (
        <div className="relative flex w-full flex-col items-start gap-2.5 xl:gap-4">
            {seatTypes.map(({ type, label, component: SeatComponent }) => (
                <div key={type} className="flex w-full items-center justify-start gap-2">
                    <button
                        className={`flex w-35 items-center gap-2 xl:w-40 p-2 rounded-lg transition-colors ${
                            selectedSeatType === type 
                                ? 'bg-blue-600/50 border-2 border-blue-400' 
                                : 'hover:bg-gray-600/30 border-2 border-transparent'
                        }`}
                        onClick={() => {
                            console.log('🎭 [SEAT_TYPE_SELECT] Seat type selected:', type);
                            onSeatTypeSelect(type);
                        }}
                    >
                        {type === 'COUPLE' ? (
                            <CoupleSeat />
                        ) : (
                            <Seat type={type === 'HIDDEN' ? 'Hidden' : 'Standard'} />
                        )}
                        <p className="font-libre-franklin text-base font-bold text-white capitalize">
                            {label}
                        </p>
                    </button>
                </div>
            ))}
        </div>
    );
};

// Enhanced SeatLayout component that can handle seat editing
const EditableSeatLayout = ({ seats, onSeatClick, selectedSeatType, highlightedSeats = [] }) => {
    if (!seats || seats.length === 0) {
        return <div className="text-white">No seats data available</div>;
    }

    // Group seats by row
    const seatsByRow = seats.reduce((acc, seat) => {
        const row = seat.location?.row || seat.row;
        if (!acc[row]) acc[row] = [];
        acc[row].push(seat);
        return acc;
    }, {});

    // Sort rows alphabetically
    const sortedRows = Object.keys(seatsByRow).sort();

    return (
        <div className="relative flex h-full flex-col items-center justify-center gap-5 lg:gap-5">
            <div className="bg-gray-300 h-4 w-48 rounded-t-lg flex items-center justify-center">
                <span className="text-black text-sm font-bold">SCREEN</span>
            </div>
            <div className="relative flex flex-col items-start gap-1.5 lg:gap-2 xl:gap-3">
                {sortedRows.map((rowLetter) => {
                    const rowSeats = seatsByRow[rowLetter].sort((a, b) => 
                        (a.location?.column || a.column) - (b.location?.column || b.column)
                    );
                    
                    return (
                        <div key={rowLetter} className="flex items-center gap-2 lg:gap-2 xl:gap-3">
                            <p className="font-unbounded w-9 justify-start self-stretch text-center text-sm font-bold text-white md:text-[18px] xl:text-xl">
                                {rowLetter}
                            </p>
                            {(() => {
                                const seatElements = [];
                                let i = 0;
                                
                                while (i < rowSeats.length) {
                                    const current = rowSeats[i];
                                    const next = rowSeats[i + 1];

                                    // Check for couple seat: both have type 'Couple' (following Seats.jsx logic exactly)
                                    if (
                                        current.type === 'Couple' &&
                                        next &&
                                        next.type === 'Couple'
                                    ) {
                                        // Render as couple seat using CoupleSeat component
                                        const isHighlighted = highlightedSeats.includes(current.seatNumber) || highlightedSeats.includes(next.seatNumber);
                                        seatElements.push(
                                            <button
                                                key={current.seatNumber + '-' + next.seatNumber}
                                                onClick={() => {
                                                    console.log('🪑 [COUPLE_SEAT_CLICK]', {
                                                        seats: [current.seatNumber, next.seatNumber],
                                                        selectedType: selectedSeatType
                                                    });
                                                    onSeatClick?.([current, next]);
                                                }}
                                                className={`cursor-pointer transition-all duration-200 ${
                                                    isHighlighted ? 'scale-110 ring-2 ring-blue-400' : ''
                                                }`}
                                            >
                                                <CoupleSeat />
                                            </button>
                                        );
                                        i += 2; // Skip next seat
                                    } else {
                                        // Render as single seat using Seat component
                                        const isHighlighted = highlightedSeats.includes(current.seatNumber);
                                        // Map to seat type exactly like Seats.jsx expects
                                        const seatType = current.type || (current.isHidden ? 'Hidden' : 'Standard');
                                        
                                        seatElements.push(
                                            <button
                                                key={current._id || current.seatNumber}
                                                onClick={() => {
                                                    console.log('🪑 [SEAT_CLICK]', {
                                                        seat: current.seatNumber,
                                                        currentType: seatType,
                                                        selectedType: selectedSeatType,
                                                        isHidden: current.isHidden,
                                                        type: current.type
                                                    });
                                                    onSeatClick?.(current);
                                                }}
                                                className={`cursor-pointer transition-all duration-200 ${
                                                    isHighlighted ? 'scale-110 ring-2 ring-blue-400' : ''
                                                }`}
                                            >
                                                <Seat type={seatType} />
                                            </button>
                                        );
                                        i += 1;
                                    }
                                }
                                return seatElements;
    );
};

const EditSeatModal = (props) => {
    const { user } = useUser();
    const branchId = user?.branch?._id || user?.branch;
    
    const { getScreenSeats } = useGetScreenSeats();
    const { updateScreen } = useUpdateScreen();
    const { bulkCreateSeats } = useBulkCreateSeats();
    const { updateSeat } = useUpdateSeat();
    
    const [seats, setSeats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSeatType, setSelectedSeatType] = useState(null);
    const [seatChanges, setSeatChanges] = useState({}); // Track seat changes { seatId: { action: 'update', oldData, newData }, ... }
    const [highlightedSeats, setHighlightedSeats] = useState([]); // For visual feedback
    const [screenInfo, setScreenInfo] = useState({
        screenName: props.screenData?.screenName || props.screenData?.name || '',
        rows: props.screenData?.size?.rows || props.screenData?.rows || 0,
        columns: props.screenData?.size?.columns || props.screenData?.columns || 0
    });
    const [hasChanges, setHasChanges] = useState(false);

    // Initialize modal with debug logging
    useEffect(() => {
        const screenId = props.screenData?._id || props.screenData?.id;
        console.log('🎬 [EDIT_MODAL_INIT] Modal opened with screen data:', {
            screenId: screenId,
            screenName: props.screenData?.screenName || props.screenData?.name,
            screenType: props.screenData?.screenType,
            rows: props.screenData?.size?.rows || props.screenData?.rows,
            columns: props.screenData?.size?.columns || props.screenData?.columns,
            isActive: props.screenData?.isActive,
            branchId: branchId
        });
    }, [props.screenData?._id, props.screenData?.id, branchId]); // Only listen to screen ID changes

    // Load seats when modal opens
    useEffect(() => {
        const loadSeats = async () => {
            const screenId = props.screenData?._id || props.screenData?.id;
            if (screenId) { // screen ID
                console.log('🎬 [EDIT_MODAL_LOAD] Starting to load seats for screen:', screenId);
                setLoading(true);
                try {
                    const result = await getScreenSeats(branchId, screenId);
                    if (result.success) {
                        // API returns { seats: [...], total: number, screen: {...} }
                        // Ensure we always have an array, even if result.data.seats is undefined or not an array
                        const seatsData = Array.isArray(result.data?.seats) ? result.data.seats : [];
                        console.log('✅ [EDIT_MODAL_LOAD] Seats loaded successfully:', seatsData.length, 'seats');
                        setSeats(seatsData);
                    } else {
                        console.error('❌ [EDIT_MODAL_LOAD] Failed to load seats:', result.error);
                        setSeats([]); // Ensure we set an empty array on error
                        showError('Error', 'Failed to load seats data');
                    }
                } catch (error) {
                    console.error('❌ [EDIT_MODAL_LOAD] Exception loading seats:', error);
                    setSeats([]); // Ensure we set an empty array on exception
                    showError('Error', 'Failed to load seats data');
                } finally {
                    setLoading(false);
                }
            }
        };

        loadSeats();
    }, [props.screenData?._id, props.screenData?.id, branchId]); // Only listen to screen ID changes

    // Generate seats based on rows and columns
    const generateSeats = useCallback((rows, columns) => {
        const newSeats = [];
        for (let row = 1; row <= rows; row++) {
            const rowLetter = String.fromCharCode(64 + row);
            for (let col = 1; col <= columns; col++) {
                newSeats.push({
                    seatNumber: `${rowLetter}${col}`,
                    location: { row: rowLetter, column: col },
                    category: 'STANDARD',
                    isHidden: false
                });
            }
        }
        return newSeats;
    }, []);

    const handleFieldChange = useCallback((field, value) => {
        console.log('📝 [FIELD_CHANGE]', { field, value, currentScreenInfo: screenInfo });
        setScreenInfo(prev => {
            const newInfo = { ...prev, [field]: value };
            
            // If rows or columns changed, regenerate seats
            if (field === 'rows' || field === 'columns') {
                const newSeats = generateSeats(
                    field === 'rows' ? value : prev.rows,
                    field === 'columns' ? value : prev.columns
                );
                console.log('🪑 [SEATS_REGENERATED]', {
                    newRows: field === 'rows' ? value : prev.rows,
                    newColumns: field === 'columns' ? value : prev.columns,
                    seatsCount: newSeats.length
                });
                setSeats(newSeats);
            }
            
            setHasChanges(true);
            return newInfo;
        });
    }, [generateSeats]);

    // Handle seat click - supports both single seat and couple seat
    const handleSeatClick = useCallback((seatOrSeats) => {
        if (!selectedSeatType) return;

        // Check if it's a couple seat (array) or single seat
        const isCoupleSeat = Array.isArray(seatOrSeats);
        const seatsToUpdate = isCoupleSeat ? seatOrSeats : [seatOrSeats];

        console.log('🎯 [SEAT_UPDATE]', {
            isCoupleSeat,
            seatsCount: seatsToUpdate.length,
            seatNumbers: seatsToUpdate.map(s => s.seatNumber),
            selectedType: selectedSeatType
        });

        // Highlight seats being edited for visual feedback
        setHighlightedSeats(seatsToUpdate.map(s => s.seatNumber));
        setTimeout(() => setHighlightedSeats([]), 500); // Remove highlight after 500ms

        setSeats(prevSeats => {
            const newSeats = [...prevSeats];
            
            seatsToUpdate.forEach(targetSeat => {
                const seatIndex = newSeats.findIndex(s => 
                    s._id === targetSeat._id || 
                    (s.location?.row === targetSeat.location?.row && s.location?.column === targetSeat.location?.column)
                );
                
                if (seatIndex !== -1) {
                    const currentSeat = newSeats[seatIndex];
                    
                    // Toggle behavior: if clicking on same type, toggle to opposite
                    // Map selectedSeatType to appropriate type value for consistency with Seats.jsx
                    let newType = selectedSeatType === 'VIP' ? 'Couple' : 
                                  selectedSeatType === 'HIDDEN' ? 'Hidden' : 'Standard';
                    let newIsHidden = selectedSeatType === 'HIDDEN';
                    
                    // Check current state for toggle behavior
                    if (selectedSeatType === 'HIDDEN') {
                        // Toggle hidden state
                        newIsHidden = !currentSeat.isHidden;
                        newType = currentSeat.type || 'Standard'; // Keep original type
                    } else if (currentSeat.type === newType && !currentSeat.isHidden) {
                        // If clicking same type again, toggle to standard
                        newType = 'Standard';
                    }
                    
                    // Handle couple seat logic
                    if (isCoupleSeat && selectedSeatType === 'VIP') {
                        // For couple seats, both should be Couple type
                        newType = 'Couple';
                        newIsHidden = false;
                    }
                    
                    newSeats[seatIndex] = {
                        ...currentSeat,
                        type: newType,
                        isHidden: newIsHidden
                    };
                    
                    // Track changes for sync
                    setSeatChanges(prev => ({
                        ...prev,
                        [currentSeat._id || currentSeat.seatNumber]: {
                            action: 'update',
                            oldData: { type: currentSeat.type, isHidden: currentSeat.isHidden },
                            newData: { type: newType, isHidden: newIsHidden }
                        }
                    }));
                }
            });
            
            setHasChanges(true);
            return newSeats;
        });
    }, [selectedSeatType]);

    const handleSave = async () => {
        if (!hasChanges) {
            console.log('ℹ️ [SAVE_SKIPPED] No changes to save');
            props.onClose();
            return;
        }

        console.log('💾 [SAVE_START] Starting save process with changes:', {
            screenInfo,
            seatsCount: seats.length,
            hasChanges,
            seatChangesCount: Object.keys(seatChanges).length
        });

        showLoading('Saving Changes...', 'Please wait while we update the screen and seats');
        
        try {
            const screenId = props.screenData._id || props.screenData.id;
            
            // Update screen info if changed
            const screenUpdateData = {
                screenName: screenInfo.screenName,
                size: {
                    rows: screenInfo.rows,
                    columns: screenInfo.columns
                }
            };

            console.log('🎬 [SCREEN_UPDATE] Updating screen with data:', screenUpdateData);
            const updateResult = await updateScreen(branchId, screenId, screenUpdateData);
            
            if (!updateResult.success) {
                throw new Error(updateResult.error || 'Failed to update screen');
            }
            console.log('✅ [SCREEN_UPDATE] Screen updated successfully');

            // Update individual seats that have changes
            if (Object.keys(seatChanges).length > 0) {
                console.log('🪑 [SEATS_UPDATE] Updating individual seats:', Object.keys(seatChanges).length);
                
                for (const [seatId, change] of Object.entries(seatChanges)) {
                    try {
                        const seatUpdateData = {
                            type: change.newData.type,
                            isHidden: change.newData.isHidden
                        };
                        
                        const seatResult = await updateSeat(branchId, screenId, seatId, seatUpdateData);
                        
                        if (!seatResult.success) {
                            console.error(`❌ [SEAT_UPDATE_FAILED] Failed to update seat ${seatId}:`, seatResult.error);
                            // Continue with other seats, don't fail completely
                        } else {
                            console.log(`✅ [SEAT_UPDATE] Seat ${seatId} updated successfully`);
                        }
                    } catch (seatError) {
                        console.error(`❌ [SEAT_UPDATE_ERROR] Exception updating seat ${seatId}:`, seatError);
                        // Continue with other seats
                    }
                }
                
                console.log('✅ [SEATS_UPDATE] All seat updates completed');
            }

            closeSwal();
            showSuccess('Success!', 'Screen and seats updated successfully');
            
            // Clear changes after successful save
            setSeatChanges({});
            setHasChanges(false);
            
            // Refresh the parent page data if there's a refresh callback
            if (props.onRefresh) {
                console.log('🔄 [REFRESH] Triggering parent data refresh');
                props.onRefresh();
            }
            
            console.log('✅ [SAVE_COMPLETE] All changes saved successfully');
            props.onClose();
            
        } catch (error) {
            console.error('❌ [SAVE_ERROR] Error saving changes:', error);
            closeSwal();
            showError('Error', error.message || 'Failed to save changes');
        }
    };

    if (loading) {
        return (
            <div className="absolute inset-0 z-50 bg-slate-900/10 backdrop-blur-[20px]">
                <div className="fixed flex flex-col items-center justify-center gap-[10%] rounded-xl shadow-[8px_8px_20px_0px_rgba(0,0,0,0.25)] backdrop-blur-[20px] lg:inset-[10%] lg:bg-slate-900/60 xl:inset-[5%] xl:bg-slate-900">
                    <div className="text-white text-xl">Loading seats...</div>
                </div>
            </div>
        );
    }

    const updatedScreenData = {
        ...props.screenData,
        screenName: screenInfo.screenName,
        size: {
            rows: screenInfo.rows,
            columns: screenInfo.columns
        }
    };

    return (
        <div className="absolute inset-0 z-50 bg-slate-900/10 backdrop-blur-[20px]">
            <div className="fixed flex flex-col items-center justify-center gap-[10%] rounded-xl shadow-[8px_8px_20px_0px_rgba(0,0,0,0.25)] backdrop-blur-[20px] lg:inset-[10%] lg:bg-slate-900/60 xl:inset-[5%] xl:bg-slate-900">

                <div className="relative flex w-full items-center justify-center">
                    <div className="flex justify-center items-center gap-0">
                        {/* Information Section */}
                        <div className="relative w-80 flex-shrink-0 flex flex-col gap-6 items-start text-left justify-center px-[5%]">
                            <ScreenInformation 
                                screenData={updatedScreenData} 
                                onFieldChange={handleFieldChange}
                            />
                            <SeatInformation 
                                selectedSeatType={selectedSeatType}
                                onSeatTypeSelect={setSelectedSeatType}
                            />
                            
                            {/* Instructions */}
                            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-600">
                                <h4 className="text-white font-bold text-sm mb-2">Instructions:</h4>
                                <ul className="text-gray-300 text-xs space-y-1">
                                    <li>• Select a seat type above</li>
                                    <li>• Click once to apply type</li>
                                    <li>• Click again to toggle back</li>
                                    <li>• VIP seats become couple seats when adjacent</li>
                                    <li>• Click Confirm to save changes</li>
                                </ul>
                            </div>
                        </div>

                        {/* Seat Layout Section */}
                        <div className="relative min-h-0 flex justify-center p-[3%] mr-[2%]">
                            <EditableSeatLayout 
                                seats={seats}
                                onSeatClick={handleSeatClick}
                                selectedSeatType={selectedSeatType}
                                highlightedSeats={highlightedSeats}
                            />
                        </div>
                    </div>
                </div>

                <div className="relative flex items-center gap-4">
                    <CancelButton onclick={() => {
                        console.log('❌ [MODAL_CANCEL] User canceled editing, changes discarded:', { hasChanges });
                        props.onClose();
                    }} />
                    <ConfirmButton onClick={handleSave} />
                </div>
            </div>
        </div>
    );
};

export default EditSeatModal;
