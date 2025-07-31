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
        <CustomDropdown
            name="discount"
            placeholder=""
            value={movieStatusFilter}
            onChange={handleStatusChange}
            bgColor="indigo-700 backdrop-blur-[30px]"
            inputBgColor="pink-400"
            variant={'figma'}
            hoverColor="purple-600"
            borderColor=""
            textColor="white"
            dropdownTextColor="white"
            height="h-11"
            inputTextSize="text-md"
            optionTextSize="text-sm"
            openDirection='down'
            textAlign="center"
            width="w-full md:w-[calc(100vw*0.28)] lg:w-[calc(70vw*0.28)]"
            options={statusOptions}
            forceFillLabel={true}
        />
    );
};

export default MovieStatusFilterButton;
