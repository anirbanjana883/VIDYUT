import { Code2, FileText, Globe, ImageIcon, MessageSquare, Mic, MicOff, Paperclip, Presentation, Send, X, Zap } from 'lucide-react'
import React, { useEffect, useState, useRef } from 'react'
import sendMessage from '../features/sendMessage'
import { useDispatch, useSelector } from 'react-redux'
import { addMessage, setArtifacts, setIsLoading, setMessages } from '../redux/messageSlice'
import { createConversation } from '../features/createConversation'
import { addConversation, setConvTitle, setSelectedConversation } from '../redux/conversationSlice'
import { updateConversation } from '../features/updateConversation'

function ChatInput() {
  const [value, setValue] = useState("")
  const [selectedAgent, setSelectedAgent] = useState("Auto")
  const { selectedConversation } = useSelector(state => state.conversation)
  const { messages, isLoading } = useSelector(state => state.message)
  const [selectedFile, setSelectedFile] = useState(null)
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef(null)
  const fileRef = useRef(null)
  const dispatch = useDispatch()

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition()
    recognition.lang = "en-US"
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (event) => {
      let transcript = ""
      for (let index = event.resultIndex; index < event.results.length; index++) {
        transcript += event.results[index][0].transcript
      }
      setValue(transcript)
    }

    recognition.onend = () => {
      setListening(false)
    }

    recognitionRef.current = recognition
  }, [])

  const toggleMic = () => {
    if (!recognitionRef.current) {
      alert("speech recognition not supported")
    }
    if (listening) {
      recognitionRef.current.stop()
      setListening(false)
    } else {
      recognitionRef.current.start()
      setListening(true)
    }
  }

  const handleSendMessage = async () => {
    dispatch(setIsLoading(true))
    let conversation = selectedConversation
    if (!conversation) {
      dispatch(setMessages([]))
      const conv = await createConversation()
      dispatch(setSelectedConversation(conv))

      dispatch(addConversation(conv))
      conversation = conv
    }

    if (conversation.title == "New Chat") {
      await updateConversation({ id: conversation?._id, title: value.trim() })
      dispatch(setConvTitle({ conversationId: conversation?._id, title: value.slice(0, 40) }))
    }

    console.log(selectedFile)
    const formData = new FormData()
    formData.append("prompt", value.trim())
    formData.append("conversationId", conversation?._id)
    formData.append("agent", selectedAgent.toLowerCase())
    if (selectedFile) {
      formData.append("file", selectedFile)
    }

    dispatch(addMessage({ role: "user", content: value.trim() }))
    setValue("")
    const data = await sendMessage(formData)
    dispatch(setIsLoading(false))
    setSelectedFile(null)
    dispatch(setArtifacts(data.artifacts || []))
    dispatch(addMessage({ role: "assistant", content: data?.answer, images: data?.images }))
    console.log(data)
  }

  const agents = [
    { id: "auto", icon: Zap, label: "Auto" },
    { id: "chat", icon: MessageSquare, label: "Chat" },
    { id: "coding", icon: Code2, label: "Coding" },
    { id: "pdf", icon: FileText, label: "PDF" },
    { id: "ppt", icon: Presentation, label: "PPT" },
    { id: "vision", icon: ImageIcon, label: "Vision" },
    { id: "search", icon: Globe, label: "Search" }
  ]

  return (
    <div className='w-full overflow-hidden px-3 md:px-5 py-4 border-t border-green-500/20 bg-[#0a0a0a]'>
      <div className='flex flex-col gap-2 bg-[#121212] border border-green-500/30 rounded-2xl px-4 pt-3.5 pb-3 shadow-[0_0_15px_rgba(34,197,94,0.05)]'>

        <div className='flex w-[80%] gap-2 pr-2 flex-wrap'>
          {agents.map((agent) => {
            const isActive = selectedAgent === agent.label
            const Icon = agent.icon
            return (
              <div
                key={agent.id}
                onClick={() => setSelectedAgent(agent.label)}
                className={`
            flex-shrink-0
            cursor-pointer
            inline-flex
            items-center
            gap-1.5
            px-3
            py-2
            rounded-full
            text-xs
            font-bold
            border
            transition-all

            ${isActive
                    ? "bg-green-600 text-white border-transparent shadow-[0_0_10px_rgba(34,197,94,0.4)]"
                    : "bg-black/40 text-gray-400 border-green-500/20 hover:bg-black/60 hover:text-white"
                  }
          `}>

                <Icon size={14}
                  className={
                    isActive
                      ? "text-white"
                      : "text-gray-400"
                  } />

                {agent.label}

              </div>
            )
          })}
        </div>

        {
          selectedFile && <div className='my-3'>
            <div className='inline-flex items-center gap-2 rounded-xl border border-green-500/30 bg-black/40 px-3 py-2'>
              {
                selectedFile?.type === "application/pdf" ? <FileText size={16}
                  className="text-green-400"
                /> : selectedFile.type.startsWith("image/") && <img src={URL.createObjectURL(selectedFile)} alt="preview" className="h-10 w-10 rounded-xl object-cover mt-1"
                />
              }

              <div>
                <p className='text-xs font-bold text-white'>
                  {selectedFile?.name}
                </p>
                <p className='text-[10px] font-bold text-green-500'>
                  {Math.ceil(selectedFile.size / 1024)}KB
                </p>
              </div>
              <button className='ml-2' onClick={() => { setSelectedFile(null); fileRef.current.value = "" }}><X size={14} className='text-gray-400 hover:text-red-500' /></button>
            </div>
          </div>
        }

        <textarea
          placeholder='Ask VIDYUT Anything...'
          onChange={(e) => setValue(e.target.value)}
          value={value}
          className="w-full bg-transparent outline-none resize-none text-[14px] font-bold text-white placeholder:text-gray-500 leading-relaxed [scrollbar-width:none] [&::-webkit-scrollbar]:hidden disabled:opacity-50 mt-2"
          rows={3}
        />
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-1'>

            <input type="file" accept='.pdf,image/*' hidden ref={fileRef} onChange={(e) => {
              const file = e.target.files[0]
              if (file) {
                setSelectedFile(file)
              }
            }} />

            <button className='flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-green-400 hover:bg-white/[0.05] border border-transparent hover:border-green-500/30 transition-all duration-150 bg-transparent cursor-pointer' onClick={() => fileRef.current.click()}>
              <Paperclip size={16} />
            </button>
            <button
              onClick={toggleMic}
              className={`flex items-center justify-center w-8 h-8 rounded-lg  transition-all duration-150 cursor-pointer ${listening ? "bg-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.5)]" : "text-gray-400 hover:text-green-400 hover:bg-white/[0.05]"}`}>
              {listening ? <Mic size={16} /> : <MicOff size={16} />}
            </button>
          </div>
          <button
            disabled={(!value && !selectedFile) || isLoading}
            onClick={handleSendMessage}
            className={`flex items-center justify-center w-8 h-8 rounded-lg border-none cursor-pointer transition-all duration-150 ${value.trim() || selectedFile ? "bg-green-600 hover:bg-green-500 text-white shadow-[0_0_10px_rgba(34,197,94,0.4)]" : "bg-black/40 text-gray-600 cursor-not-allowed"}`}>
            <Send size={15} />
          </button>
        </div>
      </div>
    </div >
  )
}

export default ChatInput