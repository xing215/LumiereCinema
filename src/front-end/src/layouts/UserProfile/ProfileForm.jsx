import React, { useEffect, useState } from 'react';
import { ROUTES } from '@routes/routeConfig';
import { useNavigate } from 'react-router-dom';

import { validatePassword, formatPasswordErrors } from '@/utils/auth.utils';
import CustomDropdown from '@components/UI/CustomDropdown';
import { useFetchProfile, useUpdateProfile } from '@hooks/useUser';

const Buttons = ({ text, onClick, loading }) => {
    return (
        <button
            className="relative z-10 flex h-auto w-full cursor-pointer flex-row items-center justify-center rounded-2xl bg-pink-400 p-2 py-3 text-white shadow-[inset_0px_0px_50px_3px_rgba(155,47,255,1.00)] hover:bg-purple-700"
            onClick={loading ? null : onClick}
        >
            <span className="md:text-md relative h-auto w-[80%] text-center font-['Unbounded'] text-sm font-semibold">{text}</span>
        </button>
    );
};

const ProfileForm = () => {
    const [hovered, setHovered] = useState(false);
    const navigate = useNavigate();

    const { fetchProfile, profile, loading, error } = useFetchProfile();
    const { updateProfile, loading: updating, error: updateError } = useUpdateProfile();

    function toTitleCase(str) {
        return str?.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    }

    function formatDate(date) {
        if (!date) return '';
        if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) return date;
        const d = new Date(date);
        if (isNaN(d)) return '';
        return d.toISOString().slice(0, 10);
    }

    useEffect(() => {
        fetchProfile();
    }, []);
    const [formData, setFormData] = useState({
        name: profile?.name || '',
        birthday: formatDate(profile?.birthday) || '',
        gender: toTitleCase(profile?.gender) || '',
        email: profile?.email || '',
        phone: profile?.phone || '',
    });

    useEffect(() => {
        if (profile) {
            setFormData({
                name: profile.name || '',
                birthday: formatDate(profile?.birthday) || '',
                gender: toTitleCase(profile.gender) || '',
                email: profile.email || '',
                phone: profile.phone || '',
            });
        }
    }, [profile]);

    const [errors, setErrors] = useState({});

    // Validation patterns
    const patterns = {
        name: /^[a-zA-ZÀ-ỹ\s]{2,}\s+[a-zA-ZÀ-ỹ\s]{2,}$/,
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        phone: /^(?:\+84|0084|0)[235789][0-9]{1,2}[0-9]{7}$/,
        gender: /^(Male|Female|Other)$/,
    };

    const validateField = (name, value) => {
        let error = '';

        switch (name) {
            case 'name':
                if (!patterns.name.test(value.trim())) {
                    error = 'Name must contain at least two words (e.g., John Smith)';
                }
                break;
            case 'email':
                if (!patterns.email.test(value)) {
                    error = 'Please enter a valid email address';
                }
                break;
            case 'phone':
                if (!patterns.phone.test(value)) {
                    error = 'Please enter a valid Vietnamese phone number';
                }
                break;
            case 'birthday':
                if (value) {
                    const selectedDate = new Date(value);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    if (selectedDate >= today) {
                        error = 'Birthday must be before today';
                    }
                }
                break;
            case 'gender':
                if (value && !patterns.gender.test(value)) {
                    error = 'Please select a valid gender option';
                }
                break;
            case 'password':
                const passwordErrors = validatePassword(value);
                if (passwordErrors.length > 0) {
                    error = formatPasswordErrors(passwordErrors);
                }
                break;
            case 'retypePassword':
                if (value !== formData.password) {
                    error = 'Passwords do not match';
                }
                break;
            default:
                break;
        }

        return error;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Real-time validation
        const error = validateField(name, value);
        setErrors((prev) => ({
            ...prev,
            [name]: error,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate all fields before submit
        const newErrors = {};
        Object.keys(formData).forEach((key) => {
            const error = validateField(key, formData[key]);
            if (error) newErrors[key] = error;
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Prepare data for API (match backend field names)
        const UpdateData = {};
        if (formData.name !== profile?.name) UpdateData.name = formData.name;
        if (formData.phone !== profile?.phone) UpdateData.phone = formData.phone;
        if (formData.birthday !== formatDate(profile?.birthday)) UpdateData.birthday = formData.birthday;
        if (formData.gender.toLowerCase() !== (profile?.gender || '').toLowerCase()) UpdateData.gender = formData.gender.toLowerCase();

        const result = await updateProfile(UpdateData);
        if (result.success) {
            toggleEdit();
        }

        // Error is handled by the hook and displayed below
    };

    const [canEdit, setCanEdit] = useState(true);
    function toggleEdit() {
        setCanEdit(!canEdit);
    }

    return (
        <div className="px-4sm:px-0 flex w-[90%] max-w-[690px] flex-col items-start justify-start gap-3">
            <div className="w-full justify-start font-['Libre_Franklin'] text-3xl font-bold text-white">Information</div>

            {updateError && (
                <div className="w-full rounded-md bg-red-100 p-3 text-center">
                    <p className="text-md font-['Libre_Franklin'] text-red-800">{updateError}</p>
                </div>
            )}
            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="w-full space-y-4 sm:space-y-5 md:space-y-6">
                <div>
                    <label className="mb-2 block font-['Libre_Franklin'] text-sm font-bold text-white sm:text-base md:text-lg lg:text-xl">Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`bg-opacity-70 h-10 w-full rounded-lg bg-zinc-300 px-3 text-black placeholder-gray-600 focus:ring-2 focus:outline-none disabled:bg-zinc-300/5 disabled:text-white disabled:ring-1 disabled:ring-amber-50 sm:h-11 sm:px-4 md:h-12 lg:h-13 xl:h-14 ${errors.name ? 'ring-2 ring-red-500 focus:ring-red-500' : 'focus:ring-purple-500'} focus:bg-opacity-90 font-['Unbounded'] text-sm sm:text-base md:text-lg`}
                        required
                        disabled={canEdit}
                    />
                    {errors.name && <p className="mt-1 font-['Libre_Franklin'] text-xs text-red-400 sm:text-sm">{errors.name}</p>}
                </div>

                {/* Birthday and Gender Row - Stack on small screens */}
                <div className="flex flex-col gap-4 md:flex-row md:gap-4">
                    <div className="flex-1">
                        <label className="mb-2 block font-['Libre_Franklin'] text-sm font-bold text-white sm:text-base md:text-lg lg:text-xl">Birthday</label>
                        <input
                            type="date"
                            name="birthday"
                            value={formData.birthday}
                            onChange={handleInputChange}
                            className={`bg-opacity-70 h-10 w-full rounded-lg bg-zinc-300 px-3 text-black focus:ring-2 focus:outline-none disabled:bg-zinc-300/5 disabled:text-white disabled:ring-1 disabled:ring-amber-50 sm:h-11 sm:px-4 md:h-12 lg:h-13 xl:h-14 ${errors.birthday ? 'ring-2 ring-red-500 focus:ring-red-500' : 'focus:ring-purple-500'} focus:bg-opacity-90 font-['Unbounded'] text-sm sm:text-base md:text-lg`}
                            required
                            disabled={canEdit}
                        />
                        {errors.birthday && <p className="mt-1 font-['Libre_Franklin'] text-xs text-red-400 sm:text-sm">{errors.birthday}</p>}
                    </div>
                    <div className="flex-1">
                        {!canEdit ? (
                            <>
                                <label className="mb-2 block font-['Libre_Franklin'] text-sm font-bold text-white sm:text-base md:text-lg lg:text-xl">Gender</label>

                                <CustomDropdown
                                    value={formData.gender}
                                    onChange={handleInputChange}
                                    name="gender"
                                    placeholder="Select..."
                                    bgColor="zinc-300"
                                    hoverColor="zinc-200"
                                    borderColor="zinc-400"
                                    textColor="black"
                                    bgOpacity="bg-opacity-70"
                                    height="h-10 sm:h-11 sm:px-4 md:h-12 lg:h-13 xl:h-14"
                                    textAlign="left"
                                    options={[
                                        { value: 'Male', label: 'Male' },
                                        { value: 'Female', label: 'Female' },
                                        { value: 'Other', label: 'Other' },
                                    ]}
                                />
                            </>
                        ) : (
                            <>
                                <label className="mb-2 block font-['Libre_Franklin'] text-sm font-bold text-white sm:text-base md:text-lg lg:text-xl">Gender</label>
                                <input
                                    type="string"
                                    name="birthday"
                                    value={formData.gender}
                                    onChange={handleInputChange}
                                    className={`bg-opacity-70 h-10 w-full rounded-lg bg-zinc-300 px-3 text-black focus:ring-2 focus:outline-none disabled:bg-zinc-300/5 disabled:text-white disabled:ring-1 disabled:ring-amber-50 sm:h-11 sm:px-4 md:h-12 lg:h-13 xl:h-14 ${errors.birthday ? 'ring-2 ring-red-500 focus:ring-red-500' : 'focus:ring-purple-500'} focus:bg-opacity-90 font-['Unbounded'] text-sm sm:text-base md:text-lg`}
                                    required
                                    disabled={canEdit}
                                />
                            </>
                        )}
                        {errors.gender && <p className="mt-1 font-['Libre_Franklin'] text-xs text-red-400 sm:text-sm">{errors.gender}</p>}
                    </div>
                </div>

                {/* Email */}
                <div className="relative w-full" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onTouchStart={() => setHovered(true)}>
                    {/* Tooltip */}
                    <div
                        className={`absolute top-0 left-1/2 z-50 w-max -translate-x-1/2 rounded bg-indigo-100 px-3 py-1 font-['Libre_Franklin'] text-xs text-black shadow-lg backdrop-blur-[10px] transition-all duration-200 ${hovered && !canEdit ? 'pointer-events-auto scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0'} `}
                    >
                        Please contact support to change your email
                    </div>
                    <label className="mb-2 block font-['Libre_Franklin'] text-sm font-bold text-white sm:text-base md:text-lg lg:text-xl">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`bg-opacity-70 h-10 w-full rounded-lg bg-zinc-300 px-3 text-black placeholder-gray-600 focus:ring-2 focus:outline-none disabled:bg-zinc-300/5 disabled:text-white disabled:ring-1 disabled:ring-amber-50 sm:h-11 sm:px-4 md:h-12 lg:h-13 xl:h-14 ${errors.email ? 'ring-2 ring-red-500 focus:ring-red-500' : 'focus:ring-purple-500'} focus:bg-opacity-90 font-['Unbounded'] text-sm sm:text-base md:text-lg`}
                        required
                        disabled={true}
                    />
                    {errors.email && <p className="mt-1 font-['Libre_Franklin'] text-xs text-red-400 sm:text-sm">{errors.email}</p>}
                </div>

                {/* Phone Number */}
                <div>
                    <label className="mb-2 block font-['Libre_Franklin'] text-sm font-bold text-white sm:text-base md:text-lg lg:text-xl">Phone Number</label>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`bg-opacity-70 h-10 w-full rounded-lg bg-zinc-300 px-3 text-black placeholder-gray-600 focus:ring-2 focus:outline-none disabled:bg-zinc-300/5 disabled:text-white disabled:ring-1 disabled:ring-amber-50 sm:h-11 sm:px-4 md:h-12 lg:h-13 xl:h-14 ${errors.phone ? 'ring-2 ring-red-500 focus:ring-red-500' : 'focus:ring-purple-500'} focus:bg-opacity-90 font-['Unbounded'] text-sm sm:text-base md:text-lg`}
                        required
                        disabled={canEdit}
                    />
                    {errors.phone && <p className="mt-1 font-['Libre_Franklin'] text-xs text-red-400 sm:text-sm">{errors.phone}</p>}
                </div>
            </form>
            <div className="mx-auto flex w-full max-w-[350px] flex-col justify-center gap-3 pt-4 md:mx-0 md:w-[62%]">
                {!canEdit ? (
                    <Buttons text={!updating ? (updateError ? 'RETRY' : 'SAVE') : '• • •'} onClick={handleSubmit} loading={updating} />
                ) : (
                    <>
                        <Buttons text={'CHANGE PASSWORD'} onClick={() => navigate(ROUTES.CHANGE_PASSWORD)} />
                        <Buttons text={'EDIT'} onClick={toggleEdit} />
                    </>
                )}
            </div>
        </div>
    );
};

export default ProfileForm;
