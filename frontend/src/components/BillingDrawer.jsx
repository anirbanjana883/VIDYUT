import React from 'react'
import { AnimatePresence, motion } from "motion/react"
import { Crown, X } from 'lucide-react'
import { useSelector } from 'react-redux'
import { createOrder } from '../features/createOrder'
import { verifyPayment } from '../features/verifyPayment'

function BillingDrawer({ open, onClose }) {

    const { userData } = useSelector(state => state.user)

    const handleUpgrade = async (plan) => {
        try {
            const data = await createOrder(plan)
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: data?.order?.amount,
                currency: data?.order?.currency,
                name: "VIDYUT",
                description: `${data?.plan?.name} Plan`,
                order_id: data?.order?.id,
                handler: async (response) => {
                    try {
                        const data = await verifyPayment(response)
                        console.log(data)
                    } catch (error) {
                        console.log(error)
                    }
                },
                theme: {
                    color: "#16a34a" // Tailwind green-600
                }
            }

            const razorpay = new window.Razorpay(options)
            razorpay.open()
        } catch (error) {
            console.log(error)
        }
    }
    
    return (
        <AnimatePresence>
            {open && <> <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: .8 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 bg-black z-40 backdrop-blur-sm"
            />
                <motion.div
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "100%" }}
                    transition={{ duration: .25 }}
                    className="fixed right-0 top-0 z-50 h-screen w-[380px] bg-[#0a0a0a] border-l border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.1)] flex flex-col"
                >

                    <div className='flex items-center justify-between p-5 border-b border-green-500/20'>
                        <div>
                            <div className='text-white text-lg font-bold'>
                                Billing
                            </div>
                            <div className='text-white font-bold text-sm'>
                                Plans & Credits
                            </div>
                        </div>
                        <button onClick={onClose} className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center"
                        >
                            <X size={18} className="text-white font-bold" />
                        </button>
                    </div>

                    <div className='p-5'>
                        <div className='rounded-xl bg-[#151515] border border-green-500/30 p-4'>
                            <div className='flex justify-between items-center'>
                                <div>
                                    <p className='text-white font-bold text-sm'>
                                        Current Plan
                                    </p>
                                    <h3 className='text-white text-xl font-bold uppercase tracking-wide'>
                                        {userData?.plan || "free"}
                                    </h3>
                                </div>
                                <Crown className='text-green-400' />
                            </div>

                            <div className='mt-5'>
                                <div className='flex justify-between text-xs font-bold text-white mb-2'>
                                    <span>Credits</span>
                                    <span>{userData.credits || 0}/{userData.totalCredits || 100}</span>
                                </div>

                                <div className='h-2 rounded-full bg-black border border-green-500/20 overflow-hidden'>
                                    <div className="h-full bg-green-600 transition-all duration-500"
                                        style={{
                                            width: `${(
                                                (userData?.credits || 0) /
                                                (userData?.totalCredits || 1)
                                            ) * 100
                                                }%`
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='px-5 flex-1 overflow-auto space-y-4 pb-5'>
                        <div className='rounded-xl border border-green-500/20 bg-[#121212] p-4 transition-all hover:border-green-500/50 hover:shadow-[0_0_15px_rgba(34,197,94,0.1)]'>
                            <h3 className='text-white font-bold'>Starter Plan</h3>
                            <p className='text-green-400 text-2xl font-bold mt-2'>₹199</p>
                            <p className='text-white font-bold text-sm mt-1'>500 Credits</p>
                            <button className='mt-4 w-full rounded-lg bg-green-600 hover:bg-green-500 py-2.5 text-white font-bold transition-colors' onClick={() => handleUpgrade("starter")}>Upgrade</button>
                        </div>
                        
                        <div className='rounded-xl border border-green-500/40 bg-[#121212] p-4 transition-all hover:border-green-500/70 hover:shadow-[0_0_15px_rgba(34,197,94,0.15)] relative overflow-hidden'>
                            <div className='absolute top-0 right-0 bg-green-600 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg'>POPULAR</div>
                            <h3 className='text-white font-bold'>Pro Plan</h3>
                            <p className='text-green-400 text-2xl font-bold mt-2'>₹499</p>
                            <p className='text-white font-bold text-sm mt-1'>1000 Credits</p>
                            <button className='mt-4 w-full rounded-lg bg-green-600 hover:bg-green-500 py-2.5 text-white font-bold transition-colors' onClick={() => handleUpgrade("pro")}>Upgrade</button>
                        </div>
                    </div>

                </motion.div>
            </>
            }
        </AnimatePresence>
    )
}

export default BillingDrawer