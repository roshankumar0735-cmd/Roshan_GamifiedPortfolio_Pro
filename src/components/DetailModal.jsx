import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function DetailModal({ id, profile, onClose }){
  if(!id) return null
  let content = { title:id, body:'' }
  switch(id){
    case 'about': content = { title:'About', body: profile.bio }; break
    case 'projects': content = { title:'Projects', body: profile.projects.map(p=>`${p.name}: ${p.desc}`).join('\n') }; break
    case 'skills': content = { title:'Skills', body: profile.skills.join(', ') }; break
    case 'experience': content = { title:'Experience', body: profile.experience.map(e=>`${e.role} — ${e.years}`).join('\n') }; break
    case 'contact': content = { title:'Contact', body: `Email: ${profile.links.email}\nLinkedIn: ${profile.links.linkedin}` }; break
    case 'linkedin': content = { title:'LinkedIn', body: profile.links.linkedin }; break
    case 'github': content = { title:'GitHub', body: profile.links.github }; break
    case 'qualification': content = { title:'Qualification', body: profile.qualification.map(q=>`${q.degree} — ${q.year}`).join('\n') }; break
    default: content = { title:id, body:'Details coming soon.' }
  }
  return (
    <AnimatePresence>
      <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{position:'fixed', inset:0, display:'flex', alignItems:'center', justifyContent:'center', zIndex:2000}}>
        <div style={{background:'rgba(0,0,0,0.6)', position:'absolute', inset:0}} onClick={onClose} />
        <motion.div initial={{y:30}} animate={{y:0}} exit={{y:30}} style={{background:'white', color:'#111', padding:24, borderRadius:12, width:'min(900px,92%)', zIndex:2100}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <h2 style={{margin:0}}>{content.title}</h2>
            <button onClick={onClose} style={{background:'transparent', border:'none', fontSize:20}}>✕</button>
          </div>
          <pre style={{whiteSpace:'pre-wrap', marginTop:12}}>{content.body}</pre>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
