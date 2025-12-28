export const MODELS = {
    // Text Generation
    // Using specific version to avoid 'not found' errors with aliases
    text: 'gemini-2.0-flash',

    // Image Generation
    // Using imagen-3.0 as a stable fallback.
    // Switch to 'imagen-4.0-generate-001' if available.
    image: 'imagen-3.0-generate-001',

    // Text to Speech
    // Keeping the original preview model for now, but be aware it might fail if not available.
    tts: 'gemini-2.5-flash-preview-tts'
};
