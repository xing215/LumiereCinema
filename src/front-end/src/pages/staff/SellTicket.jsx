// =============================================================================
// IMPORTS
// =============================================================================

// React core
import { useState, useEffect, useMemo } from 'react';

// Layout and UI components
import StaffLayout from '@layouts/StaffLayout.jsx';
import MobileNotSupported from '@components/display/MobileNotSupported.jsx';
import SelectBranchButton from '@components/buttons/Staff/SelectBranch.jsx';
import CustomDropdown from "@/components/UI/CustomDropdown";
import BackwardButton from '@components/buttons/backwardButton2.jsx';
import TicketDetail from '@components/UI/TicketDetail.jsx';

// Feature-specific components
import MovieList from '@layouts/SellTicket/MovieList';
import Schedule from '@layouts/SellTicket/Schedule';
import SeatsScreen from '@layouts/SellTicket/SeatsScreen';
import SnackList from '@/layouts/SellTicket/SnacksList';
import Payment from '@/layouts/SellTicket/Payment';

// Hooks
import { useFetchNowShowing, useFetchComingSoon, useGetMovieDetail } from '@hooks/useMovie';
import { useGetBranchById, useGetSchedules } from '@hooks/useBranch';
import { useStartHoldSession, useClearSession, useCreateTicket, useGetSnacksByBranch, useGetSeatsBySchedule } from '@hooks/useTicket';
import { useUser } from '@contexts/UserContext.jsx';

// =============================================================================
// EMPLOYEE INPUT COMPONENT
// =============================================================================

const InputSeller = ({ value, onBlur, onChange }) => {
    return (
        <div className='absolute right-[5%] top-[4%] flex flex-row items-center justify-center md:w-[50%] lg:w-[25%] min-w-[260px]'>
            <div className="w-[40%] text-white text-right mr-2 text-lg font-normal font-['Unbounded']">Employee:</div>
            <input
                type="text"
                name="name"
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                className={`bg-opacity-70 h-8 w-[60%]  disabled:bg-zinc-300/5 disabled:text-white disabled:ring-1 disabled:ring-amber-50 rounded-lg bg-zinc-300 px-3 text-black placeholder-gray-600 focus:ring-2 focus:outline-none sm:px-4 focus:bg-opacity-90 font-['Unbounded'] text-sm sm:text-base md:text-lg`}
                required
            />
        </div>
    );
};

// =============================================================================
// MAIN SELL TICKET COMPONENT
// =============================================================================

