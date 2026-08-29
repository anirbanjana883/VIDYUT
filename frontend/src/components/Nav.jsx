import { MessageSquare } from 'lucide-react'
import React from 'react'
import { useSelector } from 'react-redux'

function Nav() {
const {selectedConversation} = useSelector(state => state.conversation)
const {messages} = useSelector(state => state.message)
  return (
<>
    {selectedConversation &&   
    <div className='h-14 flex items-center gap-2.5  px-5 border-b border-green-500/30 bg-[#0a0a0a] shadow-[0_4px_20px_rgba(34,197,94,0.03)]'>
      <div className='flex items-center justify-center w-7 h-7 rounded-lg bg-green-500/10 border border-green-500/30'>
        <MessageSquare size={13} className="text-green-400 font-bold"/>
      </div>
      <div className='text-[14px] font-bold text-white tracking-wide'>
        {selectedConversation?.title || "New Chat"}
      </div>
      <div className='text-[10px] font-bold text-white bg-green-500/20 border border-green-500/30 px-2 py-0.5 rounded-full'>
        {messages?.length} Messages
      </div>
    </div>}
  </>
  )
}

export default Nav