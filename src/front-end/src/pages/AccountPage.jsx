import Header from "../layouts/LandingPage/Header";
import ChatBot from "../components/display/ChatBot";
import { Title } from "../components/UI/Label";
import Options from "../layouts/AccountPage/Options";

const AccountPage = () => {
    return (
        <div className="bg-slate-950 max-w-screen h-auto">
            <Header />
            
            <Title text="ACCOUNT" />
            <div className="w-screen h-30 bg-slate-950"></div>
            <div className="relative w-[1062px] h-[869px] flex-shrink-0 bg-slate-950 mx-auto">
                <Options />
            </div>
            

            <ChatBot />
            
        </div>
    );
}

export default AccountPage;