export const generateProfileImg = (seed: string): string => {
    const avatarURL = `https://api.dicebear.com/9.x/pixel-art/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9`

    return avatarURL
}