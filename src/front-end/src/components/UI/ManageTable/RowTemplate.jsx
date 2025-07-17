import TickButton from '../../buttons/Staff/TickButton.jsx';
import ActiveButton from '../../buttons/Staff/ActiveButton.jsx';
import EditButton from '../../buttons/Staff/EditButton.jsx';
import PreviewButton from "../../buttons/Staff/PreviewButton.jsx";

const RowTemplate = (props) => {
    // Check nếu có columnConfig hay không
    const hasColumnConfig = props.columnConfig && props.columnConfig.length > 0;

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

    // Handle click - nhưng không trigger khi click vào button
    const handleRowClick = (e) => {
        // Không expand khi click vào button, checkbox, etc.
        if (e.target.tagName === 'BUTTON' ||
            e.target.type === 'checkbox' ||
            e.target.closest('button') ||
            e.target.closest('[role="button"]') ||
            e.target.closest('.tick-button') ||
            e.target.closest('.action-button')) {
            return;
        }

        if (props.onRowClick && !props.isHeader) {
            props.onRowClick();
        }
    };

    return (
        <div className="z-10 flex flex-col">
            <div
                className={`relative flex items-center gap-5 pl-[3%] pr-[3%] lg:py-3 xl:gap-2 xl:py-5 transition-all duration-300 
                    ${props.checked ? 'bg-zinc-400' : ''} 
                    ${props.isExpanded ? 'bg-zinc-300 shadow-md' : ''} 
                    ${!props.isHeader ? 'hover:bg-gray-50 cursor-pointer' : ''}
                    ${!hasColumnConfig ? 'justify-between' : ''}`} // Thêm justify-between khi không có config
                onClick={handleRowClick}
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
                            className={`${columnWidth} ${hasColumnConfig ? 'flex-shrink-0' : ''} flex ${props.isExpanded ? 'items-start' : 'items-center'} justify-center`}
                        >
                            <div className={`font-libre-franklin w-full lg:text-lg xl:text-xl text-center justify-center
                                ${props.isHeader ? 'font-bold' : 'font-medium'} 
                                ${shouldTruncateText ? 'truncate' : ''} 
                                ${props.isExpanded && !props.isHeader ? 'whitespace-normal break-words py-2' : ''}`}>
                                {value === 'TickButton' ? (
                                    props.isHeader ? (
                                        <span></span>
                                    ) : (
                                        <div className="tick-button flex justify-center w-full" onClick={(e) => e.stopPropagation()}>
                                            <TickButton check={props.checked} onTick={props.onTicked} />
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
                                ) : value === 'EditButton' ? (
                                    props.isHeader ? (
                                        <span>Edit</span>
                                    ) : (
                                        <div className="action-button flex justify-center w-full" onClick={(e) => e.stopPropagation()}>
                                            <EditButton />
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
                                            <PreviewButton onClick={() => props.onPreview?.(props.rowIndex)} />
                                        </div>
                                    )
                                ) : (
                                    <span title={tooltipText} className={props.isExpanded ? 'whitespace-normal leading-relaxed' : ''}>
                                        {value}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="relative h-[3px] min-w-[105%] bg-slate-950" />
        </div>
    );
};

export default RowTemplate;