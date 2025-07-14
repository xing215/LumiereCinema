import RowTemplate from './RowTemplate.jsx';

const Header = ({ Data }) => {
    return (
        <div className="fixed top-0 z-20 w-full rounded-t-xl lg:bg-zinc-400 xl:bg-zinc-300">
            <RowTemplate data={Data} isHeader={true} />
        </div>
    );
};

export default Header;
