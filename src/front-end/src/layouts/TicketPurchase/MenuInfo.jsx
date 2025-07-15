import TicketDetail from "../../components/UI/TicketDetail";
import NextNaviButton, { BackNaviButton } from "../../components/buttons/NaviButton";

const InputField = ({ label, name, type = "text" }) => (
  <div>
    <label className="mb-1 block font-['Libre_Franklin'] text-md font-bold text-white md:text-base lg:text-lg">
      {label}
    </label>
    <input
      type={type}
      name={name}
      className="bg-opacity-70 h-10 w-[80vw] lg:w-[30vw] md:w-[35vw] rounded-lg bg-zinc-300 px-3 text-black placeholder-gray-600 focus:ring-2 focus:outline-none md:h-9 lg:h-10 focus:bg-opacity-90 font-['Unbounded'] text-sm sm:text-base md:text-lg"
      required
    />
  </div>
);

const MenuInfo = () => (
  <div className="relative flex items-center justify-center w-screen pt-3 md:pt-7">
    <div className="relative flex flex-row justify-start w-full h-full md:min-h-[470px] md:w-screen lg:w-[75vw] lg:h-auto rounded-xl">
      {/* Background layer */}
      <div className="absolute inset-0 mix-blend-color-dodge bg-zinc-300/30 rounded-xl pointer-events-none z-0" />

      {/* Poster */}
      <div className="hidden md:block">
        <TicketDetail />
      </div>

      {/* Main content */}
      <div className="relative flex flex-col justify-between items-center flex-1 min-w-[55vw]">
        <div className="block md:hidden pt-5">
          <TicketDetail />
        </div>
        <div className="relative flex flex-col justify-start items-center gap-4">
          <div className="w-auto text-center justify-start text-white text-base md:text-lg xl:text-2xl font-black font-['Unbounded'] pt-8">
            CUSTOMER INFORMATION
          </div>
          <InputField label="Name" name="name" />
          <InputField label="Email" name="email" />
          <InputField label="Phone Number" name="phone" />
        </div>

        <div className="w-[80vw] lg:w-[30vw] md:w-[35vw] flex flex-row gap-2 justify-center items-center px-4 sm:px-8 md:px-10 lg:px-12 pb-10.5 md:pb-6 pt-8">
          <BackNaviButton />
          <NextNaviButton text="SEATINGS" />
          <div className="bottom-0 pb-4 md:pb-0.5 absolute text-center justify-start">
            <span className="text-white text-[13px] md:text-[12px] lg:text-[13px] font-normal font-['Libre_Franklin']">
              Join our lunar point system?{" "}
            </span>
            <span className="text-white text-[13px] md:text-[12px] lg:text-[13px] font-bold font-['Libre_Franklin']">
              Register an account.
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default MenuInfo;
