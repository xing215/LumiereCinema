const Label = ({text, pt = ""}) => {
    return (
        <div className={`relative flex flex-col items-center justify-center w-screen ${pt}`}>
            <div className="text-white font-bold font-['Unbounded']
            xl:text-5xl lg:text-4xl md:text-2xl text-2xl">
                {text}
            </div>
        </div>
    );
}


export const Title = ({ text }) => (
    <Label
        text={text}
        pt ="pt-12 sm:pt-18 lg:pt-21 xl:pt-26"
    />
)

export default Label;
