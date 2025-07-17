import { useRef, useEffect, useState } from 'react';
import RowTemplate from './ManageTable/RowTemplate.jsx';

const ManageTable = ({ data, anyTicked, setTickedRows, onEdit, onEditSeat, header, columnConfig }) => {
    const headerScrollRef = useRef(null);
    const contentScrollRef = useRef(null);
    const [expandedRow, setExpandedRow] = useState(null); // Track row nào đang expanded

    // Check if column config exists and has content
    const hasColumnConfig = columnConfig && Object.keys(columnConfig).length > 0;

    const handleTick = (rowIndex) => {
        setTickedRows((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(rowIndex)) {
                newSet.delete(rowIndex);
            } else {
                newSet.add(rowIndex);
            }
            return newSet;
        });
    };

    // Handle row expand/collapse
    const handleRowClick = (rowIndex) => {
        setExpandedRow(prev => prev === rowIndex ? null : rowIndex);
    };

    // Đồng bộ scroll ngang giữa header và content - chỉ khi có columnConfig
    useEffect(() => {
        if (!hasColumnConfig) return; // Không sync scroll nếu không có columnConfig

        const headerElement = headerScrollRef.current;
        const contentElement = contentScrollRef.current;

        if (!headerElement || !contentElement) return;

        const syncHeaderScroll = () => {
            if (contentElement.scrollLeft !== headerElement.scrollLeft) {
                headerElement.scrollLeft = contentElement.scrollLeft;
            }
        };

        const syncContentScroll = () => {
            if (headerElement.scrollLeft !== contentElement.scrollLeft) {
                contentElement.scrollLeft = headerElement.scrollLeft;
            }
        };

        contentElement.addEventListener('scroll', syncHeaderScroll);
        headerElement.addEventListener('scroll', syncContentScroll);

        return () => {
            contentElement.removeEventListener('scroll', syncHeaderScroll);
            headerElement.removeEventListener('scroll', syncContentScroll);
        };
    }, [hasColumnConfig]);

    return (
        <div className="absolute top-1/4 left-1/2 w-[90%] -translate-x-1/2 transform lg:h-[65%] xl:h-[60%]">
            {/* Header cố định - chỉ scroll ngang khi có columnConfig */}
            <div
                ref={headerScrollRef}
                className={`no-scrollbar relative z-20 w-full bg-zinc-400 rounded-t-2xl shadow-sm ${
                    hasColumnConfig ? 'overflow-x-auto' : 'overflow-x-hidden'
                }`}
                style={{ overflowY: 'hidden' }}
            >
                <div className={hasColumnConfig ? 'min-w-max' : 'w-full'}>
                    <RowTemplate data={header} isHeader={true} columnConfig={columnConfig} />
                </div>
            </div>

            {/* Content - scroll cả ngang và dọc khi có columnConfig, chỉ dọc khi không có */}
            <div
                ref={contentScrollRef}
                className={`no-scrollbar relative h-[90%] w-full overflow-y-auto ${
                    hasColumnConfig ? 'overflow-x-auto' : 'overflow-x-hidden'
                }`}
            >
                <div className={hasColumnConfig ? 'min-w-max' : 'w-full'}>
                    {data.map((row, index) => (
                        <RowTemplate
                            key={index}
                            data={row}
                            isHeader={false}
                            checked={anyTicked.has(index)}
                            rowIndex={index}
                            onTicked={() => handleTick(index)}
                            onEdit={onEdit}
                            onEditSeat={onEditSeat}
                            columnConfig={columnConfig}
                            isExpanded={expandedRow === index}
                            onRowClick={() => handleRowClick(index)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ManageTable;