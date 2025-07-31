import CancelButton from '@components/buttons/Staff/CancelButton.jsx';
import ConfirmButton from '@components/buttons/Staff/ConfirmButton.jsx';
import { Box, Square, SquareCheckBig } from 'lucide-react';
import { useState, useEffect } from 'react';

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

const BoxTemplate = ({ text, className, value, onChange, type = "text", disabled = false }) => {
    return (
        <div className={`relative justify-start text-start ${className || ''}`}>
            <p className="font-libre-franklin relative text-xl font-normal text-white">{text}</p>
            <input
                type={type}
                value={value || ''}
                onChange={(e) => onChange && onChange(e.target.value)}
                disabled={disabled}
                className="relative h-10 w-full rounded-xl bg-zinc-300/70 px-3 text-black placeholder:text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder={disabled ? "Read-only" : `Enter ${text.toLowerCase()}`}
            />
        </div>
    );
};

const SelectTemplate = ({ text, className, value, onChange, options, disabled = false }) => {
    return (
        <div className={`relative justify-start text-start ${className || ''}`}>
            <p className="font-libre-franklin relative text-xl font-normal text-white">{text}</p>
            <select
                value={value || ''}
                onChange={(e) => onChange && onChange(e.target.value)}
                disabled={disabled}
                className="relative h-10 w-full rounded-xl bg-zinc-300/70 px-3 text-black disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
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
        } else {
            setChosenRole(new Set([1])); // Default to customer for new accounts
        }
    }, [isEdit, accountData]);

    const handleChosenRole = (roleIndex) => {
        setChosenRole((prev) => {
            const newSet = new Set(prev);

            const isCustomer = roleIndex === 1;

            if (newSet.has(roleIndex)) {
                newSet.delete(roleIndex);
            } else {
                if (isCustomer) {
                    newSet.clear();
                    newSet.add(1);
                } else {
                    newSet.delete(1);
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
        { value: 'other', label: 'Other' }
    ];

    return (
        <div className="absolute inset-0 z-50 bg-slate-900/10 backdrop-blur-[20px]">
            <div className="fixed inset-[10%] flex items-center justify-center gap-[5%] rounded-xl shadow-[8px_8px_20px_0px_rgba(0,0,0,0.25)] backdrop-blur-[20px] lg:bg-slate-900/60 xl:bg-slate-900">
                <div className="relative flex h-full w-[60%] flex-col items-start justify-center gap-4">
                    <div className="relative flex w-full gap-4">
                        <BoxTemplate 
                            text="Name" 
                            className="w-[100%]" 
                            value={accountData?.name || ''} 
                            onChange={(value) => handleFieldChange('name', value)}
                        />
                    </div>
                    <div className="relative flex w-full gap-4">
                        <BoxTemplate 
                            text="Birthday" 
                            className="w-[60%]" 
                            type="date"
                            value={accountData?.birthday || ''} 
                            onChange={(value) => handleFieldChange('birthday', value)}
                        />
                        <SelectTemplate 
                            text="Gender" 
                            className="w-[35%]" 
                            value={accountData?.gender || 'male'} 
                            onChange={(value) => handleFieldChange('gender', value)}
                            options={genderOptions}
                        />
                    </div>
                    <BoxTemplate 
                        text="Email" 
                        className="w-[100%]" 
                        type="email"
                        value={accountData?.email || ''} 
                        onChange={(value) => handleFieldChange('email', value)}
                    />
                    <BoxTemplate 
                        text="Phone Number" 
                        className="w-[100%]" 
                        type="tel"
                        value={accountData?.phone || ''} 
                        onChange={(value) => handleFieldChange('phone', value)}
                    />
                    {!isEdit && (
                        <BoxTemplate 
                            text="Password" 
                            className="w-[100%]" 
                            type="password"
                            value={accountData?.password || ''} 
                            onChange={(value) => handleFieldChange('password', value)}
                        />
                    )}
                    {chosenRole.has(1) ? null : (
                        <SelectTemplate 
                            text="Branch" 
                            className="w-[100%]" 
                            value={
                                typeof accountData?.branch === 'object' && accountData?.branch?._id 
                                    ? accountData.branch._id 
                                    : accountData?.branch || ''
                            } 
                            onChange={(value) => handleFieldChange('branch', value)}
                            options={[
                                { value: '', label: 'Select Branch' },
                                ...branches.map(branch => ({
                                    value: branch._id,
                                    label: branch.name
                                }))
                            ]}
                        />
                    )}
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
