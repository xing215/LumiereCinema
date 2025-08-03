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
        { type: 'VIP', label: 'VIP/Couple', component: CoupleSeat },
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
                        {type === 'VIP' ? (
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

    // Generate seats based on rows and columns
    const generateSeats = useCallback((rows, columns) => {
        const newSeats = [];
        for (let row = 1; row <= rows; row++) {
            const rowLetter = String.fromCharCode(64 + row);
            for (let col = 1; col <= columns; col++) {
                newSeats.push({
                    seatNumber: `${rowLetter}${col}`,
                    location: { row: rowLetter, column: col },
                    type: 'Standard',
                    isHidden: false
                });
            }
        }
        return newSeats;
    }, []);

    const handleFieldChange = useCallback((field, value) => {
        console.log('📝 [FIELD_CHANGE]', { field, value });
        setScreenInfo(prev => {
            const newInfo = { ...prev, [field]: value };
            
            // If rows or columns changed, regenerate seats
            if (field === 'rows' || field === 'columns') {
                const newSeats = generateSeats(
                    field === 'rows' ? value : prev.rows,
                    field === 'columns' ? value : prev.columns
                );
                console.log('🪑 [SEATS_REGENERATED]', { seatsCount: newSeats.length });
                setSeats(newSeats);
            }
            
            setHasChanges(true);
            return newInfo;
        });
    }, [generateSeats]);

    // Handle seat click with enhanced debugging
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
                isHidden: s.isHidden 
            }))
        });

        // Highlight seats for visual feedback
        setHighlightedSeats(seatsToUpdate.map(s => s.seatNumber));
        setTimeout(() => setHighlightedSeats([]), 800);

        setSeats(prevSeats => {
            const newSeats = [...prevSeats];
            
            seatsToUpdate.forEach(targetSeat => {
                const seatIndex = newSeats.findIndex(s => 
                    s._id === targetSeat._id || 
                    s.seatNumber === targetSeat.seatNumber ||
                    (s.location?.row === targetSeat.location?.row && s.location?.column === targetSeat.location?.column)
                );
                
                if (seatIndex !== -1) {
                    const currentSeat = newSeats[seatIndex];
                    
                    // Map selectedSeatType to appropriate type value
                    let newType = selectedSeatType === 'VIP' ? 'Couple' : 
                                  selectedSeatType === 'HIDDEN' ? 'Hidden' : 'Standard';
                    let newIsHidden = selectedSeatType === 'HIDDEN';
                    
                    // Toggle behavior
                    if (selectedSeatType === 'HIDDEN') {
                        newIsHidden = !currentSeat.isHidden;
                        newType = currentSeat.type || 'Standard';
                    } else if (currentSeat.type === newType && !currentSeat.isHidden) {
                        newType = 'Standard';
                    }
                    
                    // Handle couple seat logic
                    if (isCoupleSeat && selectedSeatType === 'VIP') {
                        newType = 'Couple';
                        newIsHidden = false;
                    }
                    
                    console.log('🔄 [SEAT_UPDATE]', {
                        seatNumber: currentSeat.seatNumber,
                        oldType: currentSeat.type,
                        newType: newType,
                        oldHidden: currentSeat.isHidden,
                        newHidden: newIsHidden
                    });
                    
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

            // Update individual seats
            if (Object.keys(seatChanges).length > 0) {
                console.log('🪑 [SEATS_UPDATE] Updating seats:', Object.keys(seatChanges).length);
                
                for (const [seatId, change] of Object.entries(seatChanges)) {
                    try {
                        const seatUpdateData = {
                            type: change.newData.type,
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
                
                console.log('✅ [SEATS_UPDATE] All seat updates completed');
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
                                    <li>• Click once to apply type</li>
                                    <li>• Click again to toggle back</li>
                                    <li>• VIP seats become couple seats when adjacent</li>
                                    <li>• Click Confirm to save changes</li>
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
