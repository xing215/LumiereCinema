const OurTeam = () => {
    return (
        <section className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10 px-6 py-12">
            {/* Text bên trái */}
            <div className="w-full md:w-2/3 flex flex-col items-center md:items-center text-center md:text-center gap-4">
                <h2 className="font-['Unbounded'] text-xl md:text-xl lg:text-3xl xl:text-4xl font-bold text-white">Our Team</h2>
                <p className="font-['Libre_Franklin'] text-white text-sm md:text-base xl:text-lg font-normal leading-relaxed">
                    At Lumiere Cinema, our team is a group of passionate creatives, developers, and dreamers who believe in the power of film and technology. Each member brings a unique set of skills to the table, working together to build a platform that truly enhances the cinema experience.
                </p>
            </div>

            {/* Hình bên phải */}
            <div className="w-full md:w-1/3 flex justify-center items-center">
                <div className="w-[170px] md:w-[300px] h-[170px] md:h-[300px] bg-white rounded-xl shadow-lg" />
            </div>
        </section>
    );
};

export default OurTeam;
