export const safeParseJSON = (text) => {
    try {
        if (!text) return null;
        let cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const firstBracket = cleaned.indexOf('[');
        const lastBracket = cleaned.lastIndexOf(']');
        if (firstBracket !== -1 && lastBracket !== -1) {
            cleaned = cleaned.substring(firstBracket, lastBracket + 1);
        }
        return JSON.parse(cleaned);
    } catch (e) {
        console.error("JSON Parse Error on text:", text);
        return null;
    }
};
