export const shorten_file_name = (file_name: string, result_length: number): string => {
    if (!file_name.includes(".")){
        throw new Error("File name does not have an extension");
    }
    if (file_name.length <= result_length) {
        return file_name;
    }
    const extension = file_name.split(".").pop()!; // Array is never empty
    if (result_length <= extension.length + 3) {
        throw new Error("Result length is too short");
    }
    const file_name_without_extension = file_name.slice(0, file_name.length - extension.length - 1);
    const file_name_shortened = file_name_without_extension.slice(0, result_length - extension.length - 3);
    return `${file_name_shortened}...${extension}`;
}
