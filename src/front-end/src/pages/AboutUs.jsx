import Header from '@layouts/LandingPage/Header.jsx';
import Footer from '@layouts/LandingPage/Footer.jsx';
import ChatBot from '@/components/display/ChatBot';
import { Title } from '@components/UI/label.jsx';
import TheStory from '@/layouts/AboutUs/TheStory';
import OurTeam from '@/layouts/AboutUs/OurTeam';


const AboutUs = () => {
    return (
        <div className=" relative gap-10 flex flex-col no-scrollbar w-screen overflow-hidden bg-slate-950">
            <Header />
            <Title text="ABOUT US" />
            <TheStory />
            <OurTeam />
            <ChatBot />
            <Footer />
            <div className="absolute top-80 right-[-50px] z-10 h-[200px] w-[100px] rotate-[150deg] bg-sky-400/60 mix-blend-lighten blur-[100px] md:top-100 md:right-[-140px] md:h-[300px] md:w-[150px] lg:right-[-200px] lg:h-[400px] lg:w-[200px] xl:top-120 xl:right-[-230px] xl:h-[488px] xl:w-[315px]" />
            <div className="absolute bottom-180 left-1/5 h-44 w-44 -translate-x-1/2 transform rounded-full bg-purple-600/60 mix-blend-lighten blur-[100px]" />
        
        </div>
    );
}

export default AboutUs;