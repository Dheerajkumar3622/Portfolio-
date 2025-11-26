import React, { useState } from 'react';

interface TagInputProps {
    tags: string[];
    setTags: (newTags: string[]) => void;
    placeholder?: string;
    className?: string;
}

const TagInput: React.FC<TagInputProps> = ({ tags, setTags, placeholder, className }) => {
    const [inputValue, setInputValue] = useState('');

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const newTag = inputValue.trim();

            if (newTag && !tags.includes(newTag)) {
                setTags([...tags, newTag]);
                setInputValue('');
            }
        }
    };

    const removeTag = (indexToRemove: number) => {
        setTags(tags.filter((_, index) => index !== indexToRemove));
    };

    return (
        <div className={`border flex flex-wrap items-center gap-2 p-2 rounded-md bg-gray-700 ${className}`}>
            {tags.map((tag, index) => (
                <div key={index} className="flex items-center bg-accent/30 text-accent text-sm font-semibold px-3 py-1 rounded-full">
                    <span>{tag}</span>
                    <button
                        type="button"
                        onClick={() => removeTag(index)}
                        className="ml-2 text-accent hover:text-white font-bold"
                        aria-label={`Remove ${tag}`}
                    >
                        &times;
                    </button>
                </div>
            ))}
            <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder || 'Add a tag...'}
                className="flex-1 bg-transparent border-none text-white placeholder-gray-400 focus:outline-none focus:ring-0 p-1 min-w-[120px]"
            />
        </div>
    );
};

export default TagInput;
