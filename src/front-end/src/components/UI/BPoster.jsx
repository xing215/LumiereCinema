const BPoster = ({ Pics }) => (
    <div className="relative mx-auto aspect-[300/470] max-h-[470px] overflow-hidden rounded-xl md:aspect-auto md:h-full md:max-h-[470px] md:w-auto md:max-w-[300px] md:min-w-[200px]">
        <img src={Pics} className="h-full w-full rounded-xl object-cover" alt="Poster" />
    </div>
);

export default BPoster;
