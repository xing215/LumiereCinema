const Label = ({ text, pt = '' }) => {
    return (
        <div className={`relative flex w-screen flex-col items-center justify-center ${pt}`}>
            <div className="font-['Unbounded'] text-2xl font-bold text-white md:text-2xl lg:text-4xl xl:text-5xl">{text}</div>
        </div>
    );
};

export const Title = ({ text }) => <Label text={text} pt="pt-12 sm:pt-18 lg:pt-26" />;

export default Label;
