
// =============================================================================
// IMPORTS
// =============================================================================

import { useState, useEffect } from 'react';
import SnackSelect from '../../components/UI/SnackSelect';
import NextNaviButton from '@components/buttons/NaviButton';

// SweetAlert for popup notifications
import { showWarning } from '@utils/sweetalert.js';

// =============================================================================
// MAIN SNACK LIST COMPONENT
// =============================================================================

const SnackList = ({ snacks = [], loading, updateSnackTicket, snackTicketData, handleNext }) => {
    // =============================================================================
    // EVENT HANDLERS
    // =============================================================================

    const handleSnackChange = (shortname, newQuantity, snackName, price) => {
        const snacksArr = Array.isArray(snackTicketData?.snackList) ? [...snackTicketData.snackList] : [];
        const existingIndex = snacksArr.findIndex(item => item.shortname === shortname);
        const snackObj = Array.isArray(snacks) ? snacks.find(s => s.shortname === shortname) : null;
        const stock = snackObj?.stock.total ?? Infinity;
        
        if (newQuantity > stock) {
            showWarning('Stock Limit', `Only ${stock} of this snack is available in stock.`, 1000);
            return;
        }
        
        let newSnackList;
        if (existingIndex >= 0) {
            if (newQuantity > 0) {
                newSnackList = [...snacksArr];
                newSnackList[existingIndex].quantity = newQuantity;
            } else {
                newSnackList = [...snacksArr];
                newSnackList.splice(existingIndex, 1);
            }
        } else if (newQuantity > 0) {
            newSnackList = [...snacksArr, { shortname, quantity: newQuantity, name: snackName }];
        } else {
            newSnackList = [...snacksArr];
        }
        
        const total = newSnackList.reduce((sum, item) => {
            const snack = snacks.find(s => s.shortname === item.shortname);
            return sum + (snack ? snack.price * item.quantity : 0);
        }, 0);
        
        updateSnackTicket({ snackList: newSnackList, total });
    };

    const handleSnackAdd = (shortname, snackName, price) => {
        const snacksArr = Array.isArray(snackTicketData?.snackList) ? [...snackTicketData.snackList] : [];
        const existing = snacksArr.find(item => item.shortname === shortname);
        const newQty = (existing?.quantity || 0) + 1;
        handleSnackChange(shortname, newQty, snackName, price);
    };

    const handleSnackRemove = (shortname, snackName, price) => {
        const snacksArr = Array.isArray(snackTicketData?.snackList) ? [...snackTicketData.snackList] : [];
        const existing = snacksArr.find(item => item.shortname === shortname);
        const newQty = Math.max((existing?.quantity || 0) - 1, 0);
        handleSnackChange(shortname, newQty, snackName, price);
    };

    // =============================================================================
    // COMPONENT RENDER
    // =============================================================================

    return (
        <div className="flex flex-col items-center justify-center w-full h-full">
            <div className="flex items-start justify-center h-[80vh] rounded-xl w-[90%] relative">
                <div className="absolute pointer-events-none inset-0 w-full h-full bg-zinc-300/30 mix-blend-color-dodge"/>
                
                <div className='flex flex-col items-start justify-start h-full w-full'>
                    <div className="flex flex-row flex-wrap gap-4 items-start justify-start w-full h-full py-4 px-6">
                        {loading ? (
                            <div className="text-white w-full text-center">• • •</div>
                        ) : Array.isArray(snacks) && snacks.length > 0 ? (
                            (() => {
                                const totalQty = snacks.reduce((sum, snack) => sum + (snack.stock.total || 0), 0);
                                if (totalQty === 0) {
                                    return (
                                        <div className="text-white w-auto m-auto font-['Unbounded']">
                                            No snacks available.
                                        </div>
                                    );
                                }
                                return snacks.filter(snack => snack.stock.total > 0).map(snack => (
                                    <SnackSelect
                                        key={snack._id}
                                        snack_type={snack.name}
                                        description={snack.description}
                                        price={snack.price}
                                        onChange={fn => {
                                            const currentQty = (Array.isArray(snackTicketData?.snackList)
                                                ? snackTicketData.snackList.find(s => s.shortname === snack.shortname)?.quantity
                                                : 0) || 0;
                                            const newQty = typeof fn === 'function' ? fn(currentQty) : fn;
                                            handleSnackChange(snack.shortname, newQty, snack.name, snack.price);
                                        }}
                                        quantity={
                                            (Array.isArray(snackTicketData?.snackList)
                                                ? snackTicketData.snackList.find(s => s.shortname === (snack.shortname))?.quantity
                                                : 0) || 0
                                        }
                                        stock={snack.stock.total || 0}
                                    />
                                ));
                            })()
                        ) : (
                            <div className="text-white w-auto m-auto font-['Unbounded']">
                                No snacks available.
                            </div>
                        )}
                    </div>
                    
                    <div className={`flex items-center w-full pr-6 pb-6 h-auto justify-end`}>
                        <NextNaviButton onClick={handleNext} text={'SNACKS'} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SnackList;