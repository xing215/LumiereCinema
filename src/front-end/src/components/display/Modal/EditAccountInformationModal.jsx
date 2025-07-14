import CancelButton from "../../buttons/Staff/CancelButton.jsx";
import ConfirmButton from "../../buttons/Staff/ConfirmButton.jsx";
import {Box, Square, SquareCheckBig} from "lucide-react";
import { useState } from "react";

const TickButton = ({ onTick, check }) => {
    return (
        <button onClick={onTick} className="h-5 w-5 cursor-pointer">
            {check ? (
                <SquareCheckBig className="h-full w-full text-white" />
            ) : (
                <Square className="h-full w-full text-white" />
            )}
        </button>
    );
};

const Role = ({ index, role, isChecked, onTick }) => {
    return (
        <div className="flex items-center gap-2">
            <TickButton onTick={() => onTick(index)} check={isChecked} />
            <p className="text-xl font-normal text-white font-libre-franklin">{role}</p>
        </div>
    );
};

const BoxTemplate = (props) => {
    return (
        <div className={`relative text-start justify-start ${props.className || ''}`}>
            <p className="relative text-white text-xl font-normal font-libre-franklin">{props.text}</p>
            <div className="relative bg-zinc-300/70 rounded-xl w-full h-10" />
        </div>
    );
};

const EditAccountInformationModal = (props) => {
    const [chosenRole, setChosenRole] = useState(new Set());

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
                }
                else {
                    newSet.delete(1);
                    newSet.add(roleIndex);
                }
            }

            return newSet;
        });
    };

    return (
        <div className="absolute inset-0 z-50 bg-slate-900/10 backdrop-blur-[20px]">
            <div className="fixed inset-[10%] flex items-center justify-center gap-[5%] rounded-xl shadow-[8px_8px_20px_0px_rgba(0,0,0,0.25)] backdrop-blur-[20px] lg:bg-slate-900/60 xl:bg-slate-900">
                <div className="w-[60%] flex flex-col relative justify-center gap-4 h-full items-start">
                    <div className="w-full flex relative gap-4">
                        <BoxTemplate text="ID" className="w-[20%]"/>
                        <BoxTemplate text="Name" className="w-[75%]"/>
                    </div>
                    <div className="w-full flex relative gap-4">
                        <BoxTemplate text="Birthday" className="w-[60%]"/>
                        <BoxTemplate text="Gender" className="w-[35%]"/>
                    </div>
                    <BoxTemplate text="Email" className="w-[100%]"/>
                    <BoxTemplate text="Phone Number" className="w-[100%]"/>
                    <BoxTemplate text="Password" className="w-[100%]"/>
                    {chosenRole.has(1) ? null : <BoxTemplate text="Cinema" className="w-[100%]"/>}
                </div>
                <div className="flex flex-col relative justify-center gap-[20%] h-full items-start">
                    <div className="flex flex-col gap-2">
                        <Role index={1} role="Customer" isChecked={chosenRole.has(1)} onTick={handleChosenRole} />
                        <Role index={2} role="Cashier" isChecked={chosenRole.has(2)} onTick={handleChosenRole} />
                        <Role index={3} role="Check-in counter" isChecked={chosenRole.has(3)} onTick={handleChosenRole} />
                        <Role index={4} role="Branch manager" isChecked={chosenRole.has(4)} onTick={handleChosenRole} />
                        <Role index={5} role="Administrator" isChecked={chosenRole.has(5)} onTick={handleChosenRole} />
                    </div>
                    <div className="flex flex-col gap-4">
                        <CancelButton onClick={props.onClose} />
                        <ConfirmButton onClick={() => props.handleConfirm(chosenRole)} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditAccountInformationModal;
