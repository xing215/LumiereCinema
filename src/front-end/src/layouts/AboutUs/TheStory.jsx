import Logo from '@assets/img/Logo.svg';

const TheStory = () => {
    return (
        <section className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10 px-6 py-6">
            {/* Logo bên trái */}
            <div className="w-full md:w-1/3 flex justify-center items-center">
                <img
                    src={Logo}
                    alt="Lumiere Logo"
                    className="w-[170px] md:w-[300px] h-auto object-contain"
                />
            </div>

            {/* Phần text bên phải */}
            <div className="w-full md:w-2/3 flex flex-col items-center md:items-center text-center md:text-center gap-4">
                <h2 className="font-['Unbounded'] text-xl md:text-xl lg:text-3xl xl:text-4xl font-bold text-white">The Story</h2>
                <p className="font-['Libre_Franklin'] text-white text-base md:text-lg xl:text-xl font-semibold">
                    WHERE LIGHT MEETS STORY
                </p>
                <p className="font-['Libre_Franklin'] text-white text-sm md:text-base xl:text-lg font-normal leading-relaxed">
                    At Lumiere Cinema, we bring together the magic of storytelling and the brilliance of technology to transform the way you experience movies. Whether you're discovering the latest blockbuster or managing cinema operations behind the scenes, our platform is designed to make every step smooth, engaging, and cinematic.
                    <br /><br />
                    Inspired by the pioneering spirit of the Lumière brothers, we carry their legacy forward by combining elegant design with smart functionality. From real-time seat booking to personalized promotions and advanced admin tools, Lumiere Cinema is where innovation meets imagination.
                </p>
            </div>
        </section>
    );
};

export default TheStory;
