import { useEffect, useState, useRef } from 'react'
import './App.css'
import Navbar from './components/Navbar/Navbar'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons/faPlus'
import { faCopy, faEye, faEyeSlash, faPenToSquare, faTrash } from '@fortawesome/free-solid-svg-icons'
import { collection, getDocs, addDoc, deleteDoc, doc, setDoc } from "firebase/firestore";
import { db } from "./firestoreDatabase/firestoreConfig"
import { ClipLoader } from 'react-spinners'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Footer from './components/Footer/Footer'

function App() {
  const [getPasswords, setPasswords] = useState([])
  const [data, setData] = useState({ site: '', username: '', password: '' });
  const [passwordVisible, setPasswordVisible] = useState(true)
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const passwordRef = useRef();
  const isFetchingDataRef = useRef(false);

  const getData = async () => {
    if (isFetchingDataRef.current) return;
    isFetchingDataRef.current = true;
    setIsLoadingData(true);
    const querySnapshot = await getDocs(collection(db, "passwords"));
    const pass = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setPasswords(pass);
    setLoading(false);
    setIsLoadingData(false);
    isFetchingDataRef.current = false;
  };

  useEffect(() => {
    getData();
  }, []);

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  }

  const showPassword = () => {
    if (passwordVisible) {
      passwordRef.current.type = "text"
    } else {
      passwordRef.current.type = "password"
    }
    setPasswordVisible(!passwordVisible);
  }

  const savePass = async () => {
    if (!isLoadingData) {
      if (editId) {
        await setDoc(doc(db, "passwords", editId), data);
        setEditId(null);
      } else {
        await addDoc(collection(db, "passwords"), data);
      }
      setData({ site: '', username: '', password: '' });
      getData();
      toast('Password Saved Successfully', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    }
  }

  const deletePass = async (id) => {
    await deleteDoc(doc(db, "passwords", id));
    getData();

    toast('Password Removed Successfully', {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      progress: undefined,
      theme: "light",
    });
  }

  const editPass = (pass) => {
    setData({ site: pass.site, username: pass.username, password: pass.password });
    setEditId(pass.id);
  }

  const copyText = (text) => {
    toast('Copied to Clipboard', {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      progress: undefined,
      theme: "light",
    });
    navigator.clipboard.writeText(text);
  }

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover
        theme="light"
      />
      <Navbar />

      <div className='p-10 m-10 py-0'>
        <h1 className="text-center mb-4 text-3xl font-extrabold text-gray-900 md:text-5xl lg:text-6xl"><span className="text-transparent bg-clip-text bg-gradient-to-r to-emerald-600 from-sky-400">Pass Protector</span></h1>
        <p className="text-center text-lg font-normal text-gray-500 lg:text-xl">Get access to your Passwords and Manage them Easily and without worrying about your Safety.</p>
      </div>

      <div className="container px-40 items-center">
        <div className='mb-6'>
          <label className="block mb-2 text-sm font-medium text-gray-900">Enter Site</label>
          <input type="text" id="site" value={data.site} onChange={handleChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" placeholder="Enter your Website" required name="site" />
        </div>

        <div className="grid gap-6 mb-6 md:grid-cols-2">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900">Enter Username</label>
            <input type="text" id="username" value={data.username} onChange={handleChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" placeholder="Enter your Username" required name="username" />
          </div>

          <div className='relative'>
            <label className="block mb-2 text-sm font-medium text-gray-900">Enter Password</label>
            <input ref={passwordRef} type="password" id="password" value={data.password} onChange={handleChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" placeholder="Enter your Password" required name="password" />
            <span className='absolute right-5 top-9 cursor-pointer'>
              <FontAwesomeIcon className='p-1' icon={passwordVisible ? faEyeSlash : faEye} onClick={showPassword} />
            </span>
          </div>
        </div>

        <div className='flex justify-center'>
          <button type="button" className="text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 shadow-lg shadow-teal-500/50 dark:shadow-lg dark:shadow-teal-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2" onClick={savePass}><FontAwesomeIcon icon={faPlus} /> ADD PASSWORD</button>
        </div>

        <h1 className="py-5 my-3 text-center mb-4 text-3xl font-extrabold text-gray-900 md:text-4xl lg:text-4xl">Your <span className="text-transparent bg-clip-text bg-gradient-to-r to-emerald-600 from-sky-400">Passwords</span></h1>

        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          <table className="table-auto text-center w-full text-sm rtl:text-right text-gray-500 dark:text-gray-400">
            <thead className="text-xs uppercase bg-slate-800 text-white">
              <tr>
                <th scope='col' className='px-6 py-3'>Sr No</th>
                <th scope="col" className="px-6 py-3">Site</th>
                <th scope="col" className="px-6 py-3">Username</th>
                <th scope="col" className="px-6 py-3">Password</th>
                <th scope="col" className="px-6 py-3">Action</th>
                <th scope="col" className="px-6 py-3"><span className="sr-only">Edit</span></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className='text-center items-center justify-center' colSpan={5}>
                    <div className='py-5 text-center'>
                      <ClipLoader loading={true} color='blue' />
                    </div>
                  </td>
                </tr>
              ) : (
                getPasswords.map((pass, index) => (
                  <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600" key={pass.id}>
                    <td className="px-6 py-4">
                      <div className='flex text-center justify-center'>{index + 1}</div>
                    </td>
                    <th className="px-6 py-4">
                      <div className='flex text-center justify-center'>
                        <img src={`https://www.google.com/s2/favicons?domain=${pass.site}`} alt="Favicon" className="w-6 h-6" />&nbsp;
                        {pass.site}
                      </div>
                    </th>
                    <td className="px-6 py-4">
                      <div className='flex text-center justify-center'>
                        <span>{pass.username}</span>
                        <div onClick={() => { copyText(pass.username) }}><FontAwesomeIcon className='cursor-pointer px-2' icon={faCopy} /></div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className='flex text-center justify-center'>
                        <span>{"*".repeat(pass.password.length)}</span>
                        <div onClick={() => { copyText(pass.password) }}><FontAwesomeIcon className='cursor-pointer px-2' icon={faCopy} /></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button type="button" className="text-white bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-green-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2" onClick={() => editPass(pass)}><FontAwesomeIcon icon={faPenToSquare} />Edit</button>
                      <button type="button" className="text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2" onClick={() => deletePass(pass.id)}><FontAwesomeIcon icon={faTrash} /> Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default App;
/*Made by Abdul Salaam Danish*/ 