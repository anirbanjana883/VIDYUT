import { Check, Copy, ExternalLink, FileX2, X } from 'lucide-react'
import React from 'react'
import { useState } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

function MessageBubble({ role, content, images }) {
  const isUser = role === "user"
  const [lightBox, setLightBox] = useState(null)
  const [copiedCode, setCopiedCode] = useState("")

  const copyCode = async (code) => {
    await navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => {
      setCopiedCode("")
    }, 2000)
  }

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`w-fit max-w-[92vw] md:max-w-[72%]
 px-4 py-2.5 rounded-2xl
 break-words overflow-hidden
 leading-relaxed
        ${isUser
          ? "bg-green-700/80 border border-green-500/40 text-white font-bold rounded-tr-sm shadow-[0_0_15px_rgba(34,197,94,0.1)]"
          : "text-white font-bold rounded-tl-sm bg-transparent"
        }`}>

        {images.length > 0 && (
          <div className='flex flex-wrap gap-3 mt-4'>
            {images.map((img, i) => (
              <img
                key={i}
                src={img}
                onClick={() => setLightBox(img)}
                loading="lazy"
                onError={(e) => e.currentTarget.remove()}
                className="w-40 h-28 rounded-xl object-cover border border-green-500/30 cursor-zoom-in hover:opacity-90 transition hover:shadow-[0_0_10px_rgba(34,197,94,0.3)]"
              />
            ))}
          </div>
        )}

        <Markdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => (
              <h1 className='text-2xl font-bold text-white mt-5 mb-3'>{children}</h1>
            ),
            h2: ({ children }) => (
              <h2 className='text-xl font-bold text-white mt-4 mb-2'>{children}</h2>
            ),
            h3: ({ children }) => (
              <h3 className='text-lg font-bold text-white mt-3 mb-2'>{children}</h3>
            ),
            p: ({ children }) => (
              <p className='mb-3 whitespace-pre-wrap break-words font-bold text-white'>{children}</p>
            ),
            ul: ({ children }) => (
              <ul className='list-disc pl-5 space-y-1 my-2 font-bold text-white'>{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className='list-decimal pl-5 space-y-1 my-2 font-bold text-white'>{children}</ol>
            ),
            table: ({ children }) => (
              <div className='overflow-x-auto my-4'>
                <table className='min-w-full border border-green-500/30 font-bold text-white'>
                  {children}
                </table>
              </div>
            ),
            th: ({ children }) => (
              <th className='border border-green-500/30 bg-black/40 px-3 py-2 text-left font-bold text-white'>
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className='border border-green-500/30 px-3 py-2 font-bold text-white'>
                {children}
              </td>
            ),
            a: ({ href, children }) => (
              <a href={href}
                target="_blank"
                rel="noreferrer"
                className="text-green-400 font-bold underline inline-flex items-center gap-1 hover:text-green-300 transition-colors"
              >
                {children}
                <ExternalLink size={14} />
              </a>
            ),
            code: ({ className, children }) => {
              const value = String(children).trim()

              if (!className) {
                return (
                  <code className='px-1.5 py-0.5 rounded bg-green-500/20 text-green-300 font-bold border border-green-500/10'>
                    {value}
                  </code>
                )
              }

              const language = className.replace("language-", "")

              return (
                <div className='my-4 overflow-hidden rounded-xl border border-green-500/30 bg-[#0a0a0a] shadow-[0_0_15px_rgba(34,197,94,0.05)]'>
                  <div className='flex items-center justify-between bg-[#121212] border-b border-green-500/30 px-4 py-2'>
                    <span className='uppercase text-xs font-bold text-green-400 tracking-wider'>
                      {language}
                    </span>
                    <button className='flex items-center gap-1 text-xs font-bold text-white hover:text-green-400 transition-colors' 
                    onClick={() => copyCode(value)}>
                      {
                        copiedCode == value ?
                          <>
                            <Check size={14}/>
                            Copied
                          </> :
                          <><Copy size={14} />Copy</>
                      }
                    </button>
                  </div>

                  <SyntaxHighlighter
                    language={language}
                    style={oneDark}
                    wrapLongLines
                    showLineNumbers
                    customStyle={{
                      margin: 0,
                      padding: "16px",
                      background: "#0a0a0a", // Matte black base
                      fontSize: "13px",
                      fontWeight: "bold"
                    }}
                  >
                    {value}
                  </SyntaxHighlighter>
                </div>
              )
            },
            img:({src})=>{
              if(!src)return null;
              return (
                <img
                  src={src}
                  onClick={() => setLightBox(src)}
                  loading="lazy"
                  onError={(e) => e.currentTarget.remove()}
                  className="w-40 h-28 rounded-xl object-cover border border-green-500/30 cursor-zoom-in hover:opacity-90 transition hover:shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                />
              )
            }
          }}
        >
          {content}
        </Markdown>

      </div>
      {lightBox &&
        <div className='fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-6'>
          <button
            className='absolute top-5 right-5 text-white/80 hover:text-white bg-green-500/20 hover:bg-green-500/40 rounded-full p-2 transition-colors'
            onClick={() => setLightBox(null)}
          >
            <X />
          </button>
          <img
            src={lightBox}
            className="max-w-[90vw] max-h-[85vh] rounded-2xl border border-green-500/40 shadow-[0_0_30px_rgba(34,197,94,0.15)] object-contain"
          />
        </div>}
    </div>
  )
}

export default MessageBubble