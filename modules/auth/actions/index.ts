"use server"
import {auth} from "@/auth"
import {prisma} from "@/lib/db"
import { signIn } from "@/auth"

export const getUserById = async (id:string) => {
    try {
        const user = await prisma.user.findUnique({
            where:{id},
            include:{
                accounts:true
            }
        })
        console.log(user);
        return user
    } catch (error) {
        console.error(error);
        return null;
    }
}

export const getUserByEmail = async (email:string) => {
    try {
        const user = await prisma.user.findUnique({
            where:{email},
            include:{
                accounts:true
            }
        })
        return user
    } catch (error) {
        console.error(error);
        return null;
    }
}


export const getAccountByUserId = async (userId:string) => {
    try {
        const account = await prisma.account.findFirst({
            where:{userId}
        })
        return account
    } catch (error) {
        console.error(error);
        return null;
    }
}

export const getCurrentUser = async () => {
    const user = await auth();
    return user?.user;
}

export const handleSignInGoogle = async () => {
    await signIn("google", { redirectTo: "/" })
}

export const handleSignInGithub = async () => {
    await signIn("github", { redirectTo: "/" })
}