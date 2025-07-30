import React, { useState } from "react";
import CustomDropdown from "@components/UI/CustomDropdown";

const statusOptions = [
    { value: "all", label: "All movies" },
    { value: "now", label: "Now Showing" },
    { value: "up", label: "Upcoming" },
];


const MovieStatusFilterButton = ({ value, onChange }) => {
    const [movieStatusFilter, setMovieStatusFilter] = useState(value || "all");

    const handleStatusChange = (e) => {
        setMovieStatusFilter(e.target.value);
        if (onChange) onChange(e.target.value);
    };

    return (
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
            height="h-10 sm:h-11 md:h-12 lg:h-13 xl:h-14 z-50"
            textAlign="center"
            inputTextSize="text-sm sm:text-base md:text-lg"
            optionTextSize="text-sm sm:text-base md:text-lg"
            width="w-40 md:w-56"
            forceFillLabel={true}
        />
    );
};

export default MovieStatusFilterButton;
