import React from 'react'

const Navbar = () => {
  return (
    <nav>
        <ul className='flex justify-around p-3 bg-slate-800 text-white font-semibold'>
            <li>
                <a href="https://github.com/AS-Danish/pass-protector" target='_blank'>Github</a>
            </li>
            <li>
                <a href="https://www.linkedin.com/in/abdul-salaam-danish/" target='_blank'>LinkedIn</a>
            </li>
        </ul>
    </nav>
  )
}

export default Navbar