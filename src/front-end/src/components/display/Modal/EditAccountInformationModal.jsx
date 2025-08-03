import CancelButton from '@components/buttons/Staff/CancelButton.jsx';
import ConfirmButton from '@components/buttons/Staff/ConfirmButton.jsx';
import CustomDropdown from '@components/UI/CustomDropdown.jsx';
import { Box, Square, SquareCheckBig, CalendarIcon } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '@styles/datepicker.css';

const TickButton = ({ onTick, check }) => {
    return (
        <button onClick={onTick} className="h-5 w-5 cursor-pointer">
            {check ? <SquareCheckBig className="h-full w-full text-white" /> : <Square className="h-full w-full text-white" />}
        </button>
    );
};

const Role = ({ index, role, isChecked, onTick }) => {
    return (
        <div className="flex items-center gap-2">
            <TickButton onTick={() => onTick(index)} check={isChecked} />
            <p className="font-libre-franklin text-xl font-normal text-white">{role}</p>
        </div>
    );
};

const InputTemplate = ({ text, className, value, onChange, type = "text", disabled = false }) => {
    return (
        <div className={`relative justify-start text-start ${className || ''}`}>
            <p className="font-libre-franklin relative text-xl font-normal text-white">{text}</p>
            <input
                type={type}
                value={value || ''}
                onChange={(e) => onChange && onChange(e.target.value)}
                disabled={disabled}
                className={`h-10 w-full rounded-lg px-3 bg-zinc-300 bg-opacity-70 text-black shadow-sm font-['Unbounded'] text-base transition-shadow duration-200 hover:shadow-md focus:ring-2 focus:ring-purple-500 focus:outline-none placeholder:text-gray-500 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                placeholder={disabled ? "Read-only" : `Enter ${text.toLowerCase()}`}
            />
        </div>
    );
};

const DatePickerTemplate = ({ text, className, value, onChange, disabled = false }) => {
    const [selectedDate, setSelectedDate] = useState(null);
    const datePickerRef = useRef(null);

    // Convert string date to Date object
    useEffect(() => {
        if (value) {
            try {
                const date = new Date(value);
                if (!isNaN(date.getTime())) {
                    setSelectedDate(date);
                } else {
                    setSelectedDate(null);
                }
            } catch (error) {
                setSelectedDate(null);
            }
        } else {
            setSelectedDate(null);
        }
    }, [value]);

    const handleDateChange = (date) => {
        setSelectedDate(date);
        if (onChange) {
            if (date) {
                // Convert to YYYY-MM-DD format
                const formattedDate = date.toISOString().split('T')[0];
                onChange(formattedDate);
            } else {
                onChange('');
            }
        }
    };

    return (
        <div className={`relative justify-start text-start ${className || ''}`}>
            <p className="font-libre-franklin relative text-xl font-normal text-white">{text}</p>
            <div className={disabled ? 'opacity-50 pointer-events-none' : ''}>
                <div className="relative">
                    <div className="absolute top-1/2 left-3 -translate-y-1/2 transform pointer-events-none z-10">
                        <CalendarIcon className="h-4 w-4 text-gray-500" />
                    </div>
                    <DatePicker
                        ref={datePickerRef}
                        selected={selectedDate}
                        onChange={handleDateChange}
                        dateFormat="dd/MM/yyyy"
                        className="h-10 w-full rounded-lg pl-10 pr-8 bg-zinc-300 bg-opacity-70 text-black shadow-sm font-['Unbounded'] text-base transition-shadow duration-200 hover:shadow-md focus:ring-2 focus:ring-purple-500 focus:outline-none placeholder:text-gray-500"
                        calendarClassName="react-datepicker-custom"
                        showPopperArrow={false}
                        autoComplete="off"
                        placeholderText={`Select ${text.toLowerCase()}`}
                        isClearable
                        todayButton="Today"
                        showYearDropdown
                        showMonthDropdown
                        dropdownMode="select"
                        maxDate={new Date()}
                        minDate={new Date('1900-01-01')}
                        shouldCloseOnSelect={true}
                    />
                </div>
            </div>
        </div>
    );
};

const DropdownTemplate = ({ text, className, value, onChange, options, disabled = false, placeholder }) => {
    return (
        <div className={`relative justify-start text-start ${className || ''}`}>
            <p className="font-libre-franklin relative text-xl font-normal text-white">{text}</p>
            <div className={disabled ? 'opacity-50 pointer-events-none' : ''}>
                <CustomDropdown
                    value={value || ''}
                    onChange={(e) => onChange && onChange(e.target.value)}
                    options={options}
                    placeholder={placeholder || `Select ${text.toLowerCase()}`}
                    name={text.toLowerCase()}
                    bgColor="zinc-300"
                    inputBgColor="zinc-300"
                    textColor="black"
                    bgOpacity="bg-opacity-70"
                    height="h-10"
                    textAlign="left"
                    inputTextSize="text-base"
                    optionTextSize="text-base"
                    borderColor=""
                    forceFillLabel={true}
                />
            </div>
        </div>
    );
};

const EditAccountInformationModal = ({ 
    onClose, 
    handleConfirm, 
    isEdit = false, 
    accountData = null, 
    onDataChange = null,
    isLoading = false,
    branches = []
}) => {
    const [chosenRole, setChosenRole] = useState(new Set());
    
    // Debug logs
    console.log('Modal props:', { branches, accountData, chosenRole: Array.from(chosenRole) });
    
    // Initialize roles when modal opens
    useEffect(() => {
        if (isEdit && accountData?.roles) {
            const roleIndices = new Set();
            accountData.roles.forEach(role => {
                switch(role.toLowerCase()) {
                    case 'customer': roleIndices.add(1); break;
                    case 'cashier': roleIndices.add(2); break;
                    case 'checkincounter': roleIndices.add(3); break;
                    case 'branchmanager': roleIndices.add(4); break;
                    case 'administrator': roleIndices.add(5); break;
                }
            });
            setChosenRole(roleIndices);
        } else if (!isEdit) {
            setChosenRole(new Set([1])); // Default to customer for new accounts
        }
    }, [isEdit, accountData?.roles]); // Only depend on roles, not entire accountData


    const handleChosenRole = (roleIndex) => {
        setChosenRole((prev) => {
            const newSet = new Set(prev);

            const isCustomer = roleIndex === 1;
            const isAdministrator = roleIndex === 5;
            
            if (newSet.has(roleIndex)) {
                // Nếu đã có role này, xóa nó
                newSet.delete(roleIndex);
            } else {
                if (isCustomer || isAdministrator) {
                    // Customer hoặc Administrator: clear tất cả và chỉ add role này
                    newSet.clear();
                    newSet.add(roleIndex);
                } else {
                    // Role khác: xóa customer và administrator, rồi add role này
                    newSet.delete(1); // xóa customer
                    newSet.delete(5); // xóa administrator  
                    newSet.add(roleIndex);
                }
            }

            return newSet;
        });
    };

    const handleFieldChange = (field, value) => {
        if (onDataChange) {
            onDataChange(field, value);
        }
    };

    const genderOptions = [
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' },
        { value: 'other', label: 'Other' }    ];

    return (
        <div className="absolute inset-0 z-50 bg-slate-900/10 backdrop-blur-[20px]">
            <div className="fixed inset-[10%] flex items-center justify-center gap-[5%] rounded-xl shadow-[8px_8px_20px_0px_rgba(0,0,0,0.25)] backdrop-blur-[20px] lg:bg-slate-900/60 xl:bg-slate-900">
                <div className="relative flex h-full w-[60%] flex-col items-start justify-center gap-4">
                    <div className="relative flex w-full gap-4">
                        <InputTemplate 
                            text="Name" 
                            className="w-[100%]" 
                            value={accountData?.name || ''} 
                            onChange={(value) => handleFieldChange('name', value)}
                        />
                    </div>
                    <div className="relative flex w-full gap-4">
                        <DatePickerTemplate 
                            text="Birthday" 
                            className="w-[60%] lg:w-[70%]" 
                            value={accountData?.birthday || ''} 
                            onChange={(value) => handleFieldChange('birthday', value)}
                        />
                        <DropdownTemplate 
                            text="Gender" 
                            className="w-[35%] lg:w-[25%]" 
                            value={accountData?.gender || 'male'} 
                            onChange={(value) => handleFieldChange('gender', value)}
                            options={genderOptions}
                        />
                    </div>
                    <InputTemplate 
                        text="Email" 
                        className="w-[100%]" 
                        type="email"
                        value={accountData?.email || ''} 
                        onChange={(value) => handleFieldChange('email', value)}
                    />
                    <InputTemplate 
                        text="Phone Number" 
                        className="w-[100%]" 
                        type="tel"
                        value={accountData?.phone || ''} 
                        onChange={(value) => handleFieldChange('phone', value)}
                    />
                    {!isEdit && (
                        <InputTemplate 
                            text="Password" 
                            className="w-[100%]" 
                            type="password"
                            value={accountData?.password || ''} 
                            onChange={(value) => handleFieldChange('password', value)}
                        />
                    )}
                    {[2, 3, 4].some(chosenRole.has, chosenRole) ?(
                        <DropdownTemplate 
                            text="Branch" 
                            className="w-[100%]" 
                            value={
                                typeof accountData?.branch === 'object' && accountData?.branch?._id 
                                    ? accountData.branch._id 
                                    : accountData?.branch || ''
                            } 
                            onChange={(value) => handleFieldChange('branch', value)}
                            placeholder="Select Branch"
                            options={branches.map(branch => ({
                                value: branch._id,
                                label: branch.name
                            }))}
                        />
                    ) : null }
                </div>
                <div className="relative flex h-full flex-col items-start justify-center gap-[20%]">
                    <div className="flex flex-col gap-2">
                        <Role index={1} role="Customer" isChecked={chosenRole.has(1)} onTick={handleChosenRole} />
                        <Role index={2} role="Cashier" isChecked={chosenRole.has(2)} onTick={handleChosenRole} />
                        <Role index={3} role="Check-in counter" isChecked={chosenRole.has(3)} onTick={handleChosenRole} />
                        <Role index={4} role="Branch manager" isChecked={chosenRole.has(4)} onTick={handleChosenRole} />
                        <Role index={5} role="Administrator" isChecked={chosenRole.has(5)} onTick={handleChosenRole} />
                    </div>
                    <div className="flex flex-col gap-4">
                        <CancelButton onClick={onClose} disabled={isLoading} />
                        <ConfirmButton 
                            onClick={() => handleConfirm(chosenRole)} 
                            disabled={isLoading || chosenRole.size === 0}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditAccountInformationModal;
