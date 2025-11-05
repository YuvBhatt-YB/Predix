export const transactionsDateTimeFormatter = (prismaDate) => {
    const dateTime = new Date(prismaDate)

    const time = dateTime.toLocaleString("en-US",{
        hour:"numeric",
        minute:"numeric",
        hour12:true
    })
    const date = dateTime.toLocaleString("en-US",{
        day:"numeric",
        month:"long",
        year:"numeric"
    })

    return `${time} ${date}`
}