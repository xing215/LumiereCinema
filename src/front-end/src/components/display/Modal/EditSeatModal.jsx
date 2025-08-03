import { useState, useEffect, useCallback } from 'react';
import SeatLayout from '@components/display/Seats.jsx';
import Seat from '@components/UI/Seat.jsx';
import CoupleSeat from '@components/UI/CoupleSeat.jsx';
import { useGetScreenSeats, useUpdateScreen, useBulkCreateSeats, useUpdateSeat, useRemoveSeat } from '@hooks/useBranch';
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

const EditSeatModal = (props) => {
    const { user } = useUser();
    const branchId = user?.branch?._id || user?.branch;
    
    const { getScreenSeats } = useGetScreenSeats();
    const { updateScreen } = useUpdateScreen();
    const { bulkCreateSeats } = useBulkCreateSeats();
    const { updateSeat } = useUpdateSeat();
    const { removeSeat } = useRemoveSeat();
    
    const [seats, setSeats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSeatType, setSelectedSeatType] = useState(null);
    const [seatChanges, setSeatChanges] = useState({});
    const [highlightedSeats, setHighlightedSeats] = useState([]);
    const [screenInfo, setScreenInfo] = useState({
        screenName: props.screenData?.screenName || props.screenData?.name || '',
        rows: props.screenData?.size?.rows || props.screenData?.rows || 0,
        columns: props.screenData?.size?.columns || props.screenData?.columns || 0
    });
    const [hasChanges, setHasChanges] = useState(false);

    // Load seats when modal opens
    useEffect(() => {
        const loadSeats = async () => {
            const screenId = props.screenData?._id || props.screenData?.id;
            if (screenId) {
                console.log('🎬 [EDIT_MODAL_LOAD] Loading seats for screen:', screenId);
                setLoading(true);
                try {
                    const result = await getScreenSeats(branchId, screenId);
                    if (result.success) {
                        const seatsData = Array.isArray(result.data?.seats) ? result.data.seats : [];
                        console.log('✅ [EDIT_MODAL_LOAD] Seats loaded:', seatsData.length, 'seats');
                        setSeats(seatsData);
                    } else {
                        console.error('❌ [EDIT_MODAL_LOAD] Failed to load seats:', result.error);
                        setSeats([]);
                        showError('Error', 'Failed to load seats data');
                    }
                } catch (error) {
                    console.error('❌ [EDIT_MODAL_LOAD] Exception loading seats:', error);
                    setSeats([]);
                    showError('Error', 'Failed to load seats data');
                } finally {
                    setLoading(false);
                }
            }
        };

        loadSeats();
    }, [props.screenData?._id, props.screenData?.id, branchId]);

    // Generate or update seats based on rows and columns
    const updateSeatsForDimensions = useCallback((newRows, newColumns, existingSeats = []) => {
        console.log('🪑 [SEATS_DIMENSION_UPDATE]', { 
            newRows, 
            newColumns, 
            existingSeatsCount: existingSeats.length 
        });

        const updatedSeats = [];
        
        // Create seat map for existing seats
        const existingSeatMap = {};
        existingSeats.forEach(seat => {
            const row = seat.location?.row || seat.row;
            const column = seat.location?.column || seat.column;
            if (row && column) {
                existingSeatMap[`${row}-${column}`] = seat;
            }
        });

        // Generate seats for the new dimensions
        for (let row = 1; row <= newRows; row++) {
            const rowLetter = String.fromCharCode(64 + row);
            for (let col = 1; col <= newColumns; col++) {
                const seatKey = `${rowLetter}-${col}`;
                const existingSeat = existingSeatMap[seatKey];
                
                if (existingSeat) {
                    // Keep existing seat with its current properties
                    updatedSeats.push({
                        ...existingSeat,
                        seatNumber: `${rowLetter}${col}`,
                        location: { row: rowLetter, column: col },
                        row: rowLetter
                    });
                } else {
                    // Create new seat with default properties
                    updatedSeats.push({
                        seatNumber: `${rowLetter}${col}`,
                        location: { row: rowLetter, column: col },
                        row: rowLetter,
                        type: 'Standard',
                        isHidden: false
                    });
                }
            }
        }

        console.log('✅ [SEATS_DIMENSION_UPDATE] Generated/updated seats:', {
            totalSeats: updatedSeats.length,
            newSeats: updatedSeats.filter(s => !existingSeatMap[`${s.location.row}-${s.location.column}`]).length,
            preservedSeats: updatedSeats.filter(s => existingSeatMap[`${s.location.row}-${s.location.column}`]).length
        });

        return updatedSeats;
    }, []);

    // Legacy generate seats function for initial load
    const generateSeats = useCallback((rows, columns) => {
        return updateSeatsForDimensions(rows, columns, []);
    }, [updateSeatsForDimensions]);

    const handleFieldChange = useCallback(async (field, value) => {
        console.log('📝 [FIELD_CHANGE]', { field, value });
        
        // For rows/columns changes, sync immediately with database
        if (field === 'rows' || field === 'columns') {
            const screenId = props.screenData._id || props.screenData.id;
            const oldRows = screenInfo.rows;
            const oldColumns = screenInfo.columns;
            const newRows = field === 'rows' ? value : oldRows;
            const newColumns = field === 'columns' ? value : oldColumns;
            
            console.log('🔄 [DIMENSION_CHANGE]', { field, value, oldRows, oldColumns, newRows, newColumns });
            
            // Show loading for dimension changes
            showLoading('Updating Screen Layout...', 'Please wait while we update screen dimensions and seats');
            
            try {
                // Update screen dimensions first
                const screenUpdateData = {
                    screenName: screenInfo.screenName,
                    size: { rows: newRows, columns: newColumns }
                };
                
                console.log('🎬 [SCREEN_UPDATE_DIMENSIONS] Updating screen dimensions:', screenUpdateData);
                const updateResult = await updateScreen(branchId, screenId, screenUpdateData);
                
                if (!updateResult.success) {
                    throw new Error(updateResult.error || 'Failed to update screen dimensions');
                }
                
                // Determine what seats need to be added or removed
                const currentSeats = seats;
                const seatsToRemove = [];
                const seatsToAdd = [];
                
                if (field === 'rows') {
                    if (value < oldRows) {
                        // Remove seats from the last row(s)
                        for (let row = value + 1; row <= oldRows; row++) {
                            const rowLetter = String.fromCharCode(64 + row);
                            const rowSeats = currentSeats.filter(s => 
                                (s.location?.row || s.row) === rowLetter
                            );
                            seatsToRemove.push(...rowSeats.filter(s => s._id)); // Only existing seats
                        }
                    } else if (value > oldRows) {
                        // Add seats to new row(s)
                        for (let row = oldRows + 1; row <= value; row++) {
                            const rowLetter = String.fromCharCode(64 + row);
                            for (let col = 1; col <= newColumns; col++) {
                                seatsToAdd.push({
                                    seatNumber: `${rowLetter}${col}`,
                                    location: { row: rowLetter, column: col }, // Use row letter (A, B, C, etc.)
                                    category: 'STANDARD', // Use uppercase 'STANDARD' to match SeatCategory shortname
                                    isHidden: false
                                });
                            }
                        }
                    }
                } else if (field === 'columns') {
                    if (value < oldColumns) {
                        // Remove seats from the last column(s)
                        for (let col = value + 1; col <= oldColumns; col++) {
                            const columnSeats = currentSeats.filter(s => 
                                (s.location?.column || s.column) === col
                            );
                            seatsToRemove.push(...columnSeats.filter(s => s._id)); // Only existing seats
                        }
                    } else if (value > oldColumns) {
                        // Add seats to new column(s)
                        for (let row = 1; row <= newRows; row++) {
                            const rowLetter = String.fromCharCode(64 + row);
                            for (let col = oldColumns + 1; col <= value; col++) {
                                seatsToAdd.push({
                                    seatNumber: `${rowLetter}${col}`,
                                    location: { row: rowLetter, column: col }, // Use row letter (A, B, C, etc.)
                                    category: 'STANDARD', // Use uppercase 'STANDARD' to match SeatCategory shortname
                                    isHidden: false
                                });
                            }
                        }
                    }
                }
                
                console.log('🪑 [SEATS_OPERATION_PLAN]', {
                    seatsToRemove: seatsToRemove.length,
                    seatsToAdd: seatsToAdd.length,
                    seatsToAddDetails: seatsToAdd.map(s => ({ seatNumber: s.seatNumber, category: s.category }))
                });
                
                // Remove seats if needed
                if (seatsToRemove.length > 0) {
                    console.log('🗑️ [SEATS_REMOVE] Removing seats:', seatsToRemove.length);
                    for (const seat of seatsToRemove) {
                        try {
                            await removeSeat(branchId, screenId, seat._id);
                            console.log(`✅ [SEAT_REMOVED] Seat ${seat.seatNumber} removed`);
                        } catch (error) {
                            console.error(`❌ [SEAT_REMOVE_ERROR] Failed to remove seat ${seat.seatNumber}:`, error);
                            throw new Error(`Failed to remove seat ${seat.seatNumber}: ${error.message}`);
                        }
                    }
                }
                
                // Add seats if needed
                if (seatsToAdd.length > 0) {
                    console.log('➕ [SEATS_ADD] Adding seats:', seatsToAdd.length);
                    console.log('🪑 [SEATS_ADD_DATA] Seats data:', JSON.stringify(seatsToAdd, null, 2));
                    
                    try {
                        const createResult = await bulkCreateSeats(branchId, screenId, { seats: seatsToAdd });
                        console.log('🔍 [SEATS_ADD_RESULT]', createResult);
                        
                        if (createResult.success) {
                            console.log('✅ [SEATS_ADD] New seats created successfully');
                        } else {
                            console.error('❌ [SEATS_ADD_FAILED]:', createResult.error);
                            throw new Error(`Failed to create seats: ${createResult.error}`);
                        }
                    } catch (error) {
                        console.error('❌ [SEATS_ADD_ERROR]:', error);
                        throw new Error(`Failed to create seats: ${error.message}`);
                    }
                }
                
                // Reload seats from server to get the updated state
                console.log('🔄 [SEATS_RELOAD] Reloading seats from server');
                const result = await getScreenSeats(branchId, screenId);
                if (result.success) {
                    const seatsData = Array.isArray(result.data?.seats) ? result.data.seats : [];
                    setSeats(seatsData);
                    console.log('✅ [SEATS_RELOAD] Seats reloaded:', seatsData.length, 'seats');
                } else {
                    console.error('❌ [SEATS_RELOAD_FAILED]:', result.error);
                }
                
                closeSwal(); // Close loading alert
                showSuccess('Success!', `Screen dimensions updated to ${newRows}x${newColumns}`);
                
            } catch (error) {
                console.error('❌ [DIMENSION_CHANGE_ERROR] Error updating dimensions:', error);
                closeSwal(); // Close loading alert
                showError('Error', error.message || 'Failed to update screen dimensions');
                return; // Don't update local state if database update failed
            }
        }
        
        // Update local state
        setScreenInfo(prev => ({
            ...prev,
            [field]: value
        }));
        
        setHasChanges(true);
    }, [screenInfo, seats, branchId, props.screenData, updateScreen, removeSeat, bulkCreateSeats, getScreenSeats]);

    // Handle seat click with enhanced debugging and fixed couple seat logic
    const handleSeatClick = useCallback((seatOrSeats) => {
        if (!selectedSeatType) {
            console.log('⚠️ [EDIT_SEAT] No seat type selected');
            return;
        }

        const isCoupleSeat = Array.isArray(seatOrSeats);
        const seatsToUpdate = isCoupleSeat ? seatOrSeats : [seatOrSeats];

        console.log('🎯 [EDIT_SEAT_CLICK]', {
            isCoupleSeat,
            seatsCount: seatsToUpdate.length,
            seatNumbers: seatsToUpdate.map(s => s.seatNumber),
            selectedType: selectedSeatType,
            currentSeats: seatsToUpdate.map(s => ({ 
                seatNumber: s.seatNumber, 
                currentType: s.type,
                currentCategory: s.category, 
                isHidden: s.isHidden 
            }))
        });

        // Highlight seats for visual feedback
        setHighlightedSeats(seatsToUpdate.map(s => s.seatNumber));
        setTimeout(() => setHighlightedSeats([]), 800);

        setSeats(prevSeats => {
            const newSeats = [...prevSeats];
            
            // Process each seat to update
            seatsToUpdate.forEach(targetSeat => {
                const seatIndex = newSeats.findIndex(s => 
                    s._id === targetSeat._id || 
                    s.seatNumber === targetSeat.seatNumber ||
                    (s.location?.row === targetSeat.location?.row && s.location?.column === targetSeat.location?.column)
                );
                
                if (seatIndex !== -1) {
                    const currentSeat = newSeats[seatIndex];
                    let newType, newIsHidden;
                    
                    // Enhanced logic for different seat types - Fixed mapping with proper couple seat handling
                    switch (selectedSeatType) {
                        case 'HIDDEN':
                            // For HIDDEN: If applying to couple seat, make both seats hidden
                            // If applying to single seat, toggle hidden state
                            if (isCoupleSeat) {
                                // Apply hidden to couple seats - set both to hidden standard seats
                                newType = 'Standard';
                                newIsHidden = true;
                            } else {
                                // Toggle hidden state for single seat while preserving type
                                newIsHidden = !currentSeat.isHidden;
                                newType = currentSeat.category || currentSeat.type || 'Standard';
                            }
                            break;
                            
                        case 'COUPLE':
                            // For couple seats: always set to Couple (no toggle)
                            newType = 'Couple';
                            newIsHidden = false;
                            break;
                            
                        case 'STANDARD':
                        default:
                            // For standard: set to Standard (works for both single and couple seats)
                            newType = 'Standard';
                            newIsHidden = false;
                            break;
                    }
                    
                    console.log('🔄 [SEAT_UPDATE]', {
                        seatNumber: currentSeat.seatNumber,
                        oldType: currentSeat.type,
                        oldCategory: currentSeat.category,
                        newType: newType,
                        oldHidden: currentSeat.isHidden,
                        newHidden: newIsHidden,
                        selectedSeatType,
                        isCoupleSeat,
                        seatIndex
                    });
                    
                    const updatedSeat = {
                        ...currentSeat,
                        type: newType,          // Keep for internal consistency
                        category: newType,      // Use for API calls
                        isHidden: newIsHidden
                    };
                    
                    newSeats[seatIndex] = updatedSeat;
                    
                    // Track changes for sync - use proper seat ID
                    const seatChangeKey = currentSeat._id || currentSeat.seatNumber;
                    setSeatChanges(prev => ({
                        ...prev,
                        [seatChangeKey]: {
                            action: 'update',
                            oldData: { type: currentSeat.category || currentSeat.type, isHidden: currentSeat.isHidden },
                            newData: { type: newType, isHidden: newIsHidden },
                            seatNumber: currentSeat.seatNumber
                        }
                    }));
                    
                    console.log('✅ [SEAT_CHANGE_TRACKED]', {
                        seatChangeKey,
                        seatNumber: currentSeat.seatNumber,
                        newData: { type: newType, isHidden: newIsHidden }
                    });
                }
            });

            // Additional logic for COUPLE type: ensure adjacent seats are also updated
            if (selectedSeatType === 'COUPLE' && !isCoupleSeat) {
                // If user clicked on a single seat to make it couple, update adjacent seat too
                const clickedSeat = seatsToUpdate[0];
                const clickedSeatIndex = newSeats.findIndex(s => 
                    s._id === clickedSeat._id || 
                    s.seatNumber === clickedSeat.seatNumber ||
                    (s.location?.row === clickedSeat.location?.row && s.location?.column === clickedSeat.location?.column)
                );

                if (clickedSeatIndex !== -1) {
                    const clickedSeatData = newSeats[clickedSeatIndex];
                    const row = clickedSeatData.location?.row || clickedSeatData.row;
                    const column = clickedSeatData.location?.column || clickedSeatData.column;

                    // Check for adjacent seat (next column in same row)
                    const adjacentSeatIndex = newSeats.findIndex(s => 
                        (s.location?.row || s.row) === row && 
                        (s.location?.column || s.column) === column + 1
                    );

                    if (adjacentSeatIndex !== -1) {
                        const adjacentSeat = newSeats[adjacentSeatIndex];
                        
                        console.log('🔗 [ADJACENT_SEAT_UPDATE] Making adjacent seat couple', {
                            clickedSeat: clickedSeatData.seatNumber,
                            adjacentSeat: adjacentSeat.seatNumber
                        });

                        const updatedAdjacentSeat = {
                            ...adjacentSeat,
                            type: 'Couple',
                            category: 'Couple',
                            isHidden: false
                        };

                        newSeats[adjacentSeatIndex] = updatedAdjacentSeat;

                        // Track change for adjacent seat too
                        const adjacentSeatChangeKey = adjacentSeat._id || adjacentSeat.seatNumber;
                        setSeatChanges(prev => ({
                            ...prev,
                            [adjacentSeatChangeKey]: {
                                action: 'update',
                                oldData: { type: adjacentSeat.category || adjacentSeat.type, isHidden: adjacentSeat.isHidden },
                                newData: { type: 'Couple', isHidden: false },
                                seatNumber: adjacentSeat.seatNumber
                            }
                        }));

                        console.log('✅ [ADJACENT_SEAT_CHANGE_TRACKED]', {
                            adjacentSeatChangeKey,
                            seatNumber: adjacentSeat.seatNumber,
                            newData: { type: 'Couple', isHidden: false }
                        });
                    }
                }
            }
            
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
            
            // Update screen info
            const screenUpdateData = {
                screenName: screenInfo.screenName,
                size: {
                    rows: screenInfo.rows,
                    columns: screenInfo.columns
                }
            };

            console.log('🎬 [SCREEN_UPDATE] Updating screen:', screenUpdateData);
            const updateResult = await updateScreen(branchId, screenId, screenUpdateData);
            
            if (!updateResult.success) {
                throw new Error(updateResult.error || 'Failed to update screen');
            }
            console.log('✅ [SCREEN_UPDATE] Screen updated successfully');

            // Handle seat changes - both updates and potential bulk creation for new seats
            const existingSeats = seats.filter(seat => seat._id);
            const newSeats = seats.filter(seat => !seat._id);
            
            console.log('🪑 [SEATS_ANALYSIS]', {
                totalSeats: seats.length,
                existingSeats: existingSeats.length,
                newSeats: newSeats.length,
                seatChanges: Object.keys(seatChanges).length
            });

            // Update existing seats that have changes
            if (Object.keys(seatChanges).length > 0) {
                console.log('🔄 [EXISTING_SEATS_UPDATE] Updating existing seats');
                
                for (const [seatId, change] of Object.entries(seatChanges)) {
                    try {
                        const seatUpdateData = {
                            category: change.newData.type,  // Fix: use 'category' instead of 'type'
                            isHidden: change.newData.isHidden
                        };
                        
                        console.log('🔄 [SEAT_UPDATE]', { seatId, seatUpdateData });
                        const seatResult = await updateSeat(branchId, screenId, seatId, seatUpdateData);
                        
                        if (!seatResult.success) {
                            console.error(`❌ [SEAT_UPDATE_FAILED] Seat ${seatId}:`, seatResult.error);
                        } else {
                            console.log(`✅ [SEAT_UPDATE] Seat ${seatId} updated successfully`);
                        }
                    } catch (seatError) {
                        console.error(`❌ [SEAT_UPDATE_ERROR] Exception updating seat ${seatId}:`, seatError);
                    }
                }
            }

            // Create new seats if any
            if (newSeats.length > 0) {
                console.log('➕ [NEW_SEATS_CREATE] Creating new seats:', newSeats.length);
                
                const seatsToCreate = newSeats.map(seat => ({
                    seatNumber: seat.seatNumber,
                    location: seat.location,
                    category: seat.type || 'Standard',  // Fix: use 'category' instead of 'type'
                    isHidden: seat.isHidden || false
                }));
                
                try {
                    const createResult = await bulkCreateSeats(branchId, screenId, { seats: seatsToCreate });
                    if (createResult.success) {
                        console.log('✅ [NEW_SEATS_CREATE] New seats created successfully');
                    } else {
                        console.error('❌ [NEW_SEATS_CREATE_FAILED]:', createResult.error);
                    }
                } catch (createError) {
                    console.error('❌ [NEW_SEATS_CREATE_ERROR]:', createError);
                }
            }

            closeSwal();
            showSuccess('Success!', 'Screen and seats updated successfully');
            
            // Clear changes after successful save
            setSeatChanges({});
            setHasChanges(false);
            
            // Refresh parent data
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
                                    <li>• Click seats to apply selected type</li>
                                    <li>• Hidden: Toggles seat visibility</li>
                                    <li>• Couple: Makes seats couple type</li>
                                    <li>• Standard: Returns seat to normal</li>
                                    <li>• Changes auto-save when you click Confirm</li>
                                </ul>
                            </div>
                        </div>

                        {/* Seat Layout Section using updated SeatLayout */}
                        <div className="relative min-h-0 flex justify-center p-[3%] mr-[2%]">
                            <SeatLayout 
                                data={seats}
                                isEditable={true}
                                onSeatClick={handleSeatClick}
                                selectedSeatType={selectedSeatType}
                                highlightedSeats={highlightedSeats}
                            />
                        </div>
                    </div>
                </div>

                <div className="relative flex items-center gap-4">
                    <CancelButton onclick={() => {
                        console.log('🔙 [CANCEL] User cancelled edit modal');
                        props.onClose();
                    }} />
                    <ConfirmButton onClick={handleSave} />
                </div>
            </div>
        </div>
    );
};

export default EditSeatModal;
