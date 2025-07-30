import { useState, useEffect, use } from 'react';
import dayjs from 'dayjs';
import { Camera } from 'lucide-react';
import StaffLayout from '@layouts/StaffLayout.jsx';
import MobileNotSupported from '@components/display/MobileNotSupported.jsx';
import { useFetchNowShowing, useFetchComingSoon } from '@hooks/useMovie';
import SelectBranchButton from '@components/buttons/Staff/SelectBranch.jsx';
import CustomDropdown from "@/components/UI/CustomDropdown";
// Additional hooks from TicketPurchase
import { useGetBranchById } from '@hooks/useBranch';
import { useGetMovieDetail } from '@hooks/useMovie';
import { useStartHoldSession, useClearSession, useCreateTicket} from '@hooks/useTicket';
import { useGetSchedules } from '@hooks/useBranch';
import { useGetSnacks } from '@hooks/useBranch';
import { useGetSeatsBySchedule } from '@hooks/useTicket';
import MovieList from '@layouts/SellTicket/MovieList';
import Schedule from '@layouts/SellTicket/Schedule';
import SeatsScreen from '@layouts/SellTicket/SeatsScreen';
import BackwardButton from '@components/buttons/backwardButton2.jsx';

const InputSeller = ({ value, onBlur, onChange }) => {
    return (
        <div className='absolute right-[5%] top-[5%] flex flex-row items-center justify-center md:w-[50%] lg:w-[25%] min-w-[260px]'>
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

const SellTicket = () => {
    // Movie ticket data state
    const [movieTicketData, setMovieTicketData] = useState({
        customer: null,
        noLoginCustomerInfo: {
            name: null,
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
            name: null,
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

    // Update functions
    const updateMovieTicket = (updates) => {
        setMovieTicketData(prev => ({ ...prev, ...updates }));
    };
    const updateSnackTicket = (updates) => {
        setSnackTicketData(prev => ({ ...prev, ...updates }));
    };
    // Example usage of hooks (not for menu navigation)
    const { getBranchById, branch, loading: branchLoading, error: branchError } = useGetBranchById();
    const { getMovieDetail, movieDetail, loading: movieLoading, error: movieError } = useGetMovieDetail();
    const { seats, loading: seatsLoading, error: seatsError, fetchSeats } = useGetSeatsBySchedule();
    const { getSnacks, snacks, loading: snacksLoading, error: snacksError } = useGetSnacks();
    const { startHoldSession, holdSeatData, loading: holdLoading, error: holdError } = useStartHoldSession();
    const { clearSession, loading: clearSessionLoading } = useClearSession();
    const { createTicket, ticket, loading: ticketLoading, error: ticketError } = useCreateTicket();

    const { fetchNowShowing, movies: nowShowingMovies, loading: nowShowingLoading } = useFetchNowShowing();
    const { fetchComingSoon, movies: comingSoonMovies, loading: comingSoonLoading } = useFetchComingSoon();
    const [selectedFilter, setSelectedFilter] = useState('NOW SHOWING');
    const [displayedMovies, setDisplayedMovies] = useState([]);

    useEffect(() => {
        getBranchById('6860b849b285c0004c37d9c2');
    }, []);

    useEffect(() => {
        if (branch) {
            updateMovieTicket({ branch: branch });
            updateSnackTicket({ branch: branch });
        } else if (branchError) {
            console.log('Error fetching branch:', branchError);
        }
    }, [branch]);

const handleFilterChange = (filter) => {
        setSelectedFilter(filter);
        if (filter === 'NOW SHOWING') {
            setDisplayedMovies(nowShowingMovies);
        } else if (filter === 'UPCOMING') {
            setDisplayedMovies(comingSoonMovies);
        } else if (filter === 'ALL') {
            setDisplayedMovies([...nowShowingMovies, ...comingSoonMovies]);
        }
    }

    useEffect(() => {
        fetchNowShowing();
        fetchComingSoon();
    }, []);

    useEffect(() => {
        if (nowShowingMovies.length > 0 && selectedFilter === 'NOW SHOWING') {
            setDisplayedMovies(nowShowingMovies);
        }
    }, [nowShowingMovies]);

    const { fetchSchedules, schedules, loading: schedulesLoading, error: schedulesError } = useGetSchedules();
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


    const [employeeId, setEmployeeId] = useState('');
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

    // Step-based menu rendering (similar to TicketPurchase)
    const MENU_STEPS = {
        MOVIE_LIST: 0,
        SCHEDULE: 1,
        SEATS: 2,
        // SNACK: 2,
        // INFO: 3,
        // PAYMENT: 4,
        // TICKET_DISPLAY: 5
    };

    const [currentStep, setCurrentStep] = useState(MENU_STEPS.MOVIE_LIST);

    const goToNextStep = () => {
        setCurrentStep(prev => prev + 1);
    };
    const goToPreviousStep = () => {
        setCurrentStep(prev => (prev > 0 ? prev - 1 : 0));
    };
    

    const renderCurrentMenu = () => {
        switch (currentStep) {
            case MENU_STEPS.MOVIE_LIST:
                return (
                    <>
                        <div className="left-[5%] absolute top-[5%] z-50 md:w-[20%]  min-w-[260px]">
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
                                    { value: 'NOW SHOWING', label: 'NOW SHOWING' },
                                    { value: 'UPCOMING', label: 'UPCOMING' },
                                    { value: 'ALL', label: 'ALL' },
                                ]}
                            />
                        </div>
                        <MovieList
                            movies={displayedMovies}
                            loading={nowShowingLoading || comingSoonLoading}
                            onMovieSelect={onMovieSelect}
                        />
                        <SelectBranchButton />
                    </>
                );
            case MENU_STEPS.SCHEDULE:
                return (
                    <>
                    <div className="absolute top-[5%] scale-90 z-50 md:w-[20%]  min-w-[260px]"><BackwardButton onClick={goToPreviousStep} /></div>
                    
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
                                        <div className="absolute top-[5%] scale-90 z-50 md:w-[20%]  min-w-[260px]"><BackwardButton onClick={goToPreviousStep} /></div>

                    <SeatsScreen
                        seats={seats}
                        loading={seatsLoading}
                        onSeatSelect={(seat) => {
                            // Handle seat selection logic here
                            console.log('Selected seat:', seat);
                        }}
                        movieTicketData={movieTicketData}
                        updateMovieTicket={updateMovieTicket}
                    />
                    </>
                );
            // case MENU_STEPS.INFO:
            //     // Placeholder for future Info menu
            //     return null;
            // case MENU_STEPS.PAYMENT:
            //     // Placeholder for future Payment menu
            //     return null;
            // case MENU_STEPS.TICKET_DISPLAY:
            //     // Placeholder for future TicketDisplay menu
            //     return null;
            default:
                return null;
        }
    };

    return (
        <StaffLayout>
            <MobileNotSupported>
                <InputSeller value={employeeId || ''} onChange={handleEmployeeIdChange} onBlur={handleEmployeeIdBlur}/>
                {/* Step-based menu render */}
                {renderCurrentMenu()}
            </MobileNotSupported>

            {/* Background blur effects */}
            <div className="tranform absolute top-0 left-1/5 h-52 w-52 -translate-y-1/2 rounded-full bg-sky-400/60 mix-blend-lighten blur-[100px]" />
            <div className="tranform absolute top-1/4 left-0 h-44 w-44 -translate-x-1/2 rounded-full bg-pink-400/60 mix-blend-lighten blur-[100px]" />
            <div className="absolute top-1/2 right-1/11 h-28 w-28 rounded-full bg-amber-300/60 mix-blend-lighten blur-[100px]" />
            <div className="tranform absolute right-0 bottom-0 h-56 w-56 translate-x-1/2 rounded-full bg-purple-600/60 mix-blend-lighten blur-[100px]" />
        </StaffLayout>
    );
}

export default SellTicket;