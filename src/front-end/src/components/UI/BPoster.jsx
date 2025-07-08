const BPoster = ({ Pics }) => (
  <div className="relative max-h-[470px] aspect-[300/470] md:aspect-auto md:h-full md:max-h-[470px] md:w-auto md:min-w-[200px] md:max-w-[300px] rounded-xl overflow-hidden mx-auto">
    <img
      src={Pics}
      className="w-full h-full object-cover rounded-xl"
      alt="Poster"
    />
  </div>
);

export default BPoster;