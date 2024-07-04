import { useState } from "react";
import { Navigate } from "react-router-dom";

export function AppBar(){
  const [loggedOut, setLoggedOut] = useState(false)

  function handleLogout(){
    localStorage.removeItem("token")
    setLoggedOut(true)
  }
    return (
      <div className="shadow h-14 flex justify-between">

        <div className="flex flex-col justify-center h-full ml-4">
          PayTM App
        </div>
        
        <div className="flex">

          <button onClick={handleLogout} className="flex flex-col justify-center h-full mr-4 cursor-pointer underline">
          Logout
          </button>

          <div className="rounded-full h-12 w-12 bg-slate-200 flex justify-center mt-1 mr-2">

            <div className="flex flex-col justify-center h-full text-xl">
            U
            </div>

          </div>

        </div>
        {loggedOut && <Navigate to={'/signin'} />}
      </div>
    );
}