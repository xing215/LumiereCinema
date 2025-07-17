// Export all authentication hooks
export {
  useLogin,
  useRegister,
  useLogout,
  useResetPassword,
  useChangePassword
} from './useAuth';

// Export all user profile hooks
export {
  useFetchProfile,
  useUpdateProfile,
  useGetWatchHistory,
  useGetWishlist,
  useAddToWishlist,
  useRemoveFromWishlist,
  useRateMovie,
  useGetMyRatings,
  useMessageChatBot
} from './useUser';

// Export all movie hooks
export {
  useSetBranch,
  useFetchNowShowing,
  useFetchComingSoon,
  useGetMovieDetail,
  useGetShowtimes,
  useSearchMovies,
  useFilterByBranch
} from './useMovie';

// Export all branch hooks
export {
  useFetchBranches,
  useSetCurrentBranch,
  useGetScreens,
  useUpdateScreen,
  useRemoveScreen,
  useGetSchedules,
  useUpdateSchedule,
  useRemoveSchedule,
  useGetSnacks,
  useUpdateSnack,
  useRemoveSnack
} from './useBranch';

// Export all ticket hooks
export {
  useFetchAvailableSeats,
  useSelectSeat,
  useRemoveSeat,
  useSelectSnack,
  useCalculateTotal,
  useApplyPromotion,
  useCreateTicket,
  useStartHoldSession,
  useClearSession,
  useCheckin,
  useActiveTicket
} from './useTicket';

// Export all report hooks
export {
  useGetRevenueReport,
  useExportReport,
  useGetAvailableBranches,
  useGetAvailableMovies,
  useSetBranch as useSetReportBranch,
  useSetDateRange,
  useSetMovie
} from './useReport';

// Export all admin hooks
export {
  useGetAccounts,
  useAddAccount,
  useUpdateAccount,
  useUpdateUserPermission,
  useRemoveAccount,
  useGetPromotions,
  useAddPromotion,
  useUpdatePromotion,
  useRemovePromotion,
  useGetMovies,
  useAddMovie,
  useUpdateMovie,
  useRemoveMovie,
  useAddBranch,
  useUpdateBranch,
  useRemoveBranch
} from './useAdmin';
