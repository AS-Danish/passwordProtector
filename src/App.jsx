import React, { useEffect, useState, useRef } from 'react';
import './App.css';
import Navbar from './components/Navbar/Navbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faCopy, faEye, faEyeSlash, faPenToSquare, faTrash } from '@fortawesome/free-solid-svg-icons';
import { collection, getDocs, addDoc, deleteDoc, doc, setDoc, query, where } from 'firebase/firestore';
import { db, auth, googleProvider } from './firestoreDatabase/firestoreConfig';
import { ClipLoader } from 'react-spinners';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Footer from './components/Footer/Footer';
import { onAuthStateChanged, signOut, signInWithPopup } from 'firebase/auth';

function App() {
  const [getPasswords, setPasswords] = useState([]);
  const [data, setData] = useState({ site: '', username: '', password: '' });
  const [passwordVisible, setPasswordVisible] = useState(true);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [user, setUser] = useState(null);

  const passwordRef = useRef();

  // Check for user authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        getData(user.uid);
      } else {
        setUser(null);
        setPasswords([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch passwords from Firestore based on user ID
  const getData = async (userId) => {
    setLoading(true);
    const q = query(collection(db, 'passwords'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const pass = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setPasswords(pass);
    setLoading(false);
  };

  // Handle input change
  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  // Toggle password visibility
  const showPassword = () => {
    if (passwordVisible) {
      passwordRef.current.type = 'text';
    } else {
      passwordRef.current.type = 'password';
    }
    setPasswordVisible(!passwordVisible);
  };

  // Save password to Firestore
  const savePass = async () => {
    if (user) {
      if (editId) {
        await setDoc(doc(db, 'passwords', editId), { ...data, userId: user.uid });
        setEditId(null);
      } else {
        await addDoc(collection(db, 'passwords'), { ...data, userId: user.uid });
      }
      setData({ site: '', username: '', password: '' });
      getData(user.uid);
      toast('Password Saved Successfully', {
        position: 'top-right',
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: 'light',
      });
    }
  };

  // Delete password from Firestore
  const deletePass = async (id) => {
    await deleteDoc(doc(db, 'passwords', id));
    getData(user.uid);
  };

  // Edit password entry
  const editPass = (pass) => {
    setData({ site: pass.site, username: pass.username, password: pass.password });
    setEditId(pass.id);
  };

  // Copy text to clipboard
  const copyText = (text) => {
    toast('Copied to Clipboard', {
      position: 'top-right',
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      progress: undefined,
      theme: 'light',
    });
    navigator.clipboard.writeText(text);
  };

  // Handle user sign out
  const handleSignOut = async () => {
    await signOut(auth);
  };

  // Handle Google Sign-In
  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      toast.error(error.message);
    }
  };

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
      {/* Pass user and handleSignOut to Navbar */}
      <Navbar user={user} handleSignOut={handleSignOut} />

      {user ? (
        <>
          <div className="p-10 m-10 py-0">
            <h1 className="text-center mb-4 text-3xl font-extrabold text-gray-900 md:text-5xl lg:text-6xl">
              <span className="text-transparent bg-clip-text bg-gradient-to-r to-emerald-600 from-sky-400">Pass Protector</span>
            </h1>
            <p className="text-center text-lg font-normal text-gray-500 lg:text-xl">
              Get access to your Passwords and Manage them Easily and without worrying about your Safety.
            </p>
          </div>

          <div className="container px-40 items-center">
            <div className="mb-6">
              <label className="block mb-2 text-sm font-medium text-gray-900">Enter Site</label>
              <input
                type="text"
                id="site"
                value={data.site}
                onChange={handleChange}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                placeholder="Enter your Website"
                required
                name="site"
              />
            </div>

            <div className="grid gap-6 mb-6 md:grid-cols-2">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900">Enter Username</label>
                <input
                  type="text"
                  id="username"
                  value={data.username}
                  onChange={handleChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  placeholder="Enter your Username"
                  required
                  name="username"
                />
              </div>

              <div className="relative">
                <label className="block mb-2 text-sm font-medium text-gray-900">Enter Password</label>
                <input
                  ref={passwordRef}
                  type="password"
                  id="password"
                  value={data.password}
                  onChange={handleChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  placeholder="Enter your Password"
                  required
                  name="password"
                />
                <span className="absolute right-5 top-9 cursor-pointer">
                  <FontAwesomeIcon className="p-1" icon={passwordVisible ? faEyeSlash : faEye} onClick={showPassword} />
                </span>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                className="text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 shadow-lg shadow-teal-500/50 dark:shadow-lg dark:shadow-teal-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
                onClick={savePass}
              >
                <FontAwesomeIcon icon={faPlus} /> ADD PASSWORD
              </button>
            </div>

            <h1 className="py-5 my-3 text-center mb-4 text-3xl font-extrabold text-gray-900 md:text-4xl lg:text-4xl">
              Your <span className="text-transparent bg-clip-text bg-gradient-to-r to-emerald-600 from-sky-400">Passwords</span>
            </h1>

            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
              <table className="table-auto text-center w-full text-sm rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs uppercase bg-slate-800 text-white">
                  <tr>
                    <th scope="col" className="px-6 py-3">Sr No</th>
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
                      <td className="text-center items-center justify-center" colSpan={5}>
                        <div className="py-5 text-center">
                          <ClipLoader loading={true} color="blue" />
                        </div>
                      </td>
                    </tr>
                  ) : (
                    getPasswords.map((pass, index) => (
                      <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600" key={pass.id}>
                        <td className="px-6 py-4">
                          <div className="flex text-center justify-center">{index + 1}</div>
                        </td>
                        <th className="px-6 py-4">
                          <div className="flex text-center justify-center">
                            <img src={`https://www.google.com/s2/favicons?domain=${pass.site}`} alt="Favicon" className="w-6 h-6" />&nbsp;
                            {pass.site}
                          </div>
                        </th>
                        <td className="px-6 py-4">
                          <div className="flex text-center justify-center">
                            <span>{pass.username}</span>
                            <div onClick={() => { copyText(pass.username); }}><FontAwesomeIcon className="cursor-pointer px-2" icon={faCopy} /></div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex text-center justify-center">
                            <span>{"*".repeat(pass.password.length)}</span>
                            <div onClick={() => { copyText(pass.password); }}><FontAwesomeIcon className="cursor-pointer px-2" icon={faCopy} /></div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            className="text-white bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-green-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
                            onClick={() => editPass(pass)}
                          >
                            <FontAwesomeIcon icon={faPenToSquare} />Edit
                          </button>
                          <button
                            type="button"
                            className="text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
                            onClick={() => deletePass(pass.id)}
                          >
                            <FontAwesomeIcon icon={faTrash} /> Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <>

          <div className="p-10 m-10 py-0 justify-center">
            <h1 className="text-center mb-4 text-3xl font-extrabold text-gray-900 md:text-5xl lg:text-6xl">
              <span className="text-transparent bg-clip-text bg-gradient-to-r to-emerald-600 from-sky-400">Pass Protector</span>
            </h1>
            <p className="text-center text-lg font-normal text-gray-500 lg:text-xl">
              Get access to your Passwords and Manage them Easily and without worrying about your Safety.
            </p>
          </div>


          <div class="flex flex-col items-center justify-center px-4 py-20 mx-auto">
            <div class="w-full bg-white rounded-lg shadow dark:border sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
              <div class="p-3 space-y-4 md:space-y-4 sm:p-6">
                <h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                  Welcome Back
                </h1>
                <div className="flex justify-center text-center">
                  <button onClick={handleGoogleSignIn} type="button" className="text-white m-6 bg-[#4285F4] hover:bg-[#4285F4]/90 focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50 font-medium rounded-lg text-sm px-5 py-4 text-center inline-flex items-center dark:focus:ring-[#4285F4]/55 me-4 mb-4">
                    <svg className="w-4 h-4 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 19">
                      <path fill-rule="evenodd" d="M8.842 18.083a8.8 8.8 0 0 1-8.65-8.948 8.841 8.841 0 0 1 8.8-8.652h.153a8.464 8.464 0 0 1 5.7 2.257l-2.193 2.038A5.27 5.27 0 0 0 9.09 3.4a5.882 5.882 0 0 0-.2 11.76h.124a5.091 5.091 0 0 0 5.248-4.057L14.3 11H9V8h8.34c.066.543.095 1.09.088 1.636-.086 5.053-3.463 8.449-8.4 8.449l-.186-.002Z" clip-rule="evenodd" />
                    </svg>
                    Sign in with Google
                  </button>
                </div>
              </div>
            </div>
          </div>

        </>
      )}

      <Footer />
    </>
  );
}

export default App;
