import Logo from '@assets/img/Logo.svg';

const TheStory = () => {
    return (
        <section className="mx-auto flex max-w-6xl flex-col items-center gap-10 px-6 py-6 lg:flex-row">
            {/* Logo bên trái */}
            <div className="flex w-full items-center justify-center md:w-1/3">
                <img src={Logo} alt="Lumiere Logo" className="h-auto w-[170px] object-contain md:w-[300px]" />
            </div>

            {/* Phần text bên phải */}
            <div className="flex w-full flex-col items-center gap-4 text-center md:w-2/3 md:items-center md:text-center">
                <h2 className="font-['Unbounded'] text-xl font-bold text-white md:text-xl lg:text-3xl xl:text-4xl">The Story</h2>
                <p className="font-['Libre_Franklin'] text-base font-semibold text-white md:text-lg xl:text-xl">WHERE LIGHT MEETS STORY</p>
                <p className="font-['Libre_Franklin'] text-sm leading-relaxed font-normal text-white md:text-base xl:text-lg">
                    At Lumiere Cinema, we bring together the magic of storytelling and the brilliance of technology to transform the way you experience movies. Whether you're discovering the latest
                    blockbuster or managing cinema operations behind the scenes, our platform is designed to make every step smooth, engaging, and cinematic.
                    <br />
                    <br />
                    Inspired by the pioneering spirit of the Lumière brothers, we carry their legacy forward by combining elegant design with smart functionality. From real-time seat booking to
                    personalized promotions and advanced admin tools, Lumiere Cinema is where innovation meets imagination.
                </p>
            </div>
        </section>
    );
};

export default TheStory;
