import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatNumber(number: number, precision: number = 2): string | number {
    if (number >= 1000000000) {
        return `${(number / 1000000000).toFixed(precision)}B`;
    } else if (number >= 1000000) {
        return `${(number / 1000000).toFixed(precision)}M`;
    } else if (number >= 1000) {
        return `${(number / 1000).toFixed(precision)}K`;
    } else {
        return number;
    }
}

export const CheckHTML = (text: string): boolean => {
    const regex = /<(\/?)(html|head|title|base|link|meta|style|script|noscript|template|body|section|nav|article|aside|h1|h2|h3|h4|h5|h6|header|footer|address|main|p|hr|pre|blockquote|ol|ul|li|dl|dt|dd|figure|figcaption|div|a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|picture|source|img|iframe|embed|object|param|video|audio|track|map|area|math|svg|canvas|math|table|caption|colgroup|col|tbody|thead|tfoot|tr|td|th|form|label|input|button|select|datalist|optgroup|option|textarea|output|progress|meter|fieldset|legend|details|summary|dialog|script|style|template|slot|shadow|article|aside|details|figcaption|figure|footer|header|hgroup|main|mark|nav|section|summary|time|mark|audio|video|source|track|embed|object|param|ins|del|picture|source|img|iframe|canvas|math|svg|table|caption|colgroup|col|tbody|thead|tfoot|tr|td|th|form|fieldset|legend|label|input|button|select|datalist|optgroup|option|textarea|output|progress|meter|details|summary|command|menu|slot|template|html|head|title|base|link|meta|style|script|noscript|template|body|section|nav|article|aside|h1|h2|h3|h4|h5|h6|header|footer|address|main|p|hr|pre|blockquote|ol|ul|li|dl|dt|dd|figure|figcaption|div|a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|picture|source|img|iframe|embed|object|param|video|audio|track|map|area|math|svg|canvas|math|table|caption|colgroup|col|tbody|thead|tfoot|tr|td|th|form|label|input|button|select|datalist|optgroup|option|textarea|output|progress|meter|fieldset|legend|details|summary|dialog|script|style|template|slot|shadow|article|aside|details|figcaption|figure|footer|header|hgroup|main|mark|nav|section|summary|time|mark|audio|video|source|track|embed|object|param|ins|del|picture|source|img|iframe|canvas|math|svg|table|caption|colgroup|col|tbody|thead|tfoot|tr|td|th|form|fieldset|legend|label|input|button|select|datalist|optgroup|option|textarea|output|progress|meter|details|summary|command|menu|slot|template)\b[^>]*>/gi;
    return regex.test(text);
};

export const removeSpecialCharacters = (text: string): string =>
    text.replace(/[^a-zA-Z0-9]/g, "");

export function wrapText(text: string, maxLength: number = 20): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
}

export function capitalizeString(string: string): string {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export function formatSize(fileSizeInBytes: number): string {
    if (fileSizeInBytes === 0) return "0 B";
    const units = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(fileSizeInBytes) / Math.log(1024));
    if (i >= units.length) return fileSizeInBytes + " B";
    return parseFloat((fileSizeInBytes / Math.pow(1024, i)).toFixed(2)) + " " + units[i];
}
