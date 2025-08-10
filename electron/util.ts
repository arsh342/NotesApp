// Check if we're in development by looking for the source files
export const isDev = process.env.NODE_ENV === 'development' || !process.resourcesPath;
