import React from 'react';
import TickButton from '@components/buttons/Staff/TickButton.jsx';
import ActiveButton from '@components/buttons/Staff/ActiveButton.jsx';
import EditButton from '@components/buttons/Staff/EditButton.jsx';
import PreviewButton from "@components/buttons/Staff/PreviewButton.jsx";
import EditableCell from '@components/UI/EditableCell.jsx';

const RowTemplate = (props) => {
    // Check nếu có columnConfig hay không
    const hasColumnConfig = props.columnConfig && props.columnConfig.length > 0;

    // State for handling delayed expansion
    const [expandTimeout, setExpandTimeout] = React.useState(null);
    const [isDoubleClick, setIsDoubleClick] = React.useState(false);

    // Sử dụng columnConfig được truyền từ component cha
    const getColumnWidth = (index) => {
        if (hasColumnConfig && props.columnConfig[index]) {
            return props.columnConfig[index].width || 'w-20';
        }
        return 'flex-1'; // Sử dụng flex-1 khi không có config để chia đều
    };

    const shouldTruncate = (index) => {
        if (hasColumnConfig && props.columnConfig[index]) {
            // Nếu row đang expanded, không truncate
            return props.isExpanded ? false : (props.columnConfig[index].truncate || false);
        }
        return false; // default không truncate
    };

    const getTooltipText = (index, value) => {
        // Không cần tooltip khi expanded
        if (props.isExpanded) return undefined;

        if (shouldTruncate(index) && typeof value === 'string') {
            return value;
        }
        return undefined;
    };

    // Handle click - use timeout to detect single vs double click
    const handleRowClick = (e) => {
        // Don't expand when clicking on buttons, checkboxes, or editable cells
        if (e.target.tagName === 'BUTTON' ||
            e.target.type === 'checkbox' ||
            e.target.closest('button') ||
            e.target.closest('[role="button"]') ||
            e.target.closest('.tick-button') ||
            e.target.closest('.action-button') ||
            e.target.closest('input')) {
            return;
        }

        // If this is part of a double-click sequence, ignore the single click
        if (isDoubleClick) {
            return;
        }

        if (props.onRowClick && !props.isHeader) {
            // Clear any existing timeout
            if (expandTimeout) {
                clearTimeout(expandTimeout);
                setExpandTimeout(null);
            }
            
            // Set a timeout to execute single-click action only if no double-click occurs
            const timeout = setTimeout(() => {
                // Check again if it's still not a double-click before executing
                if (!isDoubleClick) {
                    props.onRowClick();
                }
                setExpandTimeout(null);
            }, 300);
            
            setExpandTimeout(timeout);
        }
    };

    // Handle double-click - cancel single-click action and let EditableCell handle editing
    const handleDoubleClick = (e) => {
        // Set the double-click flag immediately
        setIsDoubleClick(true);
        
        // Cancel the pending single-click action
        if (expandTimeout) {
            clearTimeout(expandTimeout);
            setExpandTimeout(null);
        }
        
        // Reset the double-click flag after a short delay
        setTimeout(() => {
            setIsDoubleClick(false);
        }, 100);
        
        // Don't call onRowClick for double-click - this allows EditableCell to handle editing
    };

    // Clear timeout on component unmount
    React.useEffect(() => {
        return () => {
            if (expandTimeout) {
                clearTimeout(expandTimeout);
            }
        };
    }, [expandTimeout]);

    // Check if this is a review row
    const isReviewRow = props.data && props.data[0] && typeof props.data[0] === 'object' && props.data[0].type === 'ReviewIndicator';
    
    // Check if this is an add movie row
    const isAddRow = props.data && props.data[0] && typeof props.data[0] === 'object' && props.data[0].type === 'AddIndicator';

    return (
        <div className="z-10 flex flex-col">
            <div
                className={`relative flex items-center gap-5 pl-[3%] pr-[3%] lg:py-3 xl:gap-2 xl:py-5 transition-all duration-300 
                    ${props.checked ? 'bg-zinc-400' : ''} 
                    ${props.isExpanded ? 'bg-zinc-300 shadow-md' : ''} 
                    ${isReviewRow ? 'bg-orange-50 border-l-4 border-orange-500 shadow-lg' : ''} 
                    ${isAddRow ? 'bg-green-50 border-l-4 border-green-500 shadow-lg' : ''} 
                    ${!props.isHeader ? 'hover:bg-gray-50 cursor-pointer' : ''}
                    ${!hasColumnConfig ? 'justify-between' : ''}
                    ${hasColumnConfig ? 'min-w-max' : 'w-full'}`}
                onClick={handleRowClick}
                onDoubleClick={handleDoubleClick}
                style={{
                    minHeight: props.isExpanded ? 'auto' : 'inherit'
                }}
            >
                {Array.from({ length: props.data?.length }, (_, index) => {
                    const value = props.data?.[index];
                    const columnWidth = getColumnWidth(index);
                    const shouldTruncateText = shouldTruncate(index);
                    const tooltipText = getTooltipText(index, value);

                    return (
                        <div
                            key={index}
                            className={`${columnWidth} ${hasColumnConfig ? 'flex-shrink-0' : ''} flex ${props.isExpanded ? 'items-start' : 'items-center'} ${index === 1 ? 'justify-start' : 'justify-center'}`}
                        >
                            <div 
                                className={`font-libre-franklin w-full lg:text-lg xl:text-xl text-center justify-center
                                    ${props.isHeader ? 'font-bold' : 'font-medium'} 
                                    ${props.isExpanded && !props.isHeader ? 'whitespace-normal break-words py-2' : ''}`}
                                style={shouldTruncateText ? {
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                } : {}}
                            >
                                {value === 'TickButton' ? (
                                    props.isHeader ? (
                                        <span></span>
                                    ) : (
                                        <div className="tick-button flex justify-center w-full" onClick={(e) => e.stopPropagation()}>
                                            <TickButton check={props.checked} onTick={props.onTicked} />
                                        </div>
                                    )
                                ) : value && typeof value === 'object' && value.type === 'ReviewIndicator' ? (
                                    props.isHeader ? (
                                        <span></span>
                                    ) : (
                                        <div className="flex justify-center w-full">
                                            <span className="px-2 py-1 text-xs font-bold text-white bg-blue-500 rounded-full animate-pulse">
                                                REVIEW
                                            </span>
                                        </div>
                                    )
                                ) : value && typeof value === 'object' && value.type === 'AddIndicator' ? (
                                    props.isHeader ? (
                                        <span></span>
                                    ) : (
                                        <div className="flex justify-center w-full">
                                            <span className="px-2 py-1 text-xs font-bold text-white bg-green-500 rounded-full animate-pulse">
                                                NEW
                                            </span>
                                        </div>
                                    )
                                ) : value === 'ActiveButton' ? (
                                    props.isHeader ? (
                                        <span>Active</span>
                                    ) : (
                                        <div className="action-button flex justify-center w-full" onClick={(e) => e.stopPropagation()}>
                                            <ActiveButton />
                                        </div>
                                    )
                                ) : value && typeof value === 'object' && value.type === 'ActiveButton' ? (
                                    props.isHeader ? (
                                        <span>Active</span>
                                    ) : (
                                        <div className="action-button flex justify-center w-full" onClick={(e) => e.stopPropagation()}>
                                            <ActiveButton 
                                                isHidden={value.isHidden}
                                                onToggle={(newIsHidden) => props.onStatusChange?.(value.rowIndex, newIsHidden)}
                                                disabled={value.disabled || props.isUpdating}
                                                activeLabel="Visible"
                                                inactiveLabel="Hidden"
                                                isUpdating={value.isUpdating || false}
                                                isRowTicked={props.checked}
                                            />
                                        </div>
                                    )
                                ) : value === 'EditButton' ? (
                                    props.isHeader ? (
                                        <span>Edit</span>
                                    ) : (
                                        <div className="action-button flex justify-center w-full" onClick={(e) => e.stopPropagation()}>
                                            <EditButton onClick={() => props.onEdit?.(props.rowIndex)} />
                                        </div>
                                    )
                                ) : value === 'EditSeatButton' ? (
                                    props.isHeader ? (
                                        <span>Seat</span>
                                    ) : (
                                        <div className="action-button flex justify-center w-full" onClick={(e) => e.stopPropagation()}>
                                            <EditButton onClick={() => props.onEditSeat?.(props.rowIndex)} />
                                        </div>
                                    )
                                ) : value === 'PreviewButton' ? (
                                    props.isHeader ? (
                                        <span>Preview</span>
                                    ) : (
                                        <div className="action-button flex justify-center w-full" onClick={(e) => e.stopPropagation()}>
                                            <PreviewButton 
                                                onClick={() => props.onPreview?.(props.rowIndex)} 
                                                disabled={isReviewRow}
                                            />
                                        </div>
                                    )
                                ) : value && typeof value === 'object' && value.type === 'ReviewLabel' ? (
                                    props.isHeader ? (
                                        <span>Preview</span>
                                    ) : (
                                        <div className="action-button flex justify-center w-full" onClick={(e) => e.stopPropagation()}>
                                            <PreviewButton/>
                                        </div>
                                    )
                                ) : value && typeof value === 'object' && value.type === 'AddLabel' ? (
                                    props.isHeader ? (
                                        <span>Preview</span>
                                    ) : (
                                        <div className="action-button flex justify-center w-full" onClick={(e) => e.stopPropagation()}>
                                            <PreviewButton/>
                                        </div>
                                    )
                                ) : value && typeof value === 'object' && value.type === 'StatusIndicator' ? (
                                    props.isHeader ? (
                                        <span>Status</span>
                                    ) : (
                                        <div className="flex flex-col gap-1 w-full items-center">
                                            <div className={`flex items-center justify-center w-6 h-6 rounded-full text-sm font-bold ${
                                                value.isValid 
                                                    ? 'bg-green-100 text-green-600' 
                                                    : 'bg-red-100 text-red-600'
                                            }`}>
                                                {value.isValid ? '✓' : '✗'}
                                            </div>
                                            {value.errors && (
                                                <span className="text-red-600 text-xs text-center max-w-full break-words">
                                                    {value.errors}
                                                </span>
                                            )}
                                        </div>
                                    )
                                ) : (
                                    // Check if this cell should be editable
                                    props.editableFields && props.editableFields.includes(index) && !props.isHeader ? (
                                        <EditableCell
                                            value={value}
                                            isEditing={props.editingCell?.rowIndex === props.rowIndex && props.editingCell?.columnIndex === index}
                                            onStartEdit={() => props.onStartEdit?.(props.rowIndex, index, value)}
                                            onSave={(newValue) => props.onSaveEdit?.(props.rowIndex, index, newValue)}
                                            onCancel={props.onCancelEdit}
                                            disabled={false}
                                            isUpdating={props.isUpdating && props.editingCell?.rowIndex === props.rowIndex && props.editingCell?.columnIndex === index}
                                            className={props.isExpanded ? 'whitespace-normal leading-relaxed' : ''}
                                            tooltipText={tooltipText}
                                            shouldTruncate={shouldTruncateText && !props.isExpanded}
                                            fieldType={(props.fieldTypes && props.fieldTypes[index] ? props.fieldTypes[index] : 'text') }
                                        />
                                    ) : (
                                        <span
                                            title={tooltipText}
                                            className={`
                                                ${props.isExpanded ? 'whitespace-normal leading-relaxed' : ''} 
                                                ${shouldTruncateText && !props.isExpanded ? 'truncate block' : ''}
                                            `}
                                        >
                                           {value}
                                        </span>
                                    )
                                )}
                            </div>
                        </div>
                    );
                })}
                {/* Separator line as absolute positioned element within the row */}
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-slate-950" />
            </div>
        </div>
    );
};

export default RowTemplate;