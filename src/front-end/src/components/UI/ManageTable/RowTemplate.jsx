import TickButton from '../../buttons/Staff/TickButton.jsx';
import ActiveButton from '../../buttons/Staff/ActiveButton.jsx';
import EditButton from '../../buttons/Staff/EditButton.jsx';

const RowTemplate = (props) => {
    return (
        <div className="z-10 flex w-full flex-col">
            <div className={`relative flex items-center justify-center gap-1 px-[3%] lg:py-3 xl:gap-2 xl:py-5 ${props.checked ? 'bg-zinc-400' : ''}`}>
                {Array.from({ length: props.data?.length }, (_, index) => {
                    const value = props.data?.[index];
                    return (
                        <p key={index} className={`font-libre-franklin h-full w-full justify-start text-left lg:text-lg xl:text-xl ${props.isHeader ? 'font-bold' : 'font-medium'}`}>
                            {value === 'TickButton' ? (
                                props.isHeader ? (
                                    ''
                                ) : (
                                    <TickButton check={props.checked} onTick={props.onTicked} />
                                )
                            ) : value === 'ActiveButton' ? (
                                props.isHeader ? (
                                    'Active'
                                ) : (
                                    <ActiveButton />
                                )
                            ) : value === 'Edit' ? (
                                props.isHeader ? (
                                    'Edit'
                                ) : (
                                    <EditButton onClick={() => props.onEdit?.(props.rowIndex)} />
                                )
                            ) : value === 'EditSeatButton' ? (
                                props.isHeader ? (
                                    'Seat'
                                ) : (
                                    <EditButton onClick={() => props.onEditSeat?.(props.rowIndex)} />
                                )
                            ) : (
                                value
                            )}
                        </p>
                    );
                })}
            </div>
            <div className="relative h-[3px] w-full bg-slate-950" />
        </div>
    );
};

export default RowTemplate;