const SellTicket = () => {
    // =============================================================================
    // CONSTANTS AND CONFIGURATION
    // =============================================================================

    const MENU_STEPS = {
        MOVIE_LIST: 0,
        SCHEDULE: 1,
        SEATS: 2,
        SNACK: 3,
        PAYMENT: 4,
        TICKET_DISPLAY: 5
    };

    // =============================================================================
    // CONTEXT AND USER DATA
    // =============================================================================

    const { user } = useUser();
    const cashierBranchId = useMemo(() => user?.branch?._id, [user]);

    // =============================================================================
    // STATE MANAGEMENT
    // =============================================================================

    const [currentStep, setCurrentStep] = useState(MENU_STEPS.MOVIE_LIST);
    const [employeeId, setEmployeeId] = useState('');
    const [startedHoldSession, setStartedHoldSession] = useState(false);
    const [sessionExpiresAt, setSessionExpiresAt] = useState(null);

    // Movie filter state
    const [selectedFilter, setSelectedFilter] = useState('NOW SHOWING');
    const [displayedMovies, setDisplayedMovies] = useState([]);

    // Movie ticket data state
    const [movieTicketData, setMovieTicketData] = useState({
        customer: null,
        noLoginCustomerInfo: {
            name: 'in-store customer',
            phone: null,
            email: null
        },
        branch: {
            _id: null,
            name: null,
            address: null,
            city: null,
            location: {
                type: null,
                coordinates: null
            },
            isActive: null,
            showings: null
        },
        schedule: {
            _id: null,
            movie: {
                _id: null,
                name: null,
                poster: null
            },
            screen: null,
            startTime: null,
            endTime: null,
            availableSeatsCount: 0
        },
        seats: [],
        promotion: null,
        seller: null,
        total: 0,
        adultTickets: 0,
        discountedTickets: 0,
        discounted: 0
    });

    // Snack ticket data state
    const [snackTicketData, setSnackTicketData] = useState({
        customer: null,
        noLoginCustomerInfo: {
            name: 'in-store customer',
            phone: null,
            email: null
        },
        branch: {
            _id: null,
            name: null,
            address: null,
            city: null,
            location: {
                type: null,
                coordinates: null
            },
            isActive: null,
            showings: null
        },
        snackList: [],
        promotionCode: '',
        seller: null,
        total: 0,
        discounted: 0
    });

    // =============================================================================
    // HOOK DECLARATIONS
    // =============================================================================

    const { getBranchById, branch, loading: branchLoading, error: branchError } = useGetBranchById();
    const { getMovieDetail, movieDetail, loading: movieLoading, error: movieError } = useGetMovieDetail();
    const { seats, loading: seatsLoading, error: seatsError, fetchSeats } = useGetSeatsBySchedule();
    const { getSnacks, snacks, loading: snacksLoading, error: snacksError } = useGetSnacksByBranch();
    const { startHoldSession, holdSeatData, clearHoldSeatData, loading: holdLoading, error: holdError } = useStartHoldSession();
    const { clearSession, loading: clearSessionLoading } = useClearSession();
    const { createTicket, ticket, loading: ticketLoading, error: ticketError } = useCreateTicket();
    const { fetchNowShowing, movies: nowShowingMovies, loading: nowShowingLoading } = useFetchNowShowing();
    const { fetchComingSoon, movies: comingSoonMovies, loading: comingSoonLoading } = useFetchComingSoon();
    const { fetchSchedules, schedules, loading: schedulesLoading, error: schedulesError } = useGetSchedules();

    // =============================================================================
    // DATA UPDATE FUNCTIONS
    // =============================================================================

    const updateMovieTicket = (updates) => {
        setMovieTicketData(prev => ({ ...prev, ...updates }));
        console.log('Updated movie ticket data:', { ...movieTicketData, ...updates });
    };

    const updateSnackTicket = (updates) => {
        setSnackTicketData(prev => ({ ...prev, ...updates }));
        console.log('Updated snack ticket data:', { ...snackTicketData, ...updates });
    };

    // =============================================================================
    // INITIALIZATION EFFECTS
    // =============================================================================

    useEffect(() => {
        if (user && cashierBranchId) {
            getBranchById(cashierBranchId);
        }
    }, [cashierBranchId]);

    useEffect(() => {
        if (branch) {
            updateMovieTicket({ branch: branch });
            updateSnackTicket({ branch: branch });
        } else if (branchError) {
            console.log('Error fetching branch:', branchError);
        }
    }, [branch]);

    useEffect(() => {
        fetchNowShowing();
        fetchComingSoon();
    }, []);

    useEffect(() => {
        if (snackTicketData?.branch?._id) {
            getSnacks(snackTicketData.branch._id);
        }
    }, [snackTicketData.branch._id]);

    // Snack stock validation (from TicketPurchase)
    useEffect(() => {
        if (snackTicketData?.branch?._id && snacks && snacks.length > 0) {
            console.log('Snacks fetched successfully:', snacks);
            if (Array.isArray(snackTicketData?.snackList) && snackTicketData.snackList.length > 0) {
                let changed = false;
                const newSnackList = snackTicketData.snackList.map(item => {
                    const snack = snacks.find(s => s._id === item.snack);
                    if (!snack) return item;
                    const stock = snack.stock ?? Infinity;
                    if (item.quantity > stock) {
                        changed = true;
                        return { ...item, quantity: stock };
                    }
                    return item;
                });
                if (changed) {
                    alert('Some snacks in your selection exceed available stock and have been adjusted.');
                    updateSnackTicket({ snackList: newSnackList, promotion: null, discount: 0 });
                }
            }
        }
    }, [snacks]);

    useEffect(() => {
        if (nowShowingMovies.length > 0 && selectedFilter === 'NOW SHOWING') {
            setDisplayedMovies(nowShowingMovies);
        }
    }, [nowShowingMovies]);

    // =============================================================================
    // EVENT HANDLERS
    // =============================================================================

    const handleFilterChange = (filter) => {
        setSelectedFilter(filter);
        if (filter === 'NOW SHOWING') {
            setDisplayedMovies(nowShowingMovies);
        } else if (filter === 'UPCOMING') {
            setDisplayedMovies(comingSoonMovies);
        } else if (filter === 'ALL MOVIES') {
            setDisplayedMovies([...nowShowingMovies, ...comingSoonMovies]);
        }
    };

    const handleEmployeeIdChange = (e) => {
        setEmployeeId(e.target.value);
    };

    const handleEmployeeIdBlur = () => {
        if (employeeId.trim() === '') {
            setEmployeeId('');
        } else {
            updateMovieTicket({ seller: employeeId });
            updateSnackTicket({ seller: employeeId });
        }
    };

    const onMovieSelect = async (movie) => {
        try {
            console.log('Selected movie:', movie);
            updateMovieTicket({
                schedule: {
                    _id: null,
                    movie: {
                        _id: movie._id,
                        name: movie.title,
                        poster: movie.posterURL
                    },
                    screen: null,
                    startTime: null,
                    endTime: null,
                    availableSeatsCount: 0
                },
                seats: [],
                adultTickets: 0,
                discountedTickets: 0,
                total: 0,
                discounted: 0,
                promotion: null
            });
            await fetchSchedules(movie._id, movieTicketData.branch._id);
            goToNextStep();
        } catch (error) {
            console.error('Error fetching schedules:', error);
            alert('Failed to load schedules. Please try again later.');
        }
    };

    const onScheduleSelect = async (schedule) => {
        try {
            updateMovieTicket({
                schedule: {
                    _id: schedule._id,
                    movie: movieTicketData.schedule.movie,
                    screen: schedule.screen || null,
                    startTime: schedule.startTime || null,
                    endTime: schedule.endTime || null,
                    availableSeatsCount: schedule.availableSeatsCount || 0
                },
                seats: [],
                adultTickets: 0,
                discountedTickets: 0,
                total: 0,
                discounted: 0,
                promotion: null
            });
            await fetchSeats(schedule._id);
            goToNextStep();
        } catch (error) {
            console.error('Error selecting schedule:', error);
            alert('Failed to select schedule. Please try again later.');
        }
    };

    const handleSessionExpire = () => {
        console.log('Session expired, clearing session...', holdSeatData);
        setStartedHoldSession(false);
        setSessionExpiresAt(null);
        alert('Your session has expired. Please select your seats again.');
        updateMovieTicket({ seats: [] });
        setCurrentStep(MENU_STEPS.SEATS);
        clearHoldSeatData();
    };

    // =============================================================================
    // NAVIGATION FUNCTIONS
    // =============================================================================

    const goToNextStep = () => {
        setCurrentStep(prev => prev + 1);
    };

    const goToPreviousStep = () => {
        setCurrentStep(prev => (prev > 0 ? prev - 1 : 0));
    };

    // =============================================================================
    // HOLD SESSION AND TICKET MANAGEMENT EFFECTS
    // =============================================================================

    useEffect(() => {
        async function holdSessionIfNeeded() {
            if (currentStep === MENU_STEPS.PAYMENT && !startedHoldSession) {
                await startHoldSession({ scheduleId: movieTicketData.schedule._id, seatNumbers: movieTicketData.seats });
            }
        }
        holdSessionIfNeeded();

        if (currentStep == MENU_STEPS.TICKET_DISPLAY) {
            const timer = setTimeout(() => {
                window.location.reload();
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [currentStep]);

    useEffect(() => {
        if (holdSeatData && holdSeatData.data && holdSeatData.data.expiresAt) {
            setSessionExpiresAt(holdSeatData.data.expiresAt);
            setStartedHoldSession(true);
        }
        if (holdError) {
            if (holdError.includes('seats')) {
                alert('Your seat selection have been occupied by other customers. Please adjust your selection.');
                fetchSeats(movieTicketData.schedule._id);
                updateMovieTicket({ seats: [] });
                setStartedHoldSession(false);
                return;
            } else if (holdError.includes('snack')) {
                alert('Your snack selection exceeds available stock. Please adjust your order.');
                getSnacks(snackTicketData?.branch?._id);
                updateSnackTicket({ snackList: [] });
                setStartedHoldSession(false);
                return;
            }
            alert('An error occurred while creating your ticket. Please try again.');
            setStartedHoldSession(false);
        }
    }, [holdSeatData, holdError]);

    useEffect(() => {
        if (startedHoldSession) {
            setStartedHoldSession(false);
            clearSession();
            updateMovieTicket({
                promotion: null,
                discount: 0
            });
        }
    }, [movieTicketData.seats]);

    useEffect(() => {
        updateMovieTicket({ promotion: null, discount: 0 });
        updateSnackTicket({ promotion: null, discount: 0 });
    }, [movieTicketData.noLoginCustomerInfo, snackTicketData.noLoginCustomerInfo]);

    useEffect(() => {
        if (ticket) {
            console.log('Ticket created successfully:', ticket);
            setCurrentStep(MENU_STEPS.TICKET_DISPLAY);
        } else if (ticketError) {
            console.error('Error creating ticket:', ticketError);
            if (ticketError.includes('seats')){
                alert('Your seat selection have been occupied by other customers. Please adjust your selection.');
                setCurrentStep(MENU_STEPS.SEATS);
                fetchSeats(movieTicketData.schedule._id);
                updateMovieTicket({ seats: [] });
                return;
            } else if (ticketError.includes('snack')) {
                alert('Your snack selection exceeds available stock. Please adjust your order.');
                setCurrentStep(MENU_STEPS.SNACK);
                getSnacks(snackTicketData?.branch?._id);
                updateSnackTicket({ snackList: [] });
                return;
            }
            alert('An error occurred while creating your ticket. Please try again.');
            setCurrentStep(MENU_STEPS.PAYMENT);
        }
    }, [ticket, ticketError]);

    // =============================================================================
    // RENDER MENU FUNCTIONS
    // =============================================================================

    const renderCurrentMenu = () => {
        switch (currentStep) {
            case MENU_STEPS.MOVIE_LIST:
                return (
                    <>
                        <div className="left-[5%] absolute top-[4%] z-50 md:w-[20%]  min-w-[260px]">
                            <CustomDropdown
                                name="discount"
                                placeholder=""
                                value={selectedFilter}
                                onChange={e => handleFilterChange(e?.target ? e.target.value : e)}
                                bgColor="indigo-700 backdrop-blur-[30px]"
                                inputBgColor="pink-400"
                                variant={'figma'}
                                hoverColor="purple-600"
                                borderColor=""
                                textColor="white"
                                dropdownTextColor="white"
                                height="h-8"
                                inputTextSize="text-md"
                                optionTextSize="text-sm"
                                openDirection='down'
                                textAlign="center"
                                options={[
                                    { value: 'ALL MOVIES', label: 'ALL MOVIES' },
                                    { value: 'NOW SHOWING', label: 'NOW SHOWING' },
                                    { value: 'UPCOMING', label: 'UPCOMING' },
                                    
                                ]}
                            />
                        </div>
                        <MovieList
                            movies={displayedMovies}
                            loading={nowShowingLoading || comingSoonLoading}
                            onMovieSelect={onMovieSelect}
                        />
                    </>
                );
            case MENU_STEPS.SCHEDULE:
                return (
                    <>
                    <div className="absolute top-[4%] scale-90 z-50 md:w-[20%]  min-w-[260px]"><BackwardButton onClick={goToPreviousStep} /></div>
                    
                    <Schedule
                        schedules={schedules}
                        loading={schedulesLoading}
                        onScheduleSelect={onScheduleSelect}
                    />
                    </>
                );
            case MENU_STEPS.SEATS:
                return (
                    <>
                                        <div className="absolute top-[4%] scale-90 z-50 md:w-[20%]  min-w-[260px]"><BackwardButton onClick={goToPreviousStep} /></div>

                    <SeatsScreen
                        seats={seats}
                        loading={seatsLoading}
                        movieTicketData={movieTicketData}
                        updateMovieTicket={updateMovieTicket}
                        onNext={goToNextStep}
                    />
                    </>
                );
            case MENU_STEPS.SNACK:
                return (<>
                <div className="absolute top-[4%] scale-90 z-50 md:w-[20%]  min-w-[260px]"><BackwardButton onClick={goToPreviousStep} /></div>
                    <SnackList
                        snacks={snacks}
                        loading={snacksLoading}
                        updateSnackTicket={updateSnackTicket}
                        snackTicketData={snackTicketData}
                        handleNext={goToNextStep}
                    />
                </>)

case MENU_STEPS.PAYMENT:
    return (
        <>
            <div className="absolute top-[4%] scale-90 z-50 md:w-[20%] min-w-[260px]">
                <BackwardButton onClick={goToPreviousStep} />
            </div>
            <Payment
                createTicket={createTicket}
                sessionExpiresAt={sessionExpiresAt}
                onExpire={handleSessionExpire}
                movieTicketData={movieTicketData}
                snackTicketData={snackTicketData}
                updateMovieTicket={updateMovieTicket}
                updateSnackTicket={updateSnackTicket}
            />
        </>
    );

            case MENU_STEPS.TICKET_DISPLAY:
                return (
                    <>
                    <div className="absolute w-full top-[4%] h-5 text-center justify-start text-white text-xl font-bold font-['Unbounded']">TICKET IS PRINTING...</div>
                                <div className="flex flex-col items-center justify-center w-full h-full overflow-hidden">
            <div className="flex items-start justify-center h-[80vh] rounded-xl overflow-hidden w-[90%] relative">
                        <TicketDetail
                            movieTicketData={movieTicketData}
                            snackTicketData={snackTicketData}
                            isStaff={true}
                        />
                </div>
                </div>
                    </>
                );
            default:
                return null;
        }
    };

    // =============================================================================
    // MAIN COMPONENT RENDER
    // =============================================================================

    return (
        <StaffLayout>
            <MobileNotSupported>
                {currentStep !== MENU_STEPS.MOVIE_LIST && currentStep !== MENU_STEPS.TICKET_DISPLAY && (
                    <div className='flex justify-center items-center absolute top-[2%] w-full'>
                        <NavigationProgress
                            movieTicketData={movieTicketData}
                            snackTicketData={snackTicketData}
                            setCurrentStep={setCurrentStep}
                            currentStep={currentStep}
                            MENU_STEPS={MENU_STEPS}
                        />
                    </div>
                )}
                
                <InputSeller 
                    value={employeeId || ''} 
                    onChange={handleEmployeeIdChange} 
                    onBlur={handleEmployeeIdBlur}
                />
                
                {renderCurrentMenu()}
                
                <SelectBranchButton 
                    isLoading={branchLoading} 
                    branchName={branch?.name} 
                />
            </MobileNotSupported>

            <div className="tranform absolute top-0 left-1/5 h-52 w-52 -translate-y-1/2 rounded-full bg-sky-400/60 mix-blend-lighten blur-[100px]" />
            <div className="tranform absolute top-1/4 left-0 h-44 w-44 -translate-x-1/2 rounded-full bg-pink-400/60 mix-blend-lighten blur-[100px]" />
            <div className="absolute top-1/2 right-1/11 h-28 w-28 rounded-full bg-amber-300/60 mix-blend-lighten blur-[100px]" />
            <div className="tranform absolute right-0 bottom-0 h-56 w-56 translate-x-1/2 rounded-full bg-purple-600/60 mix-blend-lighten blur-[100px]" />
        </StaffLayout>
    );
};

// =============================================================================
// NAVIGATION PROGRESS COMPONENT
// =============================================================================

const NavigationProgress = ({ movieTicketData, snackTicketData, setCurrentStep, currentStep, MENU_STEPS }) => {
    const Steps = ({active = false, onClick, text, connector=false}) => (
        <button className='w-10 h-10 flex items-center justify-center relative cursor-pointer' onClick={onClick} disabled={!active}>
            {connector && (
                <>
                <div className={`absolute z-2 -left-5 w-8 h-[20px] bg-white transition-all duration-300`} />
                {active ? (
                    <div className="absolute z-2 -left-5 w-8 h-[10px] bg-pink-400 transition-all duration-300" />
                ) : (
                    <div className="absolute z-2 -left-5 w-8 h-[10px] bg-white transition-all duration-300" />
                )}
                </>
            )}
            <div className="w-full h-full absolute bg-white rounded-full" />
            {active ? (
                <div className="absolute z-3 w-7 h-7 bg-pink-400 rounded-full" />
            ) : (
                <div className="w-7 h-7 z-3 absolute bg-white rounded-full" />
            )}
        </button>
    );

    return (
        <div className="relative inline-flex justify-start items-center gap-2">
            <Steps active={movieTicketData?.schedule?.movie?._id || currentStep >= MENU_STEPS.MOVIE_LIST} onClick={() => setCurrentStep(MENU_STEPS.MOVIE_LIST)} text="Movie" />
            <Steps active={movieTicketData?.schedule?._id || currentStep >= MENU_STEPS.SCHEDULE} onClick={() => setCurrentStep(MENU_STEPS.SCHEDULE)} text="Time" connector={true}/>
            <Steps active={(movieTicketData?.seats.length > 0) || currentStep >= MENU_STEPS.SEATS} onClick={() => setCurrentStep(MENU_STEPS.SEATS)} text="Seats" connector={true}/>
            <Steps active={(snackTicketData?.snackList.length > 0) || currentStep >= MENU_STEPS.SNACKS} onClick={() => setCurrentStep(MENU_STEPS.SNACKS)} text="Snack" connector={true}/>
            <Steps active={(movieTicketData?.seats.length > 0)} onClick={() => setCurrentStep(MENU_STEPS.PAYMENT)} text="Pay" connector={true}/>
        </div>
    );
};

export default SellTicket;