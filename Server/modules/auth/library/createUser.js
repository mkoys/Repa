import nextIdentifier from "../database/nextIdentifier.js"

export default async (data) => {
    const newUser = {
        id: await nextIdentifier(),
        created: new Date(),
        ...data
    }

    return newUser;
}