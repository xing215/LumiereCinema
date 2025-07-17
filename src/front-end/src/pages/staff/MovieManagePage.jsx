import { useState } from 'react';
import StaffLayout from '../../layouts/StaffLayout.jsx';
import MobileNotSupported from '../../components/display/MobileNotSupported.jsx';
import SearchButton from '../../components/buttons/Staff/SearchButton.jsx';
import ConfirmationModal from '../../components/display/Modal/Confirmation.jsx';
import ManageTable from '../../components/UI/ManageTable.jsx';
import DeleteButton from '../../components/buttons/Staff/DeleteButton.jsx';
import DownloadTemplateButton from "../../components/buttons/Staff/DownloadTemplateButton.jsx";
import UploadCSVButton from "../../components/buttons/Staff/uploadCsvButton.jsx";
import AddButton from "../../components/buttons/Staff/AddButton.jsx";

const IntegratedButton = () => (
    <div className="absolute right-1/12 z-10 flex items-end gap-4 lg:top-1/7 xl:top-1/20">
        <AddButton text="Add Schedule" />
        <div className="flex flex-col items-center">
            <DownloadTemplateButton />
            <UploadCSVButton />
        </div>
    </div>
)

const MovieManagePage = () => {
    const [tickedMovies, setTickedMovies] = useState(new Set());
    const [movieRows, setMovieRows] = useState(Array.from({ length: 10 }, () => ['TickButton', '001', 'Thám tử lừng danh Conan', 'Thám Tử Lừng Danh Conan (Detective Conan) là bộ manga trinh thám nổi tiếng của tác giả Gosho Aoyama, lần đầu ra mắt vào năm 1994.', '06/05/2025', 'Detective', '120', '5000', '12', '100', 'ActiveButton', 'PreviewButton']));
    const [showConfirmDeletePromotion, setShowConfirmDeletePromotion] = useState(false);

    const handleDelete = () => {
        setMovieRows((prev) => prev.filter((_, index) => !tickedMovies.has(index)));
        setTickedMovies(new Set());
        setShowConfirmDeletePromotion(false);
    };

    const header = ['TickButton', 'ID', 'Name', 'Description', 'Showing', 'Genre', 'Duration', 'Audience', 'Trailer', 'Poster', 'ActiveButton', 'PreviewButton'];

    // Configuration cho từng cột của Movie table
    const movieColumnConfig = [
        { width: 'w-10', truncate: false },    // TickButton
        { width: 'w-10', truncate: false },    // ID
        { width: 'w-45', truncate: true },     // Name - cắt text nếu dài
        { width: 'w-60', truncate: true },     // Description - cột rộng nhất, cắt text
        { width: 'w-40', truncate: true },    // Showing
        { width: 'w-30', truncate: true },     // Genre - cắt text nếu dài
        { width: 'w-20', truncate: false },    // Duration
        { width: 'w-20', truncate: false },    // Audience
        { width: 'w-16', truncate: false },    // Trailer
        { width: 'w-16', truncate: false },    // Poster
        { width: 'w-20', truncate: false },    // ActiveButton
        { width: 'w-20', truncate: false }     // Preview
    ];

    return (
        <StaffLayout backgroundClass="bg-zinc-300/70">
            <MobileNotSupported>
                <SearchButton />
                {tickedMovies.size > 0 ? <DeleteButton onClicked={() => setShowConfirmDeletePromotion(true)} /> : <IntegratedButton />}
                {showConfirmDeletePromotion && <ConfirmationModal item={tickedMovies.size} handleDelete={handleDelete} onClose={() => setShowConfirmDeletePromotion(false)} />}
                <ManageTable
                    data={movieRows}
                    anyTicked={tickedMovies}
                    setTickedRows={setTickedMovies}
                    header={header}
                    columnConfig={movieColumnConfig}
                />
                <div className="font-unbounded absolute top-5 left-1/6 z-10 text-5xl font-bold text-black">Movies</div>
                <div className="absolute bottom-1/3 left-0 z-5 h-44 w-44 -translate-x-1/2 transform rounded-full bg-amber-300 mix-blend-hard-light blur-[100px]" />
                <div className="absolute top-1/5 right-0 z-5 h-44 w-44 translate-x-1/2 transform rounded-full bg-amber-300 mix-blend-hard-light blur-[100px]" />
                <div className="absolute left-1/3 z-5 h-52 w-52 -translate-y-2/3 transform rounded-full bg-blue-500 mix-blend-hard-light blur-[100px]" />
                <div className="absolute right-0 bottom-0 z-5 h-56 w-56 translate-1/2 transform rounded-full bg-purple-600 mix-blend-hard-light blur-[100px]" />
            </MobileNotSupported>
        </StaffLayout>
    );
};
export default MovieManagePage;
