"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/modules/auth/actions";
import { revalidatePath } from "next/cache";


export const toggleStarMarked = async(playgroundId:string, isChecked:boolean)=>{
    const user = await getCurrentUser();
    const userId = user?.id;

    if(!userId){
        throw new Error("User Id is Required")
    }

    try {
        if(isChecked){
            await prisma.starmark.create({
                data:{
                    userId:userId!,
                    playgroundId,
                    isMarked:isChecked
                },
            });
        }else{
            await prisma.starmark.delete({
                where:{
                    userId_playgroundId:{
                        userId,
                        playgroundId:playgroundId
                    },
                },
            });
        }

        revalidatePath("/dashboard");
        return {success:true,isMarked:isChecked}
    } catch (error) {
        console.error("Error while updating problem:",error);
        return {success:false,error:"Failed to update problem"};
    }
}

export const getAllPlaygroundForUser = async()=>{
    const user = await getCurrentUser();

    try {
        const playground = await prisma.playground.findMany({
            where:{
                userId:user?.id
            },
            include:{
                user:true,
                Starmark:{
                    where:{
                        userId:user?.id!
                    },
                    select:{
                        isMarked:true
                    }
                }
            }
        });

        return playground;
    } catch (error) {
        console.log(error)
    }
}

export const createPlayground = async(data:{
    title:string;
    template: "REACT" | "VUE" | "ANGULAR" | "HONO" | "EXPRESS" | "NEXTJS";
    description?:string;
})=>{
    const user = await getCurrentUser();

    const {title,template,description} = data;

    try {
        const playground = await prisma.playground.create({
            data:{
                title:title,
                description:description,
                template:template,
                userId:user?.id as string
            }
        });

        return playground;
    } catch (error) {
        console.log(error);
    }
}

export const deleteProjectById = async(id:string)=>{
    try {
        await prisma.playground.delete({
            where:{
                id:id
            }
        });
        revalidatePath("/dashboard");
    } catch (error) {
        console.log(error);
    }
}

export const editProjectById = async(id:string,data:{
    title:string;
    description?:string;
})=>{
    try {
        await prisma.playground.update({
            where:{
                id:id
            },
            data:data
        })
        revalidatePath("/dashboard")
    } catch (error) {
        console.log(error);
    }
}

export const duplicateProjectById = async(id:string)=>{

    try {
        const originalPlayground = await prisma.playground.findUnique({
            where:{
                id:id
            }
        })
    
        if(!originalPlayground){
            throw new Error("Original Playground not found")
        }
    
        const duplicatePlayground = await prisma.playground.create({
            data:{
                title:`${originalPlayground.title} (Copy)`,
                description:originalPlayground.description,
                template:originalPlayground.template,
                userId:originalPlayground.userId,
            }
        })
        revalidatePath("/dashboard")
        return duplicatePlayground;
    } catch (error) {
        console.log("Error while duplicating:",error)
    }
}