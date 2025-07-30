import React, { useState } from "react";
import CustomDropdown from "@components/UI/CustomDropdown";

const statusOptions = [
    { value: "all", label: "ALL MOVIES" },
    { value: "now", label: "NOW SHOWING" },
    { value: "up", label: "UPCOMING" },
];


const MovieStatusFilterButton = ({ value, onChange }) => {
    const [movieStatusFilter, setMovieStatusFilter] = useState(value || "all");

    const handleStatusChange = (e) => {
        setMovieStatusFilter(e.target.value);
        if (onChange) onChange(e.target.value);
    };

    return (
        <div className="relative h-6 w-[49%] md:h-7 md:w-40 lg:h-8 lg:w-50 xl:h-9 xl:w-60">
            <CustomDropdown
                value={movieStatusFilter}
                onChange={handleStatusChange}
                name="movieStatus"
                placeholder="Status"
                options={statusOptions}
                bgColor="indigo-700 backdrop-blur-[50px]"
                inputBgColor="purple-400 backdrop-blur-[10px]"
                hoverColor="pink-500"
                borderColor="purple-500"
                textColor="white"
                height="h-full"
                textAlign="center"
                inputTextSize="text-base md:text-md font-bold"
                optionTextSize="text-base md:text-md font-bold"
                width="w-40 md:w-56"
                forceFillLabel={true}
            />
        </div>
    );
};

export default MovieStatusFilterButton;
