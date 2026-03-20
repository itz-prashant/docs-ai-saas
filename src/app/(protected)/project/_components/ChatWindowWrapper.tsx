import React from 'react'
import ChatMessages from './ChatMessages'
import ChatInput from './ChatInput'

type Props = {
    projectId: string
}

const ChatWindowWrapper = ({projectId}:Props) => {
  return (
    <div className="h-full flex flex-col">
      {/* messages area */}
      <ChatMessages projectId={projectId} />

      <ChatInput projectId={projectId} />
    </div>
  )
}

export default ChatWindowWrapper
