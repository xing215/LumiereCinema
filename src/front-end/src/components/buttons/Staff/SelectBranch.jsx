import { useUser } from '@contexts/UserContext';

const BranchButton = ({ isLoading, branchName, clickable = false }) => {
    const { user } = useUser();

    const roles = user?.roles || [];
    if (!roles.includes('branchmanager') && !roles.includes('cashier')) {
        return null;
    }

    const displayName = isLoading 
        ? 'LOADING...' 
        : `  ${branchName?.toUpperCase() || ''}`;

    return (
        <button className={`absolute bottom-5 left-1/2 h-9 w-96 -translate-x-1/2 transform ${clickable ? 'hover:cursor-pointer' : ''}`}>
            <div className="absolute top-0 left-0 h-9 w-96 rounded-xl bg-white shadow-[inset_0px_0px_50px_3px_rgba(3,5,28,1.00)]" />
            <div className="font-unbounded absolute top-1/2 left-1/2 -translate-1/2 transform justify-start text-center text-base font-bold text-nowrap text-white">
                {displayName}
            </div>
        </button>
    );
};

export default BranchButton;