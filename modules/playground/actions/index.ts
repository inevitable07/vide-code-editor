"use server";

import { prisma } from "@/lib/db";
import { TemplateFolder } from "../lib/path-to-json";
import { getCurrentUser } from "@/modules/auth/actions";



export const getPlaygroundById = async(id:string) =>{
    try {
        const playground = await prisma.playground.findUnique({
            where:{id},
            select:{
                templateFiles:{
                    select:{
                        content:true
                    }
                }
            }
        })
        return playground
    } catch (error) {
        console.error(error);
    }
}

export const SaveUpdatedCode = async(playgroundId:string , data:TemplateFolder)=>{
    const user = await getCurrentUser();
  if (!user) return null;

  try {
    const updatedPlayground = await prisma.templateFile.upsert({
        where:{
            playgroundId
        },
        update:{
            content:JSON.stringify(data)
        },
        create:{
            playgroundId,
            content:JSON.stringify(data)
        }
    })

    return updatedPlayground;
  } catch (error) {
     console.log("SaveUpdatedCode error:", error);
    return null;
  }
}
