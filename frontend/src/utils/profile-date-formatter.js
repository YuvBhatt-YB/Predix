export const profileDateFormatter = (prismaDate) => {
    const date = new Date(prismaDate)
    const formatter = new Intl.DateTimeFormat("en-US",{
        year:"numeric",
        month:"long",
        day:"numeric"
    })
    return formatter.format(date)
}