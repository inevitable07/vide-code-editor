"use client"

import { usePlayground } from '@/modules/playground/hooks/usePlayground';
import { useParams } from 'next/navigation'
import React from 'react'

const MainPlayGround = () => {
    const id = useParams<{id:string}>();

    const {playgroundData, templateData, isLoading, error, saveTemplateData} = usePlayground(id?.id);

    console.log("playgroundData:", playgroundData);
    console.log("templateData:", templateData);
  return (
    <div>MainPlayGround</div>
  )
}

export default MainPlayGround