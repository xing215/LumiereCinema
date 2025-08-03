/**
 * Manual Test Script for Screen and Seat Management
 * This script helps verify that the screen and seat management hooks work correctly
 */

import { useGetScreens, useUpdateScreen, useRemoveScreen } from '../hooks/useBranch.js';
import { useGetScreenSeats, useCreateSeat, useBulkCreateSeats, useUpdateSeat, useRemoveSeat } from '../hooks/useBranch.js';

// Screen Management Test Component
const ScreenManagementTest = () => {
  const { getScreens, screens, loading: screensLoading, error: screensError } = useGetScreens();
  const { updateScreen, loading: updateLoading, error: updateError } = useUpdateScreen();
  const { removeScreen, loading: removeLoading, error: removeError } = useRemoveScreen();

  const testGetScreens = async (branchId) => {
    console.log('Testing getScreens for branch:', branchId);
    const result = await getScreens(branchId);
    console.log('getScreens result:', result);
    console.log('Screens data:', screens);
  };

  const testUpdateScreen = async (branchId, screenId, screenData) => {
    console.log('Testing updateScreen:', { branchId, screenId, screenData });
    const result = await updateScreen(branchId, screenId, screenData);
    console.log('updateScreen result:', result);
  };

  const testRemoveScreen = async (branchId, screenId) => {
    console.log('Testing removeScreen:', { branchId, screenId });
    const result = await removeScreen(branchId, screenId);
    console.log('removeScreen result:', result);
  };

  return {
    testGetScreens,
    testUpdateScreen,
    testRemoveScreen,
    screens,
    loading: screensLoading || updateLoading || removeLoading,
    error: screensError || updateError || removeError
  };
};

// Seat Management Test Component
const SeatManagementTest = () => {
  const { getScreenSeats, seats, loading: seatsLoading, error: seatsError } = useGetScreenSeats();
  const { createSeat, loading: createLoading, error: createError } = useCreateSeat();
  const { bulkCreateSeats, loading: bulkLoading, error: bulkError } = useBulkCreateSeats();
  const { updateSeat, loading: updateLoading, error: updateError } = useUpdateSeat();
  const { removeSeat, loading: removeLoading, error: removeError } = useRemoveSeat();

  const testGetScreenSeats = async (branchId, screenId) => {
    console.log('Testing getScreenSeats for screen:', { branchId, screenId });
    const result = await getScreenSeats(branchId, screenId);
    console.log('getScreenSeats result:', result);
    console.log('Seats data:', seats);
  };

  const testCreateSeat = async (branchId, screenId, seatData) => {
    console.log('Testing createSeat:', { branchId, screenId, seatData });
    const result = await createSeat(branchId, screenId, seatData);
    console.log('createSeat result:', result);
  };

  const testBulkCreateSeats = async (branchId, screenId, seatsData) => {
    console.log('Testing bulkCreateSeats:', { branchId, screenId, seatsCount: seatsData.length });
    const result = await bulkCreateSeats(branchId, screenId, seatsData);
    console.log('bulkCreateSeats result:', result);
  };

  const testUpdateSeat = async (branchId, screenId, seatId, seatData) => {
    console.log('Testing updateSeat:', { branchId, screenId, seatId, seatData });
    const result = await updateSeat(branchId, screenId, seatId, seatData);
    console.log('updateSeat result:', result);
  };

  const testRemoveSeat = async (branchId, screenId, seatId) => {
    console.log('Testing removeSeat:', { branchId, screenId, seatId });
    const result = await removeSeat(branchId, screenId, seatId);
    console.log('removeSeat result:', result);
  };

  return {
    testGetScreenSeats,
    testCreateSeat,
    testBulkCreateSeats,
    testUpdateSeat,
    testRemoveSeat,
    seats,
    loading: seatsLoading || createLoading || bulkLoading || updateLoading || removeLoading,
    error: seatsError || createError || bulkError || updateError || removeError
  };
};

// Example test scenarios
const runTestScenarios = () => {
  const screenTest = ScreenManagementTest();
  const seatTest = SeatManagementTest();

  // Example branch and screen IDs (replace with actual IDs)
  const testBranchId = "YOUR_BRANCH_ID";
  const testScreenId = "YOUR_SCREEN_ID";

  return {
    // Screen tests
    async testScreenOperations() {
      console.log("=== TESTING SCREEN OPERATIONS ===");
      
      // Test get screens
      await screenTest.testGetScreens(testBranchId);
      
      // Test update screen
      const screenUpdateData = {
        screenName: "Updated Screen Name",
        screenType: "IMAX",
        size: { width: 20, height: 12 }
      };
      await screenTest.testUpdateScreen(testBranchId, testScreenId, screenUpdateData);
    },

    // Seat tests
    async testSeatOperations() {
      console.log("=== TESTING SEAT OPERATIONS ===");
      
      // Test get seats
      await seatTest.testGetScreenSeats(testBranchId, testScreenId);
      
      // Test create single seat
      const seatData = {
        seatNumber: "A1",
        location: { row: "A", column: 1 },
        category: "STANDARD",
        isHidden: false
      };
      await seatTest.testCreateSeat(testBranchId, testScreenId, seatData);
      
      // Test bulk create seats
      const bulkSeatsData = {
        seats: [
          {
            seatNumber: "A2",
            location: { row: "A", column: 2 },
            category: "STANDARD",
            isHidden: false
          },
          {
            seatNumber: "A3",
            location: { row: "A", column: 3 },
            category: "VIP",
            isHidden: false
          }
        ]
      };
      await seatTest.testBulkCreateSeats(testBranchId, testScreenId, bulkSeatsData);
      
      // Test update seat (replace SEAT_ID with actual seat ID)
      const updatedSeatData = {
        category: "VIP",
        isHidden: false
      };
      await seatTest.testUpdateSeat(testBranchId, testScreenId, "SEAT_ID", updatedSeatData);
    },

    // Comprehensive test
    async runAllTests() {
      try {
        await this.testScreenOperations();
        await this.testSeatOperations();
        console.log("=== ALL TESTS COMPLETED ===");
      } catch (error) {
        console.error("Test failed:", error);
      }
    }
  };
};

export { ScreenManagementTest, SeatManagementTest, runTestScenarios };
