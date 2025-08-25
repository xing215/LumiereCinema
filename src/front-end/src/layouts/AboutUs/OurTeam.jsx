const OurTeam = () => {
    return (
        <section className="mx-auto flex max-w-6xl flex-col items-center gap-10 px-6 py-12 lg:flex-row">
            {/* Text bên trái */}
            <div className="flex w-full flex-col items-center gap-4 text-center md:w-2/3 md:items-center md:text-center">
                <h2 className="font-['Unbounded'] text-xl font-bold text-white md:text-xl lg:text-3xl xl:text-4xl">Our Team</h2>
                <p className="font-['Libre_Franklin'] text-sm leading-relaxed font-normal text-white md:text-base xl:text-lg">
                    At Lumiere Cinema, our team is a group of passionate creatives, developers, and dreamers who believe in the power of film and technology. Each member brings a unique set of skills
                    to the table, working together to build a platform that truly enhances the cinema experience.
                </p>
            </div>

            {/* Hình bên phải */}
            <div className="flex w-full items-center justify-center lg:w-1/3">
                {/* Ảnh cho mobile (md trở xuống) */}
                <img 
                    src="/2.png" 
                    alt="Our Team - Mobile View"
                    className="block h-[170px] w-[300px] md:h-[250px] md:w-[400px] rounded-xl object-cover shadow-lg lg:h-[300px] lg:w-[300px] lg:hidden"
                />
                {/* Ảnh cho desktop (lg trở lên) */}
                <img 
                    src="/1.png" 
                    alt="Our Team - Desktop View"
                    className="hidden h-[200px] w-[170px] rounded-xl object-cover shadow-lg lg:h-[500px] lg:w-[400px] lg:block"
                />
            </div>
        </section>
    );
};

export default OurTeam;
