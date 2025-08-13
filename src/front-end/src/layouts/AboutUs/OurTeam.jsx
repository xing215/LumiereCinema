const OurTeam = () => {
    return (
        <section className="mx-auto flex max-w-6xl flex-col items-center gap-10 px-6 py-12 md:flex-row">
            {/* Text bên trái */}
            <div className="flex w-full flex-col items-center gap-4 text-center md:w-2/3 md:items-center md:text-center">
                <h2 className="font-['Unbounded'] text-xl font-bold text-white md:text-xl lg:text-3xl xl:text-4xl">Our Team</h2>
                <p className="font-['Libre_Franklin'] text-sm leading-relaxed font-normal text-white md:text-base xl:text-lg">
                    At Lumiere Cinema, our team is a group of passionate creatives, developers, and dreamers who believe in the power of film and technology. Each member brings a unique set of skills
                    to the table, working together to build a platform that truly enhances the cinema experience.
                </p>
            </div>

            {/* Hình bên phải */}
            <div className="flex w-full items-center justify-center md:w-1/3">
                <div className="h-[170px] w-[170px] rounded-xl bg-white shadow-lg md:h-[300px] md:w-[300px]" />
            </div>
        </section>
    );
};

export default OurTeam;
