import React from 'react'
export default function Sidebar({ profile, onOpen }){
  return (
    <aside className="col-span-5 max-h-[78vh] overflow-y-auto pr-4">
      <article className="mb-10">
        <h1 className="text-3xl font-bold">Hello, I'm {profile.name}</h1>
        <p className="mt-4 text-white/80">{profile.bio}</p>
      </article>
      <article className="mb-10">
        <h2 className="text-2xl font-semibold">Projects</h2>
        {profile.projects.map((p,i)=>(<div key={i} className="mt-4 p-3 bg-white/3 rounded"><div className="font-bold">{p.name}</div><div className="text-sm mt-1">{p.desc}</div></div>))}
      </article>
      <article className="mb-10">
        <h2 className="text-2xl font-semibold">Experience</h2>
        {profile.experience.map((e,i)=>(<div key={i} className="mt-4 p-3 bg-white/3 rounded">{e.role} — {e.company}<div className="text-sm mt-1">{e.years}</div></div>))}
      </article>
      <article className="mb-10">
        <h2 className="text-2xl font-semibold">Skills</h2>
        <div className="mt-4 flex flex-wrap gap-2">{profile.skills.map((s,i)=>(<span key={i} className="px-3 py-1 bg-white/5 rounded">{s}</span>))}</div>
      </article>
      <article className="mb-10">
        <h2 className="text-2xl font-semibold">Qualification</h2>
        <div className="mt-4">{profile.qualification.map((q,i)=>(<div key={i} className="p-3 bg-white/3 rounded mb-2">{q.degree} — {q.year}</div>))}</div>
      </article>
    </aside>
  )
}
